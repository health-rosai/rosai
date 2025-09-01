import { createBrowserClient } from '@supabase/ssr'
import { createDemoClient } from './demo-client'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // 環境変数が設定されていない場合はデモモードを使用
  const isDemoMode = !supabaseUrl || !supabaseKey || 
                     supabaseUrl === 'https://placeholder.supabase.co' ||
                     supabaseKey === 'placeholder-anon-key'
  
  if (isDemoMode) {
    console.log('Running in DEMO mode - no Supabase credentials found')
    return createDemoClient() as any
  }

  // 本番モード
  console.log('Creating Supabase client with:', {
    url: supabaseUrl,
    keyPreview: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'no key',
    mode: 'production'
  })

  return createBrowserClient(supabaseUrl, supabaseKey)
}