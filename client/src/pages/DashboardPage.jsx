import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchDashboard } from '../api/endpoints'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency, formatDate } from '../utils/format'

const palette = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2']

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading dashboard..." />
  if (error) return <p className="text-sm text-red-500">{error}</p>

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Income">{formatCurrency(data.totals.income)}</Card>
        <Card title="Expenses">{formatCurrency(data.totals.expense)}</Card>
        <Card title="Net">{formatCurrency(data.totals.net)}</Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Monthly Income vs Expense">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#16a34a" />
                <Bar dataKey="expense" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Expense by Category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expenseByCategory} dataKey="value" nameKey="name" outerRadius={90}>
                  {data.expenseByCategory.map((entry, idx) => (
                    <Cell key={entry.name} fill={palette[idx % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Recent Transactions">
        <div className="space-y-2">
          {data.recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium">{tx.description || tx.category_name}</p>
                <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
              </div>
              <p className={tx.type === 'expense' ? 'text-red-500' : 'text-green-600'}>
                {tx.type === 'expense' ? '-' : '+'}
                {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {data.recentTransactions.length === 0 && (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
