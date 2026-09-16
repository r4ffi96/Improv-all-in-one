/**
 * Theatersport evening generator.
 *
 * Builds a show plan in the shape of the manual's example: per pair of teams
 * a table with a warm-up row and several rounds. Most rounds are "split" (both
 * teams play a different game from the same theme, so one kind of suggestion
 * gives two takes); one round is a joint scene, one is a Teamwunsch
 * (Spielwahlrunde, the teams choose), and the final match ends on a whole-group
 * game. No game is used twice in the whole evening.
 *
 * Games come from two sources, merged per theme:
 *   - the manual's curated Spielesammlung (source 'sammlung'), and
 *   - short-form stage games from the Session Builder library, mapped into the
 *     same themes by category tag (source 'encyclopedia'), when the wide pool
 *     is on. Encyclopedia games carry a short explanation so the moderator can
 *     introduce a game the teams have not played.
 *
 * The generator only produces a sensible default. The UI is where a moderator
 * deselects, swaps and re-rolls, so every helper here is pure.
 */

import {
  TS_THEME_BY_ID, TS_SPLIT_THEME_IDS, TS_OPENER_THEME_IDS, TS_JOINT_THEME_IDS,
  TS_THEME_TAGS, TS_FINALE_GAMES, TS_WARMUPS, TS_BACKUP_JOINT, TS_BACKUP_SOLO,
  TS_DEFAULT_TEAMS, TS_MODERATION_NOTES,
} from '../data/theatresports.js';
import { LIBRARY } from '../data/library.js';

let seq = 0;
const rowId = () => `tsr-${Date.now().toString(36)}-${(seq += 1).toString(36)}`;

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const norm = (name) => String(name || '').trim().toLowerCase();

