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
 * The generator only produces a sensible default. The UI is where a moderator
 * deselects, swaps and re-rolls, so every helper here is pure and side-effect
 * free.
 */

import {
  TS_THEME_BY_ID, TS_SPLIT_THEME_IDS, TS_OPENER_THEME_IDS, TS_JOINT_THEME_IDS,
  TS_FINALE_GAMES, TS_WARMUPS, TS_BACKUP_JOINT, TS_BACKUP_SOLO,
  TS_DEFAULT_TEAMS, TS_MODERATION_NOTES,
} from '../data/theatresports.js';

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

const gameNames = (themeId) => (TS_THEME_BY_ID[themeId]?.games || []).map((g) => g.name);

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

/** Games in a theme not yet used elsewhere in the plan. */
export function freeGamesForTheme(themeId, plan, ignore = null) {
  const used = usedGameNames(plan, ignore);
  return gameNames(themeId).filter((n) => !used.has(norm(n)));
}

function drawGames(themeId, count, used) {
  const free = gameNames(themeId).filter((n) => !used.has(norm(n)));
  const chosen = shuffle(free).slice(0, count);
  chosen.forEach((n) => used.add(norm(n)));
  return chosen;
}

function inspirationsFor(themeId) {
  return TS_THEME_BY_ID[themeId]?.inspirations || [];
}

/** Two distinct inspiration prompts for the two teams of a split round. */
function splitInspirations(themeId) {
  const pool = shuffle(inspirationsFor(themeId));
  const a = pool[0] || '';
  const b = pool[1] || pool[0] || '';
  return [a, b];
}

function themeHasSplitRoom(themeId, used) {
  return gameNames(themeId).filter((n) => !used.has(norm(n))).length >= 2;
}

/** Pick a split theme, avoiding the previous round's and, if possible, reuse. */
function pickSplitTheme(used, prevThemeId, usedThemes, opener) {
  const base = opener ? TS_OPENER_THEME_IDS : TS_SPLIT_THEME_IDS;
  const candidates = shuffle(base).filter((id) => themeHasSplitRoom(id, used));
  const fresh = candidates.filter((id) => id !== prevThemeId && !usedThemes.has(id));
  if (fresh.length) return fresh[0];
  const notPrev = candidates.filter((id) => id !== prevThemeId);
  if (notPrev.length) return notPrev[0];
  if (candidates.length) return candidates[0];
  // Opener pool exhausted: fall back to any split theme with room.
  const any = shuffle(TS_SPLIT_THEME_IDS).filter((id) => themeHasSplitRoom(id, used));
  return any[0] || null;
}

function buildMatch(teamA, teamB, rounds, isFinal, used) {
  const kinds = Array.from({ length: rounds }, () => 'split');
  if (rounds >= 2) kinds[1] = 'joint';
  if (rounds >= 3) kinds[2] = 'teamwunsch';
  if (isFinal) kinds[rounds - 1] = 'group';

  // The flexible (droppable) round: the latest split round after round 1.
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
        .find((id) => freeThemeGame(id, used)) || TS_JOINT_THEME_IDS[0];
      const [game] = drawGames(themeId, 1, used);
      rows.push({
        id: rowId(), kind: 'joint', label, flexible, themeId,
        include: true,
        game: game || TS_BACKUP_JOINT[0],
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
      const game = (free.length ? pick(free) : pick(TS_FINALE_GAMES));
      used.add(norm(game));
      rows.push({
        id: rowId(), kind: 'group', label, flexible, include: true, game, inspiration: '',
      });
      return;
    }

    // split
    const themeId = pickSplitTheme(used, prevTheme, usedThemes, i === 0);
    prevTheme = themeId;
    if (themeId) usedThemes.add(themeId);
    const [ga, gb] = themeId ? drawGames(themeId, 2, used) : [];
    const [ia, ib] = splitInspirations(themeId);
    rows.push({
      id: rowId(), kind: 'split', label, flexible, themeId, startLeft,
      a: { include: true, game: ga || TS_BACKUP_SOLO[0], inspiration: ia },
      b: { include: true, game: gb || TS_BACKUP_SOLO[1], inspiration: ib },
    });
    startLeft = !startLeft;
  });

  return { teamA, teamB, warmup: TS_WARMUPS[0], rows };
}

function freeThemeGame(themeId, used) {
  return gameNames(themeId).some((n) => !used.has(norm(n)));
}

export function generateEvening({ teamCount = 4, rounds = 5 } = {}) {
  const count = teamCount >= 4 ? 4 : 2;
  const r = Math.max(3, Math.min(7, rounds));
  const teams = TS_DEFAULT_TEAMS.slice(0, count);
  const pairs = count === 4 ? [[0, 1], [2, 3]] : [[0, 1]];
  const used = new Set();

  const matches = pairs.map(([x, y], idx) => buildMatch(
    teams[x], teams[y], r, idx === pairs.length - 1, used,
  ));

  return {
    createdAt: new Date().toISOString(),
    teamCount: count,
    rounds: r,
    matches,
    backupJoint: shuffle(TS_BACKUP_JOINT).slice(0, 3),
    backupSolo: shuffle(TS_BACKUP_SOLO).slice(0, 4),
    notes: TS_MODERATION_NOTES.map((n) => `• ${n}`).join('\n'),
  };
}

/** Re-roll one game in a split cell, avoiding games already in the plan. */
export function rerollSplitGame(plan, matchIndex, rowIdValue, side) {
  const match = plan.matches[matchIndex];
  const row = match.rows.find((x) => x.id === rowIdValue);
  if (!row || row.kind !== 'split') return plan;
  const free = freeGamesForTheme(row.themeId, plan, { rowId: rowIdValue, side });
  if (!free.length) return plan;
  const next = pick(free);
  return replaceRow(plan, matchIndex, rowIdValue, (r) => ({
    ...r, [side]: { ...r[side], game: next },
  }));
}

/** Re-roll a joint or group game. */
export function rerollSingleGame(plan, matchIndex, rowIdValue) {
  const match = plan.matches[matchIndex];
  const row = match.rows.find((x) => x.id === rowIdValue);
  if (!row) return plan;
  let candidates = [];
  if (row.kind === 'joint') candidates = freeGamesForTheme(row.themeId, plan, { rowId: rowIdValue });
  else if (row.kind === 'group') {
    const used = usedGameNames(plan, { rowId: rowIdValue });
    candidates = TS_FINALE_GAMES.filter((n) => !used.has(norm(n)));
  }
  if (!candidates.length) return plan;
  const next = pick(candidates);
  return replaceRow(plan, matchIndex, rowIdValue, (r) => ({ ...r, game: next }));
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
