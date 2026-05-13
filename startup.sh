#!/bin/sh
set -e

# ── PostgreSQL bootstrap ──────────────────────────────────────────────────────

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "Initializing PostgreSQL data directory..."
  mkdir -p "$PGDATA"
  chown postgres:postgres "$PGDATA"
  su postgres -s /bin/sh -c "initdb --username=postgres --auth=trust -D $PGDATA"
fi

echo "Starting PostgreSQL..."
su postgres -s /bin/sh -c "pg_ctl start -D $PGDATA -l /tmp/pg.log"

echo "Waiting for PostgreSQL to be ready..."
until su postgres -s /bin/sh -c "pg_isready -q"; do sleep 1; done

# Write a small provisioning script so quoting stays clean.
# The heredoc expands $PGUSER/$PGPASSWORD/$PGDATABASE from the current env
# into literal values inside the temp script.
cat > /tmp/provision.sh << PROVISION
#!/bin/sh
psql -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='${PGUSER}'" | grep -q 1 || \
  psql -U postgres -c "CREATE ROLE \"${PGUSER}\" LOGIN PASSWORD '${PGPASSWORD}'"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='${PGDATABASE}'" | grep -q 1 || \
  psql -U postgres -c "CREATE DATABASE \"${PGDATABASE}\" OWNER \"${PGUSER}\""
PROVISION

echo "Provisioning database role and schema..."
su postgres -s /bin/sh /tmp/provision.sh

# ── Migrations + seed (idempotent — safe to run on every startup) ─────────────
echo "Running migrations..."
node /app/src/db/seed.js

# ── Start server (foreground — keeps the container alive) ─────────────────────
echo "Starting Finance Tracker on port ${PORT}..."
exec node /app/src/index.js
