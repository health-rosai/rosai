import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const REQUIRED_ENV_VARS = [
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  
  // Google APIs
  'GOOGLE_GEMINI_API_KEY',
  'GMAIL_CLIENT_ID',
  'GMAIL_CLIENT_SECRET',
  'GMAIL_REDIRECT_URI',
  'GMAIL_REFRESH_TOKEN',
  
  // App Config
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ENVIRONMENT',
  'NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET'
]

const OPTIONAL_ENV_VARS = [
  'SENTRY_DSN',
  'NEXT_PUBLIC_VERCEL_ANALYTICS_ID'
]

function checkEnvironmentVariables() {
  console.log('🔍 Environment Variables Check\n')
  
  const missing = []
  const present = []
  const warnings = []
  
  // Check required variables
  console.log('📋 Required Variables:')
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      missing.push(varName)
      console.log(`❌ ${varName} - Missing or empty`)
    } else {
      present.push(varName)
      // Mask sensitive values for display
      const maskedValue = value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` : value
      console.log(`✅ ${varName} - Present (${maskedValue})`)
      
      // Additional validation
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
        warnings.push(`${varName} should start with https://`)
      }
      if (varName === 'GMAIL_REDIRECT_URI' && !value.startsWith('http')) {
        warnings.push(`${varName} should be a valid URL`)
      }
      if (varName === 'NEXT_PUBLIC_APP_URL' && !value.startsWith('http')) {
        warnings.push(`${varName} should be a valid URL`)
      }
    }
  })
  
  // Check optional variables
  console.log('\n📝 Optional Variables:')
  OPTIONAL_ENV_VARS.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.trim() === '' || value === 'your_sentry_dsn' || value === 'your_analytics_id') {
      console.log(`⚠️  ${varName} - Not configured (optional)`)
    } else {
      const maskedValue = value.length > 20 ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` : value
      console.log(`✅ ${varName} - Present (${maskedValue})`)
    }
  })
  
  // Check for common issues
  console.log('\n🔧 Configuration Issues:')
  
  // Check if redirect URI matches app URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const redirectUri = process.env.GMAIL_REDIRECT_URI
  if (appUrl && redirectUri) {
    if (appUrl.includes('localhost') && redirectUri.includes('localhost')) {
      const appPort = appUrl.match(/:(\d+)/)?.[1]
      const redirectPort = redirectUri.match(/:(\d+)/)?.[1]
      if (appPort !== redirectPort) {
        warnings.push(`Port mismatch: APP_URL uses ${appPort}, GMAIL_REDIRECT_URI uses ${redirectPort}`)
      }
    }
  }
  
  // Check environment consistency
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT
  if (environment === 'development' && appUrl?.includes('vercel.app')) {
    warnings.push('Environment is "development" but APP_URL points to production')
  }
  if (environment === 'production' && appUrl?.includes('localhost')) {
    warnings.push('Environment is "production" but APP_URL points to localhost')
  }
  
  // Summary
  console.log('\n📊 Summary:')
  console.log(`✅ Required variables present: ${present.length}/${REQUIRED_ENV_VARS.length}`)
  
  if (missing.length > 0) {
    console.log(`❌ Missing required variables: ${missing.length}`)
    console.log('   Missing:')
    missing.forEach(v => console.log(`   - ${v}`))
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  Configuration warnings: ${warnings.length}`)
    warnings.forEach(w => console.log(`   - ${w}`))
  }
  
  if (missing.length === 0 && warnings.length === 0) {
    console.log('\n🎉 All environment variables are properly configured!')
  } else if (missing.length === 0) {
    console.log('\n✨ Required variables are present, but check warnings above')
  } else {
    console.log('\n🔧 Action needed: Configure missing environment variables')
  }
}

checkEnvironmentVariables()