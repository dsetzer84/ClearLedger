'use client'

import { useActionState } from 'react'
import { createClientAction, type ActionState } from '@/lib/actions'

const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100'

const INITIAL_STATE: ActionState = { error: null }

export function ClientForm() {
  const [state, formAction, isPending] = useActionState(
    createClientAction,
    INITIAL_STATE
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </span>
        <input
          type="text"
          name="name"
          required
          placeholder="Client name"
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          placeholder="client@example.com"
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Company <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <input
          type="text"
          name="company"
          placeholder="Company name"
          className={INPUT_CLASS}
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {isPending ? 'Saving…' : 'Add client'}
      </button>
    </form>
  )
}
