import { format } from 'date-fns'

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(value ?? 0),
  )

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy')
