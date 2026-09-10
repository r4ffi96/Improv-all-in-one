/**
 * Single localStorage-backed store. No backend, no accounts.
 *
 * Everything the user generates lives here: archived sessions and their
 * debriefs, the in-progress Format Forge run, the Session Builder draft,
 * starred suggestions and the theme choice. The whole object can be
 * exported and re-imported as JSON from the settings screen.
 */

export const STORAGE_KEY = 'improv-all-in-one:v1';
export const SCHEMA_VERSION = 1;

export function defaultState() {
  return {
    version: SCHEMA_VERSION,
    theme: 'dark',
    archive: [],
    formats: [],   // entries sent over from a Format Forge day
    builder: null,
    forge: null,
    suggestions: {
      activeCategories: null, // null = pick a sensible default on first run
      current: {},            // categoryId -> currently shown suggestion
      saved: [],
      autoReroll: false,
      intervalSeconds: 30,
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch (err) {
    console.warn('Could not read saved data, starting fresh.', err);
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Could not save data.', err);
    return false;
  }
}

export function migrate(input) {
  const base = defaultState();
  if (!input || typeof input !== 'object') return base;
  return {
    ...base,
    ...input,
    version: SCHEMA_VERSION,
    theme: input.theme === 'light' ? 'light' : 'dark',
    archive: Array.isArray(input.archive) ? input.archive : [],
    formats: Array.isArray(input.formats) ? input.formats : [],
    suggestions: { ...base.suggestions, ...(input.suggestions || {}) },
  };
}

/** Serialise everything for the "Export all data" button. */
export function exportAll(state) {
  return JSON.stringify(
    { app: 'improv-all-in-one', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data: state },
    null,
    2,
  );
}

/**
 * Parse an exported file. Accepts both the wrapped envelope and a bare
 * state object, so a hand-edited backup still imports.
 */
export function parseImport(text) {
  const parsed = JSON.parse(text);
  const data = parsed && parsed.data ? parsed.data : parsed;
  if (!data || typeof data !== 'object') throw new Error('File does not contain app data.');
  return migrate(data);
}

export function uid(prefix = 'id') {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
