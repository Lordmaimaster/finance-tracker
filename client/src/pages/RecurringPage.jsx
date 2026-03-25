import { useEffect, useState } from 'react'
import {
  createRecurring,
  deleteRecurring,
  fetchCategories,
  fetchRecurring,
  updateRecurring,
} from '../api/endpoints'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency, formatDate } from '../utils/format'

const baseForm = {
  category_id: '',
  type: 'expense',
  amount: '',
  description: '',
  frequency: 'monthly',
  next_due: new Date().toISOString().slice(0, 10),
}

export function RecurringPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(baseForm)
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    const [recurringData, categoriesData] = await Promise.all([fetchRecurring(), fetchCategories()])
    setItems(recurringData.items)
    setCategories(categoriesData.items)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      amount: Number(form.amount),
      category_id: Number(form.category_id),
    }
    if (editingId) await updateRecurring(editingId, payload)
    else await createRecurring(payload)
    setEditingId(null)
    setForm(baseForm)
    load()
  }

  const onEdit = (item) => {
    setEditingId(item.id)
    setForm({
      category_id: item.category_id,
      type: item.type,
      amount: item.amount,
      description: item.description ?? '',
      frequency: item.frequency,
      next_due: item.next_due.slice(0, 10),
    })
  }

  const onToggleActive = async (item) => {
    await updateRecurring(item.id, { active: !item.active })
    load()
  }

  if (loading) return <LoadingState label="Loading recurring transactions..." />

  return (
    <div className="space-y-4">
      <Card title={editingId ? 'Edit recurring transaction' : 'Create recurring transaction'}>
        <form onSubmit={submit} className="grid gap-2 md:grid-cols-3">
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Amount"
            required
          />
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.category_id}
            onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
            required
          >
            <option value="">Category</option>
            {categories
              .filter((c) => c.type === form.type || c.type === 'both')
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.frequency}
            onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="date"
            value={form.next_due}
            onChange={(e) => setForm((prev) => ({ ...prev, next_due: e.target.value }))}
            required
          />
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-3">
            {editingId ? 'Update recurring' : 'Create recurring'}
          </button>
        </form>
      </Card>

      <Card title="Recurring Transactions">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800"
            >
              <div>
                <p className="font-medium">{item.description || item.category_name}</p>
                <p className="text-xs text-slate-500">
                  {item.frequency} - next due {formatDate(item.next_due)} - {formatCurrency(item.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-2 py-1 text-sm" onClick={() => onEdit(item)}>
                  Edit
                </button>
                <button className="rounded border px-2 py-1 text-sm" onClick={() => onToggleActive(item)}>
                  {item.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    await deleteRecurring(item.id)
                    load()
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500">No recurring transactions.</p>}
        </div>
      </Card>
    </div>
  )
}
