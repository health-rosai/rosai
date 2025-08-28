import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_ACCESS_TOKEN = 'sbp_ff4619a535f15e5435def50a1fd9c26061582597';
const PROJECT_REF = 'vkfjrgmxzkpkuygmryke';
const API_URL = 'https://api.supabase.com/v1';

// Google OAuth credentials from the documentation
const GOOGLE_CLIENT_ID = '386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

async function configureGoogleOAuth() {
  console.log('🔧 Configuring Google OAuth for Supabase...\n');

  try {
    // 1. First, update redirect URLs to include localhost for development
    console.log('1. Updating redirect URLs for development...');
    const authConfigResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_url: 'http://localhost:3002',
        redirect_urls: [
          'http://localhost:3000/**',
          'http://localhost:3001/**',
          'http://localhost:3002/**',
          'https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app/**',
        ],
        url_allow_list: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app'
        ]
      })
    });

    if (!authConfigResponse.ok) {
      const error = await authConfigResponse.text();
      console.error('❌ Failed to update redirect URLs:', error);
      return;
    }
    console.log('✅ Redirect URLs updated successfully');

    // 2. Enable and configure Google OAuth provider
    console.log('\n2. Configuring Google OAuth provider...');
    const googleConfigResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_google_enabled: true,
        external_google_client_id: GOOGLE_CLIENT_ID,
        external_google_secret: GOOGLE_CLIENT_SECRET,
        external_google_skip_nonce_check: false
      })
    });

    if (!googleConfigResponse.ok) {
      const error = await googleConfigResponse.text();
      console.error('❌ Failed to configure Google OAuth:', error);
      console.log('\n⚠️  Please configure manually in Supabase Dashboard:');
      console.log('   1. Go to: https://app.supabase.com/project/vkfjrgmxzkpkuygmryke/auth/providers');
      console.log('   2. Enable Google provider');
      console.log('   3. Add Client ID:', GOOGLE_CLIENT_ID);
      console.log('   4. Add Client Secret:', GOOGLE_CLIENT_SECRET);
      return;
    }

    console.log('✅ Google OAuth provider configured successfully');

    // 3. Get the callback URL for Google Console configuration
    console.log('\n3. Getting callback URL for Google Console...');
    const configResponse = await fetch(`${API_URL}/projects/${PROJECT_REF}/config/auth`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      }
    });

    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log('\n📋 Google Cloud Console Configuration:');
      console.log('================================');
      console.log('Add these Authorized redirect URIs to your Google OAuth client:');
      console.log('1. https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback');
      console.log('2. http://localhost:3002/dashboard');
      console.log('\nGoogle Cloud Console URL:');
      console.log('https://console.cloud.google.com/apis/credentials');
    }

    console.log('\n🎉 Configuration completed successfully!');
    console.log('\n📝 Testing instructions:');
    console.log('1. Access your development server: http://localhost:3002/login');
    console.log('2. Click "Googleでログイン" button');
    console.log('3. Authenticate with your Google account');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual configuration required:');
    console.log('1. Go to: https://app.supabase.com/project/vkfjrgmxzkpkuygmryke/auth/providers');
    console.log('2. Enable Google provider and add credentials');
  }
}

// Run the configuration
configureGoogleOAuth();