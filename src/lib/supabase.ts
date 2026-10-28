import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env?.VITE_SUPABASE_URL;
const rawKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (
  url: string | undefined = rawUrl,
  key: string | undefined = rawKey
): boolean => {
  if (!url || !key) return false;
  const normalizedUrl = url.trim().toLowerCase();
  const normalizedKey = key.trim().toLowerCase();
  if (!normalizedUrl.startsWith('https://')) return false;
  if (
    normalizedUrl.includes('placeholder-project') ||
    normalizedUrl.includes('your-project') ||
    normalizedUrl.includes('example.supabase.co') ||
    normalizedKey.includes('placeholder') ||
    normalizedKey.includes('your_key') ||
    normalizedKey.includes('your-key')
  ) {
    return false;
  }
  return true;
};

const configured = isSupabaseConfigured(rawUrl, rawKey);

export const supabase = createClient(
  configured ? rawUrl! : 'https://placeholder-project.supabase.co',
  configured ? rawKey! : 'placeholder-anon-key',
  {
    auth: {
      persistSession: configured,
      autoRefreshToken: configured,
      detectSessionInUrl: configured,
    },
  }
);
