export function convertToLocale(amount: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100) // Assuming amount is in cents
}

export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
  return convertToLocale(amount, currencyCode)
}

