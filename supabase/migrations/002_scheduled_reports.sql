-- Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'annual', 'custom'
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    recipients TEXT[] NOT NULL, -- Array of email addresses
    format VARCHAR(10) NOT NULL, -- 'pdf', 'excel', 'csv'
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    next_run TIMESTAMP WITH TIME ZONE,
    last_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_created_by ON scheduled_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_active ON scheduled_reports(active);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run);

-- Create report_execution_history table to track when reports are sent
CREATE TABLE IF NOT EXISTS report_execution_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
    recipients_sent TEXT[], -- Array of email addresses that received the report
    error_message TEXT,
    file_size INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for execution history
CREATE INDEX IF NOT EXISTS idx_report_execution_history_scheduled_report_id ON report_execution_history(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_report_execution_history_executed_at ON report_execution_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_report_execution_history_status ON report_execution_history(status);

-- Enable RLS
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_execution_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scheduled_reports
CREATE POLICY "Users can view their own scheduled reports" ON scheduled_reports
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create their own scheduled reports" ON scheduled_reports
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own scheduled reports" ON scheduled_reports
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own scheduled reports" ON scheduled_reports
    FOR DELETE USING (created_by = auth.uid());

-- Create RLS policies for report_execution_history
CREATE POLICY "Users can view execution history of their scheduled reports" ON report_execution_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scheduled_reports 
            WHERE id = report_execution_history.scheduled_report_id 
            AND created_by = auth.uid()
        )
    );

-- Admin users can view all scheduled reports and execution history
CREATE POLICY "Admins can view all scheduled reports" ON scheduled_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all execution history" ON report_execution_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for scheduled_reports
CREATE TRIGGER update_scheduled_reports_updated_at 
    BEFORE UPDATE ON scheduled_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data (optional, can be removed in production)
INSERT INTO scheduled_reports (name, description, template, frequency, recipients, format, created_by, next_run, active) 
SELECT 
    '月次業績レポート',
    '毎月の業績と進捗状況を自動送信',
    'monthly',
    'monthly',
    ARRAY['admin@example.com'],
    'pdf',
    id,
    NOW() + INTERVAL '1 month',
    true
FROM profiles 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;