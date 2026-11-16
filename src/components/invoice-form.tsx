'use client'

import { useActionState, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createInvoiceAction, type ActionState } from '@/lib/actions'
import { formatMoney } from '@/lib/format'
import type { Client } from '@/types'

const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100'

const INITIAL_STATE: ActionState = { error: null }

type ItemDraft = { description: string; quantity: string; unit_price: string }

function defaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().slice(0, 10)
}

export function InvoiceForm({
  clients,
  suggestedNumber,
}: {
  clients: Client[]
  suggestedNumber: string
}) {
  const [state, formAction, isPending] = useActionState(
    createInvoiceAction,
    INITIAL_STATE
  )
  const [items, setItems] = useState<ItemDraft[]>([
    { description: '', quantity: '1', unit_price: '' },
  ])

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
        0
      ),
    [items]
  )

  function updateItem(
    index: number,
    field: keyof ItemDraft,
    value: string
  ) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { description: '', quantity: '1', unit_price: '' },
    ])
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index))
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Client
          </span>
          <select name="client_id" required defaultValue="" className={INPUT_CLASS}>
            <option value="" disabled>
              Choose a client
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
                {client.company ? ` — ${client.company}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Invoice number
          </span>
          <input
            type="text"
            name="invoice_number"
            required
            defaultValue={suggestedNumber}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Due date
          </span>
          <input
            type="date"
            name="due_date"
            required
            defaultValue={defaultDueDate()}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes <span className="font-normal text-zinc-400">(optional)</span>
          </span>
          <input
            type="text"
            name="notes"
            placeholder="Anything the client should know"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Line items
        </legend>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-[1fr_90px_120px_auto] sm:items-end"
            >
              <label className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Description
                </span>
                <input
                  type="text"
                  required
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, 'description', event.target.value)
                  }
                  placeholder="What was the work?"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Qty
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, 'quantity', event.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Unit price ($)
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={item.unit_price}
                  onChange={(event) =>
                    updateItem(index, 'unit_price', event.target.value)
                  }
                  placeholder="0.00"
                  className={INPUT_CLASS}
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                aria-label="Remove line item"
                className="rounded-lg p-2.5 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Add line item
        </button>
      </fieldset>

      {/* The server action reads the line items from this field. */}
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          }))
        )}
      />

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Total
        </span>
        <span className="text-lg font-semibold">{formatMoney(total)}</span>
      </div>

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
        {isPending ? 'Saving…' : 'Create invoice'}
      </button>
    </form>
  )
}
