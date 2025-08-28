# Vercelデプロイガイド

## 1. Vercel CLIでログイン

以下のコマンドを実行して、お好みの方法でログインしてください：

```bash
vercel login
```

オプションを選択：
- **Continue with GitHub** (推奨)
- Continue with Google  
- Continue with Email

## 2. プロジェクトをデプロイ

ログイン後、以下のコマンドを実行：

```bash
vercel --prod
```

初回デプロイ時の質問に答えてください：
- Set up and deploy "~/kenshin_plus_system/rousai-system"? **Y**
- Which scope do you want to deploy to? **あなたのアカウントを選択**
- Link to existing project? **N**（新規の場合）
- What's your project's name? **rousai-system**（または任意の名前）
- In which directory is your code located? **./**（そのままEnter）

## 3. 環境変数の設定

### 方法1: Vercel Dashboard（推奨）

1. https://vercel.com/dashboard にアクセス
2. デプロイしたプロジェクトを選択
3. "Settings" タブ → "Environment Variables"
4. 以下の環境変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://vkfjrgmxzkpkuygmryke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZmpyZ214emtwa3V5Z21yeWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4NjIzNzUsImV4cCI6MjA0MDQzODM3NX0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZmpyZ214emtwa3V5Z21yeWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ4NjIzNzUsImV4cCI6MjA0MDQzODM3NX0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZmpyZ214emtwa3V5Z21yeWtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyNTA3MCwiZXhwIjoyMDcxMzAxMDcwfQ.UD0BwZoIuvF1q4QWY4BFd2pHqI859zRWabT1BLBiS10
GOOGLE_GEMINI_API_KEY=AIzaSyAfiC0RpmRrQuaWe7LxQ5I3RFVpPqSNTQk
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### 方法2: CLI経由

```bash
# 各環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_GEMINI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

## 4. 再デプロイ

環境変数設定後、再デプロイ：

```bash
vercel --prod
```

## 5. デプロイ確認

デプロイ完了後、表示されるURLにアクセスして動作確認してください。

## トラブルシューティング

### ビルドエラーの場合
- ローカルで `npm run build` が成功することを確認
- 環境変数が正しく設定されているか確認

### Supabase接続エラーの場合
- Supabase URLとキーが正しいか確認
- Supabase側でCORSが適切に設定されているか確認

### その他のエラー
- Vercel のログを確認: `vercel logs`
- プロジェクトの Functions タブでエラーを確認