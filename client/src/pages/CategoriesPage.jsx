import { useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../api/endpoints'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'

const initialForm = { name: '', type: 'expense', icon: 'tag', color: '#2563eb' }

export function CategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    const data = await fetchCategories()
    setItems(data.items)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (editingId) await updateCategory(editingId, form)
    else await createCategory(form)
    setForm(initialForm)
    setEditingId(null)
    load()
  }

  if (loading) return <LoadingState label="Loading categories..." />

  return (
    <div className="space-y-4">
      <Card title={editingId ? 'Edit Category' : 'Create Category'}>
        <form className="grid gap-2 md:grid-cols-4" onSubmit={submit}>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Icon"
            value={form.icon}
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
          />
          <input
            className="h-10 rounded-md border border-slate-300 p-1"
            type="color"
            value={form.color}
            onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
          />
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-4">
            {editingId ? 'Update category' : 'Create category'}
          </button>
        </form>
      </Card>

      <Card title="Categories">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color || '#64748b' }}
                />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => {
                    setEditingId(item.id)
                    setForm({
                      name: item.name,
                      type: item.type,
                      icon: item.icon ?? 'tag',
                      color: item.color ?? '#2563eb',
                    })
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded border px-2 py-1 text-sm"
                  onClick={async () => {
                    await deleteCategory(item.id)
                    load()
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
