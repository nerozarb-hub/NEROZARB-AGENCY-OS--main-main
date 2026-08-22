import { useState, useEffect, lazy, Suspense } from 'react';
import LoginView from './views/Auth/LoginView';
import AppShell from './components/layout/AppShell';
import SystemSyncModal from './components/modals/SystemSyncModal';
import { loadData, saveData, AppData } from './utils/storage';
import { AppDataProvider } from './contexts/AppDataContext';
import { fetchAppDataFromSupabase, subscribeToRealtimeSync, syncSettingsToSupabase } from './utils/supabaseSync';
import { GlobalErrorBoundary } from './components/layout/GlobalErrorBoundary';
import { supabase } from './lib/supabase';

// Lazy-loaded view modules — only loaded when user navigates to them
const DashboardView = lazy(() => import('./views/CommandCenter/DashboardView'));
const ClientOS = lazy(() => import('./views/ClientOS'));
const FulfillmentOS = lazy(() => import('./views/FulfillmentOS'));
const ContentOS = lazy(() => import('./views/ContentOS'));
const PromptStudio = lazy(() => import('./views/PromptStudio'));
const OnboardingOS = lazy(() => import('./views/OnboardingOS'));
const TeamView = lazy(() => import('./views/Team'));
const ClientPortalView = lazy(() => import('./views/PortalOS/ClientPortalView'));

// Suspense fallback for lazy-loaded views
function ViewLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="text-text-muted text-xs font-mono animate-pulse tracking-widest uppercase">
        LOADING MODULE...
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [isLoading, setIsLoading] = useState(true);
  const [authLevel, setAuthLevel] = useState<'ceo' | 'team' | null>(() => {
    const saved = sessionStorage.getItem('authLevel') || localStorage.getItem('nerozarb_auth_level');
    return (saved === 'ceo' || saved === 'team') ? saved : null;
  });
  const [activeView, setActiveView] = useState('command');
  const [selectedGlobalClient, setSelectedGlobalClient] = useState<string | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  useEffect(() => {
    async function hydrate() {
      setIsLoading(true);

      // 1. Check existing session / stored auth level
      const savedAuth = sessionStorage.getItem('authLevel') || localStorage.getItem('nerozarb_auth_level');
      if (savedAuth === 'ceo' || savedAuth === 'team') {
        setAuthLevel(savedAuth);
        sessionStorage.setItem('authLevel', savedAuth);
      }

      // 2. Fetch App Data from Cloud
      const cloudData = await fetchAppDataFromSupabase();
      if (cloudData) {
        setData(prev => ({
          ...prev,
          ...cloudData,
          settings: {
            ...prev.settings,
            ...(cloudData.settings || {})
          }
        }));
      }
      setIsLoading(false);
    }
    hydrate();
  }, []);

  // Realtime subscription for Supabase changes
  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    return subscribeToRealtimeSync(() => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        const cloudData = await fetchAppDataFromSupabase();
        if (cloudData) setData(previous => ({ ...previous, ...cloudData }));
      }, 350);
    });
  }, []);

  // Debounced save — prevents serializing entire state on every keystroke/click
  useEffect(() => {
    if (isLoading) return;
    const timeout = setTimeout(() => saveData(data), 500);
    return () => clearTimeout(timeout);
  }, [data, isLoading]);

  const handleLogin = async (level: 'ceo' | 'team') => {
    setAuthLevel(level);
    sessionStorage.setItem('authLevel', level);
    localStorage.setItem('nerozarb_auth_level', level);

    // Refresh cloud data on successful login
    const cloudData = await fetchAppDataFromSupabase();
    if (cloudData) setData(prev => ({ ...prev, ...cloudData }));
    setActiveView('command');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setAuthLevel(null);
    sessionStorage.removeItem('authLevel');
    localStorage.removeItem('nerozarb_auth_level');
  };

  const handleForceRefresh = async () => {
    const cloudData = await fetchAppDataFromSupabase();
    if (cloudData) setData(prev => ({ ...prev, ...cloudData }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-white/50 text-xs font-mono tracking-widest uppercase animate-pulse">
          INITIALIZING NEROZARB OS...
        </div>
      </div>
    );
  }

  // 0. Client Portal Interceptor
  if (window.location.pathname.startsWith('/portal/')) {
    const token = window.location.pathname.replace('/portal/', '');
    return (
      <Suspense fallback={<ViewLoader />}>
        <ClientPortalView token={token} />
      </Suspense>
    );
  }

  // 1. Passphrase Login Screen (CEO & Team)
  if (!authLevel) {
    return (
      <AppDataProvider data={data} setData={setData}>
        <LoginView onLogin={handleLogin} />
      </AppDataProvider>
    );
  }

  // 2. Authenticated App Shell with Role Panel
  return (
    <AppDataProvider data={data} setData={setData}>
      <AppShell
        activeView={activeView}
        setActiveView={setActiveView}
        selectedClient={selectedGlobalClient}
        setSelectedClient={setSelectedGlobalClient}
        onLogout={handleLogout}
        authLevel={authLevel}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      >
        <GlobalErrorBoundary>
          <Suspense fallback={<ViewLoader />}>
            {activeView === 'command' && (
              <DashboardView
                onNavigate={(view, id) => {
                  setActiveView(view);
                  if (id) setSelectedGlobalClient(id);
                }}
              />
            )}
            {activeView === 'client' && (
              <ClientOS
                onNavigate={(view, id) => {
                  setActiveView(view);
                  if (id) setSelectedGlobalClient(id);
                }}
              />
            )}
            {activeView === 'fulfillment' && (
              <FulfillmentOS
                onNavigate={(view, id) => {
                  setActiveView(view);
                  if (id) setSelectedGlobalClient(id);
                }}
              />
            )}
            {activeView === 'content' && (
              <ContentOS
                onNavigate={(view, id) => {
                  setActiveView(view);
                  if (id) setSelectedGlobalClient(id);
                }}
              />
            )}
            {activeView === 'studio' && (
              <PromptStudio onNavigate={setActiveView} />
            )}
            {activeView === 'onboarding' && (
              <OnboardingOS
                onNavigate={(view, id) => {
                  setActiveView(view);
                  if (id) setSelectedGlobalClient(id);
                }}
              />
            )}
            {activeView === 'team' && (
              <TeamView />
            )}
          </Suspense>
        </GlobalErrorBoundary>
      </AppShell>

      {/* Built-in System & Sync Governance Modal */}
      <SystemSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        authLevel={authLevel}
        onForceRefresh={handleForceRefresh}
      />
    </AppDataProvider>
  );
}
