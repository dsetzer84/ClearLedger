'use server'

import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'

export type ActionState = { error: string | null }

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createClientAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser()
  const name = getString(formData, 'name')
  const email = getString(formData, 'email')
  const company = getString(formData, 'company')

  if (!name) {
    return { error: 'Client name is required.' }
  }
  if (!email || !email.includes('@')) {
    return { error: 'A valid client email is required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('clients').insert({
    user_id: user.id,
    name,
    email,
    company: company || null,
  })
  if (error) {
    return { error: 'Could not save the client. Please try again.' }
  }
  redirect('/clients')
}

type RawInvoiceItem = {
  description?: unknown
  quantity?: unknown
  unit_price?: unknown
}

export async function createInvoiceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser()
  const clientId = getString(formData, 'client_id')
  const invoiceNumber = getString(formData, 'invoice_number')
  const dueDate = getString(formData, 'due_date')
  const notes = getString(formData, 'notes')

  if (!clientId) {
    return { error: 'Choose a client for this invoice.' }
  }
  if (!invoiceNumber) {
    return { error: 'Invoice number is required.' }
  }
  if (!dueDate) {
    return { error: 'Due date is required.' }
  }

  let rawItems: RawInvoiceItem[]
  try {
    rawItems = JSON.parse(getString(formData, 'items') || '[]') as RawInvoiceItem[]
  } catch {
    return { error: 'The line items could not be read. Please try again.' }
  }
  const items = rawItems
    .map((item) => ({
      description:
        typeof item.description === 'string' ? item.description.trim() : '',
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    }))
    .filter((item) => item.description.length > 0)

  if (items.length === 0) {
    return { error: 'Add at least one line item with a description.' }
  }
  if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
    return { error: 'Quantities must be greater than zero.' }
  }
  if (
    items.some((item) => !Number.isFinite(item.unit_price) || item.unit_price < 0)
  ) {
    return { error: 'Prices must be zero or greater.' }
  }

  const supabase = await createClient()
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id: clientId,
      invoice_number: invoiceNumber,
      status: 'draft',
      due_date: dueDate,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (invoiceError || !invoice) {
    return { error: 'Could not save the invoice. Please try again.' }
  }

  const { error: itemsError } = await supabase.from('invoice_items').insert(
    items.map((item) => ({ ...item, invoice_id: invoice.id }))
  )
  if (itemsError) {
    // Keep the database clean: no invoice without its line items.
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return { error: 'Could not save the line items. Please try again.' }
  }

  redirect(`/invoices/${invoice.id}`)
}

// Runs from the public share page, where there is no signed-in user, so it
// uses the service role client. The schema has no approval column, so an
// approval is recorded as a timestamped note the owner sees on the invoice
// detail page. Idempotent: approving twice does not add a second note.
export async function approveInvoiceAction(formData: FormData): Promise<void> {
  const token = getString(formData, 'token')
  if (!token) {
    redirect('/')
  }

  const service = getServiceClient()
  if (!service) {
    redirect(`/share/${token}`)
  }

  const { data: invoice } = await service
    .from('invoices')
    .select('id, notes')
    .eq('share_token', token)
    .maybeSingle()

  if (invoice) {
    const notes = invoice.notes ?? ''
    if (!notes.includes('Approved by client')) {
      const stamp = `Approved by client on ${new Date().toISOString().slice(0, 10)}`
      await service
        .from('invoices')
        .update({ notes: notes ? `${notes}\n\n${stamp}` : stamp })
        .eq('id', invoice.id)
    }
  }

  redirect(`/share/${token}`)
}
