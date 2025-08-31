import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  // 一時的にサービスロールキーを使用（開発環境のみ）
  // 本番環境では必ずanonキーを使用し、適切なRLSポリシーを設定してください
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      'placeholder-anon-key'

  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase environment variables are not set. Using placeholder values.')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}