/** Display currency for aku-bank demo (USD). */
export const CURRENCY = '$'

export function maskAccount(no = '') {
  const s = String(no)
  if (s.length < 8) return s
  return `**** **** **** ${s.slice(-4)}`
}

export function money(amount, { hide = false } = {}) {
  if (hide) return '****'
  if (amount === null || amount === undefined || amount === '') return `${CURRENCY}0.00`
  return `${CURRENCY}${amount}`
}

export function formatSignedAmount(item) {
  const sign = item.direction === 'in' ? '+' : '-'
  return `${sign}${CURRENCY}${item.amount}`
}
