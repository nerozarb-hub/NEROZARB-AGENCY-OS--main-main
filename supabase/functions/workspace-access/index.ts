import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function secureEquals(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const { accessKey } = await request.json();
    const submittedKey = typeof accessKey === 'string' ? accessKey.trim().toUpperCase() : '';
    if (!submittedKey || submittedKey.length > 128) return Response.json({ error: 'Enter a valid workspace key.' }, { status: 400, headers: corsHeaders });

    const url = Deno.env.get('SUPABASE_URL') || '';
    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
    const publishableKey = publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    const serviceKey = secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const admin = createClient(url, serviceKey);

    const { data: expectedKey, error: keyError } = await admin.rpc('get_workspace_access_key');
    if (keyError || !expectedKey || !secureEquals(submittedKey, expectedKey)) {
      return Response.json({ error: 'That workspace key is not recognised.' }, { status: 401, headers: corsHeaders });
    }

    const email = `workspace-${crypto.randomUUID()}@access.nerozarb.invalid`;
    const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createError || !created.user) return Response.json({ error: 'A secure workspace session could not be created.' }, { status: 503, headers: corsHeaders });

    const { data: existingOrganization, error: organizationLookupError } = await admin.from('organizations').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (organizationLookupError) return Response.json({ error: 'Workspace lookup failed.' }, { status: 503, headers: corsHeaders });
    const { data: organization, error: organizationError } = existingOrganization
      ? { data: existingOrganization, error: null }
      : await admin.from('organizations').insert({ name: 'NEROZARB' }).select('id').single();
    if (organizationError || !organization) return Response.json({ error: 'Workspace setup failed.' }, { status: 503, headers: corsHeaders });

    const { error: membershipError } = await admin.from('organization_members').upsert({ organization_id: organization.id, user_id: created.user.id, role: 'admin' });
    if (membershipError) return Response.json({ error: 'Workspace access could not be granted.' }, { status: 503, headers: corsHeaders });

    const sessionResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: publishableKey },
      body: JSON.stringify({ email, password }),
    });
    const session = await sessionResponse.json();
    if (!sessionResponse.ok || !session?.access_token || !session?.refresh_token) return Response.json({ error: 'A secure workspace session could not be started.' }, { status: 503, headers: corsHeaders });

    return Response.json({ access_token: session.access_token, refresh_token: session.refresh_token }, { headers: corsHeaders });
  } catch {
    return Response.json({ error: 'Could not open the workspace. Please try again.' }, { status: 500, headers: corsHeaders });
  }
});
