const { Pool } = require('pg')

// Prefer explicit PG* env vars over DATABASE_URL.
// This avoids URL-encoding issues (notably passwords containing '@') on Windows.
const hasPgVars =
  process.env.PGHOST || process.env.PGUSER || process.env.PGPASSWORD || process.env.PGDATABASE || process.env.PGPORT

const config = hasPgVars
  ? {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'finance_tracker',
    }
  : { connectionString: process.env.DATABASE_URL }

const pool = new Pool(config)

async function query(text, params = []) {
  return pool.query(text, params)
}

module.exports = { pool, query }
