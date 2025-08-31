-- 企業テーブルのスキーマを更新して必要なフィールドを追加

-- 既存のcompaniesテーブルに新しいカラムを追加
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS introducer_name TEXT,
ADD COLUMN IF NOT EXISTS headquarters_address TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS primary_health_checkup_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'both', 'other')),
ADD COLUMN IF NOT EXISTS contact_phone_primary TEXT,
ADD COLUMN IF NOT EXISTS contact_phone_secondary TEXT,
ADD COLUMN IF NOT EXISTS contact_email_secondary TEXT,
ADD COLUMN IF NOT EXISTS contact_email_tertiary TEXT;

-- 既存のcontact_emailカラムの名前を変更（互換性のため）
ALTER TABLE companies 
RENAME COLUMN contact_email TO contact_email_primary;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_companies_company_code ON companies(company_code);
CREATE INDEX IF NOT EXISTS idx_companies_introducer ON companies(introducer_name);
CREATE INDEX IF NOT EXISTS idx_companies_employee_count ON companies(employee_count);

-- 検索ベクターを更新して新しいフィールドを含める
ALTER TABLE companies 
DROP COLUMN IF EXISTS search_vector CASCADE;

ALTER TABLE companies 
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('japanese', 
    coalesce(name, '') || ' ' || 
    coalesce(company_code, '') || ' ' ||
    coalesce(introducer_name, '') || ' ' ||
    coalesce(headquarters_address, '') || ' ' ||
    coalesce(contact_person, '') || ' ' ||
    coalesce(notes, '') || ' ' ||
    coalesce(remarks, '')
  )
) STORED;

-- 検索用インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_companies_search_vector ON companies USING GIN(search_vector);

-- カラムにコメントを追加（ドキュメント化のため）
COMMENT ON COLUMN companies.company_code IS '企業ID/企業コード';
COMMENT ON COLUMN companies.introducer_name IS '紹介者名（敬称略）';
COMMENT ON COLUMN companies.headquarters_address IS '本社住所';
COMMENT ON COLUMN companies.website_url IS 'ホームページURL';
COMMENT ON COLUMN companies.primary_health_checkup_count IS '一次健診受診者数';
COMMENT ON COLUMN companies.employee_count IS '従業員数';
COMMENT ON COLUMN companies.remarks IS '備考';
COMMENT ON COLUMN companies.contact_method IS '連絡方法';
COMMENT ON COLUMN companies.contact_phone_primary IS '連絡先TEL1';
COMMENT ON COLUMN companies.contact_phone_secondary IS '連絡先TEL2';
COMMENT ON COLUMN companies.contact_email_primary IS 'メールアドレス1';
COMMENT ON COLUMN companies.contact_email_secondary IS 'メールアドレス2';
COMMENT ON COLUMN companies.contact_email_tertiary IS 'メールアドレス3';

-- 既存のcc_emailsカラムを廃止予定としてマーク（後方互換性のため残す）
COMMENT ON COLUMN companies.cc_emails IS 'DEPRECATED: 代わりにcontact_email_secondary, contact_email_tertiaryを使用';

-- ビューを作成して企業情報を分かりやすく表示
CREATE OR REPLACE VIEW v_companies_detail AS
SELECT 
  c.id,
  c.company_code AS "企業ID",
  c.name AS "企業名",
  c.introducer_name AS "紹介者",
  c.headquarters_address AS "本社住所",
  c.website_url AS "HP",
  c.primary_health_checkup_count AS "一次健診受診者数",
  c.employee_count AS "従業員数",
  c.remarks AS "備考",
  c.contact_person AS "ご担当者様",
  c.contact_method AS "連絡方法",
  c.contact_phone_primary AS "連絡先TEL1",
  c.contact_phone_secondary AS "連絡先TEL2",
  c.contact_email_primary AS "メールアドレス1",
  c.contact_email_secondary AS "メールアドレス2",
  c.contact_email_tertiary AS "メールアドレス3",
  c.current_status AS "ステータス",
  c.phase AS "フェーズ",
  a.name AS "代理店名",
  p.full_name AS "担当スタッフ",
  c.created_at AS "登録日",
  c.updated_at AS "更新日"
FROM companies c
LEFT JOIN agencies a ON c.agency_id = a.id
LEFT JOIN profiles p ON c.assigned_staff_id = p.id;

-- RLSポリシーを更新（ビューにも適用）
CREATE POLICY view_companies_detail_staff ON v_companies_detail
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY view_companies_detail_agency ON v_companies_detail
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN companies c ON c.id = v_companies_detail.id
      WHERE p.id = auth.uid()
      AND p.role = 'agency'
      AND p.agency_id = c.agency_id
    )
  );