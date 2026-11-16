import { Suspense } from 'react'
import { CheckCircle2, Receipt } from 'lucide-react'
import { approveInvoiceAction } from '@/lib/actions'
import { formatDate, formatMoney, invoiceTotal } from '@/lib/format'
import { getServiceClient } from '@/lib/supabase/service'
import { StatusBadge } from '@/components/status-badge'
import type { InvoiceWithItems } from '@/types'

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-2xl">
        <Suspense
          fallback={
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Loading invoice…
            </p>
          }
        >
          <SharedInvoice params={params} />
        </Suspense>
      </div>
    </div>
  )
}

async function SharedInvoice({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = getServiceClient()

  if (!service) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          Sharing is not set up yet
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This invoice link will work once the sender finishes setting up
          sharing. Please check back later.
        </p>
      </div>
    )
  }

  const { data, error } = await service
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('share_token', token)
    .maybeSingle()

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          This link does not match an invoice
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The link may be mistyped or out of date. Please ask the sender for a
          fresh link.
        </p>
      </div>
    )
  }

  const invoice = data as unknown as InvoiceWithItems
  const total = invoiceTotal(invoice.items)
  const approved = (invoice.notes ?? '').includes('Approved by client')

  const { data: profile } = await service
    .from('profiles')
    .select('business_name, email')
    .eq('id', invoice.user_id)
    .maybeSingle()
  const senderName =
    profile?.business_name || profile?.email || 'ClearLedger invoice'

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {senderName}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Invoice {invoice.invoice_number}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Billed to</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {invoice.client.name}
              {invoice.client.company ? ` · ${invoice.client.company}` : ''}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Due date</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-50">
              {formatDate(invoice.due_date)}
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
                Total due
              </td>
              <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {approved ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                This invoice has been approved
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Thank you. The sender can see your approval on their copy of
                this invoice.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Review this invoice
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              If the work and the amount look right, approve it so the sender
              knows. Approving does not charge anything.
            </p>
            <form action={approveInvoiceAction} className="mt-4">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-zinc-700 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Approve this invoice
              </button>
            </form>
          </>
        )}

        <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Payment
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Payments are not connected yet. Once the sender connects payments,
            the pay button below will work right here.
          </p>
          {/* Deliberately disabled: no charge path exists until Stripe
              Connect onboarding is done. Never attempt a charge here. */}
          <button
            type="button"
            disabled
            className="mt-4 w-full cursor-not-allowed rounded-lg bg-zinc-200 px-4 py-2.5 text-base font-medium text-zinc-500 sm:w-auto dark:bg-zinc-800 dark:text-zinc-400"
          >
            Pay {formatMoney(total)} — payments are not connected yet
          </button>
        </div>
      </section>
    </main>
  )
}
