const express = require('express')
const { z } = require('zod')
const { query } = require('../db/pool')

const recurringRouter = express.Router()

const createSchema = z.object({
  category_id: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  next_due: z.string(),
})

recurringRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, c.name AS category_name
       FROM recurring_transactions r
       JOIN categories c ON c.id = r.category_id
       ORDER BY r.id DESC`,
    )
    res.json({ items: result.rows })
  } catch (error) {
    next(error)
  }
})

recurringRouter.post('/', async (req, res, next) => {
  try {
    const data = createSchema.parse({
      ...req.body,
      category_id: Number(req.body.category_id),
      amount: Number(req.body.amount),
    })
    const result = await query(
      `INSERT INTO recurring_transactions
       (category_id, type, amount, description, frequency, next_due, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [
        data.category_id,
        data.type,
        data.amount,
        data.description ?? null,
        data.frequency,
        data.next_due,
      ],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

recurringRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const existing = await query('SELECT * FROM recurring_transactions WHERE id = $1', [id])
    if (!existing.rows[0]) return res.status(404).json({ message: 'Recurring transaction not found' })
    const current = existing.rows[0]
    const merged = {
      ...current,
      ...req.body,
      id: undefined,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : Number(current.amount),
      category_id:
        req.body.category_id !== undefined ? Number(req.body.category_id) : Number(current.category_id),
      active: req.body.active !== undefined ? Boolean(req.body.active) : current.active,
    }
    const validated = createSchema.partial({ next_due: true }).extend({ active: z.boolean().optional() }).parse(merged)
    const result = await query(
      `UPDATE recurring_transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, frequency = $5, next_due = $6, active = $7
       WHERE id = $8
       RETURNING *`,
      [
        validated.category_id,
        validated.type,
        validated.amount,
        validated.description ?? null,
        validated.frequency,
        validated.next_due,
        validated.active ?? true,
        id,
      ],
    )
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

recurringRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    await query('DELETE FROM recurring_transactions WHERE id = $1', [id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

module.exports = { recurringRouter }
