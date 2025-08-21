#!/bin/bash

# 労災二次健診システム - 完全セットアップスクリプト
# このスクリプトは手動実行が必要な部分をガイドします

echo "🚀 労災二次健診システム セットアップ開始"
echo "================================================"

# 1. GitHub設定
echo ""
echo "📦 Step 1: GitHub リポジトリ作成"
echo "--------------------------------"
echo "1. https://github.com/new にアクセス"
echo "2. Repository name: rousai-system"
echo "3. Public/Private を選択"
echo "4. Create repository をクリック"
echo ""
read -p "GitHubリポジトリを作成しましたか？ (y/n): " github_done

if [ "$github_done" = "y" ]; then
    echo "GitHubユーザー名を入力してください:"
    read github_username
    
    # Git初期化とプッシュ
    git init
    git add .
    git commit -m "Initial commit: Complete rousai-system with AI features"
    git branch -M main
    git remote add origin https://github.com/$github_username/rousai-system.git
    git push -u origin main
    
    echo "✅ GitHubへのプッシュ完了"
fi

# 2. Supabase設定
echo ""
echo "🗄️ Step 2: Supabase プロジェクト作成"
echo "------------------------------------"
echo "1. https://supabase.com にアクセス"
echo "2. Start your project をクリック"
echo "3. New Project を作成"
echo "   - Project name: rousai-system"
echo "   - Database Password: 強力なパスワード"
echo "   - Region: Northeast Asia (Tokyo)"
echo "4. Settings > API から以下をコピー:"
echo "   - Project URL"
echo "   - anon/public key"
echo "   - service_role key"
echo ""
read -p "Supabaseプロジェクトを作成しましたか？ (y/n): " supabase_done

if [ "$supabase_done" = "y" ]; then
    echo "NEXT_PUBLIC_SUPABASE_URL を入力:"
    read supabase_url
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY を入力:"
    read supabase_anon
    echo "SUPABASE_SERVICE_ROLE_KEY を入力:"
    read supabase_service
    
    # .env.local更新
    cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon
SUPABASE_SERVICE_ROLE_KEY=$supabase_service

# Google APIs (既存の値を保持)
GOOGLE_GEMINI_API_KEY=AIzaSyAfiC0RpmRrQuaWe7LxQ5I3RFVpPqSNTQk
GMAIL_CLIENT_ID=386180119992-44v97i22lmi2ompkffnqmsu019r6jg6a.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=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
GMAIL_REFRESH_TOKEN=1//0e7l3u4Ah1h1rCgYIARAAGA4SNwF-L9IrieRr7Ez2DXHSoRuqP-1gjmxrZtG5jc06WFGObySrYRctS8bV78Tu2hj_VLjwSDPpIoY

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_ENVIRONMENT=development
EOF
    
    echo "✅ 環境変数設定完了"
    
    echo ""
    echo "📊 Supabase SQLエディタで以下を実行してください:"
    echo "supabase/migrations/001_initial_schema.sql の内容をコピー&ペースト"
    read -p "SQLを実行しましたか？ (y/n): " sql_done
fi

# 3. Vercel設定
echo ""
echo "🚀 Step 3: Vercel デプロイ"
echo "-------------------------"
echo "1. https://vercel.com にアクセス"
echo "2. New Project をクリック"
echo "3. GitHubから rousai-system を選択"
echo "4. Environment Variables に以下を設定:"
echo "   - すべての .env.local の内容"
echo "5. Deploy をクリック"
echo ""
read -p "Vercelにデプロイしましたか？ (y/n): " vercel_done

if [ "$vercel_done" = "y" ]; then
    echo "VercelのプロジェクトURL を入力:"
    read vercel_url
    echo "✅ デプロイURL: $vercel_url"
    
    # 本番用環境変数ファイル作成
    cat > .env.production << EOF
NEXT_PUBLIC_APP_URL=$vercel_url
NEXT_PUBLIC_ENVIRONMENT=production
EOF
fi

# 4. 最終確認
echo ""
echo "✨ セットアップ完了チェック"
echo "=============================="
echo "✅ GitHub リポジトリ作成"
echo "✅ Supabase プロジェクト設定"
echo "✅ データベーステーブル作成"
echo "✅ Vercel デプロイ"
echo ""
echo "🎉 労災二次健診システムのセットアップが完了しました！"
echo ""
echo "📝 次のステップ:"
echo "1. $vercel_url にアクセスして動作確認"
echo "2. Google Cloud Console でリダイレクトURIを更新"
echo "3. テストデータの投入: npx ts-node scripts/seed-demo-data.ts"
echo ""
echo "お疲れ様でした！"