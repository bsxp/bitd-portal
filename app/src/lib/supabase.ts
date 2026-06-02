import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'These must be set as build-time env vars (Amplify Console → Environment variables).',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'bitd' },
})
