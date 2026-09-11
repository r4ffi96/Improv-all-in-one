import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultState, loadState, saveState } from '../lib/storage.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => (typeof window === 'undefined' ? defaultState() : loadState()));
  const [toast, setToast] = useState(null);
  // Deliberately not persisted: saving re-locks when the app is reloaded.
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);
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
      archiveUnlocked, setArchiveUnlocked,
      toast, showToast, setToast,
    }),
    [state, patch, replaceAll, toggleFavourite, archiveUnlocked, toast, showToast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
