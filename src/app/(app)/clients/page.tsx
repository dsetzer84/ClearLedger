import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ClientForm } from '@/components/client-form'
import type { Client } from '@/types'

export default function ClientsPage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Clients
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Every invoice belongs to a client. Add yours here first.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Add a client
        </h2>
        <div className="mt-4">
          <ClientForm />
        </div>
      </section>

      <Suspense
        fallback={
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading clients…
          </p>
        }
      >
        <ClientList />
      </Suspense>
    </main>
  )
}

async function ClientList() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        Could not load your clients. Please refresh the page.
      </p>
    )
  }

  const clients = (data ?? []) as unknown as Client[]

  if (clients.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No clients yet. Add your first one above.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {clients.map((client) => (
        <li
          key={client.id}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {client.name}
            {client.company ? (
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                {' '}
                · {client.company}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {client.email}
          </p>
        </li>
      ))}
    </ul>
  )
}
