import { api } from './http'

export const fetchDashboard = () => api.get('/dashboard/summary').then((r) => r.data)

export const fetchCategories = () => api.get('/categories').then((r) => r.data)
export const createCategory = (payload) => api.post('/categories', payload).then((r) => r.data)
export const updateCategory = (id, payload) =>
  api.put(`/categories/${id}`, payload).then((r) => r.data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data)

export const fetchTransactions = (params = {}) =>
  api.get('/transactions', { params }).then((r) => r.data)
export const createTransaction = (payload) =>
  api.post('/transactions', payload).then((r) => r.data)
export const updateTransaction = (id, payload) =>
  api.put(`/transactions/${id}`, payload).then((r) => r.data)
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((r) => r.data)

export const fetchBudgets = (params = {}) => api.get('/budgets', { params }).then((r) => r.data)
export const upsertBudget = (payload) => api.post('/budgets', payload).then((r) => r.data)
export const fetchBudgetStatus = (params = {}) =>
  api.get('/budgets/status', { params }).then((r) => r.data)

export const fetchRecurring = () => api.get('/recurring').then((r) => r.data)
export const createRecurring = (payload) => api.post('/recurring', payload).then((r) => r.data)
export const updateRecurring = (id, payload) =>
  api.put(`/recurring/${id}`, payload).then((r) => r.data)
export const deleteRecurring = (id) => api.delete(`/recurring/${id}`).then((r) => r.data)
