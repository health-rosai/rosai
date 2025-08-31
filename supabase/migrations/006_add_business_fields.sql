-- 商談・営業管理用のフィールドを追加

-- 商談関連フィールド
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cc_introducer TEXT, -- CCをつける紹介者
ADD COLUMN IF NOT EXISTS initial_meeting_date DATE, -- 初回商談日
ADD COLUMN IF NOT EXISTS recording_data_url TEXT, -- 録画データ
ADD COLUMN IF NOT EXISTS meeting_minutes TEXT, -- 商談議事録
ADD COLUMN IF NOT EXISTS correspondence_history TEXT, -- やり取り履歴
ADD COLUMN IF NOT EXISTS last_contact_date DATE, -- 最終連絡日
ADD COLUMN IF NOT EXISTS response_status_notes TEXT, -- 対応状況備考
ADD COLUMN IF NOT EXISTS next_action_date DATE, -- 次回アクション日
ADD COLUMN IF NOT EXISTS next_action_content TEXT, -- 次回アクション内容
ADD COLUMN IF NOT EXISTS memo TEXT; -- メモ

-- ドキュメント管理フィールド
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_folder_url TEXT, -- 企業フォルダへ
ADD COLUMN IF NOT EXISTS info_sheet_url TEXT, -- 情報シートリンク
ADD COLUMN IF NOT EXISTS schedule_sheet_url TEXT, -- 日程調整シートリンク
ADD COLUMN IF NOT EXISTS schedule_sheet_url2 TEXT; -- 日程調整シートリンク2

-- 地域情報フィールド
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS prefecture TEXT, -- 所在都道府県
ADD COLUMN IF NOT EXISTS city TEXT; -- 市区町村

-- 健診関連フィールド
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS primary_checkup_completion TEXT, -- 1次健診完了時期
ADD COLUMN IF NOT EXISTS result_receipt_timing TEXT, -- 健診結果受け取り時期
ADD COLUMN IF NOT EXISTS secondary_checkup_month TEXT, -- 2次健診実施予定月
ADD COLUMN IF NOT EXISTS judgment_request_count INTEGER DEFAULT 0, -- 判定依頼人数
ADD COLUMN IF NOT EXISTS earliest_checkup_date DATE, -- 一次健診日（一番早い人）
ADD COLUMN IF NOT EXISTS confirmed_count INTEGER DEFAULT 0; -- 確定数

