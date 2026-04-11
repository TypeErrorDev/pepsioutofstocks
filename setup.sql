You'll need to create these tables in your Supabase database:

-- profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- stockouts table  
CREATE TABLE stockouts (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL REFERENCES profiles(username),
  product TEXT NOT NULL,
  store TEXT NOT NULL,
  days_oos INTEGER NOT NULL,
  priority TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stockouts ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid()::text = username);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = username);
CREATE POLICY "Users can view their own stockouts" ON stockouts FOR SELECT USING (user_name = auth.uid()::text);
CREATE POLICY "Users can insert their own stockouts" ON stockouts FOR INSERT WITH CHECK (user_name = auth.uid()::text);
CREATE POLICY "Users can update their own stockouts" ON stockouts FOR UPDATE USING (user_name = auth.uid()::text);
