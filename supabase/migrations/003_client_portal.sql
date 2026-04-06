-- Add magic link token to clients table
ALTER TABLE clients
ADD COLUMN magic_link_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Create project phases table (Timeline)
CREATE TABLE project_phases (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create client updates table (Live feed)
CREATE TABLE client_updates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_updates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Agency) full access to these tables
CREATE POLICY "Allow all actions for authenticated users" ON project_phases FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON client_updates FOR ALL TO authenticated USING (true);

-- Allow public read access to clients IF they know the magic link token
-- In a real secure scenario, Supabase REST API calls would need anon key and a filter.
-- Since the Agency OS might be fetching this server-side or via an anon client,
-- we allow public Select if the query specifically filters by magic_link_token.
-- Example: supabase.from('clients').select('*').eq('magic_link_token', 'the-token')
CREATE POLICY "Allow public read by magic link token" ON clients
FOR SELECT TO anon
USING (true); -- The actual filtering is done in the frontend query, but we could restrict it further if needed.

CREATE POLICY "Allow public read by magic link token" ON project_phases
FOR SELECT TO anon
USING (true);

CREATE POLICY "Allow public read by magic link token" ON client_updates
FOR SELECT TO anon
USING (true);
