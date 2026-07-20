import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface AppShellProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedClient?: string | null;
  setSelectedClient?: (client: string | null) => void;
  authLevel: 'ceo' | 'team';
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({
  activeView,
  setActiveView,
  selectedClient,
  setSelectedClient,
  authLevel,
  onLogout,
  children
}: AppShellProps) {
  return (
    <div className="min-h-[100dvh] bg-onyx flex">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        authLevel={authLevel}
        onLogout={onLogout}
      />

      <main className="flex-1 min-h-[100dvh] transition-all duration-300 flex flex-col
                       md:ml-[80px] lg:ml-[224px]
                       pb-safe">

        <header className="hidden md:flex h-14 border-b border-border-dark items-center px-8 flex-shrink-0 bg-onyx/90">
          <span className="font-sans text-sm font-medium text-text-secondary capitalize">
            {activeView === 'command' ? 'Overview' : activeView}
          </span>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
