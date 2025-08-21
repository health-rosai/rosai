-- テストユーザーとデータの作成
-- 注意: これはテスト用です。本番環境では使用しないでください。

-- テスト用代理店を作成
INSERT INTO agencies (name, code, contact_email, is_active)
VALUES 
  ('テスト代理店A', 'AGENCY001', 'agency-a@example.com', true),
  ('テスト代理店B', 'AGENCY002', 'agency-b@example.com', true);

-- テスト用企業データを作成
INSERT INTO companies (name, code, current_status, contact_person, contact_email, contact_phone)
VALUES 
  ('株式会社サンプル商事', 'COMP001', '01', '山田太郎', 'yamada@sample.co.jp', '03-1234-5678'),
  ('テスト工業株式会社', 'COMP002', '02', '鈴木花子', 'suzuki@test.co.jp', '03-2345-6789'),
  ('サンプル物流センター', 'COMP003', '03A', '佐藤次郎', 'sato@logistics.co.jp', '03-3456-7890'),
  ('株式会社デモシステム', 'COMP004', '06', '田中一郎', 'tanaka@demo.co.jp', '03-4567-8901'),
  ('テスト製造株式会社', 'COMP005', '08', '高橋三郎', 'takahashi@manufacturing.co.jp', '03-5678-9012'),
  ('サンプルサービス', 'COMP006', '11', '伊藤四郎', 'ito@service.co.jp', '03-6789-0123'),
  ('デモ建設株式会社', 'COMP007', '14', '渡辺五郎', 'watanabe@construction.co.jp', '03-7890-1234'),
  ('テスト運輸株式会社', 'COMP008', '18', '山本六郎', 'yamamoto@transport.co.jp', '03-8901-2345'),
  ('サンプル食品工業', 'COMP009', '20', '中村七郎', 'nakamura@food.co.jp', '03-9012-3456'),
  ('株式会社完了テスト', 'COMP010', '22', '小林八郎', 'kobayashi@complete.co.jp', '03-0123-4567');

-- サンプルアラートを作成
INSERT INTO alerts (company_id, type, severity, title, description)
SELECT 
  c.id,
  'stagnant',
  'medium',
  '30日以上ステータス変更なし',
  'この企業は30日以上同じステータスに留まっています。フォローアップが必要です。'
FROM companies c
WHERE c.code = 'COMP001';

-- 成功メッセージ
SELECT 'テストデータの作成が完了しました' as message;