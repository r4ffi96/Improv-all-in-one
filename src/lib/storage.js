/**
 * Single localStorage-backed store. No backend, no accounts.
 *
 * Everything the user generates lives here: archived sessions and their
 * debriefs, the in-progress Format Forge run, the Session Builder draft,
 * starred suggestions and the theme choice. The whole object can be
 * exported and re-imported as JSON from the settings screen.
 */

import { PRESET_SESSIONS } from '../data/preset-sessions.js';
import { defaultSync } from './sync.js';

export const STORAGE_KEY = 'improv-all-in-one:v1';
export const SCHEMA_VERSION = 1;

export function defaultState() {
  return {
    version: SCHEMA_VERSION,
    theme: 'dark',
    archive: [],
    formats: [],   // entries sent over from a Format Forge day
    hidden: { library: [], formats: [] },      // ids switched off in settings
    favourites: { library: [], formats: [] },  // starred blocks and formats
    seededPresets: [],                     // preset sessions already placed in the archive
    sync: defaultSync(),                   // per-device server settings, never synced
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
    if (!raw) return seedPresets(defaultState());
    const parsed = JSON.parse(raw);
    return seedPresets(migrate(parsed));
  } catch (err) {
    console.warn('Could not read saved data, starting fresh.', err);
    return seedPresets(defaultState());
  }
}

/**
 * Put the sessions that ship with the app into the archive the first time
 * each one is seen. They become ordinary entries after that, so deleting one
 * does not bring it back and edits are kept.
 */
export function seedPresets(state) {
  const missing = PRESET_SESSIONS.filter((preset) => !state.seededPresets.includes(preset.id));
  if (!missing.length) return state;
  const known = new Set(state.archive.map((entry) => entry.id));
  return {
    ...state,
    archive: [...missing.filter((p) => !known.has(p.id)), ...state.archive],
    seededPresets: [...state.seededPresets, ...missing.map((p) => p.id)],
  };
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
    seededPresets: Array.isArray(input.seededPresets) ? input.seededPresets : [],
    sync: { ...defaultSync(), ...(input.sync || {}) },
    hidden: {
      library: Array.isArray(input.hidden?.library) ? input.hidden.library : [],
      formats: Array.isArray(input.hidden?.formats) ? input.hidden.formats : [],
    },
    favourites: {
      library: Array.isArray(input.favourites?.library) ? input.favourites.library : [],
      formats: Array.isArray(input.favourites?.formats) ? input.favourites.formats : [],
    },
    suggestions: { ...base.suggestions, ...(input.suggestions || {}) },
  };
}

/**
 * Serialise everything for the "Export all data" button.
 *
 * The sync block is left out: it holds this device's server address and
 * token, which should not travel in a backup file or onto another device.
 */
export function exportAll(state) {
  const { sync, ...data } = state;
  void sync;
  return JSON.stringify(
    { app: 'improv-all-in-one', version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data },
    null,
    2,
  );
}

/**
 * Parse an exported file. Accepts both the wrapped envelope and a bare
 * state object, so a hand-edited backup still imports.
 */
export function parseImport(text, keepSync = null) {
  const parsed = JSON.parse(text);
  const data = parsed && parsed.data ? parsed.data : parsed;
  if (!data || typeof data !== 'object') throw new Error('File does not contain app data.');
  const next = migrate(data);
  // An imported file carries no server settings, so keep this device's.
  return keepSync ? { ...next, sync: keepSync } : next;
}

export function uid(prefix = 'id') {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}
