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

async function checkDataCount() {
  console.log('🔍 Checking data count in database tables...\n')

  const tables = [
    'companies',
    'agencies', 
    'profiles',
    'status_histories',
    'emails',
    'faqs',
    'alerts'
  ]

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${table}: Error - ${error.message}`)
      } else {
        console.log(`📊 ${table}: ${count || 0} records`)
      }
    } catch (error) {
      console.log(`❌ ${table}: Error - ${error.message}`)
    }
  }

  console.log('\n📝 Summary:')
  console.log('If companies table has 0 records, you need to seed dummy data.')
  console.log('Run: npx ts-node scripts/seed-dummy-data.ts')
}

checkDataCount()
