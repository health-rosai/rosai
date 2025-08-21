# GitHub & Vercel デプロイガイド

## 📋 GitHubリポジトリ作成

### 1. GitHubで新規リポジトリ作成
1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」
3. Repository name: `rousai-system`
4. Description: `労災二次健診進捗管理システム - AI-powered health check management system`
5. Public/Private を選択
6. 「Create repository」をクリック

### 2. ローカルからプッシュ
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/rousai-system.git

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

## 🚀 Vercelデプロイ

### 1. Vercelアカウント作成
1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」→ GitHubアカウントで登録

### 2. プロジェクトインポート
1. Vercelダッシュボードで「New Project」
2. GitHubリポジトリから`rousai-system`を選択
3. 「Import」をクリック

### 3. 環境変数設定
「Environment Variables」で以下を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Google APIs
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=https://your-app.vercel.app/api/gmail/import
GMAIL_REFRESH_TOKEN=your_refresh_token

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### 4. デプロイ設定
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 5. デプロイ実行
「Deploy」をクリック

## 📝 デプロイ後の設定

### 1. Google OAuth リダイレクトURI更新
1. Google Cloud Consoleで認証情報を開く
2. OAuth 2.0 クライアントIDを編集
3. リダイレクトURIに本番URLを追加：
   ```
   https://your-app.vercel.app/api/gmail/import
   ```

### 2. Supabase URL許可リスト
1. Supabaseダッシュボード→「Authentication」→「URL Configuration」
2. Site URLとRedirect URLsに本番URLを追加

### 3. カスタムドメイン設定（オプション）
1. Vercelダッシュボード→「Settings」→「Domains」
2. カスタムドメインを追加
3. DNSレコードを設定

## ✅ デプロイチェックリスト
- [ ] GitHubリポジトリ作成完了
- [ ] Vercelプロジェクト作成完了
- [ ] 環境変数設定完了
- [ ] デプロイ成功
- [ ] 本番URLでアクセス確認
- [ ] Gmail認証動作確認
- [ ] Supabase接続確認