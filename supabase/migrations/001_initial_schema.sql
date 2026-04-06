-- Create enum types to match TypeScript types
CREATE TYPE client_status AS ENUM ('Lead', 'Discovery', 'Active Sprint', 'Retainer', 'Closed');
CREATE TYPE relationship_health AS ENUM ('healthy', 'at-risk', 'critical');
CREATE TYPE onboarding_status AS ENUM ('not-started', 'in-progress', 'complete');
CREATE TYPE task_category AS ENUM ('Content Production', 'Ad Creative', 'Website', 'Strategy', 'Video Production', 'Brand Design', 'Analytics', 'Automation', 'Client Communication', 'Other');
CREATE TYPE node_role AS ENUM ('CEO', 'Art Director', 'Video Editor', 'Operations Builder', 'Social Media Manager', 'Documentation Manager');
CREATE TYPE task_stage AS ENUM ('BRIEFED', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'DEPLOYED');
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'normal', 'urgent');
CREATE TYPE task_status AS ENUM ('active', 'deployed', 'cancelled');
CREATE TYPE post_stage AS ENUM ('PLANNED', 'BRIEF WRITTEN', 'IN PRODUCTION', 'REVIEW', 'CEO APPROVAL', 'CLIENT APPROVAL', 'SCHEDULED', 'PUBLISHED');
CREATE TYPE social_platform AS ENUM ('instagram', 'facebook', 'tiktok', 'linkedin', 'twitter');
CREATE TYPE protocol_category AS ENUM ('sop', 'ai-prompt', 'client-knowledge-base', 'brand-standard');
CREATE TYPE protocol_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE activity_type AS ENUM ('stage_advance', 'stage_regress', 'note', 'created', 'edited');

-- Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status client_status DEFAULT 'Lead',
    revenue_gate TEXT,
    tier TEXT,
    ltv NUMERIC DEFAULT 0,
    contract_value NUMERIC DEFAULT 0,
    phone TEXT,
    email TEXT,
    contact_name TEXT,
    niche TEXT,
    start_date DATE,
    shadow_avatar TEXT,
    bleeding_neck TEXT,
    content_pillars TEXT[], -- Array of strings
    relationship_health relationship_health DEFAULT 'healthy',
    onboarding_status onboarding_status DEFAULT 'not-started',
    notes TEXT,
    timeline JSONB[] DEFAULT '{}', -- Array of JSON objects for TimelineEvents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category task_category NOT NULL,
    phase TEXT,
    stage_pipeline task_stage[] DEFAULT '{}',
    current_stage task_stage,
    assigned_node node_role,
    priority priority_level DEFAULT 'normal',
    status task_status DEFAULT 'active',
    deadline DATE,
    estimated_hours NUMERIC,
    brief TEXT,
    asset_links TEXT[] DEFAULT '{}',
    sop_reference TEXT,
    activity_log JSONB[] DEFAULT '{}',
    notes TEXT,
    delivered_on_time BOOLEAN,
    linked_post_id INTEGER, -- FK added later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Posts Table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    platforms social_platform[] DEFAULT '{}',
    post_type TEXT,
    content_pillar TEXT,
    template_type TEXT,
    hook TEXT,
    trigger_used TEXT,
    caption_body TEXT,
    cta TEXT,
    cta_type TEXT,
    hashtags TEXT,
    visual_brief TEXT,
    scheduled_date DATE,
    scheduled_time TIME,
    published_date DATE,
    status post_stage DEFAULT 'PLANNED',
    priority priority_level DEFAULT 'normal',
    assigned_to node_role,
    linked_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    linked_prompt_id INTEGER,
    asset_links TEXT[] DEFAULT '{}',
    reference_post TEXT,
    performance JSONB, -- For PerformanceLog object
    activity_log JSONB[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add circular FK for task to post (if needed by design)
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_post FOREIGN KEY (linked_post_id) REFERENCES posts(id) ON DELETE SET NULL;

-- Protocols Table (Knowledge Vault)
CREATE TABLE protocols (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category protocol_category NOT NULL,
    pillar TEXT,
    tags TEXT[] DEFAULT '{}',
    status protocol_status DEFAULT 'active',
    content TEXT NOT NULL,
    prompt_tool TEXT,
    prompt_variables TEXT[] DEFAULT '{}',
    usage_notes TEXT,
    example_output TEXT,
    linked_task_types task_category[] DEFAULT '{}',
    linked_client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    related_protocol_ids INTEGER[] DEFAULT '{}',
    external_references TEXT[] DEFAULT '{}',
    copy_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Onboarding Protocols Table
CREATE TABLE onboarding_protocols (
    id TEXT PRIMARY KEY, -- Using UUID strings based on current design
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    steps JSONB[] NOT NULL DEFAULT '{}', -- Array of OnboardingStep objects
    progress NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'on-track',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (Simple enable for now, can be restricted later)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for authenticated users" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON protocols FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON onboarding_protocols FOR ALL TO authenticated USING (true);
