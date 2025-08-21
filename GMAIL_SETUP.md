# Gmail API & Gemini API 設定ガイド

## 📋 必要なもの
- Googleアカウント
- Google Cloud Consoleへのアクセス
- 約10分の作業時間

## 🔧 Gmail API 設定

### Step 1: Google Cloud プロジェクト作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 右上の「プロジェクトを選択」→「新しいプロジェクト」
3. プロジェクト名: `rousai-system` (任意)
4. 「作成」をクリック

### Step 2: Gmail API 有効化
1. 左メニュー「APIとサービス」→「ライブラリ」
2. 検索: `Gmail API`
3. 「Gmail API」をクリック→「有効にする」

### Step 3: OAuth 2.0 認証情報作成

#### 3-1. OAuth同意画面の設定（初回のみ）
1. 「APIとサービス」→「OAuth同意画面」
2. ユーザータイプ: **外部** を選択
3. 必須項目を入力:
   - アプリ名: `労災二次健診システム`
   - ユーザーサポートメール: あなたのメール
   - デベロッパー連絡先: あなたのメール
4. スコープ追加:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
5. テストユーザー追加: `health@ronshoal.com`

#### 3-2. OAuth クライアントID作成
1. 「APIとサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」
3. 設定:
   - アプリケーションの種類: **ウェブアプリケーション**
   - 名前: `Rousai Web Client`
   - 承認済みのリダイレクトURI: 
     ```
     http://localhost:3001/api/gmail/import
     ```
4. 「作成」→ クライアントIDとシークレットをコピー

## 🤖 Gemini API 設定

### Step 1: API キー取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Get API key」をクリック
3. 「Create API key in new project」を選択
4. 生成されたAPIキーをコピー

## 📝 環境変数設定

`.env.local` ファイルを編集:

```env
# Gmail OAuth2認証情報
GMAIL_CLIENT_ID=あなたのクライアントID
GMAIL_CLIENT_SECRET=あなたのクライアントシークレット
GMAIL_REDIRECT_URI=http://localhost:3001/api/gmail/import

# Gemini API
GOOGLE_GEMINI_API_KEY=あなたのGemini APIキー

# 後で追加（初回認証後）
GMAIL_REFRESH_TOKEN=
```

## 🚀 実行手順

### 1. 開発サーバー起動
```bash
npm run dev
```

### 2. 管理画面アクセス
http://localhost:3001/admin/email-import

### 3. Gmail認証
1. 「認証ページを開く」をクリック
2. Googleアカウントでログイン
3. アプリへのアクセスを許可
4. コールバックページに表示されるリフレッシュトークンをコピー
5. `.env.local` の `GMAIL_REFRESH_TOKEN` に追加

### 4. メールインポート実行
1. サーバーを再起動（Ctrl+C → `npm run dev`）
2. 管理画面で「インポート開始」をクリック

## ❗ トラブルシューティング

### 「アプリは確認されていません」警告が出る場合
1. 「詳細」をクリック
2. 「労災二次健診システム（安全でない）に移動」をクリック
3. これは開発環境での通常の動作です

### 認証エラーが発生する場合
1. リダイレクトURIが正確に一致しているか確認
2. ポート番号（3001）が正しいか確認
3. OAuth同意画面でスコープが追加されているか確認

### APIキーが無効と表示される場合
1. Gemini APIが有効になっているか確認
2. APIキーに制限がかかっていないか確認
3. 新しいAPIキーを生成してみる

## 📞 サポート

問題が解決しない場合は、以下の情報と共にお問い合わせください:
- エラーメッセージのスクリーンショット
- ブラウザのコンソールログ
- `.env.local` の内容（APIキーは伏せて）