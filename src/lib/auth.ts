import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Data Access Layer: the single place app routes learn who is signed in.
// Call it inside a <Suspense> boundary (Cache Components): it reads the
// session cookie, which cannot be part of the prerendered static shell.
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
