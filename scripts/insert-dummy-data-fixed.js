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

// Dummy data with correct schema
const dummyAgencies = [
  {
    name: '東京健診サポートセンター',
    code: 'TSC-001',
    contact_email: 'info@tokyo-health.jp',
    is_active: true,
  },
  {
    name: '関西健康管理協会',
    code: 'KHA-002',
    contact_email: 'info@kansai-health.jp',
    is_active: true,
  }
]

const dummyCompanies = [
  {
    name: '株式会社サンプル製造',
    code: 'SM-001',
    current_status: '01', // 営業フェーズ
    contact_person: '山田太郎',
    contact_email: 'yamada@sample-mfg.co.jp',
    contact_phone: '03-1234-5678',
    needs_explanation: true,
    explanation_method: 'online',
    support_level: 'full',
  },
  {
    name: '東京物流センター株式会社',
    code: 'TLC-002',
    current_status: '10', // 健診・判定フェーズ
    contact_person: '鈴木花子',
    contact_email: 'suzuki@tokyo-logistics.jp',
    contact_phone: '03-2345-6789',
    needs_explanation: false,
    support_level: 'partial',
  },
  {
    name: '関西電子部品株式会社',
    code: 'KEP-003',
    current_status: '12', // 健診・判定フェーズ
    contact_person: '田中一郎',
    contact_email: 'tanaka@kansai-electronics.com',
    contact_phone: '06-3456-7890',
    needs_explanation: true,
    explanation_method: 'visit',
    support_level: 'full',
  },
  {
    name: 'グローバルフーズ株式会社',
    code: 'GF-004',
    current_status: '14', // 労災二次健診フェーズ
    contact_person: '佐藤美香',
    contact_email: 'sato@global-foods.jp',
    contact_phone: '045-4567-8901',
    needs_explanation: true,
    explanation_method: 'document',
    support_level: 'full',
  },
  {
    name: '中部自動車工業株式会社',
    code: 'CAI-005',
    current_status: '18', // 請求フェーズ
    contact_person: '高橋健太',
    contact_email: 'takahashi@chubu-auto.co.jp',
    contact_phone: '052-5678-9012',
    needs_explanation: false,
    support_level: 'partial',
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
      return
    } else {
      console.log(`✅ Inserted ${agenciesData.length} agencies`)
    }

    // Get the first agency ID for company references
    const firstAgencyId = agenciesData[0].id

    // Insert companies with agency reference
    console.log('\n📝 Inserting companies...')
    const companiesWithAgency = dummyCompanies.map(company => ({
      ...company,
      agency_id: firstAgencyId
    }))

    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .insert(companiesWithAgency)
      .select()

    if (companiesError) {
      console.log('❌ Error inserting companies:', companiesError.message)
      return
    } else {
      console.log(`✅ Inserted ${companiesData.length} companies`)
    }

    // Insert status histories for companies
    console.log('\n📝 Inserting status histories...')
    const statusHistories = companiesData.map(company => ({
      company_id: company.id,
      to_status: company.current_status,
      change_reason: 'Initial data insertion',
    }))

    const { data: historiesData, error: historiesError } = await supabase
      .from('status_histories')
      .insert(statusHistories)
      .select()

    if (historiesError) {
      console.log('❌ Error inserting status histories:', historiesError.message)
    } else {
      console.log(`✅ Inserted ${historiesData.length} status histories`)
    }

    // Insert some sample FAQs
    console.log('\n📝 Inserting sample FAQs...')
    const sampleFAQs = [
      {
        question: '労災二次健診の対象者は誰ですか？',
        answer: '労働安全衛生法に基づき、特定の有害業務に従事する労働者が対象となります。',
        category: '健診',
        status: 'published',
        tags: ['健診', '対象者', '法律']
      },
      {
        question: '健診結果の説明はどのように行われますか？',
        answer: 'オンライン、訪問、書面の3つの方法から選択いただけます。',
        category: '健診',
        status: 'published',
        tags: ['健診', '説明', '方法']
      }
    ]

    const { data: faqsData, error: faqsError } = await supabase
      .from('faqs')
      .insert(sampleFAQs)
      .select()

    if (faqsError) {
      console.log('❌ Error inserting FAQs:', faqsError.message)
    } else {
      console.log(`✅ Inserted ${faqsData.length} FAQs`)
    }

    console.log('\n🎉 Dummy data insertion completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Agencies: ${agenciesData.length}`)
    console.log(`   - Companies: ${companiesData.length}`)
    console.log(`   - Status Histories: ${historiesData.length}`)
    console.log(`   - FAQs: ${faqsData.length}`)
    console.log('\n🚀 You can now start the development server and see the data!')

  } catch (error) {
    console.error('❌ Error during data insertion:', error)
  }
}

insertDummyData()
