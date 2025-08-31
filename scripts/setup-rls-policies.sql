-- Disable RLS for testing (NOT recommended for production)
-- This will allow all operations without authentication checks

-- Disable RLS on all tables temporarily for testing
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_histories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access" ON companies;
DROP POLICY IF EXISTS "Public insert access" ON companies;
DROP POLICY IF EXISTS "Public update access" ON companies;
DROP POLICY IF EXISTS "Public delete access" ON companies;

-- Create permissive policies for companies table (for testing)
CREATE POLICY "Enable read for all users" ON companies
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON companies
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON companies
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON companies
FOR DELETE USING (true);

-- Similarly for agencies table
DROP POLICY IF EXISTS "Enable read for all users" ON agencies;
DROP POLICY IF EXISTS "Enable insert for all users" ON agencies;
DROP POLICY IF EXISTS "Enable update for all users" ON agencies;
DROP POLICY IF EXISTS "Enable delete for all users" ON agencies;

CREATE POLICY "Enable read for all users" ON agencies
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON agencies
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON agencies
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON agencies
FOR DELETE USING (true);

-- For profiles table
DROP POLICY IF EXISTS "Enable read for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;

CREATE POLICY "Enable read for all users" ON profiles
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON profiles
FOR UPDATE USING (true) WITH CHECK (true);

-- For status_histories table
DROP POLICY IF EXISTS "Enable read for all users" ON status_histories;
DROP POLICY IF EXISTS "Enable insert for all users" ON status_histories;

CREATE POLICY "Enable read for all users" ON status_histories
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON status_histories
FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON companies TO anon, authenticated;
GRANT ALL ON agencies TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON status_histories TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;