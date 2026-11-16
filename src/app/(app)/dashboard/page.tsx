import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatMoney, invoiceTotal } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'
import type { InvoiceWithItems } from '@/types'

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Every invoice has a share link your client can open, approve, and
            pay from.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          New invoice
        </Link>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading invoices…
          </p>
        }
      >
        <InvoiceList />
      </Suspense>
    </main>
  )
}

async function InvoiceList() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        Could not load your invoices. Please refresh the page.
      </p>
    )
  }

  const invoices = (data ?? []) as unknown as InvoiceWithItems[]

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          No invoices yet
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add a client, then create your first invoice.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/clients"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Add a client
          </Link>
          <Link
            href="/invoices/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            New invoice
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {invoices.map((invoice) => (
        <li key={invoice.id}>
          <Link
            href={`/invoices/${invoice.id}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {invoice.invoice_number} · {invoice.client.name}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Due {formatDate(invoice.due_date)}
              </p>
            </div>
            <StatusBadge status={invoice.status} />
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {formatMoney(invoiceTotal(invoice.items))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
