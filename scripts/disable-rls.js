import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function configureRLS() {
  console.log('🔧 RLSポリシーを設定中...')
  
  try {
    // companiesテーブルのRLSを無効化
    const { data: disableRLS, error: disableError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE companies DISABLE ROW LEVEL SECURITY;'
      })
      
    if (disableError) {
      console.log('RLS無効化エラー（無視可能）:', disableError.message)
    }
    
    // 全ユーザーに読み取り権限を付与するポリシーを作成
    const { data: policyData, error: policyError } = await supabase
      .rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            -- 既存のポリシーを削除
            DROP POLICY IF EXISTS "Enable read access for all users" ON companies;
            DROP POLICY IF EXISTS "Enable insert for all users" ON companies;
            DROP POLICY IF EXISTS "Enable update for all users" ON companies;
            DROP POLICY IF EXISTS "Enable delete for all users" ON companies;
            
            -- RLSを有効化
            ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
            
            -- 全ユーザーに対する読み取りポリシーを作成
            CREATE POLICY "Enable read access for all users" ON companies
              FOR SELECT USING (true);
              
            -- 全ユーザーに対する挿入ポリシーを作成
            CREATE POLICY "Enable insert for all users" ON companies
              FOR INSERT WITH CHECK (true);
              
            -- 全ユーザーに対する更新ポリシーを作成
            CREATE POLICY "Enable update for all users" ON companies
              FOR UPDATE USING (true);
              
            -- 全ユーザーに対する削除ポリシーを作成
            CREATE POLICY "Enable delete for all users" ON companies
              FOR DELETE USING (true);
          END $$;
        `
      })
      
    if (policyError) {
      console.log('ポリシー作成エラー:', policyError.message)
    }
    
    // テスト：データを取得してみる
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ テスト取得エラー:', testError)
    } else {
      console.log('✅ テスト成功！取得したデータ数:', testData?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

// 別の方法：サービスロールキーを使用してデータを取得
async function testDirectAccess() {
  console.log('\n📊 サービスロールキーでの直接アクセステスト...')
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
  
  if (error) {
    console.error('❌ 直接アクセスエラー:', error)
  } else {
    console.log('✅ 取得成功！企業数:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('最初の企業:', data[0].name)
    }
  }
}

async function main() {
  // await configureRLS()
  await testDirectAccess()
}

main()
  .then(() => {
    console.log('✨ 完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  })