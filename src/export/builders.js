/**
 * Document builders. Each one produces a document model that the shared
 * PDF and DOCX renderers turn into a print document.
 *
 * No session numbering appears anywhere in these documents, by design.
 */

import { B, buildDocument, formatMinutes, prettyDate, quote } from './docModel.js';
import { getStrings } from './labels.js';
import { fullById } from '../data/library.js';
import forgeData from '../data/format-forge-steps.json';

const SESSION_ADJUSTMENTS = [
  'Running late: cut a variation round before you cut a debrief. The debrief is where the transfer happens.',
  'Room goes heady after a theory block: two minutes of Association Circle rather than pushing on.',
  'A player is sitting out repeatedly: give them the outside-eye role with a concrete note-taking brief.',
  'An exercise lands harder than expected: stay in it and drop the next warm-up, not the main block.',
  'Group is smaller than planned: run pair exercises with the coach playing, rather than rotating a lone observer.',
  'Group is larger than planned: split into two playing areas for exercise blocks and rejoin for the main block.',
];

const PLAYER_RULES_OF_THUMB = [
  'One unusual thing per scene. The second one replaces the game rather than heightening it.',
  'Platform before tilt. If the routine is not built, there is nothing to break.',
  'Status is behaviour, not rank: eye contact, stillness, who fills the silence.',
  'Restraint is precision, not withholding. Keep the stakes, lose the noise.',
  'Reaction first, reason second.',
  'A callback is only earned if the material was strong the first time.',
];

function sessionItemsResolved(session) {
  return (session.items || []).map((item) => {
    if (item.kind === 'break') {
      return { ...item, lib: null, name: item.label || 'Break' };
    }
    const base = fullById(item.libraryId);
    // A session may adapt a block for its own run (a different prompt, its own
    // debrief questions) without forking the library entry.
    const lib = base && item.overrides ? { ...base, ...item.overrides } : base;
    return { ...item, lib, name: lib ? lib.name : item.label || 'Removed library item' };
  });
}

export function sessionTotalMinutes(session) {
  return (session.items || []).reduce((sum, i) => sum + (Number(i.durationMinutes) || 0), 0);
}

function metaFor(session, strings) {
  return [
    { label: strings.meta.sessionLength, value: formatMinutes(sessionTotalMinutes(session), strings) },
    { label: strings.meta.date, value: prettyDate(session.runDate || session.createdAt) },
    { label: strings.meta.groupSize, value: session.groupSize || 'any' },
    { label: strings.meta.level, value: session.level || 'Mixed' },
  ];
}

/* ------------------------------------------------------------------ */
/* Trainer Guide                                                       */
/* ------------------------------------------------------------------ */

