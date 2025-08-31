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

const companies = [
  {
    name: '株式会社ABC製造',
    code: 'ABC-001',
    current_status: '01',
    contact_person: '田中太郎',
    contact_email: 'tanaka@abc-mfg.co.jp',
    contact_phone: '03-1234-5678',
    support_level: 'full',
    explanation_method: 'online',
    notes: '2024年度の健診対象者は約50名。前向きに検討いただいている。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: 'XYZ物流株式会社',
    code: 'XYZ-002',
    current_status: '03A',
    contact_person: '佐藤花子',
    contact_email: 'sato@xyz-logistics.jp',
    contact_phone: '03-2345-6789',
    support_level: 'partial',
    explanation_method: 'visit',
    notes: '来週の火曜日に訪問予定。決裁者同席の可能性あり。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: 'テクノロジー株式会社',
    code: 'TECH-003',
    current_status: '10',
    contact_person: '山田次郎',
    contact_email: 'yamada@technology.co.jp',
    contact_phone: '03-3456-7890',
    support_level: 'full',
    explanation_method: 'online',
    notes: '契約締結完了。来月から健診開始予定。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: 'グローバル商事',
    code: 'GLB-004',
    current_status: '12',
    contact_person: '鈴木美咲',
    contact_email: 'suzuki@global-trading.jp',
    contact_phone: '03-4567-8901',
    support_level: 'full',
    explanation_method: 'document',
    notes: '健診が順調に進行中。現在30名が受診済み。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: '株式会社イノベーション',
    code: 'INV-005',
    current_status: '18',
    contact_person: '高橋健一',
    contact_email: 'takahashi@innovation.jp',
    contact_phone: '03-5678-9012',
    support_level: 'referral_only',
    explanation_method: 'online',
    notes: '今月末に請求書発送予定。支払いは翌月末。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: '関西電子部品株式会社',
    code: 'KEP-006',
    current_status: '14',
    contact_person: '中村洋子',
    contact_email: 'nakamura@kansai-electronics.com',
    contact_phone: '06-1234-5678',
    support_level: 'full',
    explanation_method: 'visit',
    notes: '労災二次健診実施中。残り50名の対応が必要。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: '九州化学工業株式会社',
    code: 'KCI-007',
    current_status: '99A',
    contact_person: '渡辺直美',
    contact_email: 'watanabe@kyushu-chemical.jp',
    contact_phone: '092-1234-5678',
    support_level: 'full',
    explanation_method: 'online',
    notes: '全対象者の健診が完了。請求処理も完了済み。',
    status_changed_at: new Date().toISOString()
  },
  {
    name: '北海道農産物流通株式会社',
    code: 'HAD-008',
    current_status: '02',
    contact_person: '小林裕子',
    contact_email: 'kobayashi@hokkaido-agri.com',
    contact_phone: '011-1234-5678',
    support_level: 'partial',
    explanation_method: 'document',
    notes: '初回コンタクト済み。資料送付予定。',
    status_changed_at: new Date().toISOString()
  }
]

async function seedCompanies() {
  console.log('🚀 Supabaseにダミーデータを投入開始...')
  
  try {
    // 既存のデータを削除（オプション）
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 実際には存在しないIDを指定して全削除
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('既存データの削除エラー:', deleteError)
    }
    
    // 新しいデータを挿入
    const { data, error } = await supabase
      .from('companies')
      .insert(companies)
      .select()
    
    if (error) {
      console.error('❌ データ挿入エラー:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log(`✅ ${data.length}件の企業データを投入しました`)
      
      // 投入したデータを表示
      data.forEach((company, index) => {
        console.log(`  ${index + 1}. ${company.name} (ステータス: ${company.current_status})`)
      })
    } else {
      console.log('⚠️ データが投入されませんでした')
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

seedCompanies()
  .then(() => {
    console.log('✨ 完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  })