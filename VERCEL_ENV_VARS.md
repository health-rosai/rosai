# Vercel環境変数 完全リスト

## 修正が必要な環境変数

### 1. GMAIL_CLIENT_SECRET を追加（MAIL_CLIENT_SECRETではない）
```
Key: GMAIL_CLIENT_SECRET
Value: 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
```

### 2. NEXT_PUBLIC_APP_URL を追加
```
Key: NEXT_PUBLIC_APP_URL
Value: https://rosai.vercel.app
```

### 3. NEXT_PUBLIC_ENVIRONMENT を追加
```
Key: NEXT_PUBLIC_ENVIRONMENT  
Value: production
```

### 4. GMAIL_REDIRECT_URI を追加
```
Key: GMAIL_REDIRECT_URI
Value: https://rosai.vercel.app/api/gmail/import
```

## 既に設定済みの環境変数（確認用）
- ✅ GMAIL_REFRESH_TOKEN
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ GOOGLE_GEMINI_API_KEY
- ✅ GMAIL_CLIENT_ID
- ❌ MAIL_CLIENT_SECRET（これは間違い。GMAIL_CLIENT_SECRETが必要）

## 手順
1. https://vercel.com/health-rosais-projects/rosai/settings/environment-variables にアクセス
2. 上記の4つの環境変数を追加
3. Redeployを実行