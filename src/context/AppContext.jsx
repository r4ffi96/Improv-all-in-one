import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultState, loadState, migrate, saveState } from '../lib/storage.js';
import { fetchMeta, pushState, syncablePart } from '../lib/sync.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(() => (typeof window === 'undefined' ? defaultState() : loadState()));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Sync is a background concern: the app never waits on it and never fails
  // because of it. `status` is only ever used to tell the user what happened.
  const [syncStatus, setSyncStatus] = useState('idle');
  const [serverMeta, setServerMeta] = useState(null);
  const lastPushed = useRef(null);
  const pushTimer = useRef(null);
  // Pushes run one at a time. Two overlapping ones would race: the second
  // carries the baseVersion the first is in the middle of superseding, so the
  // device would report a conflict against its own write.
  const pushChain = useRef(Promise.resolve());

  // Persist on every change. The payload is small enough that a plain
  // synchronous write on change is fine.
  useEffect(() => { saveState(state); }, [state]);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

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

  const setSync = useCallback((partial) => {
    setState((prev) => ({ ...prev, sync: { ...prev.sync, ...partial } }));
  }, []);


  /* ----------------------------- sync ----------------------------- */

  const sync = state.sync;
  const syncReady = Boolean(sync.enabled && sync.url && sync.token);
  // Only the syncable part decides whether a push is due, so writing sync
  // bookkeeping back into state cannot trigger another push.
  const payload = useMemo(() => JSON.stringify(syncablePart(state)), [state]);

  const doPush = useCallback(async (force, skipIfUnchanged) => {
    const current = stateRef.current;
    if (!current.sync.enabled || !current.sync.url || !current.sync.token) return null;
    // An automatic push that the queue has already covered is not worth a round trip.
    if (skipIfUnchanged && lastPushed.current === JSON.stringify(syncablePart(current))) return null;
    setSyncStatus('pushing');
    try {
      const meta = await pushState(current.sync, syncablePart(current), { force });
      lastPushed.current = JSON.stringify(syncablePart(current));
      setServerMeta(meta);
      setSync({ syncedVersion: meta.version, lastPushedAt: meta.updatedAt, lastError: null });
      setSyncStatus('ok');
      return meta;
    } catch (err) {
      if (err.status === 409) {
        setServerMeta(err.payload || null);
        setSyncStatus('conflict');
        setSync({ lastError: 'The other device saved first.' });
      } else {
        setSyncStatus('offline');
        setSync({ lastError: err.message });
      }
      return null;
    }
  }, [setSync]);

  /** Queue a push behind any that is still in flight. */
  const runPush = useCallback((force = false, { auto = false } = {}) => {
    const next = pushChain.current.then(
      () => doPush(force, auto),
      () => doPush(force, auto),
    );
    pushChain.current = next;
    return next;
  }, [doPush]);

  const refreshMeta = useCallback(async () => {
    const current = stateRef.current;
    if (!current.sync.enabled || !current.sync.url || !current.sync.token) return null;
    setSyncStatus('checking');
    try {
      const meta = await fetchMeta(current.sync);
      setServerMeta(meta);
      setSyncStatus(meta.version !== (current.sync.syncedVersion || 0) ? 'behind' : 'ok');
      setSync({ lastError: null });
      return meta;
    } catch (err) {
      setSyncStatus('offline');
      setSync({ lastError: err.message });
      return null;
    }
  }, [setSync]);

  const applyServerState = useCallback((record) => {
    // The server stores whatever the writing device held, so a pull goes
    // through the same migration as a load from disk or an import.
    const data = migrate(record.data);
    setState((prev) => ({
      ...data,
      sync: { ...prev.sync, syncedVersion: record.version, lastPulledAt: new Date().toISOString(), lastError: null },
    }));
    lastPushed.current = JSON.stringify(syncablePart(data));
    setServerMeta({ ...record, data: undefined });
    setSyncStatus('ok');
  }, []);

  // On open, ask the server where it is rather than assuming. If it is ahead,
  // the settings screen offers a pull instead of quietly overwriting it.
  useEffect(() => {
    if (!syncReady) {
      setSyncStatus('idle');
      return;
    }
    lastPushed.current = JSON.stringify(syncablePart(stateRef.current));
    refreshMeta();
  }, [syncReady, sync.url, sync.token, refreshMeta]);

  // Debounced background push whenever the data actually changed.
  useEffect(() => {
    if (!syncReady || syncStatus === 'conflict') return undefined;
    if (lastPushed.current === null || lastPushed.current === payload) return undefined;
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => runPush(false, { auto: true }), 1500);
    return () => clearTimeout(pushTimer.current);
  }, [payload, syncReady, syncStatus, runPush]);

  // A failed push would otherwise sit there until the next edit. When the
  // connection or the tab comes back, finish it: retry if this device still
  // holds unpushed changes, otherwise just re-check where the server is.
  useEffect(() => {
    if (!syncReady || syncStatus === 'conflict') return undefined;
    const retry = () => {
      if (lastPushed.current !== null
        && lastPushed.current !== JSON.stringify(syncablePart(stateRef.current))) {
        runPush(false, { auto: true });
      } else {
        refreshMeta();
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') retry(); };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [syncReady, syncStatus, runPush, refreshMeta]);

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const value = useMemo(
    () => ({
      state, patch, replaceAll, toggleFavourite,
      setSync, syncStatus, serverMeta, refreshMeta, runPush, applyServerState,
      toast, showToast, setToast,
    }),
    [
      state, patch, replaceAll, toggleFavourite,
      setSync, syncStatus, serverMeta, refreshMeta, runPush, applyServerState,
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
