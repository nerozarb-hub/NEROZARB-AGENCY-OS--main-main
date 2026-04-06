import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { hashPassphrase } from '../../utils/storage';

interface SetupViewProps {
    onInitialize: (ceoHash: string, teamHash: string) => void;
}

export default function SetupView({ onInitialize }: SetupViewProps) {
    const [ceoPassphrase, setCeoPassphrase] = useState('');
    const [confirmCeo, setConfirmCeo] = useState('');
    const [teamPassphrase, setTeamPassphrase] = useState('');
    const [confirmTeam, setConfirmTeam] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!ceoPassphrase || !teamPassphrase) {
            setError('Both passphrases are required');
            return;
        }

        if (ceoPassphrase !== confirmCeo) {
            setError('CEO passphrases do not match');
            return;
        }

        if (teamPassphrase !== confirmTeam) {
            setError('Team passphrases do not match');
            return;
        }

        if (ceoPassphrase === teamPassphrase) {
            setError('CEO and Team passphrases must be different');
            return;
        }

        onInitialize(hashPassphrase(ceoPassphrase), hashPassphrase(teamPassphrase));
    };

    return (
        <div className="min-h-screen bg-onyx flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-card  p-8 rounded-sm shadow-2xl"
            >
                <div className="mb-8 border-b border-border-dark pb-6">
                    <h1 className="font-heading text-xl tracking-tighter text-text-primary uppercase">Initialize System</h1>
                    <p className="font-mono text-[10px] text-primary tracking-widest mt-1 uppercase">NEROZARB OS v2.0 — Platinum Edge</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest">CEO Access</h2>
                        <input
                            type="password"
                            value={ceoPassphrase}
                            onChange={(e) => setCeoPassphrase(e.target.value)}
                            placeholder="Set CEO Passphrase"
                            className="w-full bg-card-alt  px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                        />
                        <input
                            type="password"
                            value={confirmCeo}
                            onChange={(e) => setConfirmCeo(e.target.value)}
                            placeholder="Confirm CEO Passphrase"
                            className="w-full bg-card-alt  px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border-dark/50">
                        <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Team Access</h2>
                        <input
                            type="password"
                            value={teamPassphrase}
                            onChange={(e) => setTeamPassphrase(e.target.value)}
                            placeholder="Set Team Passphrase"
                            className="w-full bg-card-alt  px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                        />
                        <input
                            type="password"
                            value={confirmTeam}
                            onChange={(e) => setConfirmTeam(e.target.value)}
                            placeholder="Confirm Team Passphrase"
                            className="w-full bg-card-alt  px-4 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-500 font-mono text-[10px] text-center uppercase tracking-widest">
                            [ {error} ]
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-accent-mid text-text-primary font-mono text-xs py-4 tracking-[0.2em] transition-colors uppercase mt-4"
                    >
                        INITIALIZE
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
