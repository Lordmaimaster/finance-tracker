# ── Stage 1: build the React frontend ──────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /build
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# Default to same-origin /api — frontend and API share a single port.
# Override at build time if deploying behind a reverse proxy on a different origin.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Stage 2: production image ────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache postgresql

WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./
RUN npm ci --omit=dev

# Server source
COPY server/src ./src

# Built frontend — served as static files by Express
COPY --from=frontend /build/dist ./public

# Startup script
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

ENV PGDATA=/var/lib/postgresql/data \
    PGHOST=localhost \
    PGUSER=app \
    PGPASSWORD=changeme \
    PGDATABASE=finance_tracker \
    PORT=3000

# Mount a named volume here to persist the database across container restarts
VOLUME ["/var/lib/postgresql/data"]

EXPOSE 3000

CMD ["/startup.sh"]
