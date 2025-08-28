-- Enable Row Level Security for all tables
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_logs ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for authenticated users
-- These policies allow authenticated users to read all data and modify their own data

-- Activity logs - read only for authenticated users
CREATE POLICY "Allow authenticated users to read activity_logs" ON public.activity_logs
    FOR SELECT TO authenticated USING (true);

-- Alerts - authenticated users can manage alerts
CREATE POLICY "Allow authenticated users to manage alerts" ON public.alerts
    FOR ALL TO authenticated USING (true);

-- FAQ generation jobs - authenticated users can manage
CREATE POLICY "Allow authenticated users to manage faq_generation_jobs" ON public.faq_generation_jobs
    FOR ALL TO authenticated USING (true);

-- FAQs - authenticated users can manage
CREATE POLICY "Allow authenticated users to manage faqs" ON public.faqs
    FOR ALL TO authenticated USING (true);

-- Emails - authenticated users can manage
CREATE POLICY "Allow authenticated users to manage emails" ON public.emails
    FOR ALL TO authenticated USING (true);

-- Status histories - read only
CREATE POLICY "Allow authenticated users to read status_histories" ON public.status_histories
    FOR SELECT TO authenticated USING (true);

-- Agencies - authenticated users can read
CREATE POLICY "Allow authenticated users to read agencies" ON public.agencies
    FOR SELECT TO authenticated USING (true);

-- Profiles - users can manage their own profile
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Companies - authenticated users can read
CREATE POLICY "Allow authenticated users to read companies" ON public.companies
    FOR SELECT TO authenticated USING (true);

-- Employees - authenticated users can manage
CREATE POLICY "Allow authenticated users to manage employees" ON public.employees
    FOR ALL TO authenticated USING (true);

-- Scheduled reports - authenticated users can manage
CREATE POLICY "Allow authenticated users to manage scheduled_reports" ON public.scheduled_reports
    FOR ALL TO authenticated USING (true);

-- Report logs - authenticated users can read
CREATE POLICY "Allow authenticated users to read report_logs" ON public.report_logs
    FOR SELECT TO authenticated USING (true);