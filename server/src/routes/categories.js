const express = require('express')
const { z } = require('zod')
const { query } = require('../db/pool')

const categoriesRouter = express.Router()

const schema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['income', 'expense', 'both']),
})

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC')
    res.json({ items: result.rows })
  } catch (error) {
    next(error)
  }
})

categoriesRouter.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body)
    const result = await query(
      'INSERT INTO categories (name, icon, color, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.icon ?? 'tag', data.color ?? '#64748b', data.type],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

categoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const data = schema.parse(req.body)
    const id = Number(req.params.id)
    const result = await query(
      `UPDATE categories
       SET name = $1, icon = $2, color = $3, type = $4
       WHERE id = $5
       RETURNING *`,
      [data.name, data.icon ?? 'tag', data.color ?? '#64748b', data.type, id],
    )
    if (!result.rows[0]) return res.status(404).json({ message: 'Category not found' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    await query('DELETE FROM categories WHERE id = $1', [id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

module.exports = { categoriesRouter }
