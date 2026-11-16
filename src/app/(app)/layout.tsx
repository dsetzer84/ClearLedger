import type { ReactNode } from 'react'
import Link from 'next/link'
import { Plus, Receipt, Users } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

// Static shell: no session read here, so it prerenders. The session is
// read inside <Suspense> boundaries on each page.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="mr-2 inline-flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <Receipt className="h-5 w-5" />
            ClearLedger
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Invoices
            </Link>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <Users className="h-4 w-4" />
              Clients
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  )
}
