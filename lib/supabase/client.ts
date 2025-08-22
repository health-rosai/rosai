import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase environment variables are not set. Using placeholder values.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}