import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Database, Crown, Zap } from 'lucide-react';

interface AppShellProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedClient?: string | null;
  setSelectedClient?: (client: string | null) => void;
  onLogout: () => void;
  authLevel: 'ceo' | 'team';
  onOpenSyncModal: () => void;
  children: ReactNode;
}

export default function AppShell({
  activeView,
  setActiveView,
  selectedClient: _selectedClient,
  setSelectedClient: _setSelectedClient,
  onLogout,
  authLevel,
  onOpenSyncModal,
  children
}: AppShellProps) {
  const isCeo = authLevel === 'ceo';

  return (
    <div className="min-h-[100dvh] bg-onyx flex">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={onLogout}
        authLevel={authLevel}
        onOpenSyncModal={onOpenSyncModal}
      />

      <main className="flex-1 min-h-[100dvh] transition-all duration-300 flex flex-col
                       md:ml-[80px] lg:ml-[224px]
                       pb-safe">

        <header className="hidden md:flex h-14 border-b border-border-dark items-center justify-between px-8 flex-shrink-0 bg-onyx/90 backdrop-blur-sm sticky top-0 z-40">
          <span className="font-sans text-sm font-medium text-text-secondary capitalize">
            {activeView === 'command' ? 'Overview' : activeView}
          </span>

          <div className="flex items-center gap-3">
            {/* Active Role Tag */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase border ${
              isCeo
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
            }`}>
              {isCeo ? <Crown size={11} /> : <Zap size={11} />}
              <span>{isCeo ? 'CEO Access' : 'Team Access'}</span>
            </div>

            {/* Quick Sync Header Button */}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-dark bg-card hover:bg-white/[0.04] text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <Database size={13} className="text-primary" />
              <span>Sync & Settings</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
