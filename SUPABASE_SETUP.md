# Supabase セットアップガイド

## 📋 必要な作業

### 1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New Project」をクリック
5. 以下を入力：
   - Project name: `rousai-system`
   - Database Password: 強力なパスワードを生成
   - Region: `Northeast Asia (Tokyo)`
6. 「Create new project」をクリック

### 2. プロジェクトURLとキーを取得
1. プロジェクトダッシュボードで「Settings」→「API」
2. 以下をコピー：
   - Project URL: `https://xxxxx.supabase.co`
   - anon/public key: `eyJhbGc...`
   - service_role key: `eyJhbGc...`（秘密キー）

### 3. .env.localを更新
```env
NEXT_PUBLIC_SUPABASE_URL=あなたのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon key
SUPABASE_SERVICE_ROLE_KEY=あなたのservice_role key
```

### 4. データベーステーブル作成
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 以下のSQLを実行：

```sql
-- プロファイルテーブル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'operator', 'viewer')) DEFAULT 'viewer',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 企業テーブル
CREATE TABLE companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  employee_count INTEGER,
  industry TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  current_status TEXT NOT NULL DEFAULT '01',
  status_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_changed_by UUID REFERENCES profiles(id),
  assigned_agency_id TEXT,
  tags TEXT[],
  notes TEXT,
  contract_date DATE,
  next_action_date DATE,
  priority INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ステータス履歴テーブル
CREATE TABLE status_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 代理店テーブル
CREATE TABLE agencies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('internal', 'external')) DEFAULT 'external',
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  commission_rate DECIMAL(5,2),
  performance_score DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メールテーブル
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id TEXT UNIQUE,
  thread_id TEXT,
  subject TEXT,
  from_email TEXT,
  to_email TEXT,
  body_text TEXT,
  body_html TEXT,
  body_snippet TEXT,
  attachments JSONB DEFAULT '[]',
  labels TEXT[],
  received_at TIMESTAMP WITH TIME ZONE,
  company_id TEXT REFERENCES companies(id),
  is_processed BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  ai_processed BOOLEAN DEFAULT false,
  faq_candidate JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQテーブル
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  related_status TEXT[],
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  ai_generated BOOLEAN DEFAULT false,
  generation_metadata JSONB,
  frequency_score DECIMAL(3,2),
  confidence DECIMAL(3,2),
  source_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- FAQ生成ジョブテーブル
CREATE TABLE faq_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'scheduled', 'threshold')) DEFAULT 'manual',
  email_count_threshold INTEGER,
  emails_analyzed INTEGER,
  faqs_generated INTEGER,
  generation_result JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- 活動ログテーブル
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- システム設定テーブル
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- インデックス作成
CREATE INDEX idx_companies_status ON companies(current_status);
CREATE INDEX idx_companies_agency ON companies(assigned_agency_id);
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_status_histories_company ON status_histories(company_id);
CREATE INDEX idx_emails_company ON emails(company_id);
CREATE INDEX idx_emails_processed ON emails(is_processed);
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_published ON faqs(is_published);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
```

### 5. Row Level Security (RLS) 設定
```sql
-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
-- 管理者は全データアクセス可能
CREATE POLICY "Admins can do everything" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ユーザーは自分のプロファイルを閲覧・更新可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 6. リアルタイム設定
1. Supabaseダッシュボードで「Database」→「Replication」
2. 以下のテーブルでリアルタイムを有効化：
   - companies
   - status_histories
   - emails
   - faqs

### 7. ストレージバケット作成
```sql
-- ストレージバケット作成（SQL Editorで実行）
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

## ✅ 確認事項
- [ ] プロジェクトURLとキーを.env.localに設定
- [ ] データベーステーブル作成完了
- [ ] RLS設定完了
- [ ] リアルタイム設定完了
- [ ] ストレージバケット作成完了

## 🚀 次のステップ
1. 開発サーバーを再起動
2. `/login`ページでSupabase認証をテスト
3. データベース接続を確認