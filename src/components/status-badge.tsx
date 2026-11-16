import type { InvoiceStatus } from '@/types'

const STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  paid: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
}

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
