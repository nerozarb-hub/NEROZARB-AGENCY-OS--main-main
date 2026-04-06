import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, Users, Settings, BookOpen, Rocket, CalendarDays } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  authLevel: 'ceo' | 'team';
  onLogout: () => void;
}

const navItems = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, ceoOnly: true },
  { id: 'client', label: 'Client OS', icon: Users, ceoOnly: false },
  { id: 'fulfillment', label: 'Fulfillment', icon: Settings, ceoOnly: false },
  { id: 'content', label: 'Content OS', icon: CalendarDays, ceoOnly: false },
  { id: 'vault', label: 'Knowledge', icon: BookOpen, ceoOnly: false },
  { id: 'onboarding', label: 'Onboarding', icon: Rocket, ceoOnly: false },
];

export default function Sidebar({ activeView, setActiveView, authLevel, onLogout }: SidebarProps) {
  const { data } = useAppData();
  const filteredNavItems = navItems.filter(item => !item.ceoOnly || authLevel === 'ceo');

  const getBadgeCount = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    switch (id) {
      case 'command':
        return data.tasks.filter(t => t.deadline && t.deadline < today && t.status !== 'Deployed').length;
      case 'client':
        return data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer').length;
      case 'fulfillment':
        return data.tasks.filter(t => t.status !== 'Deployed').length;
      case 'content':
        return data.posts.filter(p => p.status !== 'Published').length;
      case 'onboarding':
        return data.onboardings.filter(o => o.status !== 'complete').length;
      default:
        return 0;
    }
  };

  return (
    <>
      {/* ===== DESKTOP SIDEBAR — left rail ===== */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen flex-col
                        md:w-[80px] lg:w-[210px]
                        bg-sidebar border-r border-border-dark z-50">

        {/* Wordmark */}
        <div className="p-[22px_18px_18px] border-b border-border-dark lg:text-left text-center flex-shrink-0">
          <p className="hidden lg:block font-mono text-[10px] text-accent-light mb-1">[ NERO ] + [ ZARB ]</p>
          <h1 className="font-heading text-[17px] font-black text-text-primary uppercase leading-none hidden lg:block">NEROZARB</h1>
          <h1 className="font-heading text-[17px] font-black text-text-primary uppercase leading-none lg:hidden block">NZ</h1>
          <p className="hidden lg:block font-sans text-[11px] font-medium text-text-muted mt-2">Agency OS · v2.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 flex flex-col overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => {
            const isActive = activeView === item.id;
            const badgeCount = getBadgeCount(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center justify-center lg:justify-start gap-3 px-[18px] py-3 transition-all duration-200 border-l-2 relative
                  ${isActive
                    ? 'border-primary bg-primary/10 text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-card-alt/30'
                  }`}
                title={item.label}
              >
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                <span className="hidden lg:block font-heading font-bold text-[11px] tracking-[0.5px]">
                  {item.label}
                </span>
                {badgeCount > 0 && (
                  <span className={`lg:ml-auto font-mono text-[8px] ${item.id === 'command' ? 'text-red-500' : 'text-primary'}`}>
                    [{badgeCount}]
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-border-dark flex-shrink-0">
          {authLevel === 'ceo' && (
            <div className="px-[18px] py-2 border-b border-border-dark/50 bg-primary/5">
              <p className="font-mono text-[10px] text-primary tracking-wide hidden lg:block">[ CEO ACCESS ACTIVE ]</p>
              <p className="font-mono text-[10px] text-primary tracking-wide lg:hidden text-center">CEO</p>
            </div>
          )}
          <div className="p-[14px_18px] space-y-2 flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-3">
              <div className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary shadow-[0_0_4px_rgba(63,106,36,0.8)]"></span>
              </div>
              <p className="font-mono text-[10px] text-accent-light tracking-wide hidden lg:block">SYSTEM ONLINE</p>
            </div>
            <p className="hidden lg:block font-sans text-[11px] font-medium text-text-muted">The Digital Atelier</p>
            <p className="hidden lg:block font-mono text-[10px] text-[#555] tracking-wide">Growth. Engineered.</p>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors pt-2 group w-full justify-center lg:justify-start"
              title="Terminate Session"
            >
              <LogOut size={14} />
              <span className="hidden lg:block font-mono text-[10px] font-medium">Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-sidebar border-t border-border-dark
                      flex items-stretch
                      safe-area-inset-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {filteredNavItems.map((item) => {
          const isActive = activeView === item.id;
          const badgeCount = getBadgeCount(item.id);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 px-1 relative transition-colors
                ${isActive ? 'text-primary' : 'text-text-muted'}`}
            >
              <Icon size={20} />
              <span className="font-mono text-[10px] font-medium tracking-wide leading-none mt-0.5 truncate w-full text-center">
                {item.label.split(' ')[0]}
              </span>
              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full"
                />
              )}
              {/* Badge dot */}
              {badgeCount > 0 && (
                <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${item.id === 'command' ? 'bg-red-500' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
        {/* Logout on mobile — long-press area or extra small icon */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-0.5 py-3 px-2 text-text-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-mono text-[10px] font-medium tracking-wide">Exit</span>
        </button>
      </nav>
    </>
  );
}
