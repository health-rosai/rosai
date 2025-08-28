import fetch from 'node-fetch';

const SUPABASE_ACCESS_TOKEN = 'sbp_ff4619a535f15e5435def50a1fd9c26061582597';
const PROJECT_REF = 'vkfjrgmxzkpkuygmryke';
const PRODUCTION_URL = 'https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app';

// Supabase Management API Base URL
const API_URL = 'https://api.supabase.com/v1';

async function updateAuthConfig() {
  console.log('🔧 Configuring Supabase Authentication...\n');

  try {
    // 1. Update Auth Configuration
    console.log('1. Updating Site URL and Redirect URLs...');
    const authConfigResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_url: PRODUCTION_URL,
        redirect_urls: [
          `${PRODUCTION_URL}/**`,
          `${PRODUCTION_URL}/auth/callback`,
          `${PRODUCTION_URL}/login`,
          'http://localhost:3000/**',
          'http://localhost:3001/**'
        ],
        url_allow_list: [
          PRODUCTION_URL,
          'http://localhost:3000',
          'http://localhost:3001'
        ],
        disable_signup: false,
        external_google_enabled: true,
        external_email_enabled: true,
        mailer_autoconfirm: false,
        sms_autoconfirm: false
      })
    });

    if (!authConfigResponse.ok) {
      const error = await authConfigResponse.text();
      console.error('❌ Failed to update auth config:', error);
    } else {
      console.log('✅ Auth configuration updated successfully');
    }

    // 2. Enable Google OAuth Provider
    console.log('\n2. Configuring Google OAuth provider...');
    
    // First, get current auth providers
    const providersResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      }
    });

    if (providersResponse.ok) {
      const authConfig = await providersResponse.json();
      
      // Update with Google OAuth settings
      const googleUpdateResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_google_enabled: true,
          external_google_client_id: process.env.GOOGLE_CLIENT_ID || '',
          external_google_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          external_google_skip_nonce_check: false
        })
      });

      if (!googleUpdateResponse.ok) {
        console.log('⚠️  Google OAuth provider needs manual configuration in Supabase Dashboard');
        console.log('   Go to: Authentication → Providers → Google');
      } else {
        console.log('✅ Google OAuth provider configured');
      }
    }

    // 3. Update Email Templates
    console.log('\n3. Updating email templates...');
    const emailTemplateResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mailer_url_paths: {
          confirmation: '/auth/confirm',
          invite: '/auth/accept-invite',
          recovery: '/auth/reset-password',
          email_change: '/auth/confirm-email-change'
        }
      })
    });

    if (emailTemplateResponse.ok) {
      console.log('✅ Email templates updated');
    } else {
      console.log('⚠️  Email templates need manual configuration');
    }

    console.log('\n🎉 Supabase authentication configuration completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If Google OAuth is needed, add Client ID and Secret in Supabase Dashboard');
    console.log('2. Test login at:', PRODUCTION_URL + '/login');
    console.log('3. Check Supabase Dashboard for any additional settings');

  } catch (error) {
    console.error('❌ Error configuring Supabase:', error.message);
    console.log('\n💡 Alternative: Configure manually in Supabase Dashboard');
    console.log('   1. Go to: https://app.supabase.com/project/' + PROJECT_REF);
    console.log('   2. Authentication → URL Configuration');
    console.log('   3. Set Site URL to:', PRODUCTION_URL);
    console.log('   4. Add Redirect URL:', PRODUCTION_URL + '/**');
  }
}

// Run the setup
updateAuthConfig();