export function buildTrainerGuide(session, lang = 'en') {
  const strings = getStrings(lang);
  const items = sessionItemsResolved(session);
  const total = sessionTotalMinutes(session);

  const blocks = [
    B.section(strings.agenda, formatMinutes(total, strings)),
    B.agenda(
      items.map((item) => ({
        label: item.name,
        duration: `${item.durationMinutes} ${strings.min}`,
        note: item.lib ? item.lib.description : item.note || '',
      })),
    ),
  ];

  if (session.skillFocus) {
    blocks.push(B.callout(`${strings.skillFocus}: ${session.skillFocus}`));
  } else if (session.topic) {
    blocks.push(
      B.callout(
        `Focus of this session: ${session.topic}. Every block below is chosen against that focus, and the debrief questions point back to it.`,
      ),
    );
  }

  items.forEach((item) => {
    if (!item.lib) {
      blocks.push(B.section(item.name, `${item.durationMinutes} ${strings.min}`));
      blocks.push(B.p(item.note || 'Scheduled break. No content.'));
      return;
    }
    const lib = item.lib;
    blocks.push(B.section(lib.name, `${item.durationMinutes} ${strings.min}`));
    blocks.push(
      B.kv([
        [strings.groupFit, lib.groupSizeFit],
        [strings.source, lib.source],
        ['Tags', lib.categoryTags.join(', ')],
      ]),
    );

    if (lib.type === 'theory') {
      blocks.push(B.callout(lib.description));
    } else {
      blocks.push(B.p(lib.description));
    }

    if (lib.setup) {
      blocks.push(B.sub(strings.setup));
      blocks.push(B.p(lib.setup));
    }
    blocks.push(B.sub(strings.fullText));
    blocks.push(B.p(lib.fullText));

    if (lib.coachingNotes && lib.coachingNotes.length) {
      blocks.push(B.coaching(lib.coachingNotes));
    }
    if (lib.variations && lib.variations.length) {
      blocks.push(B.sub(strings.variations));
      blocks.push(B.bullets(lib.variations));
    }
    if (lib.debriefQuestions && lib.debriefQuestions.length) {
      blocks.push(B.sub(strings.debrief));
      blocks.push(B.bullets(lib.debriefQuestions.map((q) => quote(q))));
    }
  });

  const coach = session.coachNotes || {};
  if (coach.pitfalls && coach.pitfalls.length) {
    blocks.push(B.section(strings.pitfallNotes));
    blocks.push(B.coaching(coach.pitfalls, strings.pitfalls));
  }

  blocks.push(B.section(strings.adjustments));
  blocks.push(B.coaching(
    coach.adjustments && coach.adjustments.length ? coach.adjustments : SESSION_ADJUSTMENTS,
    strings.adjustments.toUpperCase(),
  ));

  if (coach.sources && coach.sources.length) {
    blocks.push(B.section(strings.sourceConnections));
    blocks.push(B.bullets(coach.sources));
  }

  return buildDocument({
    title: session.title || 'Training Session',
    subtitle: session.subtitle
      ? `${strings.trainerGuide} · ${session.subtitle}`
      : session.topic
        ? `${strings.trainerGuide} · ${session.topic}`
        : strings.trainerGuide,
    meta: metaFor(session, strings),
    blocks,
    lang,
    fileBase: `${slugTitle(session.title)}-trainer-guide`,
  });
}

/* ------------------------------------------------------------------ */
/* Player Guide (single A4 page)                                       */
/* ------------------------------------------------------------------ */

export function buildPlayerGuide(session, lang = 'en') {
  const strings = getStrings(lang);
  const items = sessionItemsResolved(session);
  const total = sessionTotalMinutes(session);
  const theory = items.filter((i) => i.lib && i.lib.type === 'theory');
  const hasHarold = items.some(
    (i) => i.lib && i.lib.categoryTags.includes('Harold'),
  );

  const blocks = [
    B.section(strings.agenda, formatMinutes(total, strings)),
    B.agenda(
      items.map((item) => ({
        label: item.name,
        duration: `${item.durationMinutes} ${strings.min}`,
      })),
    ),
  ];

  const player = session.playerNotes || {};

  if (player.definition) {
    blocks.push(B.callout(player.definition));
  }

  // A session that states its own definition does not also need the generic
  // theory summary, and the Player Guide has to stay on one page.
  if (theory.length && !player.definition) {
    blocks.push(B.section(strings.theorySummary));
    blocks.push(B.bullets(theory.map((t) => `${t.lib.name}: ${trim(t.lib.description, 130)}`)));
  }

  if (player.distinctions && player.distinctions.length) {
    blocks.push(B.section(strings.keyDistinctions));
    blocks.push(B.bullets(player.distinctions));
  }

  if (player.diagram === 'funnel') {
    blocks.push(B.section(strings.funnelDiagram));
    blocks.push(B.diagram('funnel'));
  } else if (hasHarold) {
    blocks.push(B.section(strings.haroldDiagram));
    blocks.push(B.diagram('harold'));
  }

  blocks.push(B.section(
    player.distinctions && player.distinctions.length ? strings.rulesOfThumb : strings.keyDistinctions,
  ));
  blocks.push(B.bullets(
    player.rulesOfThumb && player.rulesOfThumb.length ? player.rulesOfThumb : PLAYER_RULES_OF_THUMB,
  ));

  return buildDocument({
    title: session.title || 'Training Session',
    subtitle: session.subtitle
      ? `${strings.playerGuide} · ${session.subtitle}`
      : session.topic
        ? `${strings.playerGuide} · ${session.topic}`
        : strings.playerGuide,
    meta: metaFor(session, strings),
    blocks,
    lang,
    compact: true,
    fileBase: `${slugTitle(session.title)}-player-guide`,
  });
}

