import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
  const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
  const userClient = createClient(Deno.env.get('SUPABASE_URL') || '', publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '', { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await userClient.auth.getUser(authorization.slice(7));
  if (!user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });
  const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
  const admin = createClient(Deno.env.get('SUPABASE_URL') || '', secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
  const { data: membership, error: membershipError } = await admin.from('organization_members').select('organization_id, role').eq('user_id', user.id).limit(1).maybeSingle();
  if (membershipError) return Response.json({ error: 'Workspace lookup failed' }, { status: 500, headers: corsHeaders });
  if (membership) return Response.json({ organizationId: membership.organization_id, role: membership.role }, { headers: corsHeaders });
  const { data: organization, error: organizationError } = await admin.from('organizations').insert({ name: 'NEROZARB' }).select('id').single();
  if (organizationError || !organization) return Response.json({ error: 'Workspace creation failed' }, { status: 500, headers: corsHeaders });
  const { error: insertError } = await admin.from('organization_members').insert({ organization_id: organization.id, user_id: user.id, role: 'admin' });
  if (insertError) return Response.json({ error: 'Workspace membership creation failed' }, { status: 500, headers: corsHeaders });
  return Response.json({ organizationId: organization.id, role: 'admin' }, { headers: corsHeaders });
});
