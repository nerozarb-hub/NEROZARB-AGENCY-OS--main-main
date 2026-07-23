## 2026-07-23 - Memoized Sidebar Badge Counts
**Learning:** Components containing frequent navigation state (like a Sidebar activeView) can cause O(N) array filtering operations per render. This happens because inline functions (like getBadgeCount) recalculate on every state update.
**Action:** Use `useMemo` to cache derived state from large arrays, depending only on the actual data changing, not UI interaction state.
