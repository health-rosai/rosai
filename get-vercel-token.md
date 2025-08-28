# Vercel トークン取得手順

## ステップ 1: Vercel アカウントページへアクセス
1. ブラウザで https://vercel.com/account/tokens を開く
2. Vercelアカウントでログイン（まだの場合）

## ステップ 2: 新しいトークンを作成
1. 「Create Token」ボタンをクリック
2. Token Name: `claude-deploy` と入力
3. Scope: `Full Account` を選択
4. Expiration: `No Expiration` または適切な期限を選択
5. 「Create」ボタンをクリック

## ステップ 3: トークンをコピー
1. 生成されたトークンが表示される（一度だけ表示）
2. トークン全体をコピー（`vc_` で始まる長い文字列）

## ステップ 4: トークンを共有
コピーしたトークンを私に教えてください。

例：
```
vc_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

このトークンがあれば、自動でデプロイを実行できます。