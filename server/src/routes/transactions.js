const express = require('express')
const { Parser } = require('json2csv')
const { z } = require('zod')
const { query } = require('../db/pool')

const transactionsRouter = express.Router()

const transactionSchema = z.object({
  category_id: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  date: z.string(),
})

function buildFilters(params, isExport = false) {
  const filters = []
  const values = []
  let cursor = 1

  if (params.type) {
    filters.push(`t.type = $${cursor++}`)
    values.push(params.type)
  }
  if (params.category_id) {
    filters.push(`t.category_id = $${cursor++}`)
    values.push(Number(params.category_id))
  }
  if (params.from) {
    filters.push(`t.date >= $${cursor++}`)
    values.push(params.from)
  }
  if (params.to) {
    filters.push(`t.date <= $${cursor++}`)
    values.push(params.to)
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const page = Number(params.page || 1)
  const limit = Number(params.limit || 20)
  const offset = (page - 1) * limit

  const pagingClause = isExport ? '' : `LIMIT ${limit} OFFSET ${offset}`

  return { values, whereClause, pagingClause }
}

transactionsRouter.get('/', async (req, res, next) => {
  try {
    const { values, whereClause, pagingClause } = buildFilters(req.query)
    const result = await query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       ${whereClause}
       ORDER BY t.date DESC, t.id DESC
       ${pagingClause}`,
      values,
    )
    res.json({ items: result.rows })
  } catch (error) {
    next(error)
  }
})

transactionsRouter.get('/export', async (req, res, next) => {
  try {
    const { values, whereClause } = buildFilters(req.query, true)
    const result = await query(
      `SELECT t.id, t.type, t.amount, t.description, t.date, c.name AS category
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       ${whereClause}
       ORDER BY t.date DESC, t.id DESC`,
      values,
    )
    const parser = new Parser()
    const csv = parser.parse(result.rows)
    res.header('Content-Type', 'text/csv')
    res.attachment('transactions.csv')
    res.send(csv)
  } catch (error) {
    next(error)
  }
})

transactionsRouter.post('/', async (req, res, next) => {
  try {
    const data = transactionSchema.parse({
      ...req.body,
      category_id: Number(req.body.category_id),
      amount: Number(req.body.amount),
    })
    const result = await query(
      `INSERT INTO transactions (category_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.category_id, data.type, data.amount, data.description ?? null, data.date],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

transactionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const data = transactionSchema.parse({
      ...req.body,
      category_id: Number(req.body.category_id),
      amount: Number(req.body.amount),
    })
    const result = await query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, date = $5
       WHERE id = $6
       RETURNING *`,
      [data.category_id, data.type, data.amount, data.description ?? null, data.date, id],
    )
    if (!result.rows[0]) return res.status(404).json({ message: 'Transaction not found' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

transactionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    await query('DELETE FROM transactions WHERE id = $1', [id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

module.exports = { transactionsRouter }
