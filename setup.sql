You'll need to create these tables in your Supabase database:

-- profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gpid TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- logs table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  store TEXT NOT NULL,
  product TEXT NOT NULL,
  pack_type TEXT NOT NULL,
  location TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  notes TEXT,
  gpid TEXT,
  is_worked BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  user_name TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verification_count INTEGER DEFAULT 1
);

-- sales_alerts table
CREATE TABLE sales_alerts (
  id SERIAL PRIMARY KEY,
  store TEXT NOT NULL,
  alert_text TEXT NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  resolution_text TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Authenticated users can view logs" ON logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert logs" ON logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update logs" ON logs FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view sales alerts" ON sales_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert sales alerts" ON sales_alerts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update sales alerts" ON sales_alerts FOR UPDATE USING (auth.uid() IS NOT NULL);
