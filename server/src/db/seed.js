require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { pool, query } = require('./pool')

const defaults = [
  ['Food', 'utensils', '#f97316', 'expense'],
  ['Rent', 'home', '#ef4444', 'expense'],
  ['Transport', 'bus', '#3b82f6', 'expense'],
  ['Entertainment', 'film', '#8b5cf6', 'expense'],
  ['Salary', 'wallet', '#22c55e', 'income'],
  ['Freelance', 'briefcase', '#10b981', 'income'],
  ['Savings', 'piggy-bank', '#06b6d4', 'both'],
]

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8')
  await query(sql)
  for (const item of defaults) {
    await query(
      `INSERT INTO categories (name, icon, color, type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      item,
    )
  }
  console.log('Database migrations + seed complete.')
  await pool.end()
}

run().catch(async (error) => {
  console.error(error)
  await pool.end()
  process.exit(1)
})
