import { LIBRARY, FREEZE_TAG_ID, byId } from '../data/library.js';
import { uid } from './storage.js';

export const DURATION_PRESETS = [60, 90, 120, 180, 240, 360];

export function emptySession() {
  return {
    id: uid('session'),
    type: 'session',
    title: '',
    topic: '',
    groupSize: '',
    level: '',
    targetMinutes: 90,
    freezeTag: true,
    items: [],
    createdAt: new Date().toISOString(),
    debriefs: [],
  };
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'about', 'into', 'work',
  'session', 'improv', 'what', 'when', 'want', 'them', 'they', 'our', 'your',
]);

export function tokenize(topic) {
  return String(topic || '')
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .map((t) => t.replace(/'s$/, ''))
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Crude stemming so "listening" also finds "Look and Listen" and "callbacks"
 * finds "callback". Good enough for a fixed library of this size.
 */
export function variants(token) {
  const out = new Set([token]);
  if (token.length > 4) {
    if (token.endsWith('ing')) out.add(token.slice(0, -3));
    if (token.endsWith('ed')) out.add(token.slice(0, -2));
    if (token.endsWith('s')) out.add(token.slice(0, -1));
  }
  return Array.from(out);
}

/**
 * Score library items against the topic. Tags weigh most, then the name,
 * then the description, then the body text.
 */
export function scoreItem(item, tokens) {
  if (!tokens.length) return 0;
  const tags = item.categoryTags.join(' ').toLowerCase();
  const name = item.name.toLowerCase();
  const description = item.description.toLowerCase();
  const body = `${item.fullText} ${item.coachingNotes.join(' ')}`.toLowerCase();

  return tokens.reduce((score, token) => {
    const forms = variants(token);
    const hits = (haystack) => forms.some((form) => haystack.includes(form));
    let s = score;
    if (hits(tags)) s += 6;
    if (hits(name)) s += 4;
    if (hits(description)) s += 2;
    if (hits(body)) s += 1;
    return s;
  }, 0);
}

/**
 * Candidates for a topic, best match first.
 *
 * A hit anywhere in the body text scores 1, which on a broad topic like
 * "game of the scene" matches most of the library and is no help. So when
 * enough items match on a tag or a name (score 4 or more), only those are
 * offered; the weaker body-text matches are the fallback for narrow topics.
 */
const STRONG_MATCH = 4;

export function findCandidates(topic) {
  const tokens = tokenize(topic);
  const scored = LIBRARY
    .filter((item) => item.id !== FREEZE_TAG_ID)
    .map((item) => ({ item, score: scoreItem(item, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  const strong = scored.filter((entry) => entry.score >= STRONG_MATCH);
  return (strong.length >= 3 ? strong : scored).map((entry) => entry.item);
}

export function groupByType(items) {
  return {
    warmup: items.filter((i) => i.type === 'warmup'),
    exercise: items.filter((i) => i.type === 'exercise'),
    main: items.filter((i) => i.type === 'main'),
    theory: items.filter((i) => i.type === 'theory'),
  };
}

export const totalMinutes = (session) =>
  (session.items || []).reduce((sum, item) => sum + (Number(item.durationMinutes) || 0), 0);

export function makeLibraryItem(libraryItem) {
  return {
    uid: uid('item'),
    kind: 'library',
    libraryId: libraryItem.id,
    durationMinutes: libraryItem.durationMinutes,
  };
}

export function makeBreak(minutes = 15) {
  return {
    uid: uid('break'),
    kind: 'break',
    label: 'Break',
    durationMinutes: minutes,
    note: '',
  };
}

/**
 * The Freeze Tag closer is owned by the toggle: on means exactly one
 * Freeze Tag item, always last. Off means none.
 */
export function applyFreezeTag(items, enabled) {
  const withoutFreeze = items.filter((i) => !(i.kind === 'library' && i.libraryId === FREEZE_TAG_ID));
  if (!enabled) return withoutFreeze;
  const freeze = items.find((i) => i.kind === 'library' && i.libraryId === FREEZE_TAG_ID);
  const lib = byId(FREEZE_TAG_ID);
  return [...withoutFreeze, freeze || makeLibraryItem(lib)];
}

export function moveItem(items, index, direction) {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return items;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** One-line summary used on archive cards. */
export function summarise(session) {
  const counts = { warmup: 0, exercise: 0, main: 0, theory: 0, break: 0 };
  const mains = [];
  (session.items || []).forEach((item) => {
    if (item.kind === 'break') { counts.break += 1; return; }
    // Freeze Tag is reported on its own, so it is not counted as an exercise.
    if (item.libraryId === FREEZE_TAG_ID) return;
    const lib = byId(item.libraryId);
    if (!lib) return;
    counts[lib.type] += 1;
    if (lib.type === 'main') mains.push(lib.name);
  });
  const parts = [];
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  if (counts.warmup) parts.push(plural(counts.warmup, 'warm-up'));
  if (counts.exercise) parts.push(plural(counts.exercise, 'exercise'));
  if (mains.length) parts.push(mains.join(' + '));
  if (counts.theory) parts.push(plural(counts.theory, 'theory block'));
  if (counts.break) parts.push(plural(counts.break, 'break'));
  if (session.freezeTag) parts.push('Freeze Tag');
  return parts.join(', ') || 'Empty session';
}

/** Topic tags across the selected items, used for archive filtering. */
export function sessionTags(session) {
  const tags = new Set();
  (session.items || []).forEach((item) => {
    const lib = item.kind === 'library' ? byId(item.libraryId) : null;
    if (lib) lib.categoryTags.forEach((t) => tags.add(t));
  });
  return Array.from(tags);
}
