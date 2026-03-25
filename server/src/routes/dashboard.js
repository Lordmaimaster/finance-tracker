const express = require('express')
const { query } = require('../db/pool')

const dashboardRouter = express.Router()

dashboardRouter.get('/summary', async (_req, res, next) => {
  try {
    const totalsPromise = query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric(12,2) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric(12,2) AS expense
       FROM transactions
       WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)`,
    )

    const monthlyPromise = query(
      `SELECT to_char(month_bucket, 'Mon YY') AS month,
              COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::numeric(12,2) AS income,
              COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::numeric(12,2) AS expense
       FROM generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '5 month',
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
       ) AS month_bucket
       LEFT JOIN transactions t
         ON date_trunc('month', t.date) = month_bucket
       GROUP BY month_bucket
       ORDER BY month_bucket`,
    )

    const expenseCategoryPromise = query(
      `SELECT c.name, COALESCE(SUM(t.amount), 0)::numeric(12,2) AS value
       FROM categories c
       LEFT JOIN transactions t
         ON t.category_id = c.id
        AND t.type = 'expense'
        AND date_trunc('month', t.date) = date_trunc('month', CURRENT_DATE)
       WHERE c.type IN ('expense', 'both')
       GROUP BY c.name
       HAVING COALESCE(SUM(t.amount), 0) > 0
       ORDER BY value DESC`,
    )

    const recentPromise = query(
      `SELECT t.*, c.name AS category_name
       FROM transactions t
       JOIN categories c ON c.id = t.category_id
       ORDER BY t.date DESC, t.id DESC
       LIMIT 5`,
    )

    const [totalsResult, monthlyResult, expenseResult, recentResult] = await Promise.all([
      totalsPromise,
      monthlyPromise,
      expenseCategoryPromise,
      recentPromise,
    ])

    const income = Number(totalsResult.rows[0].income || 0)
    const expense = Number(totalsResult.rows[0].expense || 0)
    res.json({
      totals: { income, expense, net: income - expense },
      monthly: monthlyResult.rows.map((row) => ({
        ...row,
        income: Number(row.income || 0),
        expense: Number(row.expense || 0),
      })),
      expenseByCategory: expenseResult.rows.map((row) => ({
        name: row.name,
        value: Number(row.value || 0),
      })),
      recentTransactions: recentResult.rows,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = { dashboardRouter }