/* ------------------------------------------------------------------ */
/* Format Forge worksheet                                              */
/* ------------------------------------------------------------------ */

export function buildForgeWorksheet(run, lang = 'en') {
  const strings = getStrings(lang);
  const state = run.stepState || {};
  const items = forgeData.items;
  const total = items.reduce(
    (sum, item) => sum + (state[item.id]?.durationMinutes ?? item.durationMinutes),
    0,
  );

  const blocks = [
    B.section(strings.agenda, formatMinutes(total, strings)),
    B.agenda(
      items.map((item) => ({
        label: item.stepNumber ? `Step ${item.stepNumber}: ${item.title}` : item.title,
        duration: `${state[item.id]?.durationMinutes ?? item.durationMinutes} ${strings.min}`,
        note: item.output || '',
      })),
    ),
    B.callout(
      'The Four Corners Test: a premise needs a cause, a solution, a conflict and actors. A premise that only describes a state collapses into cliche. The anti-brief stays on the wall all day as a drift check.',
    ),
  ];

  items.forEach((item) => {
    const st = state[item.id] || {};
    const dur = st.durationMinutes ?? item.durationMinutes;
    const heading = item.stepNumber ? `Step ${item.stepNumber}: ${item.title}` : item.title;
    blocks.push(B.section(heading, `${dur} ${strings.min}`));
    if (item.output) blocks.push(B.kv([[strings.meta.output, item.output]]));
    if (item.setup) blocks.push(B.p(item.setup));
    if (item.coachingFocus && item.coachingFocus.length) {
      blocks.push(B.coaching(item.coachingFocus));
    }
    if (item.pitfalls && item.pitfalls.length) {
      blocks.push(B.coaching(item.pitfalls, strings.pitfalls));
    }
    if (item.workedExample) {
      blocks.push(B.sub(strings.workedExample));
      blocks.push(B.callout(item.workedExample));
    }
    blocks.push(B.sub(strings.liveNotes));
    blocks.push(B.p(st.notes ? st.notes : strings.noNotes));
  });

  const card = run.formatCard || {};
  const cardRows = forgeData.formatCardFields
    .map((field) => [field.label, card[field.key] || ''])
    .filter((row) => row[1]);
  if (cardRows.length) {
    blocks.push(B.section(strings.formatCard));
    blocks.push(B.kv(cardRows));
  }

  blocks.push(B.section(strings.adjustments));
  forgeData.adjustments.forEach((adj) => {
    blocks.push(B.sub(adj.title));
    blocks.push(B.bullets(adj.points));
  });

  return buildDocument({
    title: run.title || forgeData.meta.title,
    subtitle: `${strings.forgeWorksheet} · ${forgeData.meta.subtitle}`,
    meta: [
      { label: strings.meta.sessionLength, value: formatMinutes(total, strings) },
      { label: strings.meta.date, value: prettyDate(run.runDate || run.createdAt) },
      { label: strings.meta.groupSize, value: run.groupSize || forgeData.meta.groupSize },
      { label: strings.meta.level, value: run.level || forgeData.meta.level },
    ],
    blocks,
    lang,
    fileBase: `${slugTitle(run.title || forgeData.meta.title)}-forge-worksheet`,
  });
}

function trim(text, max) {
  const clean = String(text || '').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.]+$/, '')}\u2026`;
}

function slugTitle(title) {
  return String(title || 'session')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 50) || 'session';
}
