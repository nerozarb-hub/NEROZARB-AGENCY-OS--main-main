import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginViewProps { onLogin: () => void; }

export default function LoginView({ onLogin }: LoginViewProps) {
  const [accessKey, setAccessKey] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true); setMessage('');
    await supabase.auth.signOut();
    const { data, error } = await supabase.functions.invoke('workspace-access', { body: { accessKey } });
    if (error || !data?.access_token || !data?.refresh_token) { setMessage(data?.error || error?.message || 'That workspace key is not recognised.'); setIsLoading(false); return; }
    const { error: sessionError } = await supabase.auth.setSession(data);
    if (sessionError) { setMessage('Your key was accepted, but a session could not be saved. Please try again.'); setIsLoading(false); return; }
    onLogin();
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-onyx p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-text-primary">NEROZARB</h1>
          <p className="mt-3 text-sm text-text-muted">One workspace, safely synced everywhere.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-xl border border-border-dark bg-card p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Workspace access</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">Enter your workspace key</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">No email, account, or separate employee access. Enter the shared key to open NEROZARB from any device.</p>
          </div>

          <label className="block text-sm font-medium text-text-secondary">
            Workspace key
            <input required value={accessKey} onChange={event => setAccessKey(event.target.value.toUpperCase())} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 font-mono text-sm uppercase tracking-[0.08em]" placeholder="XX-XX-XX-XX-XX" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
          </label>

          {message && <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">{message}</p>}

          <button type="submit" disabled={isLoading} className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-onyx disabled:opacity-50">
            {isLoading ? 'Opening workspace…' : 'Open workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
