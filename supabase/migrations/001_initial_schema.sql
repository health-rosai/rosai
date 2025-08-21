-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 代理店テーブル
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロファイルテーブル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'staff', 'agency')),
  agency_id UUID REFERENCES agencies(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 企業テーブル
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  current_status TEXT NOT NULL DEFAULT '01',
  phase TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN current_status IN ('01', '02', '03A', '03B') THEN '営業'
      WHEN current_status IN ('04', '05') THEN '提案'
      WHEN current_status IN ('06', '07') THEN '契約'
      WHEN current_status IN ('08', '09', '10', '11', '12', '13') THEN '健診・判定'
      WHEN current_status IN ('14', '15', '16', '17') THEN '労災二次健診'
      WHEN current_status IN ('18', '19') THEN '請求'
      WHEN current_status IN ('20', '21', '22') THEN '完了'
      ELSE '特殊'
    END
  ) STORED,
  
  -- 基本情報
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  cc_emails TEXT[],
  
  -- 契約サポート設定
  support_level TEXT CHECK (support_level IN ('referral_only', 'partial', 'full')),
  contract_email TEXT,
  
  -- サービス説明設定
  needs_explanation BOOLEAN DEFAULT false,
  explanation_method TEXT CHECK (explanation_method IN ('online', 'visit', 'document')),
  
  -- 関連情報
  agency_id UUID REFERENCES agencies(id),
  assigned_staff_id UUID REFERENCES profiles(id),
  
  -- メタデータ
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- インデックス用
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('japanese', coalesce(name, '') || ' ' || coalesce(notes, ''))
  ) STORED
);

-- ステータス履歴テーブル
CREATE TABLE status_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- メールテーブル
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT,
  from_email TEXT NOT NULL,
  to_emails TEXT[],
  cc_emails TEXT[],
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  attachments JSONB DEFAULT '[]',
  received_at TIMESTAMPTZ,
  
  -- AI処理結果
  ai_processed BOOLEAN DEFAULT false,
  ai_analysis JSONB,
  ai_suggested_status TEXT,
  ai_confidence FLOAT,
  ai_auto_reply TEXT,
  ai_processed_at TIMESTAMPTZ,
  
  -- FAQ候補
  faq_candidate JSONB DEFAULT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQテーブル
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('契約', '請求', '健診', '判定', 'サービス全般', 'その他')),
  related_status TEXT[],
  frequency_score FLOAT DEFAULT 0,
  confidence FLOAT DEFAULT 0,
  source_count INTEGER DEFAULT 0,
  
  -- バージョン管理
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES faqs(id),
  
  -- レビュー管理
  status TEXT CHECK (status IN ('draft', 'reviewing', 'approved', 'published', 'archived')) DEFAULT 'draft',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- メタデータ
  tags TEXT[],
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- AI生成情報
  ai_generated BOOLEAN DEFAULT true,
  generation_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ生成ジョブテーブル
CREATE TABLE faq_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'threshold', 'scheduled')),
  
  -- 生成条件
  email_count_threshold INTEGER DEFAULT 100,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  
  -- 結果
  emails_analyzed INTEGER,
  faqs_generated INTEGER,
  generation_result JSONB,
  error_message TEXT,
  
  -- メタデータ
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アラートテーブル
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stagnant', 'no_reply', 'error', 'deadline', 'custom')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクティビティログテーブル
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_companies_status ON companies(current_status);
CREATE INDEX idx_companies_agency ON companies(agency_id);
CREATE INDEX idx_companies_search ON companies USING GIN(search_vector);
CREATE INDEX idx_status_histories_company ON status_histories(company_id);
CREATE INDEX idx_emails_company ON emails(company_id);
CREATE INDEX idx_emails_faq_candidate ON emails(faq_candidate) WHERE faq_candidate IS NOT NULL;
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active, status);
CREATE INDEX idx_faqs_frequency ON faqs(frequency_score DESC);
CREATE INDEX idx_alerts_company_unresolved ON alerts(company_id) WHERE NOT is_resolved;

-- Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- スタッフは全企業を閲覧・編集可能
CREATE POLICY companies_staff_all ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- 代理店は自社紹介企業のみ閲覧可能
CREATE POLICY companies_agency_view ON companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'agency'
      AND profiles.agency_id = companies.agency_id
    )
  );