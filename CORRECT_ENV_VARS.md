# 正しいVercel環境変数設定

## 正しいURL
Production URL: https://rosai-git-main-health-rosais-projects.vercel.app

## 環境変数（修正版）

### 1. GMAIL_CLIENT_SECRET
```
Key: GMAIL_CLIENT_SECRET
Value: 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
```

### 2. NEXT_PUBLIC_APP_URL（正しいURLに修正）
```
Key: NEXT_PUBLIC_APP_URL
Value: https://rosai-git-main-health-rosais-projects.vercel.app
```

### 3. NEXT_PUBLIC_ENVIRONMENT
```
Key: NEXT_PUBLIC_ENVIRONMENT  
Value: production
```

### 4. GMAIL_REDIRECT_URI（正しいURLに修正）
```
Key: GMAIL_REDIRECT_URI
Value: https://rosai-git-main-health-rosais-projects.vercel.app/api/gmail/import
```

## 重要
- URLは `rosai-git-main-health-rosais-projects.vercel.app` を使用
- `rosai.vercel.app` ではありません

## 手順
1. https://vercel.com/health-rosais-projects/rosai/settings/environment-variables にアクセス
2. 上記の4つの環境変数を追加（URLを正しいものに）
3. Redeployを実行