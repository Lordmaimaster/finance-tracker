import { useEffect, useState } from 'react'
import { fetchBudgetStatus, fetchCategories, upsertBudget } from '../api/endpoints'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency } from '../utils/format'

export function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [loading, setLoading] = useState(true)
  const [statusRows, setStatusRows] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ category_id: '', limit_amount: '' })

  const load = async () => {
    setLoading(true)
    const [statusData, categoriesData] = await Promise.all([
      fetchBudgetStatus({ month, year }),
      fetchCategories(),
    ])
    setStatusRows(statusData.items)
    setCategories(categoriesData.items.filter((c) => c.type === 'expense'))
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  const submit = async (event) => {
    event.preventDefault()
    await upsertBudget({
      category_id: Number(form.category_id),
      limit_amount: Number(form.limit_amount),
      month,
      year,
    })
    setForm({ category_id: '', limit_amount: '' })
    load()
  }

  if (loading) return <LoadingState label="Loading budgets..." />

  return (
    <div className="space-y-4">
      <Card title="Set Budget">
        <form onSubmit={submit} className="grid gap-2 md:grid-cols-4">
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.category_id}
            onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
            required
          >
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="number"
            step="0.01"
            placeholder="Monthly limit"
            value={form.limit_amount}
            onChange={(e) => setForm((prev) => ({ ...prev, limit_amount: e.target.value }))}
            required
          />
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="number"
            value={month}
            min="1"
            max="12"
            onChange={(e) => setMonth(Number(e.target.value))}
          />
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-4">
            Save budget
          </button>
        </form>
      </Card>

      <Card title="Budget Status">
        <div className="space-y-3">
          {statusRows.map((row) => {
            const usage = row.limit_amount > 0 ? Math.round((row.spent / row.limit_amount) * 100) : 0
            const progress = Math.max(0, Math.min(100, usage))
            return (
              <div key={row.category_id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p>{row.category_name}</p>
                  <p>
                    {formatCurrency(row.spent)} / {formatCurrency(row.limit_amount)}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${
                      usage > 100 ? 'bg-red-500' : usage > 80 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
          {statusRows.length === 0 && <p className="text-sm text-slate-500">No budgets configured.</p>}
        </div>
      </Card>
    </div>
  )
}
