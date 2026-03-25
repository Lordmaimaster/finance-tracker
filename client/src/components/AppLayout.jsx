import { LayoutDashboard, List, RefreshCcw, Tags, Target } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: List },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/recurring', label: 'Recurring', icon: RefreshCcw },
  { to: '/categories', label: 'Categories', icon: Tags },
]

export function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-6 text-xl font-semibold">Finance Tracker</h1>
        <nav className="space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="p-4 md:p-7">
        <div className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
