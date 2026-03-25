const cron = require('node-cron')
const dayjs = require('dayjs')
const { query } = require('../db/pool')

function advanceDate(baseDate, frequency) {
  if (frequency === 'daily') return dayjs(baseDate).add(1, 'day').format('YYYY-MM-DD')
  if (frequency === 'weekly') return dayjs(baseDate).add(1, 'week').format('YYYY-MM-DD')
  if (frequency === 'yearly') return dayjs(baseDate).add(1, 'year').format('YYYY-MM-DD')
  return dayjs(baseDate).add(1, 'month').format('YYYY-MM-DD')
}

async function runRecurringProcessor() {
  const due = await query(
    `SELECT * FROM recurring_transactions
     WHERE active = true
       AND next_due <= CURRENT_DATE`,
  )

  for (const item of due.rows) {
    await query(
      `INSERT INTO transactions (category_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [item.category_id, item.type, item.amount, item.description],
    )
    await query('UPDATE recurring_transactions SET next_due = $1 WHERE id = $2', [
      advanceDate(item.next_due, item.frequency),
      item.id,
    ])
  }
}

cron.schedule('0 * * * *', () => {
  runRecurringProcessor().catch(() => {})
})

module.exports = { runRecurringProcessor }
