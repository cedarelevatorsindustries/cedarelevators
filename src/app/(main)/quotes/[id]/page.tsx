import { redirect } from 'next/navigation'

export default function LegacyQuoteDetailRedirectPage() {
  redirect('/quotes/track')
}
