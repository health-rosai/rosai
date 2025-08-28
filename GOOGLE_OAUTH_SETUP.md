# Google OAuth 設定ガイド

## 手動設定手順（Supabase Dashboard）

### 1. Supabase Dashboardで設定

1. **Supabase Dashboardにアクセス**
   - URL: https://app.supabase.com/project/vkfjrgmxzkpkuygmryke/auth/providers

2. **Google プロバイダーを有効化**
   - 「Google」セクションを探す
   - 「Enable Google provider」をONにする

3. **認証情報を入力**
   - 以下の情報を入力してください：

```
Client ID: 386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com
Client Secret: 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
```

4. **Authorized redirect URI をコピー**
   - Supabaseが表示する「Callback URL (for OAuth)」をコピー
   - 通常は: `https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback`

### 2. Google Cloud Consoleで設定

1. **Google Cloud Consoleにアクセス**
   - URL: https://console.cloud.google.com/apis/credentials

2. **OAuth 2.0 クライアントIDを編集**
   - 既存のクライアントIDをクリック
   - または新規作成

3. **承認済みのリダイレクトURIを追加**
   ```
   https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback
   ```

4. **保存**

### 3. テスト

1. ログインページにアクセス:
   https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app/login

2. 「Googleでログイン」ボタンをクリック

3. Googleアカウントで認証

## トラブルシューティング

### エラー: "Unsupported provider: missing OAuth client ID"
- Supabase DashboardでGoogle providerが有効になっているか確認
- Client IDとClient Secretが正しく入力されているか確認

### エラー: "redirect_uri_mismatch"
- Google Cloud ConsoleのリダイレクトURIが正しいか確認
- Supabaseのcallback URLと完全に一致している必要があります

### エラー: "Access blocked"
- Google Cloud ConsoleでOAuth同意画面の設定を確認
- テストユーザーを追加するか、本番環境に公開

## 重要な注意事項

現在`.env.local`にあるGoogle認証情報（GMAIL_CLIENT_ID/SECRET）は、Gmail API用のものです。
Supabase認証用には別のOAuthクライアントを作成することを推奨します。

### 新しいOAuthクライアントを作成する場合：

1. Google Cloud Console → APIs & Services → Credentials
2. 「CREATE CREDENTIALS」→ OAuth client ID
3. Application type: Web application
4. Name: Supabase Auth for Rousai System
5. Authorized redirect URIs:
   - `https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback`
6. Create → Client IDとSecretをコピー