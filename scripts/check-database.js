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

async function checkDatabase() {
  console.log('🔍 Checking database tables...\n')

  try {
    // Check if companies table exists
    const { data: tables, error: tablesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (tablesError) {
      console.log('❌ Companies table check failed:', tablesError.message)
      console.log('   Error code:', tablesError.code)
      
      if (tablesError.code === '42P01') {
        console.log('\n⚠️  The companies table does not exist!')
        console.log('   You need to run the migration to create it.')
        return false
      }
    } else {
      console.log('✅ Companies table exists')
      
      // Check table structure
      const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
        table_name: 'companies'
      }).single()
      
      if (!columnsError && columns) {
        console.log('   Columns:', columns)
      }
    }

    // Check if agencies table exists
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*')
      .limit(1)

    if (agenciesError) {
      console.log('❌ Agencies table check failed:', agenciesError.message)
      if (agenciesError.code === '42P01') {
        console.log('   The agencies table does not exist!')
      }
    } else {
      console.log('✅ Agencies table exists')
    }

    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.log('❌ Profiles table check failed:', profilesError.message)
      if (profilesError.code === '42P01') {
        console.log('   The profiles table does not exist!')
      }
    } else {
      console.log('✅ Profiles table exists')
    }

    console.log('\n📝 Summary:')
    console.log('If any tables are missing, you need to run the migration.')
    console.log('Go to Supabase Dashboard > SQL Editor and run the migration script.')
    
    return true

  } catch (error) {
    console.error('❌ Error checking database:', error)
    return false
  }
}

// Run the check
checkDatabase()