import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });

    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || '', { global: { headers: { Authorization: authorization } } });
    const token = authorization.slice(7);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });

    const { prompt, model = 'gemini-2.5-flash', generationConfig } = await request.json();
    if (typeof prompt !== 'string' || !prompt.trim()) return Response.json({ error: 'A compiled prompt is required' }, { status: 400, headers: corsHeaders });
    if (prompt.length > 100_000) return Response.json({ error: 'Prompt exceeds the server safety limit' }, { status: 400, headers: corsHeaders });
    if (!['gemini-2.5-flash', 'gemini-2.5-flash-image'].includes(model)) return Response.json({ error: 'Unsupported model profile' }, { status: 400, headers: corsHeaders });

    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    const admin = createClient(Deno.env.get('SUPABASE_URL') || '', secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: apiKey, error: secretError } = await admin.rpc('get_gemini_api_key');
    if (secretError) return Response.json({ error: 'AI provider secret is unavailable' }, { status: 503, headers: corsHeaders });
    if (!apiKey) return Response.json({ error: 'AI provider is not configured' }, { status: 503, headers: corsHeaders });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: generationConfig || { temperature: 0.5 } }),
    });
    const payload = await response.json();
    if (!response.ok) return Response.json({ error: 'Gemini generation failed', provider: payload?.error?.message || 'Unknown provider error' }, { status: 502, headers: corsHeaders });
    const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('') || '';
    return Response.json({ text, model, provider: 'gemini', usage: payload?.usageMetadata || null }, { headers: corsHeaders });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unexpected server error' }, { status: 500, headers: corsHeaders });
  }
});
