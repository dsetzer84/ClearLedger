// Types matching the Supabase schema in
// supabase/migrations/20261112_initial_schema.sql

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Profile {
  id: string
  email: string
  business_name: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  company: string | null
  created_at: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  status: InvoiceStatus
  due_date: string
  notes: string | null
  share_token: string
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
  client: Client
}

export interface ClientInsert {
  name: string
  email: string
  company?: string | null
}

export interface InvoiceItemInsert {
  description: string
  quantity: number
  unit_price: number
}

export interface InvoiceInsert {
  client_id: string
  invoice_number: string
  status?: InvoiceStatus
  due_date: string
  notes?: string | null
}
