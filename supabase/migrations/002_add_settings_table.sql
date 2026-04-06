-- Migration to add settings table for persistent configuration
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    "ceoPhraseHash" TEXT,
    "teamPhraseHash" TEXT,
    initialized BOOLEAN DEFAULT false,
    "lastUpdated" TEXT
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow full access (you may want to restrict this in production)
CREATE POLICY "Allow full access to settings" ON settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert default row if not exists
INSERT INTO settings (id, initialized)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;
