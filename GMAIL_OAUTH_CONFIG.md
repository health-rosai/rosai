# Gmail OAuth Configuration

## Important: Add these redirect URIs to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   - `http://localhost:3001/api/gmail/import` (for local development)
   - `https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app/api/gmail/import` (for production)

## Current OAuth Credentials
- **Client ID**: 386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com
- **Client Secret**: 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

## Testing the Gmail Import
1. Go to: https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app/admin/email-import
2. Click "認証ページを開く" to authenticate with Gmail
3. After authentication, click "インポート開始" to import emails

## Troubleshooting
- If you see "Missing required parameter: client_id", the environment variables may not be loaded properly
- Check the Vercel environment variables are set correctly
- Ensure the redirect URIs match exactly in Google Cloud Console