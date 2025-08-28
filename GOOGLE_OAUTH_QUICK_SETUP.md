# Google OAuth 開発環境設定完了

## ✅ 完了した設定

1. **Supabase Dashboard** - Google OAuth プロバイダーを有効化し、認証情報を設定済み
   - Client ID: 386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com
   - Client Secret: 設定済み

2. **開発環境のリダイレクトURL** - 以下のURLを許可リストに追加済み
   - http://localhost:3000/**
   - http://localhost:3001/**
   - http://localhost:3002/**

## ⚠️ 必要な追加設定

### Google Cloud Console での設定（手動で行ってください）

1. **Google Cloud Console にアクセス**
   https://console.cloud.google.com/apis/credentials

2. **OAuth 2.0 クライアントID を編集**
   - クライアントID: `386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com`
   - 「承認済みのリダイレクトURI」セクションに以下を追加:
     ```
     https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback
     http://localhost:3002/dashboard
     ```

3. **保存** をクリック

## 🧪 テスト方法

1. 開発サーバーにアクセス: http://localhost:3002/login
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントで認証
4. ダッシュボードにリダイレクトされることを確認

## トラブルシューティング

### エラー: "redirect_uri_mismatch"
- Google Cloud ConsoleでリダイレクトURIが正しく設定されているか確認
- 特に `https://vkfjrgmxzkpkuygmryke.supabase.co/auth/v1/callback` が追加されているか確認

### エラー: "Access blocked"
- OAuth同意画面で「テストユーザー」に自分のGoogleアカウントを追加
- または本番環境として公開

### ログイン後にダッシュボードに遷移しない場合
- ブラウザのコンソールでエラーを確認
- Supabase Dashboardでユーザーが作成されているか確認