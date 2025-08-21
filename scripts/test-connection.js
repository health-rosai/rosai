// Supabase接続テストスクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Supabase接続テスト開始...\n')
  
  // 環境変数チェック
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('❌ エラー: 環境変数が設定されていません')
    console.log('以下を確認してください:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ 設定済み' : '❌ 未設定')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ 設定済み' : '❌ 未設定')
    return
  }
  
  console.log('✅ 環境変数確認OK')
  console.log('URL:', url)
  console.log('Key:', key.substring(0, 20) + '...\n')
  
  // Supabase接続
  const supabase = createClient(url, key)
  
  try {
    // テーブル存在確認
    console.log('📊 テーブル確認中...')
    
    const tables = ['companies', 'profiles', 'agencies', 'emails', 'faqs']
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: エラー - ${error.message}`)
      } else {
        console.log(`✅ ${table}: OK (${count || 0}件のレコード)`)
      }
    }
    
    console.log('\n🎉 接続テスト完了！')
    console.log('Supabaseの設定は正常です。')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

testConnection()