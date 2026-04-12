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
                       pb-[70px] md:pb-0">

        {/* Global Context Bar — Editorial Refresh */}
        <header className="hidden md:flex h-[60px] border-b border-border-dark items-center justify-between px-10 flex-shrink-0 z-40 relative">
          <div className="flex items-center gap-3">
            <Hexagon size={14} className="text-primary" />
            <span className="editorial-title text-base text-text-primary">System Operations</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-text-muted">Active Context</span>
              <button className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-border-dark rounded-none hover:border-text-muted transition-all">
                <span className="text-[11px] font-medium text-text-primary tracking-wide">
                  {selectedClient || 'Global View'}
                </span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlannerOpen(true)}
              className="text-text-muted hover:text-text-primary font-sans text-[10px] uppercase tracking-widest"
            >
              <ClipboardList size={14} className="mr-2" />
              Plan Month
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
