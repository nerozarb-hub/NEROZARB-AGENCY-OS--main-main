import { motion } from 'motion/react';
import { LogOut, LayoutDashboard, Users, CheckSquare, BookOpen, Rocket, CalendarDays, UsersRound, Database, Crown, Zap } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { isTaskOpen, isPostOpen } from '../../utils/statusHelpers';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  authLevel: 'ceo' | 'team';
  onOpenSyncModal: () => void;
}

const navItems = [
  { id: 'command', label: 'Overview', icon: LayoutDashboard },
  { id: 'client', label: 'Clients', icon: Users },
  { id: 'fulfillment', label: 'Tasks', icon: CheckSquare },
  { id: 'content', label: 'Content', icon: CalendarDays },
  { id: 'team', label: 'Team', icon: UsersRound },
  { id: 'studio', label: 'Prompt Studio', icon: BookOpen },
  { id: 'onboarding', label: 'Setup', icon: Rocket },
];

export default function Sidebar({
  activeView,
  setActiveView,
  onLogout,
  authLevel,
  onOpenSyncModal
}: SidebarProps) {
  const { data } = useAppData();

  const getBadgeCount = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    switch (id) {
      case 'command':
        return data.tasks.filter(t => t.deadline && t.deadline < today && isTaskOpen(t)).length;
      case 'client':
        return data.clients.filter(c => c.status === 'Active Sprint' || c.status === 'Retainer').length;
      case 'fulfillment':
        return data.tasks.filter(isTaskOpen).length;
      case 'content':
        return data.posts.filter(isPostOpen).length;
      case 'onboarding':
        return data.onboardings.filter(o => o.status !== 'complete').length;
      default:
        return 0;
    }
  };

  const isCeo = authLevel === 'ceo';

  return (
    <>
      {/* ===== DESKTOP SIDEBAR — left rail ===== */}
      <aside className="hidden md:flex fixed top-0 left-0 min-h-[100dvh] flex-col
                        md:w-[80px] lg:w-[224px]
                        bg-sidebar border-r border-border-dark z-50">

        {/* Wordmark & Role Badge */}
        <div className="p-6 border-b border-white/[0.04] flex-shrink-0">
          <p className="font-sans text-xs text-text-muted mb-1 lg:block hidden">Agency workspace</p>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-text-primary lg:block hidden">NEROZARB</h1>
            <h1 className="text-lg font-semibold text-text-primary lg:hidden block text-center w-full">N</h1>
          </div>

          {/* Active Role Pill */}
          <div className="mt-3 lg:block hidden">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase border ${
              isCeo
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400'
            }`}>
              {isCeo ? <Crown size={11} /> : <Zap size={11} />}
              <span>{isCeo ? 'CEO Command' : 'Team Operator'}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col overflow-y-auto custom-scrollbar no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const badgeCount = getBadgeCount(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center justify-center lg:justify-start gap-3 px-6 py-3 transition-all duration-300 relative group
                  ${isActive
                    ? 'text-text-primary bg-white/[0.05]'
                    : 'text-text-muted hover:text-text-primary'
                  }`}
                title={item.label}
              >
                <Icon size={16} className={`${isActive ? (isCeo ? 'text-primary' : 'text-cyan-400') : 'group-hover:text-text-primary'} transition-colors`} />
                <span className="hidden lg:block font-sans font-medium text-sm">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute left-0 w-[2px] h-5 ${isCeo ? 'bg-primary' : 'bg-cyan-400'}`}
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
          <div className="p-4 space-y-2 flex flex-col items-center lg:items-stretch bg-onyx/50">
            {/* System & Sync Button */}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors w-full text-xs font-medium"
              title="System & Sync Settings"
            >
              <Database size={14} className="text-primary flex-shrink-0" />
              <span className="hidden lg:inline font-sans">System & Sync</span>
              <span className="hidden lg:flex ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors w-full text-xs font-medium"
              title="Sign out"
            >
              <LogOut size={14} className="flex-shrink-0" />
              <span className="hidden lg:inline font-sans">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
                      bg-sidebar/90 border-t border-white/[0.06] backdrop-blur-md
                      flex items-stretch
                      safe-area-inset-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeView === item.id;
          const badgeCount = getBadgeCount(item.id);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative transition-colors
                ${isActive ? (isCeo ? 'text-primary' : 'text-cyan-400') : 'text-text-muted'}`}
            >
              <Icon size={18} />
              <span className="font-sans text-[9px] font-medium leading-none truncate w-full text-center">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] ${isCeo ? 'bg-primary' : 'bg-cyan-400'}`}
                />
              )}
              {badgeCount > 0 && (
                <span className={`absolute top-2 right-2 w-1.5 h-1.5 ${item.id === 'command' ? 'bg-red-500' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}

        {/* Mobile Sync Modal Trigger */}
        <button
          onClick={onOpenSyncModal}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-text-muted hover:text-text-primary transition-colors"
          title="System Settings"
        >
          <Database size={18} className="text-primary/80" />
          <span className="font-sans text-[9px] font-medium leading-none">Sync</span>
        </button>
      </nav>
    </>
  );
}
