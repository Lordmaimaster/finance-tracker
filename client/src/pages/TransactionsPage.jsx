import { useEffect, useMemo, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  fetchCategories,
  fetchTransactions,
  updateTransaction,
} from '../api/endpoints'
import { Card } from '../components/Card'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency, formatDate } from '../utils/format'

const initialForm = {
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export function TransactionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [txData, catData] = await Promise.all([
        fetchTransactions(filterType ? { type: filterType, page, limit: 15 } : { page, limit: 15 }),
        fetchCategories(),
      ])
      setTransactions(txData.items)
      setCategories(catData.items)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, page])

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.type === form.type || c.type === 'both'),
    [categories, form.type],
  )

  const onSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      amount: Number(form.amount),
      category_id: Number(form.category_id),
    }
    if (!payload.category_id || !payload.amount) return
    if (editingId) await updateTransaction(editingId, payload)
    else await createTransaction(payload)
    setForm(initialForm)
    setEditingId(null)
    load()
  }

  const onEdit = (tx) => {
    setEditingId(tx.id)
    setForm({
      type: tx.type,
      amount: tx.amount,
      category_id: tx.category_id,
      description: tx.description ?? '',
      date: tx.date.slice(0, 10),
    })
  }

  const onDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    load()
  }

  if (loading) return <LoadingState label="Loading transactions..." />

  return (
    <div className="space-y-4">
      <Card
        title={editingId ? 'Edit Transaction' : 'Add Transaction'}
        action={
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-sm"
            onClick={() => {
              setForm(initialForm)
              setEditingId(null)
            }}
          >
            Reset
          </button>
        }
      >
        <form className="grid gap-2 md:grid-cols-5" onSubmit={onSubmit}>
          <select
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value, category_id: '' }))}
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
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />
          <input
            className="rounded-md border border-slate-300 p-2 text-sm"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white md:col-span-5">
            {editingId ? 'Update transaction' : 'Add transaction'}
          </button>
        </form>
      </Card>

      <Card
        title="Transactions"
        action={
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-slate-300 p-1 text-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">Page {page}</span>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                disabled={transactions.length < 15}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1 text-sm"
              onClick={() => {
                const base = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
                const qs = filterType ? `?type=${filterType}` : ''
                window.open(`${base}/transactions/export${qs}`, '_blank')
              }}
            >
              Export CSV
            </button>
          </div>
        }
      >
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid gap-2 rounded-md border border-slate-200 p-3 text-sm md:grid-cols-[120px_1fr_1fr_120px_130px] md:items-center dark:border-slate-800"
            >
              <p>{formatDate(tx.date)}</p>
              <p>{tx.category_name}</p>
              <p>{tx.description || '-'}</p>
              <p className={tx.type === 'expense' ? 'text-red-500' : 'text-green-600'}>
                {formatCurrency(tx.amount)}
              </p>
              <div className="flex gap-2">
                <button className="rounded border px-2 py-1" onClick={() => onEdit(tx)}>
                  Edit
                </button>
                <button className="rounded border px-2 py-1" onClick={() => onDelete(tx.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="rounded-md border border-dashed p-5 text-sm text-slate-500">
              No transactions found.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
