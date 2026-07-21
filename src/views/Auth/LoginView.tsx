import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginViewProps { onLogin: (level: 'ceo' | 'team') => void; onReset: () => void; }

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true); setMessage('');
    const credentials = { email: email.trim(), password };
    const result = mode === 'sign-in' ? await supabase.auth.signInWithPassword(credentials) : await supabase.auth.signUp(credentials);
    if (result.error) { setMessage(result.error.message); setIsLoading(false); return; }
    if (mode === 'sign-up' && !result.data.session) { setMessage('Check your inbox to confirm your account, then sign in.'); setIsLoading(false); return; }
    const { error: workspaceError } = await supabase.functions.invoke('workspace-bootstrap');
    if (workspaceError) { setMessage('Your account is ready, but its workspace could not be created yet. Please sign in again.'); setIsLoading(false); return; }
    onLogin('ceo');
    setIsLoading(false);
  };

  return <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4"><div className="w-full max-w-md"><div className="mb-12 text-center"><h1 className="font-heading text-4xl font-semibold tracking-tight text-text-primary">NEROZARB</h1><p className="mt-3 text-sm text-text-muted">Secure agency workspace</p></div><form onSubmit={submit} className="space-y-5 rounded-xl border border-border-dark bg-card p-6 sm:p-8"><div><h2 className="text-lg font-semibold">{mode === 'sign-in' ? 'Sign in' : 'Create your workspace account'}</h2><p className="mt-1 text-sm text-text-muted">Your work saves securely and stays in sync across devices.</p></div><label className="block text-sm font-medium text-text-secondary">Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm" placeholder="you@agency.com" autoComplete="email" /></label><label className="block text-sm font-medium text-text-secondary">Password<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm" placeholder="At least 8 characters" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} /></label>{message && <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">{message}</p>}<button type="submit" disabled={isLoading} className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-onyx disabled:opacity-50">{isLoading ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button><button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }} className="w-full text-sm text-primary hover:underline">{mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></form></div></div>;
}
