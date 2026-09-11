import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultState, loadState, saveState } from '../lib/storage.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => (typeof window === 'undefined' ? defaultState() : loadState()));
  const [toast, setToast] = useState(null);
  // Deliberately not persisted: everything re-locks when the app is reloaded.
  const [unlocked, setUnlocked] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const toastTimer = useRef(null);

  // Persist on every change. The payload is small enough that a plain
  // synchronous write on change is fine.
  useEffect(() => { saveState(state); }, [state]);

  // Theme lives on <html data-theme> so CSS variables switch in one place.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.theme === 'light' ? '#f2f5fa' : '#0e1116');
  }, [state.theme]);

  const patch = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) }));
  }, []);

  const replaceAll = useCallback((next) => setState(next), []);

  /**
   * Run an action that changes saved data, asking for the passphrase first
   * if this is the first such action since the app was opened. One unlock
   * covers saving, deleting, starring, clearing and importing.
   */
  const requireUnlock = useCallback((action) => {
    if (unlocked) {
      action();
      return;
    }
    setPendingAction(() => action);
  }, [unlocked]);

  const cancelUnlock = useCallback(() => setPendingAction(null), []);

  const completeUnlock = useCallback(() => {
    // The pending action is read here rather than inside a state updater:
    // React may run an updater more than once, which would fire the action
    // twice and, for a toggle, cancel itself out.
    const action = pendingAction;
    setUnlocked(true);
    setPendingAction(null);
    if (action) action();
  }, [pendingAction]);

  /** Star or unstar a library block or a format. */
  const toggleFavourite = useCallback((kind, id) => {
    setState((prev) => {
      const list = prev.favourites[kind] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, favourites: { ...prev.favourites, [kind]: next } };
    });
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const value = useMemo(
    () => ({
      state, patch, replaceAll, toggleFavourite,
      unlocked, requireUnlock, unlockPending: Boolean(pendingAction), cancelUnlock, completeUnlock,
      toast, showToast, setToast,
    }),
    [
      state, patch, replaceAll, toggleFavourite,
      unlocked, requireUnlock, pendingAction, cancelUnlock, completeUnlock,
      toast, showToast,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
