/**
 * All user-visible strings used inside generated documents.
 *
 * The template components never hardcode English. Adding German later means
 * adding a `de` block here and passing lang through buildDocument().
 */

export const DOC_STRINGS = {
  en: {
    author: 'Sandro Raffaele',
    coachingFocus: 'COACHING FOCUS',
    pitfalls: 'PITFALLS',
    meta: {
      sessionLength: 'Session length',
      date: 'Date',
      groupSize: 'Group size',
      level: 'Level',
      focus: 'Focus',
      output: 'Output',
    },
    trainerGuide: 'Trainer Guide',
    playerGuide: 'Player Guide',
    forgeWorksheet: 'Format Forge Worksheet',
    agenda: 'Agenda',
    setup: 'Setup',
    fullText: 'Instructions',
    variations: 'Variations',
    debrief: 'Debrief questions',
    theorySummary: 'Theory in short',
    keyDistinctions: 'Key distinctions',
    source: 'Source',
    duration: 'Duration',
    groupFit: 'Group fit',
    notes: 'Notes',
    liveNotes: 'Live notes',
    workedExample: 'Worked example',
    adjustments: 'On-the-fly adjustments',
    formatCard: 'Format card',
    haroldDiagram: 'Harold structure',
    min: 'min',
    untitled: 'Untitled',
    noNotes: 'No notes recorded.',
  },
};

export function getStrings(lang = 'en') {
  return DOC_STRINGS[lang] || DOC_STRINGS.en;
}
