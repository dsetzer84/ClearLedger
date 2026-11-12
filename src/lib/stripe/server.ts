import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

// Server-only. The secret key is read lazily so importing this module
// never crashes a build when the key is not set yet.
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(secretKey)
  }
  return stripeInstance
}
