#!/usr/bin/env node

/**
 * 労災二次健診システム - 自動デプロイスクリプト
 * GitHub、Supabase、Vercelの API を使用した完全自動化
 * 
 * 使用方法:
 * 1. 各サービスのトークンを環境変数に設定
 * 2. node scripts/deploy-automation.js を実行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 設定
const config = {
  github: {
    token: process.env.GITHUB_TOKEN || '',
    username: process.env.GITHUB_USERNAME || '',
    repoName: 'rousai-system'
  },
  supabase: {
    accessToken: process.env.SUPABASE_ACCESS_TOKEN || '',
    projectName: 'rousai-system',
    dbPassword: process.env.SUPABASE_DB_PASSWORD || '',
    region: 'ap-northeast-1' // Tokyo
  },
  vercel: {
    token: process.env.VERCEL_TOKEN || ''
  }
};

// カラー出力用
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. GitHub リポジトリ作成
async function createGitHubRepo() {
  log('\n🔧 GitHub リポジトリ作成中...', 'blue');
  
  if (!config.github.token) {
    log('❌ GITHUB_TOKEN が設定されていません', 'red');
    log('以下のコマンドで設定してください:', 'yellow');
    log('export GITHUB_TOKEN=your_github_personal_access_token');
    return false;
  }

  try {
    // GitHub API でリポジトリ作成
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${config.github.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.github.repoName,
        description: '労災二次健診進捗管理システム - AI-powered health check management',
        private: false,
        auto_init: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      log(`✅ GitHub リポジトリ作成成功: ${data.html_url}`, 'green');
      
      // Git push
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit: Complete rousai-system"', { stdio: 'inherit' });
      execSync(`git remote add origin ${data.clone_url}`, { stdio: 'inherit' });
      execSync('git push -u origin main', { stdio: 'inherit' });
      
      return data;
    } else {
      const error = await response.json();
      log(`❌ GitHub リポジトリ作成失敗: ${error.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ エラー: ${error.message}`, 'red');
    return false;
  }
}

// 2. Supabase プロジェクト作成
async function createSupabaseProject() {
  log('\n🔧 Supabase プロジェクト作成中...', 'blue');
  
  if (!config.supabase.accessToken) {
    log('❌ SUPABASE_ACCESS_TOKEN が設定されていません', 'red');
    log('以下の手順で取得してください:', 'yellow');
    log('1. https://app.supabase.com/account/tokens にアクセス');
    log('2. 新しいトークンを生成');
    log('3. export SUPABASE_ACCESS_TOKEN=your_token');
    return false;
  }

  try {
    // Supabase Management API でプロジェクト作成
    const response = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.supabase.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.supabase.projectName,
        organization_id: 'your-org-id', // 要取得
        db_pass: config.supabase.dbPassword,
        region: config.supabase.region,
        plan: 'free'
      })
    });

    if (response.ok) {
      const data = await response.json();
      log(`✅ Supabase プロジェクト作成成功`, 'green');
      
      // 環境変数ファイル更新
      const envContent = `
NEXT_PUBLIC_SUPABASE_URL=${data.endpoint}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${data.anon_key}
SUPABASE_SERVICE_ROLE_KEY=${data.service_role_key}
`;
      fs.appendFileSync('.env.local', envContent);
      
      return data;
    } else {
      const error = await response.json();
      log(`❌ Supabase プロジェクト作成失敗: ${error.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ エラー: ${error.message}`, 'red');
    return false;
  }
}

// 3. Vercel デプロイ
async function deployToVercel() {
  log('\n🔧 Vercel デプロイ中...', 'blue');
  
  if (!config.vercel.token) {
    log('❌ VERCEL_TOKEN が設定されていません', 'red');
    log('以下の手順で取得してください:', 'yellow');
    log('1. https://vercel.com/account/tokens にアクセス');
    log('2. 新しいトークンを生成');
    log('3. export VERCEL_TOKEN=your_token');
    return false;
  }

  try {
    // Vercel CLI インストール確認
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      log('Vercel CLI をインストール中...', 'yellow');
      execSync('npm i -g vercel', { stdio: 'inherit' });
    }

    // Vercel デプロイ
    execSync(`vercel --token ${config.vercel.token} --yes --prod`, { 
      stdio: 'inherit',
      env: { ...process.env, VERCEL_TOKEN: config.vercel.token }
    });
    
    log('✅ Vercel デプロイ成功', 'green');
    return true;
  } catch (error) {
    log(`❌ エラー: ${error.message}`, 'red');
    return false;
  }
}

// メイン処理
async function main() {
  log('🚀 労災二次健診システム 自動デプロイ開始', 'bright');
  log('=' .repeat(50));

  // 環境変数チェック
  log('\n📋 環境変数チェック中...', 'yellow');
  const requiredEnvs = [
    'GITHUB_TOKEN',
    'GITHUB_USERNAME',
    'SUPABASE_ACCESS_TOKEN',
    'SUPABASE_DB_PASSWORD',
    'VERCEL_TOKEN'
  ];

  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    log('\n❌ 以下の環境変数が不足しています:', 'red');
    missingEnvs.forEach(env => {
      log(`  - ${env}`, 'yellow');
    });
    
    log('\n📝 設定方法:', 'blue');
    log('1. 各サービスでトークンを生成');
    log('2. .env ファイルを作成して設定');
    log('3. source .env でロード');
    log('4. 再度このスクリプトを実行');
    
    process.exit(1);
  }

  // 順次実行
  const githubResult = await createGitHubRepo();
  if (!githubResult) {
    log('\n⚠️ GitHub リポジトリ作成をスキップ', 'yellow');
  }

  const supabaseResult = await createSupabaseProject();
  if (!supabaseResult) {
    log('\n⚠️ Supabase プロジェクト作成をスキップ', 'yellow');
  }

  const vercelResult = await deployToVercel();
  if (!vercelResult) {
    log('\n⚠️ Vercel デプロイをスキップ', 'yellow');
  }

  // 完了
  log('\n' + '=' .repeat(50));
  log('✨ デプロイプロセス完了！', 'green');
  log('\n📝 次のステップ:');
  log('1. Supabase ダッシュボードで SQL マイグレーションを実行');
  log('2. Google Cloud Console で OAuth リダイレクト URI を更新');
  log('3. 本番環境でテスト実行');
}

// 実行
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ 予期しないエラー: ${error.message}`, 'red');
    process.exit(1);
  });
}