import { GoogleGenerativeAI } from '@google/generative-ai'
import { google } from 'googleapis'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

async function testGeminiAPI() {
  console.log('🤖 Testing Gemini AI API...')
  
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    console.log('❌ GOOGLE_GEMINI_API_KEY is missing')
    return false
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const result = await model.generateContent("Hello, respond with 'API Working' if you can see this.")
    const response = await result.response
    const text = response.text()
    
    if (text) {
      console.log('✅ Gemini API working - Response:', text.substring(0, 50) + '...')
      return true
    } else {
      console.log('❌ Gemini API returned empty response')
      return false
    }
  } catch (error) {
    console.log('❌ Gemini API error:', error.message)
    return false
  }
}

async function testGmailAPI() {
  console.log('\n📧 Testing Gmail API configuration...')
  
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const redirectUri = process.env.GMAIL_REDIRECT_URI
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  
  const missing = []
  if (!clientId) missing.push('GMAIL_CLIENT_ID')
  if (!clientSecret) missing.push('GMAIL_CLIENT_SECRET')
  if (!redirectUri) missing.push('GMAIL_REDIRECT_URI')
  if (!refreshToken) missing.push('GMAIL_REFRESH_TOKEN')
  
  if (missing.length > 0) {
    console.log('❌ Missing Gmail API environment variables:')
    missing.forEach(v => console.log(`   - ${v}`))
    return false
  }
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )
    
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    })
    
    // Test token refresh
    const { credentials } = await oauth2Client.refreshAccessToken()
    if (credentials.access_token) {
      console.log('✅ Gmail OAuth credentials working')
      
      // Test Gmail API access
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
      const profile = await gmail.users.getProfile({ userId: 'me' })
      
      if (profile.data.emailAddress) {
        console.log('✅ Gmail API access working for:', profile.data.emailAddress)
        return true
      } else {
        console.log('❌ Gmail API profile request failed')
        return false
      }
    } else {
      console.log('❌ Failed to refresh Gmail access token')
      return false
    }
  } catch (error) {
    console.log('❌ Gmail API error:', error.message)
    if (error.message.includes('invalid_grant')) {
      console.log('   This usually means the refresh token has expired.')
      console.log('   You need to re-authenticate the Gmail OAuth flow.')
    }
    return false
  }
}

async function testGoogleServices() {
  console.log('🔍 Testing Google Services Configuration\n')
  
  const geminiWorking = await testGeminiAPI()
  const gmailWorking = await testGmailAPI()
  
  console.log('\n📊 Summary:')
  console.log(`Gemini AI API: ${geminiWorking ? '✅ Working' : '❌ Failed'}`)
  console.log(`Gmail API: ${gmailWorking ? '✅ Working' : '❌ Failed'}`)
  
  if (geminiWorking && gmailWorking) {
    console.log('\n🎉 All Google services are configured correctly!')
  } else {
    console.log('\n🔧 Action needed:')
    if (!geminiWorking) {
      console.log('   - Check your Gemini API key in Google AI Studio')
      console.log('   - Ensure the API key has proper permissions')
    }
    if (!gmailWorking) {
      console.log('   - Re-run Gmail OAuth setup')
      console.log('   - Check OAuth credentials in Google Cloud Console')
    }
  }
}

testGoogleServices()