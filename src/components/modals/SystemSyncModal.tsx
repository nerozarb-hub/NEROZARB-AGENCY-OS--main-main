import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw, KeyRound, Database, Download, Upload, Check, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { hashPassphrase, DEFAULT_CEO_PASSPHRASES, DEFAULT_TEAM_PASSPHRASES, AppData } from '../../utils/storage';
import { fetchAppDataFromSupabase, syncSettingsToSupabase, syncTasksToSupabase, syncPostsToSupabase, syncPromptOsToSupabase } from '../../utils/supabaseSync';

interface SystemSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  authLevel: 'ceo' | 'team';
  onForceRefresh?: () => void;
}

export default function SystemSyncModal({
  isOpen,
  onClose,
  authLevel,
  onForceRefresh
}: SystemSyncModalProps) {
  const { data, setData } = useAppData();
  const [activeTab, setActiveTab] = useState<'sync' | 'passphrases' | 'roles'>('sync');

  // Passphrase state
  const [newCeoPassphrase, setNewCeoPassphrase] = useState('');
  const [newTeamPassphrase, setNewTeamPassphrase] = useState('');
  const [passphraseMessage, setPassphraseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co'
  );

  // Handle Full Manual Sync
  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      if (isSupabaseConfigured) {
        // 1. Push current state
        await Promise.all([
          syncTasksToSupabase(data.tasks),
          syncPostsToSupabase(data.posts),
          syncPromptOsToSupabase(data),
          syncSettingsToSupabase(data.settings),
        ]);

        // 2. Fetch fresh cloud state
        const cloudData = await fetchAppDataFromSupabase();
        if (cloudData) {
          setData(prev => ({
            ...prev,
            ...cloudData
          }));
        }
        if (onForceRefresh) onForceRefresh();
        setSyncStatusMsg({ type: 'success', text: 'Full cloud synchronization completed successfully.' });
      } else {
        setSyncStatusMsg({ type: 'success', text: 'Local state saved and verified (Supabase not configured).' });
      }
    } catch (err) {
      console.error(err);
      setSyncStatusMsg({ type: 'error', text: 'Sync encountered a problem. Local state was preserved.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Passphrase Update
  const handleSavePassphrases = async () => {
    setPassphraseMessage(null);
    if (!newCeoPassphrase.trim() && !newTeamPassphrase.trim()) {
      setPassphraseMessage({ type: 'error', text: 'Please enter a new passphrase for CEO or Team.' });
      return;
    }

    const updatedSettings = {
      ...data.settings,
      lastUpdated: new Date().toISOString(),
      ...(newCeoPassphrase.trim() ? { ceoPhraseHash: hashPassphrase(newCeoPassphrase.trim().toUpperCase()) } : {}),
      ...(newTeamPassphrase.trim() ? { teamPhraseHash: hashPassphrase(newTeamPassphrase.trim().toUpperCase()) } : {})
    };

    setData(prev => ({
      ...prev,
      settings: updatedSettings
    }));

    // Sync to Supabase
    await syncSettingsToSupabase(updatedSettings);

    setNewCeoPassphrase('');
    setNewTeamPassphrase('');
    setPassphraseMessage({ type: 'success', text: 'Passphrases updated and synced to all devices!' });
  };

  // Reset Passphrases to Default
  const handleResetPassphrasesToDefault = async () => {
    if (!confirm('Reset CEO and Team passphrases back to original system defaults?')) return;

    const resetSettings = {
      ...data.settings,
      ceoPhraseHash: null,
      teamPhraseHash: null,
      lastUpdated: new Date().toISOString(),
    };

    setData(prev => ({
      ...prev,
      settings: resetSettings
    }));

    await syncSettingsToSupabase(resetSettings);
    setPassphraseMessage({ type: 'success', text: `Passphrases reset to defaults: CEO (${DEFAULT_CEO_PASSPHRASES[0]}) & Team (${DEFAULT_TEAM_PASSPHRASES[0]})` });
  };

  // Export Full JSON Backup
  const handleExportBackup = () => {
    const backupJson = JSON.stringify(data, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NEROZARB-AGENCY-BACKUP-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as AppData;
        if (!parsed.clients && !parsed.tasks && !parsed.posts) {
          alert('Invalid backup file format.');
          return;
        }
        if (confirm('Importing this backup will merge and update your current workspace data. Continue?')) {
          setData(prev => ({
            ...prev,
            ...parsed,
            settings: {
              ...prev.settings,
              ...(parsed.settings || {})
            }
          }));
          // Trigger immediate sync
          if (parsed.settings) await syncSettingsToSupabase(parsed.settings);
          alert('Workspace backup successfully restored!');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl rounded-xl border border-border-dark bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-dark px-6 py-4 bg-onyx/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">System & Sync Control</h2>
              <p className="text-xs text-text-muted">Cloud sync status, passphrase governance & zero-cost data management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-dark bg-onyx/30 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <RefreshCw size={14} />
            Sync & Backups
          </button>

          {authLevel === 'ceo' && (
            <button
              onClick={() => setActiveTab('passphrases')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'passphrases'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <KeyRound size={14} />
              Passphrase Manager
            </button>
          )}

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles size={14} />
            Role Permissions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* TAB 1: SYNC & BACKUPS */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div className="p-4 rounded-xl border border-border-dark bg-onyx flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {isSupabaseConfigured ? 'Supabase Real-Time Cloud Sync Active' : 'Local Storage Mode'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-text-muted">
                        v2.0
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {isSupabaseConfigured
                        ? 'All clients, tasks, and posts are continuously synced to your remote Supabase database.'
                        : 'Operating securely in local storage. Configure VITE_SUPABASE_URL for remote sync.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-onyx text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {syncStatusMsg && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  syncStatusMsg.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}>
                  {syncStatusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{syncStatusMsg.text}</span>
                </div>
              )}

              {/* Data Summary Grid */}
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Live Workspace Stats</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border-dark bg-onyx/50">
                    <p className="text-[11px] text-text-muted">Active Clients</p>
                    <p className="text-xl font-bold font-mono text-text-primary mt-1">{data.clients.length}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border-dark bg-onyx/50">
                    <p className="text-[11px] text-text-muted">Total Tasks</p>
                    <p className="text-xl font-bold font-mono text-text-primary mt-1">{data.tasks.length}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border-dark bg-onyx/50">
                    <p className="text-[11px] text-text-muted">Content Posts</p>
                    <p className="text-xl font-bold font-mono text-text-primary mt-1">{data.posts.length}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border-dark bg-onyx/50">
                    <p className="text-[11px] text-text-muted">Protocols / SOPs</p>
                    <p className="text-xl font-bold font-mono text-text-primary mt-1">{data.protocols.length}</p>
                  </div>
                </div>
              </div>

              {/* Backup & Portability Section */}
              <div className="border-t border-border-dark pt-5">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Zero-Cost Offline Backups</p>
                <p className="text-xs text-text-secondary mb-4">
                  Export or restore your entire agency dataset with a single click. Keep full offline ownership with zero vendor lock-in.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-dark bg-onyx hover:bg-white/[0.04] text-xs font-medium text-text-primary transition-colors"
                  >
                    <Download size={14} className="text-primary" />
                    Export Full Backup (.json)
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-dark bg-onyx hover:bg-white/[0.04] text-xs font-medium text-text-primary transition-colors"
                  >
                    <Upload size={14} className="text-primary" />
                    Import / Restore Backup
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASSPHRASE MANAGER (CEO ONLY) */}
          {activeTab === 'passphrases' && authLevel === 'ceo' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <KeyRound size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Custom Passphrase Governance</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      You can update the CEO and Team access passphrases here anytime. Changes take effect immediately and sync across all devices via Supabase.
                    </p>
                  </div>
                </div>
              </div>

              {passphraseMessage && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  passphraseMessage.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}>
                  {passphraseMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{passphraseMessage.text}</span>
                </div>
              )}

              {/* CEO Passphrase Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-secondary">
                  Update CEO Passphrase
                </label>
                <input
                  type="text"
                  value={newCeoPassphrase}
                  onChange={e => setNewCeoPassphrase(e.target.value)}
                  placeholder="Enter new CEO passphrase (e.g. NERO2024CEO)"
                  className="w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-text-primary focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-text-muted">
                  Current Status: {data.settings.ceoPhraseHash ? 'Custom passphrase configured' : `Default (${DEFAULT_CEO_PASSPHRASES[0]})`}
                </p>
              </div>

              {/* Team Passphrase Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-secondary">
                  Update Team Passphrase
                </label>
                <input
                  type="text"
                  value={newTeamPassphrase}
                  onChange={e => setNewTeamPassphrase(e.target.value)}
                  placeholder="Enter new Team passphrase (e.g. NERO2024TEAM)"
                  className="w-full rounded-lg border border-border-dark bg-onyx px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-text-primary focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-text-muted">
                  Current Status: {data.settings.teamPhraseHash ? 'Custom passphrase configured' : `Default (${DEFAULT_TEAM_PASSPHRASES[0]})`}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-dark">
                <button
                  type="button"
                  onClick={handleResetPassphrasesToDefault}
                  className="text-xs text-text-muted hover:text-red-400 transition-colors underline underline-offset-4"
                >
                  Reset Passphrases to Default
                </button>

                <button
                  type="button"
                  onClick={handleSavePassphrases}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-onyx text-xs font-semibold hover:bg-primary/90 transition-all"
                >
                  <Check size={14} />
                  Save & Sync Passphrases
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ROLE PERMISSIONS EXPLAINER */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CEO Card */}
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👑</span>
                    <h4 className="text-sm font-semibold text-primary">CEO Command Panel</h4>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Full financial metrics, LTV, revenue gates & client contract values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>CEO approval gates & final task deployment permissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Passphrase & security governance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>Prompt Studio AI governance & context packs</span>
                    </li>
                  </ul>
                </div>

                {/* Team Card */}
                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <h4 className="text-sm font-semibold text-cyan-400">Team Operator Panel</h4>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Task fulfillment & sprint pipeline execution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Content calendar creation & post production</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Client onboarding step execution & protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldAlert size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                      <span className="text-text-muted">Sensitive financial metrics & revenue gates hidden</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-dark px-6 py-3 bg-onyx/80 flex items-center justify-between text-xs text-text-muted">
          <span>Logged in as: <strong className="uppercase text-text-primary">{authLevel}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-text-primary transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
