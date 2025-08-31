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

const EXPECTED_TABLES = [
  'agencies',
  'profiles', 
  'companies',
  'status_histories',
  'emails',
  'faqs',
  'faq_generation_jobs',
  'alerts',
  'activity_logs',
  'scheduled_reports',
  'report_execution_history'
]

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ ${tableName} - Table does not exist`)
        return false
      } else {
        console.log(`⚠️  ${tableName} - Error: ${error.message}`)
        return false
      }
    } else {
      console.log(`✅ ${tableName} - Table exists`)
      return true
    }
  } catch (error) {
    console.log(`❌ ${tableName} - Error: ${error.message}`)
    return false
  }
}

async function checkDatabaseComprehensive() {
  console.log('🔍 Comprehensive Database Check\n')
  
  const results = []
  
  for (const table of EXPECTED_TABLES) {
    const exists = await checkTable(table)
    results.push({ table, exists })
  }
  
  console.log('\n📊 Summary:')
  const existingTables = results.filter(r => r.exists)
  const missingTables = results.filter(r => !r.exists)
  
  console.log(`✅ Existing tables: ${existingTables.length}/${EXPECTED_TABLES.length}`)
  if (missingTables.length > 0) {
    console.log('❌ Missing tables:')
    missingTables.forEach(r => console.log(`   - ${r.table}`))
    console.log('\n🔧 Action needed:')
    console.log('   Run the database migrations in Supabase Dashboard > SQL Editor')
    console.log('   1. 001_initial_schema.sql')
    console.log('   2. 002_scheduled_reports.sql')
    console.log('   3. 003_enable_rls.sql')
  } else {
    console.log('🎉 All expected tables exist!')
  }
}

checkDatabaseComprehensive()