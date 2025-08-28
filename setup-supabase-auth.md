# Supabase認証設定ガイド

## 自動設定に必要な情報

### 1. Supabase Access Token取得手順

1. **Supabase Dashboardにログイン**
   - URL: https://app.supabase.com
   - メールアドレスとパスワードでログイン

2. **Access Token生成**
   - 方法A: Dashboard経由
     - 右上のアバターアイコン → Account Settings
     - 「Access Tokens」タブ
     - 「Generate new token」クリック
     - Token name: `claude-setup`
     - 「Generate Token」クリック
     - トークンをコピー（`sbp_`で始まる文字列）

   - 方法B: プロジェクト設定経由  
     - プロジェクトを選択
     - Settings → API
     - 「service_role」キーをコピー（既に.env.localにあります）

### 2. Google OAuth設定（オプション）

Google認証を有効にする場合：

1. **Google Cloud Console**
   - https://console.cloud.google.com
   - プロジェクトを選択/作成
   - APIs & Services → Credentials
   - 「CREATE CREDENTIALS」→ OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback
     ```
   - Client IDとClient Secretをコピー

## 提供していただく情報

以下の情報を教えてください：

1. **Supabase Access Token** または **既存のService Role Key使用の確認**
   ```
   sbp_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   または
   ```
   既存のService Role Keyを使用してください
   ```

2. **Google OAuth情報**（設定する場合）
   ```
   Client ID: xxxxxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxxxxxxxxxxxx
   ```
   または
   ```
   Google認証は後で設定します
   ```

## 自動設定される内容

提供いただいた情報で以下を自動設定します：

1. **Site URL設定**
   - 本番URL: https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app

2. **Redirect URLs追加**
   - 本番環境用のリダイレクトURL

3. **Google認証プロバイダー**（情報提供時）
   - Google OAuth有効化
   - Client ID/Secret設定

4. **Email認証設定**
   - 確認メールテンプレート
   - リダイレクトURL

これらの情報があれば、Supabase側の設定を自動化できます。