-- 健診実施詳細フィールド
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS checkup_start_date DATE, -- 健診初日
ADD COLUMN IF NOT EXISTS leader_name TEXT, -- リーダー
ADD COLUMN IF NOT EXISTS medical_institution TEXT, -- 実施医療機関
ADD COLUMN IF NOT EXISTS preferred_start_time TIME, -- 希望開始時間
ADD COLUMN IF NOT EXISTS preferred_weekday TEXT, -- 希望曜日
ADD COLUMN IF NOT EXISTS preferred_month TEXT, -- 希望月
ADD COLUMN IF NOT EXISTS ng_period TEXT, -- NGの時期
ADD COLUMN IF NOT EXISTS executive_check BOOLEAN DEFAULT false, -- 役員チェック
ADD COLUMN IF NOT EXISTS has_venue BOOLEAN, -- 実施場所の有無
ADD COLUMN IF NOT EXISTS special_notes TEXT, -- 注意事項等
ADD COLUMN IF NOT EXISTS additional_remarks TEXT; -- 備考（追加）

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_companies_initial_meeting_date ON companies(initial_meeting_date);
CREATE INDEX IF NOT EXISTS idx_companies_last_contact_date ON companies(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_companies_next_action_date ON companies(next_action_date);
CREATE INDEX IF NOT EXISTS idx_companies_prefecture ON companies(prefecture);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_checkup_start_date ON companies(checkup_start_date);

-- 検索ベクターを再更新
ALTER TABLE companies 
DROP COLUMN IF EXISTS search_vector CASCADE;

ALTER TABLE companies 
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
  to_tsvector('japanese', 
    coalesce(name, '') || ' ' || 
    coalesce(company_code, '') || ' ' ||
    coalesce(introducer_name, '') || ' ' ||
    coalesce(cc_introducer, '') || ' ' ||
    coalesce(headquarters_address, '') || ' ' ||
    coalesce(prefecture, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(contact_person, '') || ' ' ||
    coalesce(leader_name, '') || ' ' ||
    coalesce(medical_institution, '') || ' ' ||
    coalesce(meeting_minutes, '') || ' ' ||
    coalesce(correspondence_history, '') || ' ' ||
    coalesce(next_action_content, '') || ' ' ||
    coalesce(memo, '') || ' ' ||
    coalesce(special_notes, '') || ' ' ||
    coalesce(notes, '') || ' ' ||
    coalesce(remarks, '') || ' ' ||
    coalesce(additional_remarks, '')
  )
) STORED;

-- 検索用インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_companies_search_full ON companies USING GIN(search_vector);

-- コメントを追加
COMMENT ON COLUMN companies.cc_introducer IS 'CCをつける紹介者';
COMMENT ON COLUMN companies.initial_meeting_date IS '初回商談日';
COMMENT ON COLUMN companies.recording_data_url IS '録画データURL';
COMMENT ON COLUMN companies.meeting_minutes IS '商談議事録';
COMMENT ON COLUMN companies.correspondence_history IS 'やり取り履歴';
COMMENT ON COLUMN companies.last_contact_date IS '最終連絡日';
COMMENT ON COLUMN companies.response_status_notes IS '対応状況備考';
COMMENT ON COLUMN companies.next_action_date IS '次回アクション日';
COMMENT ON COLUMN companies.next_action_content IS '次回アクション内容';
COMMENT ON COLUMN companies.memo IS 'メモ';
COMMENT ON COLUMN companies.company_folder_url IS '企業フォルダへのリンク';
COMMENT ON COLUMN companies.info_sheet_url IS '情報シートリンク';
COMMENT ON COLUMN companies.schedule_sheet_url IS '日程調整シートリンク';
COMMENT ON COLUMN companies.schedule_sheet_url2 IS '日程調整シートリンク2';
COMMENT ON COLUMN companies.prefecture IS '所在都道府県';
COMMENT ON COLUMN companies.city IS '市区町村';
COMMENT ON COLUMN companies.primary_checkup_completion IS '1次健診完了時期';
COMMENT ON COLUMN companies.result_receipt_timing IS '健診結果受け取り時期';
COMMENT ON COLUMN companies.secondary_checkup_month IS '2次健診実施予定月';
COMMENT ON COLUMN companies.judgment_request_count IS '判定依頼人数';
COMMENT ON COLUMN companies.earliest_checkup_date IS '一次健診日（一番早い人）';
COMMENT ON COLUMN companies.confirmed_count IS '確定数';
COMMENT ON COLUMN companies.checkup_start_date IS '健診初日';
COMMENT ON COLUMN companies.leader_name IS 'リーダー';
COMMENT ON COLUMN companies.medical_institution IS '実施医療機関';
COMMENT ON COLUMN companies.preferred_start_time IS '希望開始時間';
COMMENT ON COLUMN companies.preferred_weekday IS '希望曜日';
COMMENT ON COLUMN companies.preferred_month IS '希望月';
COMMENT ON COLUMN companies.ng_period IS 'NGの時期';
COMMENT ON COLUMN companies.executive_check IS '役員チェック';
COMMENT ON COLUMN companies.has_venue IS '実施場所の有無';
COMMENT ON COLUMN companies.special_notes IS '注意事項等';
COMMENT ON COLUMN companies.additional_remarks IS '備考（追加）';

-- 詳細ビューを更新
DROP VIEW IF EXISTS v_companies_detail;

CREATE OR REPLACE VIEW v_companies_detail AS
SELECT 
  c.id,
  c.company_code AS "企業ID",
  c.name AS "企業名",
  c.introducer_name AS "紹介者",
  c.cc_introducer AS "CCをつける紹介者",
  c.headquarters_address AS "本社住所",
  c.prefecture AS "所在都道府県",
  c.city AS "市区町村",
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
  c.initial_meeting_date AS "初回商談日",
  c.last_contact_date AS "最終連絡日",
  c.next_action_date AS "次回アクション日",
  c.next_action_content AS "次回アクション内容",
  c.primary_checkup_completion AS "1次健診完了時期",
  c.secondary_checkup_month AS "2次健診実施予定月",
  c.checkup_start_date AS "健診初日",
  c.medical_institution AS "実施医療機関",
  c.current_status AS "ステータス",
  c.phase AS "フェーズ",
  a.name AS "代理店名",
  p.full_name AS "担当スタッフ",
  c.created_at AS "登録日",
  c.updated_at AS "更新日"
FROM companies c
LEFT JOIN agencies a ON c.agency_id = a.id
LEFT JOIN profiles p ON c.assigned_staff_id = p.id;