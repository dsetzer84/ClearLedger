import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatMoney, invoiceTotal } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'
import { CopyShareLinkButton } from '@/components/copy-share-link'
import type { InvoiceWithItems } from '@/types'

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading invoice…
        </p>
      }
    >
      <InvoiceDetail params={params} />
    </Suspense>
  )
}

async function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  const invoice = data as unknown as InvoiceWithItems
  const total = invoiceTotal(invoice.items)

  return (
    <main className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to invoices
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Invoice {invoice.invoice_number}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {invoice.client.name}
            {invoice.client.company ? ` · ${invoice.client.company}` : ''} ·{' '}
            {invoice.client.email}
          </p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Due date</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatDate(invoice.due_date)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatDate(invoice.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
        {invoice.notes ? (
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
              {invoice.notes}
            </p>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Unit price</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                  {Number(item.quantity)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">
                  {formatMoney(Number(item.unit_price))}
                </td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {formatMoney(Number(item.quantity) * Number(item.unit_price))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 dark:border-zinc-800">
              <td
                colSpan={3}
                className="px-4 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300"
              >
                Total
              </td>
              <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Share with your client
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Your client opens this link without signing in. They see this same
          invoice, can approve it, and will be able to pay once payments are
          connected.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            /share/{invoice.share_token}
          </code>
          <CopyShareLinkButton token={invoice.share_token} />
        </div>
      </section>
    </main>
  )
}
