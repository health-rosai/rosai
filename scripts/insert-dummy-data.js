import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Dummy data
const dummyCompanies = [
  {
    id: '1',
    name: '株式会社サンプル製造',
    code: 'SM-001',
    phase: '営業',
    current_status: '01',
    contact_person: '山田太郎',
    contact_email: 'yamada@sample-mfg.co.jp',
    contact_phone: '03-1234-5678',
    needs_explanation: true,
    explanation_method: 'online',
    created_at: new Date('2024-01-15T09:00:00').toISOString(),
    updated_at: new Date('2024-08-29T14:30:00').toISOString(),
    status_changed_at: new Date('2024-08-29T14:30:00').toISOString(),
  },
  {
    id: '2',
    name: '東京物流センター株式会社',
    code: 'TLC-002',
    phase: '契約',
    current_status: '10',
    contact_person: '鈴木花子',
    contact_email: 'suzuki@tokyo-logistics.jp',
    contact_phone: '03-2345-6789',
    needs_explanation: false,
    created_at: new Date('2024-02-20T10:00:00').toISOString(),
    updated_at: new Date('2024-08-28T11:45:00').toISOString(),
    status_changed_at: new Date('2024-08-28T11:45:00').toISOString(),
  },
  {
    id: '3',
    name: '関西電子部品株式会社',
    code: 'KEP-003',
    phase: '健診・判定',
    current_status: '12',
    contact_person: '田中一郎',
    contact_email: 'tanaka@kansai-electronics.com',
    contact_phone: '06-3456-7890',
    needs_explanation: true,
    explanation_method: 'visit',
    created_at: new Date('2024-03-10T08:30:00').toISOString(),
    updated_at: new Date('2024-08-30T09:15:00').toISOString(),
    status_changed_at: new Date('2024-08-30T09:15:00').toISOString(),
  },
  {
    id: '4',
    name: 'グローバルフーズ株式会社',
    code: 'GF-004',
    phase: '労災二次健診',
    current_status: '14',
    contact_person: '佐藤美香',
    contact_email: 'sato@global-foods.jp',
    contact_phone: '045-4567-8901',
    needs_explanation: true,
    explanation_method: 'document',
    created_at: new Date('2024-04-05T13:20:00').toISOString(),
    updated_at: new Date('2024-08-27T16:00:00').toISOString(),
    status_changed_at: new Date('2024-08-27T16:00:00').toISOString(),
  },
  {
    id: '5',
    name: '中部自動車工業株式会社',
    code: 'CAI-005',
    phase: '請求',
    current_status: '18',
    contact_person: '高橋健太',
    contact_email: 'takahashi@chubu-auto.co.jp',
    contact_phone: '052-5678-9012',
    needs_explanation: false,
    created_at: new Date('2024-05-12T14:00:00').toISOString(),
    updated_at: new Date('2024-08-26T10:30:00').toISOString(),
    status_changed_at: new Date('2024-08-26T10:30:00').toISOString(),
  }
]

const dummyAgencies = [
  {
    id: '1',
    name: '東京健診サポートセンター',
    code: 'TSC-001',
    contact_email: 'info@tokyo-health.jp',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: '関西健康管理協会',
    code: 'KHA-002',
    contact_email: 'info@kansai-health.jp',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

async function insertDummyData() {
  console.log('🚀 Inserting dummy data into database...\n')

  try {
    // Insert agencies
    console.log('📝 Inserting agencies...')
    const { data: agenciesData, error: agenciesError } = await supabase
      .from('agencies')
      .insert(dummyAgencies)
      .select()

    if (agenciesError) {
      console.log('❌ Error inserting agencies:', agenciesError.message)
    } else {
      console.log(`✅ Inserted ${agenciesData.length} agencies`)
    }

    // Insert companies
    console.log('\n📝 Inserting companies...')
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .insert(dummyCompanies)
      .select()

    if (companiesError) {
      console.log('❌ Error inserting companies:', companiesError.message)
    } else {
      console.log(`✅ Inserted ${companiesData.length} companies`)
    }

    // Insert status histories for companies
    console.log('\n📝 Inserting status histories...')
    const statusHistories = []
    for (const company of dummyCompanies) {
      statusHistories.push({
        company_id: company.id,
        to_status: company.current_status,
        changed_by: 'system',
        change_reason: 'Initial data insertion',
        created_at: new Date().toISOString(),
      })
    }

    const { data: historiesData, error: historiesError } = await supabase
      .from('status_histories')
      .insert(statusHistories)
      .select()

    if (historiesError) {
      console.log('❌ Error inserting status histories:', historiesError.message)
    } else {
      console.log(`✅ Inserted ${historiesData.length} status histories`)
    }

    console.log('\n🎉 Dummy data insertion completed!')
    console.log('You can now start the development server and see the data.')

  } catch (error) {
    console.error('❌ Error during data insertion:', error)
  }
}

insertDummyData()
