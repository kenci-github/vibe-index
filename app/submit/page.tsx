import { getCities } from '@/lib/db/supabase'
import SubmitForm from '@/components/forms/SubmitForm'
import type { City, Country } from '@/types'

export const metadata = {
  title: 'Submit a Place — Vibe Index',
  description: 'Know somewhere worth discovering? Submit it to the Vibe Index.',
}

export default async function SubmitPage() {
  const cities = await getCities() as (City & { country: Country })[]
  return <SubmitForm cities={cities} />
}
