export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function invoiceTotal(
  items: { quantity: number; unit_price: number }[]
): number {
  return items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  )
}

export function formatDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
