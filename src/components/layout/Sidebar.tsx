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
        <div className="p-6 border-b border-white/[0.04] flex-shrink-0">
          <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#555] mb-2 lg:block hidden">System v2.0</p>
          <h1 className="editorial-title text-2xl text-text-primary lg:block hidden">Nerozarb</h1>
          <h1 className="editorial-title text-xl text-text-primary lg:hidden block text-center">Nz</h1>
        </div>


        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col overflow-y-auto custom-scrollbar no-scrollbar">
          {filteredNavItems.map((item) => {
            const isActive = activeView === item.id;
            const badgeCount = getBadgeCount(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center justify-center lg:justify-start gap-3 px-6 py-3 transition-all duration-300 relative group
                  ${isActive
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                  }`}
                title={item.label}
              >
                <Icon size={16} className={`${isActive ? 'text-primary' : 'group-hover:text-text-primary'} transition-colors`} />
                <span className="hidden lg:block font-sans font-bold text-[10px] uppercase tracking-widest">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 w-[2px] h-5 bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {badgeCount > 0 && (
                  <span className={`lg:ml-auto text-[10px] font-mono ${item.id === 'command' ? 'text-red-500' : 'text-primary/60'}`}>
                    {badgeCount}
                  </span>
                )}
              </button>

            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-white/[0.04] flex-shrink-0">
          {authLevel === 'ceo' && (
            <div className="px-6 py-2 border-b border-white/[0.04] bg-primary/5">
              <p className="font-mono text-[9px] text-primary tracking-widest hidden lg:block uppercase font-bold">CEO Active</p>
              <p className="font-mono text-[9px] text-primary tracking-widest lg:hidden text-center uppercase font-bold">CEO</p>
            </div>
          )}
          <div className="p-6 space-y-4 flex flex-col items-center lg:items-start bg-onyx/50">
            <div className="flex items-center gap-3">
              <div className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-none h-1.5 w-1.5 bg-primary"></span>
              </div>
              <p className="font-mono text-[9px] text-text-muted tracking-widest hidden lg:block uppercase font-bold">Nominal</p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-text-muted hover:text-red-500 transition-colors group w-full justify-center lg:justify-start"
              title="Terminate Session"
            >
              <LogOut size={14} />
              <span className="hidden lg:block font-sans text-[10px] font-bold uppercase tracking-widest">Terminate</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-sidebar/80 border-t border-white/[0.06] backdrop-blur-md
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
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative transition-colors
                ${isActive ? 'text-primary' : 'text-text-muted'}`}
            >
              <Icon size={18} />
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest leading-none truncate w-full text-center">
                {item.label.split(' ')[0]}
              </span>
              {/* Active dots/line */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-primary rounded-none"
                />
              )}
              {/* Badge dot */}
              {badgeCount > 0 && (
                <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-none ${item.id === 'command' ? 'bg-red-500' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
