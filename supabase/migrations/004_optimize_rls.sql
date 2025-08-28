-- =====================================================
-- RLS パフォーマンス最適化
-- auth.uid() を (SELECT auth.uid()) に置換
-- =====================================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "companies_staff_all" ON public.companies;
DROP POLICY IF EXISTS "companies_agency_view" ON public.companies;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own scheduled reports" ON public.scheduled_reports;
DROP POLICY IF EXISTS "Allow authenticated users to read report_logs" ON public.report_logs;
DROP POLICY IF EXISTS "Allow authenticated users to manage scheduled_reports" ON public.scheduled_reports;
DROP POLICY IF EXISTS "Allow authenticated users to read companies" ON public.companies;

-- =====================================================
-- Companies テーブルの最適化されたポリシー
-- =====================================================

-- スタッフは全企業を閲覧・編集可能（最適化版）
CREATE POLICY "companies_staff_all_optimized" ON public.companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- 代理店は自社紹介企業のみ閲覧可能（最適化版）
CREATE POLICY "companies_agency_view_optimized" ON public.companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'agency'
      AND profiles.agency_id = companies.agency_id
    )
  );

-- =====================================================
-- Profiles テーブルの最適化されたポリシー
-- =====================================================

-- ユーザーは自分のプロファイルを更新可能（最適化版）
CREATE POLICY "Users can update own profile optimized" ON public.profiles
    FOR UPDATE TO authenticated 
    USING (id = (SELECT auth.uid()));

-- =====================================================
-- Scheduled Reports テーブルの最適化されたポリシー
-- =====================================================

-- ユーザーは自分のスケジュールレポートを管理可能（最適化版）
CREATE POLICY "Users can manage their own scheduled reports optimized" ON public.scheduled_reports
    FOR ALL TO authenticated 
    USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- Report Logs テーブルの最適化されたポリシー
-- =====================================================

-- 認証されたユーザーはレポートログを閲覧可能（最適化版）
CREATE POLICY "Allow authenticated users to read report_logs optimized" ON public.report_logs
    FOR SELECT TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (SELECT auth.uid())
      )
    );