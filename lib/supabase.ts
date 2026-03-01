import { createClient } from '@supabase/supabase-js'
import type { Place } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<{ public: { Tables: { places: { Row: Place } } } }>(url, key)
