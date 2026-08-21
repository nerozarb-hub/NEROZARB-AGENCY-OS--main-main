import { useState, useEffect, lazy, Suspense } from 'react';
import LoginView from './views/Auth/LoginView';
import AppShell from './components/layout/AppShell';
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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-text-muted text-sm font-mono animate-pulse tracking-wider">LOADING MODULE...</div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [isLoading, setIsLoading] = useState(true);
  const [authLevel, setAuthLevel] = useState<'ceo' | null>(null);
  const [activeView, setActiveView] = useState('command');
  const [selectedGlobalClient, setSelectedGlobalClient] = useState<string | null>(null);

  useEffect(() => {
    async function hydrate() {
      setIsLoading(true);

      // 1. Check Supabase Session First
      const { data: { session } } = await supabase.auth.getSession();

      const hasWorkspaceKeySession = session?.user.email?.endsWith('@access.nerozarb.invalid');
      if (hasWorkspaceKeySession) setAuthLevel('ceo');
      else {
        if (session) await supabase.auth.signOut();
        setAuthLevel(null);
      }

      // 2. Fetch App Data
      const cloudData = await fetchAppDataFromSupabase();
      if (cloudData) {
        setData(prev => ({
          ...prev,
          ...cloudData
        }));
      }
      setIsLoading(false);
    }
    hydrate();

    // 3. Listen for Auth Changes (Login / Logout across tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user.email?.endsWith('@access.nerozarb.invalid')) {
        setAuthLevel('ceo');
        const cloudData = await fetchAppDataFromSupabase();
        if (cloudData) setData(prev => ({ ...prev, ...cloudData }));
      } else {
        if (session) await supabase.auth.signOut();
        setAuthLevel(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleInitialize = (ceoHash: string, teamHash: string) => {
    const newSettings = {
      ceoPhraseHash: ceoHash,
      teamPhraseHash: teamHash,
      initialized: true,
      lastUpdated: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      settings: newSettings,
    }));

    // Sync to Supabase
    syncSettingsToSupabase(newSettings);
  };

  const handleReset = () => {
    const resetSettings = {
      ceoPhraseHash: null,
      teamPhraseHash: null,
      initialized: false,
      lastUpdated: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      settings: resetSettings,
    }));

    // Sync to Supabase
    syncSettingsToSupabase(resetSettings);

    // Clear local storage to be sure
    localStorage.removeItem('nerozarb-os-v2');
  };

  const handleLogin = async () => {
    setAuthLevel('ceo');
    sessionStorage.setItem('authLevel', 'ceo');
    const cloudData = await fetchAppDataFromSupabase();
    if (cloudData) setData(prev => ({ ...prev, ...cloudData }));
    setActiveView('command');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthLevel(null);
    sessionStorage.removeItem('authLevel');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-white/50 text-sm font-space animate-pulse">Establishing secure connection...</div>
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

  // 1. Initial Setup Mode
  // Setup view removed because we are using hardcoded global passphrases.

  // 2. Login Screen
  if (!authLevel) {
    return (
      <AppDataProvider data={data} setData={setData}>
        <LoginView
          onLogin={handleLogin}
        />
      </AppDataProvider>
    );
  }

  return (
    <AppDataProvider data={data} setData={setData}>
      <AppShell
        activeView={activeView}
        setActiveView={setActiveView}
        selectedClient={selectedGlobalClient}
        setSelectedClient={setSelectedGlobalClient}
        onLogout={handleLogout}
      >
        <GlobalErrorBoundary>
          <Suspense fallback={<ViewLoader />}>
            {activeView === 'command' && <DashboardView onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {activeView === 'client' && <ClientOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {activeView === 'fulfillment' && <FulfillmentOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {activeView === 'content' && <ContentOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {activeView === 'studio' && <PromptStudio onNavigate={setActiveView} />}
            {activeView === 'onboarding' && <OnboardingOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {activeView === 'team' && <TeamView />}
          </Suspense>
        </GlobalErrorBoundary>
      </AppShell>
    </AppDataProvider>
  );
}
