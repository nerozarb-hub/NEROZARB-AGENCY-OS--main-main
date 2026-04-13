import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Hexagon, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import MonthlyPlannerModal from '../../views/ContentOS/MonthlyPlannerModal';
import { useAppData } from '../../contexts/AppDataContext';
import { Button } from '../ui/Button';

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
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const { data } = useAppData();

  const activeClientId = selectedClient ? data.clients.find(c => c.name === selectedClient)?.id || null : null;

  return (
    <div className="min-h-screen bg-onyx flex">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        authLevel={authLevel}
        onLogout={onLogout}
      />

      <main className="flex-1 min-h-screen transition-all duration-300 flex flex-col
                       md:ml-[80px] lg:ml-[210px]
                       pb-safe">

        {/* Global Context Bar — Editorial Refresh */}
        <header className="hidden md:flex h-[52px] border-b border-white/[0.04] items-center justify-between px-8 flex-shrink-0 z-40 relative bg-onyx/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-primary rounded-none" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-text-primary">
              {activeView.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlannerOpen(true)}
              className="text-text-muted hover:text-text-primary"
            >
              <ClipboardList size={14} />
              <span className="font-sans text-[10px] uppercase tracking-widest ml-2">Plan Month</span>
            </Button>
          </div>
        </header>


        <MonthlyPlannerModal
          isOpen={isPlannerOpen}
          onClose={() => setIsPlannerOpen(false)}
          clientId={activeClientId}
        />

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
