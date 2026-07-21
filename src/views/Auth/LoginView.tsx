import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginViewProps { onLogin: (level: 'ceo' | 'team') => void; onReset: () => void; }

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-up');
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

  const isSignIn = mode === 'sign-in';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-onyx p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-text-primary">NEROZARB</h1>
          <p className="mt-3 text-sm text-text-muted">Your agency workspace, safely synced everywhere.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-xl border border-border-dark bg-card p-6 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{isSignIn ? 'Welcome back' : 'First-time setup'}</p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">{isSignIn ? 'Sign in to your workspace' : 'Set up your account'}</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              {isSignIn
                ? 'Use the email and password you created when setting up NEROZARB.'
                : 'Use your own email and create a password. There is no pre-set password.'}
            </p>
          </div>

          <label className="block text-sm font-medium text-text-secondary">
            Your email
            <input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm" placeholder="you@agency.com" autoComplete="email" />
          </label>
          <label className="block text-sm font-medium text-text-secondary">
            {isSignIn ? 'Your password' : 'Create a password'}
            <input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-border-dark bg-onyx px-3 text-sm" placeholder="At least 8 characters" autoComplete={isSignIn ? 'current-password' : 'new-password'} />
          </label>

          {message && <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">{message}</p>}

          <button type="submit" disabled={isLoading} className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-onyx disabled:opacity-50">
            {isLoading ? 'Working…' : isSignIn ? 'Sign in' : 'Create my account'}
          </button>
          <button type="button" onClick={() => { setMode(isSignIn ? 'sign-up' : 'sign-in'); setMessage(''); }} className="w-full text-sm text-primary hover:underline">
            {isSignIn ? 'New here? Set up your account' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
