import forgeData from '../data/format-forge-steps.json';
import { uid } from './storage.js';

export const FORGE = forgeData;

export function emptyForgeRun() {
  return {
    id: uid('forge'),
    type: 'format-forge',
    title: '',
    groupSize: forgeData.meta.groupSize,
    level: forgeData.meta.level,
    currentItemId: forgeData.items[0].id,
    stepState: {},        // itemId -> { notes, durationMinutes, done, elapsedSeconds }
    formatCard: {},
    createdAt: new Date().toISOString(),
    debriefs: [],
  };
}

export const stepDuration = (run, item) =>
  run.stepState?.[item.id]?.durationMinutes ?? item.durationMinutes;

export const forgeTotalMinutes = (run) =>
  forgeData.items.reduce((sum, item) => sum + stepDuration(run, item), 0);

export const forgeDoneCount = (run) =>
  forgeData.items.filter((item) => run.stepState?.[item.id]?.done).length;

/** Turn a filled-in format card into a Format Library entry. */
export function formatFromCard(run) {
  const card = run.formatCard || {};
  const stages = String(card.beatTable || '')
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [head, ...rest] = line.split(/\s[-–]\s|:/);
      return {
        name: head.trim(),
        description: rest.join(': ').trim() || 'No further detail recorded on the format card.',
      };
    });

  const notes = [
    card.fixed ? `Fixed every show: ${card.fixed}` : '',
    card.variable ? `Variable per show: ${card.variable}` : '',
    card.openQuestions ? `Open questions: ${card.openQuestions}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    id: uid('fmt'),
    name: card.workingTitle || run.title || 'Untitled format',
    origin: 'Format Forge day',
    structureSummary: card.worldPremise || 'World premise not recorded on the format card.',
    stages: stages.length ? stages : [{ name: 'Beat table', description: 'Not recorded on the format card.' }],
    typicalDuration: '25-35 min',
    notes: notes || 'No further notes recorded.',
    relatedTheory: ['gl-format-vs-game', 'gl-four-corners', 'gl-narrator-frame'],
    fromRunId: run.id,
  };
}

export function forgeSummary(run) {
  const done = forgeDoneCount(run);
  const card = run.formatCard || {};
  const bits = [`${done} of ${forgeData.items.length} steps marked done`];
  if (card.workingTitle) bits.unshift(`Working title: ${card.workingTitle}`);
  return bits.join(', ');
}