const trimExplain = (text, max = 220) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.]+$/, '')}…`;
};

/* ------------------------------------------------------------------ */
/* pools                                                               */
/* ------------------------------------------------------------------ */

/** Short-form stage games from the library, computed once. */
let STAGE_GAMES = null;
function stageGames() {
  if (STAGE_GAMES) return STAGE_GAMES;
  STAGE_GAMES = LIBRARY.filter((item) => {
    if (item.source !== 'Improv Encyclopedia') return false;
    const tags = item.categoryTags || [];
    if (tags.includes('Long Form') || tags.includes('Format')) return false;
    if (item.type === 'warmup') return false;
    return tags.includes('Performance') || tags.includes('Scene work');
  });
  return STAGE_GAMES;
}

const curatedPool = (theme) => (theme.games || []).map((g) => ({
  name: g.name, source: 'sammlung', refId: null, explain: '', hint: g.hint || '',
}));

function encyclopediaPool(themeId) {
  const wanted = TS_THEME_TAGS[themeId];
  if (!wanted || !wanted.length) return [];
  const set = new Set(wanted);
  return stageGames()
    .filter((item) => (item.categoryTags || []).some((t) => set.has(t)))
    .map((item) => ({
      name: item.name, source: 'encyclopedia', refId: item.id,
      explain: trimExplain(item.description), hint: '',
    }));
}

/** The games available for a theme, curated first, deduped by name. */
export function poolForTheme(themeId, widePool) {
  const theme = TS_THEME_BY_ID[themeId];
  if (!theme) return [];
  const out = curatedPool(theme);
  if (widePool) {
    const seen = new Set(out.map((g) => norm(g.name)));
    for (const g of encyclopediaPool(themeId)) {
      if (!seen.has(norm(g.name))) { out.push(g); seen.add(norm(g.name)); }
    }
  }
  return out;
}

const gameByName = (themeId, widePool, name) => poolForTheme(themeId, widePool)
  .find((g) => norm(g.name) === norm(name)) || { name, source: 'sammlung', refId: null, explain: '' };

/* ------------------------------------------------------------------ */
/* used-game bookkeeping                                               */
/* ------------------------------------------------------------------ */

/** Every game name currently placed in the plan (optionally ignoring one cell). */
export function usedGameNames(plan, ignore = null) {
  const used = new Set();
  const add = (name) => { if (name) used.add(norm(name)); };
  for (const match of plan.matches) {
    for (const row of match.rows) {
      if (ignore && ignore.rowId === row.id) {
        if (row.kind === 'split') {
          if (ignore.side !== 'a' && row.a) add(row.a.game);
          if (ignore.side !== 'b' && row.b) add(row.b.game);
        }
        continue;
      }
      if (row.kind === 'split') { add(row.a?.game); add(row.b?.game); }
      else if (row.kind === 'joint' || row.kind === 'group') add(row.game);
    }
  }
  return used;
}

/** Game objects in a theme not yet used elsewhere in the plan. */
export function freeGamesForTheme(themeId, plan, ignore = null) {
  const used = usedGameNames(plan, ignore);
  return poolForTheme(themeId, plan.widePool).filter((g) => !used.has(norm(g.name)));
}

/* ------------------------------------------------------------------ */
/* generation                                                          */
/* ------------------------------------------------------------------ */

function drawGames(themeId, count, used, widePool) {
  const free = poolForTheme(themeId, widePool).filter((g) => !used.has(norm(g.name)));
  const chosen = shuffle(free).slice(0, count);
  chosen.forEach((g) => used.add(norm(g.name)));
  return chosen;
}

const inspirationsFor = (themeId) => TS_THEME_BY_ID[themeId]?.inspirations || [];

function splitInspirations(themeId) {
  const pool = shuffle(inspirationsFor(themeId));
  const a = pool[0] || '';
  const b = pool[1] || pool[0] || '';
  return [a, b];
}

const cellFrom = (game, inspiration) => ({
  include: true,
  game: game ? game.name : '',
  source: game ? game.source : 'sammlung',
  refId: game ? game.refId : null,
  explain: game ? game.explain : '',
  inspiration: inspiration || '',
});

function themeRoom(themeId, used, widePool) {
  return poolForTheme(themeId, widePool).filter((g) => !used.has(norm(g.name))).length;
}

function pickSplitTheme(used, prevThemeId, usedThemes, opener, widePool) {
  const base = opener ? TS_OPENER_THEME_IDS : TS_SPLIT_THEME_IDS;
  const candidates = shuffle(base).filter((id) => themeRoom(id, used, widePool) >= 2);
  const fresh = candidates.filter((id) => id !== prevThemeId && !usedThemes.has(id));
  if (fresh.length) return fresh[0];
  const notPrev = candidates.filter((id) => id !== prevThemeId);
  if (notPrev.length) return notPrev[0];
  if (candidates.length) return candidates[0];
  const any = shuffle(TS_SPLIT_THEME_IDS).filter((id) => themeRoom(id, used, widePool) >= 2);
  return any[0] || null;
}

function buildMatch(teamA, teamB, rounds, isFinal, used, widePool, warmup) {
  const kinds = Array.from({ length: rounds }, () => 'split');
  if (rounds >= 2) kinds[1] = 'joint';
  if (rounds >= 3) kinds[2] = 'teamwunsch';
  if (isFinal) kinds[rounds - 1] = 'group';

  let flexIndex = -1;
  for (let i = rounds - 1; i >= 1; i -= 1) {
    if (kinds[i] === 'split') { flexIndex = i; break; }
  }

  const rows = [];
  let prevTheme = null;
  const usedThemes = new Set();
  let startLeft = true;

  kinds.forEach((kind, i) => {
    const label = `Runde ${i + 1}`;
    const flexible = i === flexIndex;

    if (kind === 'joint') {
      const themeId = shuffle(TS_JOINT_THEME_IDS)
        .find((id) => themeRoom(id, used, widePool) >= 1) || TS_JOINT_THEME_IDS[0];
      const [game] = drawGames(themeId, 1, used, widePool);
      rows.push({
        id: rowId(), kind: 'joint', label, flexible, themeId, ...cellFrom(game),
        inspiration: inspirationsFor(themeId).join(', '),
      });
      return;
    }

    if (kind === 'teamwunsch') {
      rows.push({ id: rowId(), kind: 'teamwunsch', label, flexible, startLeft });
      startLeft = !startLeft;
      return;
    }

    if (kind === 'group') {
      const free = TS_FINALE_GAMES.filter((n) => !used.has(norm(n)));
      const name = free.length ? pick(free) : pick(TS_FINALE_GAMES);
      used.add(norm(name));
      rows.push({
        id: rowId(), kind: 'group', label, flexible,
        include: true, game: name, source: 'sammlung', refId: null, explain: '', inspiration: '',
      });
      return;
    }

    // split
    const themeId = pickSplitTheme(used, prevTheme, usedThemes, i === 0, widePool);
    prevTheme = themeId;
    if (themeId) usedThemes.add(themeId);
    const [ga, gb] = themeId ? drawGames(themeId, 2, used, widePool) : [];
    const [ia, ib] = splitInspirations(themeId);
    rows.push({
      id: rowId(), kind: 'split', label, flexible, themeId, startLeft,
      a: cellFrom(ga, ia),
      b: cellFrom(gb, ib),
    });
    startLeft = !startLeft;
  });

  return { teamA, teamB, warmup: warmup || TS_WARMUPS[0], rows };
}

export function generateEvening({ teamCount = 4, rounds = 5, widePool = true } = {}) {
  const count = teamCount >= 4 ? 4 : 2;
  const r = Math.max(3, Math.min(7, rounds));
  const teams = TS_DEFAULT_TEAMS.slice(0, count);
  const pairs = count === 4 ? [[0, 1], [2, 3]] : [[0, 1]];
  const used = new Set();

  const matches = pairs.map(([x, y], idx) => buildMatch(
    teams[x], teams[y], r, idx === pairs.length - 1, used, widePool,
    // A different audience warm-up per match, so the second half after the
    // break does not repeat the first.
    TS_WARMUPS[idx % TS_WARMUPS.length],
  ));

  return {
    createdAt: new Date().toISOString(),
    teamCount: count,
    rounds: r,
    widePool,
    matches,
    backupJoint: shuffle(TS_BACKUP_JOINT).slice(0, 3),
    backupSolo: shuffle(TS_BACKUP_SOLO).slice(0, 4),
    notes: TS_MODERATION_NOTES.map((n) => `• ${n}`).join('\n'),
  };
}

/* ------------------------------------------------------------------ */
/* edits                                                               */
/* ------------------------------------------------------------------ */

/** Set a specific game (by name) into a split cell, carrying its source. */
export function setSplitGame(plan, matchIndex, rowIdValue, side, name) {
  const row = plan.matches[matchIndex].rows.find((x) => x.id === rowIdValue);
  if (!row) return plan;
  const g = gameByName(row.themeId, plan.widePool, name);
  return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
    ...r, [side]: { ...r[side], game: g.name, source: g.source, refId: g.refId, explain: g.explain },
  }));
}

/** Set a specific game into a joint or group row. */
export function setSingleGame(plan, matchIndex, rowIdValue, name) {
  const row = plan.matches[matchIndex].rows.find((x) => x.id === rowIdValue);
  if (!row) return plan;
  const g = row.kind === 'joint'
    ? gameByName(row.themeId, plan.widePool, name)
    : { name, source: 'sammlung', refId: null, explain: '' };
  return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
    ...r, game: g.name, source: g.source, refId: g.refId, explain: g.explain,
  }));
}

/** Re-roll one game in a split cell, avoiding games already in the plan. */
export function rerollSplitGame(plan, matchIndex, rowIdValue, side) {
  const row = plan.matches[matchIndex].rows.find((x) => x.id === rowIdValue);
  if (!row || row.kind !== 'split') return plan;
  const free = freeGamesForTheme(row.themeId, plan, { rowId: rowIdValue, side });
  if (!free.length) return plan;
  const g = pick(free);
  return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
    ...r, [side]: { ...r[side], game: g.name, source: g.source, refId: g.refId, explain: g.explain },
  }));
}

/** Re-roll a joint or group game. */
export function rerollSingleGame(plan, matchIndex, rowIdValue) {
  const row = plan.matches[matchIndex].rows.find((x) => x.id === rowIdValue);
  if (!row) return plan;
  if (row.kind === 'joint') {
    const free = freeGamesForTheme(row.themeId, plan, { rowId: rowIdValue });
    if (!free.length) return plan;
    const g = pick(free);
    return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
      ...r, game: g.name, source: g.source, refId: g.refId, explain: g.explain,
    }));
  }
  if (row.kind === 'group') {
    const used = usedGameNames(plan, { rowId: rowIdValue });
    const free = TS_FINALE_GAMES.filter((n) => !used.has(norm(n)));
    if (!free.length) return plan;
    return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
      ...r, game: pick(free), source: 'sammlung', refId: null, explain: '',
    }));
  }
  return plan;
}

/** Change a split round's theme, redrawing both games from the new theme. */
export function changeSplitTheme(plan, matchIndex, rowIdValue, themeId) {
  const insp = inspirationsFor(themeId);
  return replaceRow(plan, matchIndex, rowIdValue, (r) => {
    const used = usedGameNames(plan, { rowId: rowIdValue, side: null });
    const free = poolForTheme(themeId, plan.widePool).filter((game) => !used.has(norm(game.name)));
    const pool = shuffle(free);
    const ga = pool[0];
    const gb = pool[1] || pool[0];
    return {
      ...r, themeId,
      a: cellFrom(ga, insp[0] || ''),
      b: cellFrom(gb, insp[1] || insp[0] || ''),
    };
  });
}

/** Append a split round to a match. */
export function addSplitRound(plan, matchIndex) {
  const match = plan.matches[matchIndex];
  const used = usedGameNames(plan);
  const themeId = pickSplitTheme(used, null, new Set(), false, plan.widePool)
    || TS_SPLIT_THEME_IDS[0];
  const [ga, gb] = drawGames(themeId, 2, used, plan.widePool);
  const insp = inspirationsFor(themeId);
  const row = {
    id: rowId(), kind: 'split', label: `Runde ${match.rows.length + 1}`,
    flexible: false, themeId, startLeft: true,
    a: cellFrom(ga, insp[0] || ''),
    b: cellFrom(gb, insp[1] || insp[0] || ''),
  };
  return {
    ...plan,
    matches: plan.matches.map((m, i) => (i !== matchIndex ? m : { ...m, rows: [...m.rows, row] })),
  };
}

export function removeRow(plan, matchIndex, rowIdValue) {
  return {
    ...plan,
    matches: plan.matches.map((m, i) => (i !== matchIndex ? m
      : { ...m, rows: m.rows.filter((r) => r.id !== rowIdValue) })),
  };
}

/** Immutable helper: replace one row in one match. */
export function replaceRow(plan, matchIndex, rowIdValue, updater) {
  return {
    ...plan,
    matches: plan.matches.map((m, i) => (i !== matchIndex ? m : {
      ...m,
      rows: m.rows.map((r) => (r.id === rowIdValue ? updater(r) : r)),
    })),
  };
}

/** Immutable helper: patch match-level fields (team names, warm-up). */
export function patchMatch(plan, matchIndex, partial) {
  return {
    ...plan,
    matches: plan.matches.map((m, i) => (i !== matchIndex ? m : { ...m, ...partial })),
  };
}

/** Which split themes currently have room, for the theme dropdown. */
export function availableSplitThemes(plan) {
  return TS_SPLIT_THEME_IDS.filter((id) => poolForTheme(id, plan.widePool).length > 0);
}

/** All games used in the plan that carry an explanation, for the export. */
export function explainedGames(plan) {
  const seen = new Set();
  const out = [];
  const add = (cell) => {
    if (!cell || !cell.explain || cell.include === false) return;
    if (seen.has(norm(cell.game))) return;
    seen.add(norm(cell.game));
    out.push({ name: cell.game, explain: cell.explain });
  };
  for (const match of plan.matches) {
    for (const row of match.rows) {
      if (row.kind === 'split') { add(row.a); add(row.b); }
      else if (row.kind === 'joint' || row.kind === 'group') add(row);
    }
  }
  return out;
}
