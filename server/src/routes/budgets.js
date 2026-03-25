const express = require('express')
const { z } = require('zod')
const { query } = require('../db/pool')

const budgetsRouter = express.Router()

const budgetSchema = z.object({
  category_id: z.number().int().positive(),
  limit_amount: z.number().min(0),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(9999),
})

budgetsRouter.get('/', async (req, res, next) => {
  try {
    const month = Number(req.query.month)
    const year = Number(req.query.year)
    const params = []
    const filters = []
    if (month) {
      params.push(month)
      filters.push(`b.month = $${params.length}`)
    }
    if (year) {
      params.push(year)
      filters.push(`b.year = $${params.length}`)
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
    const result = await query(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       ${where}
       ORDER BY b.year DESC, b.month DESC, c.name ASC`,
      params,
    )
    res.json({ items: result.rows })
  } catch (error) {
    next(error)
  }
})

budgetsRouter.post('/', async (req, res, next) => {
  try {
    const data = budgetSchema.parse({
      ...req.body,
      category_id: Number(req.body.category_id),
      limit_amount: Number(req.body.limit_amount),
      month: Number(req.body.month),
      year: Number(req.body.year),
    })
    const result = await query(
      `INSERT INTO budgets (category_id, limit_amount, month, year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (category_id, month, year)
       DO UPDATE SET limit_amount = EXCLUDED.limit_amount
       RETURNING *`,
      [data.category_id, data.limit_amount, data.month, data.year],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

budgetsRouter.get('/status', async (req, res, next) => {
  try {
    const now = new Date()
    const month = Number(req.query.month || now.getMonth() + 1)
    const year = Number(req.query.year || now.getFullYear())
    const result = await query(
      `SELECT
         b.category_id,
         c.name AS category_name,
         b.limit_amount,
         COALESCE(SUM(t.amount), 0)::numeric(12,2) AS spent
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       LEFT JOIN transactions t
         ON t.category_id = b.category_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = $1
        AND EXTRACT(YEAR FROM t.date) = $2
       WHERE b.month = $1 AND b.year = $2
       GROUP BY b.category_id, c.name, b.limit_amount
       ORDER BY c.name ASC`,
      [month, year],
    )
    res.json({ items: result.rows })
  } catch (error) {
    next(error)
  }
})

module.exports = { budgetsRouter }
