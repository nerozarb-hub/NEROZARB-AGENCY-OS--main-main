import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginViewProps {
  onLogin: (level: 'ceo' | 'team') => void;
  onReset: () => void;
}

const CEO_PASSPHRASE = 'NERO2024CEO';
const TEAM_PASSPHRASE = 'NERO2024TEAM';

export default function LoginView({ onLogin, onReset }: LoginViewProps) {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetClicks, setResetClicks] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmed = passphrase.trim().toUpperCase();

    if (trimmed === CEO_PASSPHRASE) {
      onLogin('ceo');
      return;
    }

    if (trimmed === TEAM_PASSPHRASE) {
      onLogin('team');
      return;
    }

    setError('Invalid passphrase. Access denied.');
    setIsLoading(false);
    setTimeout(() => setError(null), 4000);
  };

  return (
    <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <div className="text-center mb-16 select-none" onClick={() => setResetClicks(prev => prev + 1)}>
          <h1 className="font-heading text-4xl tracking-tight text-text-primary mb-3 font-semibold cursor-pointer">NEROZARB</h1>
          <div className="text-text-muted text-sm">
            Team workspace
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-xs relative flex flex-col items-center space-y-4">
          <motion.div
            animate={error ? {
              x: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.4 }
            } : {}}
            className="relative w-full"
          >
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              className={`w-full rounded-lg bg-white/[0.03] border ${error ? 'border-red-500' : 'border-border-dark'} px-4 py-3 text-center text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
              autoFocus
              autoComplete="off"
            />
          </motion.div>

          <button
            type="submit"
            disabled={isLoading || !passphrase.trim()}
            className="mt-8 w-full bg-primary hover:bg-accent-mid disabled:opacity-50 text-text-primary font-mono text-xs py-3 tracking-[0.2em] transition-colors uppercase disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-10 left-0 right-0 text-center font-mono text-[10px] tracking-widest uppercase text-red-500"
              >
                [ {error} ]
              </motion.p>
            )}
          </AnimatePresence>

          {resetClicks >= 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              type="button"
              onClick={onReset}
              className="mt-12 text-[10px] font-mono text-primary hover:text-white transition-colors tracking-[0.3em] uppercase underline underline-offset-4"
            >
              [ EMERGENCY SYSTEM RESET ]
            </motion.button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
