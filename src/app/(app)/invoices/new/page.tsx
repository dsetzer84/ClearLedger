import { Suspense } from 'react'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoice-form'
import type { Client } from '@/types'

export default function NewInvoicePage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          New invoice
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create a draft. Its share link appears on the invoice page once it is
          saved.
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading…
          </p>
        }
      >
        <NewInvoiceContent />
      </Suspense>
    </main>
  )
}

async function NewInvoiceContent() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: clientsData, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (clientsError) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        Could not load your clients. Please refresh the page.
      </p>
    )
  }

  const clients = (clientsData ?? []) as unknown as Client[]

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          Add a client first
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          An invoice needs a client to belong to.
        </p>
        <Link
          href="/clients"
          className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Add a client
        </Link>
      </div>
    )
  }

  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  const suggestedNumber = `INV-${String((count ?? 0) + 1).padStart(4, '0')}`

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <InvoiceForm clients={clients} suggestedNumber={suggestedNumber} />
    </section>
  )
}
