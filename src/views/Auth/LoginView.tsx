import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Zap, Shield, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { validatePassphrase, DEFAULT_CEO_PASSPHRASES, DEFAULT_TEAM_PASSPHRASES } from '../../utils/storage';

interface LoginViewProps {
  onLogin: (level: 'ceo' | 'team') => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const { data } = useAppData();
  const [selectedRole, setSelectedRole] = useState<'ceo' | 'team'>('ceo');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [successRole, setSuccessRole] = useState<'ceo' | 'team' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setIsLoading(true);
    setError(null);

    const input = passphrase.trim();
    const resolvedRole = validatePassphrase(input, data?.settings);

    if (resolvedRole) {
      setSuccessRole(resolvedRole);
      setTimeout(() => {
        onLogin(resolvedRole);
      }, 400);
      return;
    }

    // Invalid passphrase
    setError('Invalid passphrase. Access denied.');
    setIsLoading(false);
    setTimeout(() => setError(null), 4000);
  };

  const isCeo = selectedRole === 'ceo';

  return (
    <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-onyx relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md flex flex-col items-center z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8 select-none">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-text-primary mb-2">
            NEROZARB
          </h1>
          <div className="flex items-center justify-center gap-3 text-text-muted font-mono text-[10px] tracking-[0.25em] uppercase">
            <span>AGENCY OPERATING SYSTEM</span>
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            <span>v2.0</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full rounded-2xl border border-border-dark bg-card/95 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-onyx rounded-xl border border-border-dark mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ceo');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isCeo
                  ? 'bg-primary text-onyx shadow-md'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Crown size={14} className={isCeo ? 'text-onyx' : 'text-primary'} />
              <span>CEO Command</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('team');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                !isCeo
                  ? 'bg-cyan-400 text-onyx shadow-md'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Zap size={14} className={!isCeo ? 'text-onyx' : 'text-cyan-400'} />
              <span>Team Operator</span>
            </button>
          </div>

          {/* Role Info Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-semibold uppercase tracking-[0.16em] ${isCeo ? 'text-primary' : 'text-cyan-400'}`}>
                {isCeo ? '👑 Executive Access' : '⚡ Operational Access'}
              </span>
              <span className="text-[10px] font-mono text-text-muted bg-white/[0.04] px-2 py-0.5 rounded border border-border-dark">
                {isCeo ? 'FULL GOVERNANCE' : 'PRODUCTION MODE'}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-text-primary">
              {isCeo ? 'Enter CEO Passphrase' : 'Enter Team Passphrase'}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              {isCeo
                ? 'Full access to financials, strategy, LTV data, approvals & system governance.'
                : 'Access to tasks, content calendar, client sprints & team fulfillment.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              animate={error ? {
                x: [0, -8, 8, -8, 8, 0],
                transition: { duration: 0.35 }
              } : {}}
              className="relative"
            >
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Passphrase
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={isCeo ? "Enter CEO passphrase" : "Enter Team passphrase"}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-border-dark bg-onyx px-4 py-3 font-mono text-sm tracking-[0.08em] text-text-primary placeholder:text-text-muted/40 focus:border-primary focus:outline-none transition-colors"
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-mono text-center uppercase tracking-wider"
                >
                  [ {error} ]
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation State */}
            {successRole && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-mono flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>Access Granted: Opening {successRole.toUpperCase()} Panel...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passphrase.trim()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-[0.14em] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isCeo
                  ? 'bg-primary hover:bg-primary/90 text-onyx shadow-lg shadow-primary/10'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-onyx shadow-lg shadow-cyan-400/10'
              }`}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Open {isCeo ? 'CEO' : 'Team'} Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper / Passphrase Hint Drawer */}
          <div className="mt-6 pt-5 border-t border-border-dark">
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              className="flex items-center justify-between w-full text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle size={13} className="text-primary" />
                <span>Forgot your passkey or need help?</span>
              </span>
              <span className="text-[10px] font-mono text-primary/80 underline underline-offset-2">
                {showHelper ? 'Hide defaults' : 'View defaults'}
              </span>
            </button>

            <AnimatePresence>
              {showHelper && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 rounded-lg border border-border-dark bg-onyx/70 p-3 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-text-muted">CEO Default:</span>
                    <code className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {DEFAULT_CEO_PASSPHRASES[0]}
                    </code>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-text-muted">Team Default:</span>
                    <code className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                      {DEFAULT_TEAM_PASSPHRASES[0]}
                    </code>
                  </div>
                  <p className="text-[10px] text-text-muted pt-1 border-t border-border-dark/60 leading-normal">
                    Tip: Entering a valid CEO passphrase will always grant CEO access, and a Team passphrase will grant Team access. Passphrases can be changed inside the workspace anytime.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 flex items-center gap-2 text-[11px] text-text-muted">
          <Shield size={12} className="text-primary/70" />
          <span>Encrypted Session • Zero External Subscriptions Required</span>
        </div>
      </motion.div>
    </div>
  );
}
