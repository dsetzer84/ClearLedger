import { createClient } from '@supabase/supabase-js'

// Server-only. The public share page has no signed-in user, and the RLS
// policies only let owners read their own rows, so share links are served
// with the service role key. Returns null when the key is not configured,
// so the share page degrades to an honest "not set up yet" state instead
// of crashing. Never import this from client code.
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return null
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
