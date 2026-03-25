require('dotenv').config()
const { app } = require('./app')
const { runRecurringProcessor } = require('./utils/recurringProcessor')

const port = Number(process.env.PORT || 4000)

app.listen(port, () => {
  // Process recurring items at boot so users see new transactions quickly.
  runRecurringProcessor().catch(() => {})
  console.log(`API running on http://localhost:${port}`)
})
