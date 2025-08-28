-- =====================================================
-- 最適化されたRLSポリシーを作成するSQLスクリプト
-- 既存のポリシーが削除された状態で実行してください
-- Supabase DashboardのSQL Editorで実行してください
-- =====================================================

-- 注意: このスクリプトは管理者権限で実行する必要があります
-- 既存のポリシーが削除されていることを確認してから実行してください

-- =====================================================
-- ステップ1: 現在のポリシー状況を確認
-- =====================================================

-- 現在のポリシー一覧を表示（空のはず）
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'scheduled_reports', 'profiles', 'report_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- ステップ2: 最適化されたポリシーを作成
-- =====================================================

-- Companies テーブル - スタッフ用（全権限）
CREATE POLICY "companies_staff_all_optimized" ON public.companies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Companies テーブル - 代理店用（閲覧のみ）
CREATE POLICY "companies_agency_view_optimized" ON public.companies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'agency'
      AND profiles.agency_id = companies.agency_id
    )
  );

-- Scheduled Reports テーブル - ユーザーは自分のレポートのみ管理
CREATE POLICY "scheduled_reports_authenticated_all" ON public.scheduled_reports
  FOR ALL TO authenticated 
  USING (created_by = (SELECT auth.uid()));

-- Profiles テーブル - ユーザーは自分のプロファイルを更新可能
CREATE POLICY "Users can update own profile optimized" ON public.profiles
  FOR UPDATE TO authenticated 
  USING (id = (SELECT auth.uid()));

-- Report Logs テーブル - 認証されたユーザーは閲覧可能
CREATE POLICY "Allow authenticated users to read report_logs optimized" ON public.report_logs
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- ステップ3: 追加の基本ポリシー
-- =====================================================

-- Profiles テーブル - 全ユーザーが閲覧可能
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated 
  USING (true);

-- Companies テーブル - 基本的な閲覧権限（フォールバック）
CREATE POLICY "companies_basic_view" ON public.companies
  FOR SELECT TO authenticated
  USING (true);

-- Scheduled Reports テーブル - 基本的な閲覧権限（フォールバック）
CREATE POLICY "scheduled_reports_basic_view" ON public.scheduled_reports
  FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- ステップ4: 最終確認
-- =====================================================

-- 作成されたポリシーの確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'scheduled_reports', 'profiles', 'report_logs')
ORDER BY tablename, policyname;

-- テーブルごとのポリシー数確認
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'scheduled_reports', 'profiles', 'report_logs')
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- ステップ5: 動作テスト
-- =====================================================

-- ポリシーが正しく動作するかテスト
-- 以下のクエリが正常に実行されることを確認してください

-- Companies テーブルのテスト
-- SELECT * FROM companies LIMIT 5;

-- Scheduled Reports テーブルのテスト
-- SELECT * FROM scheduled_reports LIMIT 5;

-- Profiles テーブルのテスト
-- SELECT * FROM profiles LIMIT 5;

-- =====================================================
-- 完了メッセージ
-- =====================================================

-- ✅ 最適化されたRLSポリシーの作成が完了しました！
-- 
-- 📋 作成されたポリシー:
-- 
-- Companies テーブル:
--   - companies_staff_all_optimized: スタッフ用（全権限）
--   - companies_agency_view_optimized: 代理店用（閲覧のみ）
--   - companies_basic_view: 基本的な閲覧権限
-- 
-- Scheduled Reports テーブル:
--   - scheduled_reports_authenticated_all: ユーザーは自分のレポートのみ管理
--   - scheduled_reports_basic_view: 基本的な閲覧権限
-- 
-- Profiles テーブル:
--   - Users can update own profile optimized: ユーザーは自分のプロファイルを更新可能
--   - Users can view all profiles: 全ユーザーが閲覧可能
-- 
-- Report Logs テーブル:
--   - Allow authenticated users to read report_logs optimized: 認証されたユーザーは閲覧可能
-- 
-- 📝 次のステップ:
-- 1. Supabase Dashboardでポリシーが正しく表示されているか確認
-- 2. アプリケーションでデータアクセスが正常に動作するかテスト
-- 3. 必要に応じてSupabase Dashboardをリフレッシュ（F5キー）
-- 4. 警告が表示されていないか確認
-- 5. パフォーマンスが改善されているか確認
