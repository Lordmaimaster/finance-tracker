const cors = require('cors')
const express = require('express')
const { ZodError } = require('zod')
const { categoriesRouter } = require('./routes/categories')
const { transactionsRouter } = require('./routes/transactions')
const { budgetsRouter } = require('./routes/budgets')
const { recurringRouter } = require('./routes/recurring')
const { dashboardRouter } = require('./routes/dashboard')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/categories', categoriesRouter)
app.use('/api/transactions', transactionsRouter)
app.use('/api/budgets', budgetsRouter)
app.use('/api/recurring', recurringRouter)
app.use('/api/dashboard', dashboardRouter)

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, _req, res, _next) => {
  if (res.headersSent) return
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Invalid request', details: err.flatten() })
  }
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Server error' })
})

module.exports = { app }
