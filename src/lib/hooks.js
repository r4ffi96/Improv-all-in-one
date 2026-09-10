import { useCallback, useEffect, useRef, useState } from 'react';

export const TABS = [
  { id: 'builder', label: 'Session', title: 'Session Builder' },
  { id: 'suggestions', label: 'Suggest', title: 'Suggestion Generator' },
  { id: 'formats', label: 'Formats', title: 'Format Library' },
  { id: 'archive', label: 'Archive', title: 'Session Archive' },
  { id: 'forge', label: 'Forge', title: 'Format Forge' },
  { id: 'glossary', label: 'Glossary', title: 'Terminology Glossary' },
];

const DEFAULT_TAB = 'builder';

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
  const tab = TABS.some((t) => t.id === parts[0]) ? parts[0] : DEFAULT_TAB;
  return { tab, params: parts.slice(1) };
}

/** Hash routing: #/tab/param keeps links and the back button working. */
export function useHashRoute() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) window.location.replace(`#/${DEFAULT_TAB}`);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((tab, ...params) => {
    const path = [tab, ...params.filter((p) => p != null).map((p) => encodeURIComponent(p))].join('/');
    window.location.hash = `#/${path}`;
  }, []);

  const goBack = useCallback(() => window.history.back(), []);

  return { route, navigate, goBack };
}

/** Interval that stays correct when the callback identity changes. */
export function useInterval(callback, delayMs) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);
  useEffect(() => {
    if (delayMs == null) return undefined;
    const id = setInterval(() => saved.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

export function useDebouncedEffect(fn, deps, delay = 300) {
  useEffect(() => {
    const id = setTimeout(fn, delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
