import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

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

async function applyRLSPolicies() {
  console.log('🔧 Applying RLS policies...\n')

  try {
    // Read SQL file
    const sqlPath = join(__dirname, 'setup-rls-policies.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      
      const { data, error } = await supabase.rpc('execute_sql', {
        sql: statement + ';'
      })
      
      if (error) {
        // Try direct execution if RPC doesn't exist
        const { data: directData, error: directError } = await supabase
          .from('_sql')
          .insert({ query: statement + ';' })
          .select()
        
        if (directError) {
          console.log(`⚠️  Statement failed (this might be expected): ${directError.message}`)
        } else {
          console.log('✅ Statement executed')
        }
      } else {
        console.log('✅ Statement executed')
      }
    }

    console.log('\n📝 RLS policies setup attempt completed!')
    console.log('Note: Some errors are expected if policies already exist.')
    console.log('\n⚠️  IMPORTANT: These are permissive policies for testing only!')
    console.log('   You should implement proper authentication-based policies for production.')
    
    // Test insertion
    console.log('\n🧪 Testing company insertion...')
    const testCompany = {
      name: 'テスト企業',
      code: 'TEST-' + Date.now(),
      current_status: '01',
      support_level: 'referral_only',
      explanation_method: 'online',
      needs_explanation: false
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('companies')
      .insert([testCompany])
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Test insertion failed:', insertError.message)
      console.log('   Error details:', insertError)
    } else {
      console.log('✅ Test insertion succeeded!')
      console.log('   Created company:', insertData.name, '(ID:', insertData.id, ')')
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', insertData.id)
      
      if (!deleteError) {
        console.log('   Test data cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error)
    console.log('\n💡 Alternative: Apply these policies manually in Supabase Dashboard')
    console.log('   1. Go to: https://app.supabase.com/project/vkfjrgmxzkpkuygmryke/editor')
    console.log('   2. Open SQL Editor')
    console.log('   3. Copy and paste the contents of scripts/setup-rls-policies.sql')
    console.log('   4. Run the SQL')
  }
}

// Run the setup
applyRLSPolicies()