import Link from 'next/link'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Sign in
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Welcome back to ClearLedger.
      </p>
      <LoginForm />
      <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
        No account yet?{' '}
        <Link
          href="/signup"
          className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
