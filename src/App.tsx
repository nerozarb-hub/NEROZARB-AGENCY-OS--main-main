import { useState, useEffect, lazy, Suspense } from 'react';
import LoginView from './views/Auth/LoginView';
import AppShell from './components/layout/AppShell';
import { loadData, saveData, AppData } from './utils/storage';
import { AppDataProvider } from './contexts/AppDataContext';
import { fetchAppDataFromSupabase, syncSettingsToSupabase } from './utils/supabaseSync';
import { GlobalErrorBoundary } from './components/layout/GlobalErrorBoundary';
import { supabase } from './lib/supabase';

// Lazy-loaded view modules — only loaded when user navigates to them
const DashboardView = lazy(() => import('./views/CommandCenter/DashboardView'));
const ClientOS = lazy(() => import('./views/ClientOS'));
const FulfillmentOS = lazy(() => import('./views/FulfillmentOS'));
const ContentOS = lazy(() => import('./views/ContentOS'));
const KnowledgeVault = lazy(() => import('./views/KnowledgeVault'));
const OnboardingOS = lazy(() => import('./views/OnboardingOS'));
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
  const [authLevel, setAuthLevel] = useState<'ceo' | 'team' | null>(() => {
    return (sessionStorage.getItem('authLevel') as 'ceo' | 'team') || null;
  });
  const [activeView, setActiveView] = useState('command');
  const [selectedGlobalClient, setSelectedGlobalClient] = useState<string | null>(null);

  useEffect(() => {
    async function hydrate() {
      setIsLoading(true);

      // 1. Check Supabase Session First
      const { data: { session } } = await supabase.auth.getSession();

      const storedAuthLevel = sessionStorage.getItem('authLevel') as 'ceo' | 'team' | null;

      if (session) {
        // Auto-login based on session existence.
        setAuthLevel(storedAuthLevel || 'ceo');
      } else if (storedAuthLevel) {
        // Passphrase-based auth: trust sessionStorage even without Supabase session
        setAuthLevel(storedAuthLevel);
      } else {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Keep current auth level if set during login process
        setAuthLevel(prev => prev || 'ceo');
      } else {
        setAuthLevel(null);
        sessionStorage.removeItem('authLevel');
      }
    });

    return () => subscription.unsubscribe();
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

  const handleLogin = (level: 'ceo' | 'team') => {
    setAuthLevel(level);
    sessionStorage.setItem('authLevel', level);
    // Team lands on Fulfillment OS, CEO on Command Center
    setActiveView(level === 'ceo' ? 'command' : 'fulfillment');
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
          onReset={handleReset}
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
        authLevel={authLevel}
        onLogout={handleLogout}
      >
        <GlobalErrorBoundary>
          <Suspense fallback={<ViewLoader />}>
            {activeView === 'command' && authLevel === 'ceo' && <DashboardView onNavigate={(view, id) => {
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
            {activeView === 'vault' && <KnowledgeVault selectedClient={selectedGlobalClient} />}
            {activeView === 'onboarding' && <OnboardingOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
            {/* Fallback if team tries to access command center */}
            {activeView === 'command' && authLevel !== 'ceo' && <FulfillmentOS onNavigate={(view, id) => {
              setActiveView(view);
              if (id) setSelectedGlobalClient(id);
            }} />}
          </Suspense>
        </GlobalErrorBoundary>
      </AppShell>
    </AppDataProvider>
  );
}

