import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useInterval } from '../lib/hooks.js';
import {
  FORGE, emptyForgeRun, forgeDoneCount, forgeTotalMinutes, stepDuration,
} from '../lib/forge.js';
import { buildForgeWorksheet } from '../export/builders.js';
import { exportDocument } from '../export/index.js';
import {
  Card, CheckBox, ConfirmButton, Disclosure, Empty, Sheet, Tag, TextArea, TextInput,
} from '../components/ui.jsx';
import {
  IconBack, IconChevron, IconDownload, IconLock, IconPause, IconPlay, IconReset,
} from '../components/Icons.jsx';

const KIND_TONE = { step: 'accent', shell: 'good', break: 'warn' };

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function FormatForge({ navigate, setSubtitle }) {
  const { state, patch, showToast, unlocked, requireUnlock } = useApp();
  const run = state.forge;
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [busy, setBusy] = useState('');
  const [tick, setTick] = useState(0);

  const setRun = useCallback(
    (updater) => patch((prev) => ({ forge: typeof updater === 'function' ? updater(prev.forge) : updater })),
    [patch],
  );

  useEffect(() => {
    if (!state.forge) setRun(emptyForgeRun());
  }, [state.forge, setRun]);

  const current = useMemo(
    () => FORGE.items.find((i) => i.id === (run && run.currentItemId)) || FORGE.items[0],
    [run],
  );

  const stepState = (run && run.stepState[current.id]) || {};
  const isRunning = Boolean(stepState.runningSince);

  useInterval(() => setTick((t) => t + 1), isRunning ? 1000 : null);

  useEffect(() => {
    if (!run) return undefined;
    setSubtitle(`${forgeDoneCount(run)} / ${FORGE.items.length} done · ${forgeTotalMinutes(run)} min planned`);
    return () => setSubtitle('');
  }, [setSubtitle, run]);

  if (!run) return <Empty>Loading&hellip;</Empty>;

  const patchStep = (itemId, partial) => {
    setRun((prev) => ({
      ...prev,
      stepState: {
        ...prev.stepState,
        [itemId]: { ...(prev.stepState[itemId] || {}), ...partial },
      },
    }));
  };

  const elapsed = (stepState.elapsedSeconds || 0)
    + (stepState.runningSince ? (Date.now() - stepState.runningSince) / 1000 : 0);
  void tick; // the interval above drives the re-render while the timer runs

  const toggleTimer = () => {
    if (isRunning) {
      patchStep(current.id, {
        elapsedSeconds: (stepState.elapsedSeconds || 0) + (Date.now() - stepState.runningSince) / 1000,
        runningSince: null,
      });
    } else {
      patchStep(current.id, { runningSince: Date.now() });
    }
  };

  const resetTimer = () => patchStep(current.id, { elapsedSeconds: 0, runningSince: null });

  const goto = (itemId) => setRun((prev) => ({ ...prev, currentItemId: itemId }));
  const index = FORGE.items.findIndex((i) => i.id === current.id);
  const target = stepDuration(run, current);
  const overrun = elapsed > target * 60;

  const doExport = async (format) => {
    setBusy(format);
    try {
      await exportDocument(buildForgeWorksheet({ ...run, title: run.title || FORGE.meta.title }), format);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const saveToArchive = () => {
    const title = saveTitle.trim();
    if (!title) return;
    const entry = { ...run, title, savedAt: new Date().toISOString(), debriefs: run.debriefs || [] };
    patch((prev) => {
      const existing = prev.archive.findIndex((a) => a.id === entry.id);
      const archive = existing >= 0
        ? prev.archive.map((a, i) => (i === existing ? entry : a))
        : [entry, ...prev.archive];
      return { archive, forge: { ...prev.forge, title } };
    });
    setSaveOpen(false);
    setSaveTitle('');
    showToast('Forge day saved to archive');
  };

  return (
    <div className="stack">
      {/* stepper */}
      <div className="stepstrip">
        {FORGE.items.map((item) => {
          const done = run.stepState[item.id]?.done;
          const isCurrent = item.id === current.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`stepstrip__item${isCurrent ? ' is-current' : ''}${done && !isCurrent ? ' is-done' : ''}`}
              onClick={() => goto(item.id)}
            >
              <div className="stepstrip__k">{item.stepNumber ?? '·'}</div>
              <div className="stepstrip__t">{item.shortLabel}</div>
            </button>
          );
        })}
      </div>

      {/* current step */}
      <Card>
        <div className="row row--tight" style={{ marginBottom: 8 }}>
          <Tag tone={KIND_TONE[current.kind]}>
            {current.stepNumber ? `Step ${current.stepNumber}` : current.kind === 'break' ? 'Break' : 'Session shell'}
          </Tag>
          <div className="spacer" />
          <CheckBox
            checked={Boolean(stepState.done)}
            onChange={(v) => patchStep(current.id, { done: v })}
            ariaLabel="Mark step done"
          />
        </div>
        <div className="card__title" style={{ fontSize: 20 }}>{current.title}</div>
        {current.output ? (
          <div className="small muted" style={{ marginTop: 6 }}>
            <span className="label" style={{ marginRight: 6 }}>Output</span>{current.output}
          </div>
        ) : null}

        {/* timer */}
        <div className="divider" />
        <div className="row row--tight">
          <div className={`timer${overrun ? '' : ''}`} style={{ color: overrun ? 'var(--bad)' : 'var(--text)' }}>
            {formatClock(elapsed)}
          </div>
          <span className="small muted">/ {target} min</span>
          <div className="spacer" />
          <button type="button" className="btn btn--sm btn--icon" onClick={toggleTimer} aria-label={isRunning ? 'Pause' : 'Start'}>
            {isRunning ? <IconPause width={16} height={16} /> : <IconPlay width={16} height={16} />}
          </button>
          <button type="button" className="btn btn--sm btn--icon" onClick={resetTimer} aria-label="Reset timer">
            <IconReset width={16} height={16} />
          </button>
        </div>
        <div className="row row--tight" style={{ marginTop: 10 }}>
          <span className="label">Target</span>
          <input
            className="input"
            style={{ width: 84, minHeight: 36, padding: '4px 8px', textAlign: 'center' }}
            type="number"
            min="1"
            max="240"
            value={target}
            onChange={(e) => patchStep(current.id, { durationMinutes: Math.max(1, Number(e.target.value) || 1) })}
            aria-label="Target duration in minutes"
          />
          <span className="tiny faint">min for this run</span>
        </div>
      </Card>

      <div className="section-title">Setup</div>
      <Card>
        <p className="pre-wrap" style={{ margin: 0, fontSize: 15 }}>{current.setup}</p>
      </Card>

      {current.coachingFocus.length ? (
        <>
          <div className="section-title">Coaching focus</div>
          <Card style={{ background: 'var(--gold-soft)', borderColor: 'var(--gold-line)' }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {current.coachingFocus.map((point, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 14.5 }}>{point}</li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}

      {current.pitfalls && current.pitfalls.length ? (
        <>
          <div className="section-title">Pitfalls</div>
          <Card style={{ background: 'var(--bad-soft)', borderColor: 'color-mix(in srgb, var(--bad) 35%, transparent)' }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {current.pitfalls.map((point, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 14.5 }}>{point}</li>
              ))}
            </ul>
          </Card>
        </>
      ) : null}

      {current.workedExample ? (
        <>
          <div className="section-title">Worked example</div>
          <Card className="card--flat">
            <p className="pre-wrap" style={{ margin: 0, fontSize: 14.5, fontStyle: 'italic' }}>
              {current.workedExample}
            </p>
          </Card>
        </>
      ) : null}

      <div className="section-title">Live notes</div>
      <Card>
        <TextArea
          label={null}
          rows={5}
          placeholder="What actually happened, what was said, what to remember."
          value={stepState.notes || ''}
          onChange={(e) => patchStep(current.id, { notes: e.target.value })}
        />
      </Card>

      {current.id === 'ff-shell-formatcard' ? (
        <>
          <div className="section-title">Format card</div>
          <Card>
            <div className="stack-sm">
              {FORGE.formatCardFields.map((field) => (
                <TextArea
                  key={field.key}
                  label={field.label}
                  hint={field.hint}
                  rows={field.key === 'beatTable' ? 4 : 2}
                  value={(run.formatCard || {})[field.key] || ''}
                  onChange={(e) => setRun((prev) => ({
                    ...prev, formatCard: { ...(prev.formatCard || {}), [field.key]: e.target.value },
                  }))}
                />
              ))}
            </div>
          </Card>
        </>
      ) : null}

      <div className="row row--tight">
        <button
          type="button"
          className="btn"
          style={{ flex: 1 }}
          disabled={index === 0}
          onClick={() => goto(FORGE.items[index - 1].id)}
        >
          <IconBack /> Previous
        </button>
        <button
          type="button"
          className="btn btn--primary"
          style={{ flex: 1 }}
          disabled={index === FORGE.items.length - 1}
          onClick={() => { patchStep(current.id, { done: true }); goto(FORGE.items[index + 1].id); }}
        >
          Next <IconChevron />
        </button>
      </div>

      {/* persistent adjustment panel */}
      <div className="section-title">On-the-fly adjustments</div>
      <div className="stack-sm">
        {FORGE.adjustments.map((adj) => (
          <Disclosure key={adj.id} title={adj.title}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {adj.points.map((point, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 14.5, color: 'var(--text-dim)' }}>{point}</li>
              ))}
            </ul>
          </Disclosure>
        ))}
      </div>

      <div className="section-title">Day details</div>
      <Card>
        <div className="btn-grid">
          <TextInput
            label="Group size"
            value={run.groupSize}
            onChange={(e) => setRun((prev) => ({ ...prev, groupSize: e.target.value }))}
          />
          <TextInput
            label="Level"
            value={run.level}
            onChange={(e) => setRun((prev) => ({ ...prev, level: e.target.value }))}
          />
        </div>
      </Card>

      <div className="section-title">Export &amp; save</div>
      <Card>
        <div className="label" style={{ marginBottom: 8 }}>Worksheet</div>
        <div className="btn-grid">
          <button type="button" className="btn btn--primary" aria-label="Export worksheet as PDF" disabled={busy === 'pdf'} onClick={() => doExport('pdf')}>
            <IconDownload /> {busy === 'pdf' ? 'Building…' : 'PDF'}
          </button>
          <button type="button" className="btn" aria-label="Export worksheet as DOCX" disabled={busy === 'docx'} onClick={() => doExport('docx')}>
            <IconDownload /> {busy === 'docx' ? 'Building…' : 'DOCX'}
          </button>
        </div>
        <button
          type="button"
          className="btn btn--gold btn--block"
          style={{ marginTop: 12 }}
          onClick={() => {
            setSaveTitle(run.title || (run.formatCard || {}).workingTitle || '');
            requireUnlock(() => setSaveOpen(true));
          }}
        >
          {unlocked ? null : <IconLock />} Save day to Archive
        </button>
        <ConfirmButton
          className="btn btn--danger btn--block"
          confirmLabel="Tap again to start a fresh day"
          onConfirm={() => { setRun(emptyForgeRun()); showToast('Started a new forge day'); }}
        >
          Start a new forge day
        </ConfirmButton>
      </Card>

      {saveOpen ? (
        <Sheet
          title="Save forge day"
          subtitle="Name the format that emerged, not the method."
          onClose={() => setSaveOpen(false)}
          footer={
            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!saveTitle.trim()}
              onClick={saveToArchive}
            >
              Save
            </button>
          }
        >
          <TextInput
            label="Title"
            placeholder="e.g. Emotion Smugglers - Forge Day"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            autoFocus
          />
          <div className="small muted" style={{ marginTop: 12 }}>
            Saved days are tagged as forge days in the archive, separate from training sessions. Once the
            format has a name, send it over to the Format Library from the archive entry.
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--block"
            style={{ marginTop: 12 }}
            onClick={() => { setSaveOpen(false); navigate('archive'); }}
          >
            Open the archive
          </button>
        </Sheet>
      ) : null}
    </div>
  );
}
