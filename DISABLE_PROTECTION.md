# Vercelデプロイメント保護を無効化する方法

Gmail認証を本番環境で使用するには、Vercelのデプロイメント保護を無効化する必要があります。

## 手順

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/health-rosais-projects/rousai-system/settings

2. **Deployment Protection設定へ移動**
   - Settings → Deployment Protection

3. **Protection Bypassを設定**
   - 「Protection Bypass for Automation」セクションを探す
   - 「Generate Protection Bypass Secret」をクリック
   - 生成されたトークンをコピー

4. **または保護を無効化**
   - 「Protection for Preview Deployments」を「Disabled」に設定
   - 「Protection for Production Deployments」を「Disabled」に設定

## 現在の状況

- ローカル環境 (http://localhost:3001) では正常に動作
- 本番環境では認証保護により直接アクセスできない
- OAuth URLには正しくclient_idが含まれている

## テストURL
- ローカル: http://localhost:3001/admin/email-import
- 本番: https://rousai-system-fj56vpzpj-health-rosais-projects.vercel.app/admin/email-import

保護を無効化後、本番環境でGmail認証が可能になります。