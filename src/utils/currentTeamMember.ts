const STORAGE_KEY = 'nerozarb-current-team-member';

// Convenience identity for "which team member is using this browser" — not an
// access-control mechanism. The app is still gated by one shared workspace key
// (see LoginView.tsx); this only personalizes views like My Tasks so they can
// filter by a real assigneeId instead of the previous permanently-broken
// sessionStorage.getItem('nodeRole') stand-in that nothing ever wrote to.
export const getCurrentTeamMemberId = (): string | null => localStorage.getItem(STORAGE_KEY);

export const setCurrentTeamMemberId = (id: string | null) => {
  if (id) localStorage.setItem(STORAGE_KEY, id);
  else localStorage.removeItem(STORAGE_KEY);
};
