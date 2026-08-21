import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const { token } = await request.json();
    const magicLinkToken = typeof token === 'string' ? token.trim() : '';
    if (!magicLinkToken) return Response.json({ error: 'Invalid or expired magic link.' }, { status: 400, headers: corsHeaders });

    const url = Deno.env.get('SUPABASE_URL') || '';
    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    const serviceKey = secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const admin = createClient(url, serviceKey);

    // service_role bypasses RLS deliberately — this function is the only place
    // a magic-link token is allowed to resolve to a single client's data.
    const { data: client, error: clientError } = await admin
      .from('clients')
      .select('id, name, email, niche, magic_link_token')
      .eq('magic_link_token', magicLinkToken)
      .maybeSingle();

    if (clientError || !client) return Response.json({ error: 'Invalid or expired magic link.' }, { status: 404, headers: corsHeaders });

    const [{ data: phases }, { data: updates }] = await Promise.all([
      admin.from('project_phases').select('*').eq('client_id', client.id).order('order_index', { ascending: true }),
      admin.from('client_updates').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    ]);

    return Response.json({ client, phases: phases || [], updates: updates || [] }, { headers: corsHeaders });
  } catch {
    return Response.json({ error: 'Could not load the portal. Please try again.' }, { status: 500, headers: corsHeaders });
  }
});
