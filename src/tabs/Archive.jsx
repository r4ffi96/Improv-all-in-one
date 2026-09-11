import { useEffect, useMemo, useState } from 'react';
import { byId, ensureLibraryDetails } from '../data/library.js';
import { useApp } from '../context/AppContext.jsx';
import { summarise, sessionTags, totalMinutes } from '../lib/session.js';
import { FORGE, formatFromCard, forgeSummary, forgeTotalMinutes, stepDuration } from '../lib/forge.js';
import { uid } from '../lib/storage.js';
import { buildForgeWorksheet, buildPlayerGuide, buildTrainerGuide } from '../export/builders.js';
import { exportDocument, prettyDate, todayISO } from '../export/index.js';
import { Card, ConfirmButton, Disclosure, Empty, Sheet, Tag, TextArea, TextInput } from '../components/ui.jsx';
import {
  IconBack, IconChevron, IconDownload, IconEdit, IconLock, IconNotes, IconSend,
} from '../components/Icons.jsx';

const SORTS = [
  { id: 'date', label: 'Newest' },
  { id: 'duration', label: 'Longest' },
  { id: 'title', label: 'A-Z' },
];

export default function Archive({ route, navigate, setSubtitle }) {
  const { state, patch, showToast, requireUnlock, unlocked } = useApp();
  const [sort, setSort] = useState('date');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [debriefFor, setDebriefFor] = useState(null);
  const [busy, setBusy] = useState('');

  const openId = route.params[0] || null;
  const current = openId ? state.archive.find((a) => a.id === openId) : null;

  const durationOf = (entry) =>
    entry.type === 'format-forge' ? forgeTotalMinutes(entry) : totalMinutes(entry);

  const allTags = useMemo(() => {
    const tags = new Set();
    state.archive.forEach((entry) => {
      if (entry.type !== 'format-forge') sessionTags(entry).forEach((t) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [state.archive]);

  const visible = useMemo(() => {
    let list = [...state.archive];
    if (typeFilter !== 'all') list = list.filter((e) => (e.type || 'session') === typeFilter);
    if (tagFilter !== 'all') {
      list = list.filter((e) => e.type !== 'format-forge' && sessionTags(e).includes(tagFilter));
    }
    list.sort((a, b) => {
      if (sort === 'duration') return durationOf(b) - durationOf(a);
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
      return new Date(b.savedAt || b.createdAt) - new Date(a.savedAt || a.createdAt);
    });
    return list;
  }, [state.archive, sort, typeFilter, tagFilter]);

  useEffect(() => {
    setSubtitle(current ? prettyDate(current.savedAt || current.createdAt) : `${state.archive.length} saved`);
    return () => setSubtitle('');
  }, [setSubtitle, current, state.archive.length]);

  const updateEntry = (id, updater) => {
    patch((prev) => ({
      archive: prev.archive.map((entry) => (entry.id === id ? updater(entry) : entry)),
    }));
  };

  const doExport = async (entry, kind, format) => {
    setBusy(`${entry.id}-${kind}-${format}`);
    try {
      await ensureLibraryDetails();
      let doc;
      if (kind === 'forge') doc = buildForgeWorksheet(entry);
      else if (kind === 'trainer') doc = buildTrainerGuide(entry);
      else doc = buildPlayerGuide(entry);
      await exportDocument(doc, format);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const duplicateToBuilder = (entry) => {
    const copy = {
      ...entry,
      id: uid('session'),
      title: `${entry.title} (copy)`,
      createdAt: new Date().toISOString(),
      savedAt: undefined,
      debriefs: [],
      items: entry.items.map((item) => ({ ...item, uid: uid('item') })),
    };
    patch({ builder: copy });
    showToast('Copied into the Session Builder');
    navigate('builder');
  };

  const sendToLibrary = (entry) => {
    const format = formatFromCard(entry);
    patch((prev) => ({ formats: [format, ...prev.formats] }));
    showToast('Added to the Format Library');
    navigate('formats', format.id);
  };

  /* ------------------------------ detail ------------------------------ */
  if (current) {
    const isForge = current.type === 'format-forge';
    return (
      <div className="stack">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('archive')}>
          <IconBack /> All archived
        </button>

        <Card>
          <div className="card__title" style={{ fontSize: 20 }}>{current.title}</div>
          <div className="row row--tight" style={{ marginTop: 10 }}>
            <Tag tone={isForge ? 'gold' : 'accent'}>{isForge ? 'Forge day' : 'Session'}</Tag>
            <Tag>{durationOf(current)} min</Tag>
            <Tag>{prettyDate(current.savedAt || current.createdAt)}</Tag>
            {current.debriefs && current.debriefs.length ? (
              <Tag tone="good">Debriefed &times;{current.debriefs.length}</Tag>
            ) : null}
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>
            {isForge ? forgeSummary(current) : summarise(current)}
          </div>
        </Card>

        <div className="section-title">{isForge ? 'Day structure' : 'Running order'}</div>
        <Card>
          <div className="stack-sm">
            {isForge
              ? FORGE.items.map((item) => {
                const st = current.stepState?.[item.id] || {};
                return (
                  <div key={item.id}>
                    <div className="row row--tight">
                      <span className="bold" style={{ flex: 1 }}>
                        {item.stepNumber ? `Step ${item.stepNumber}: ` : ''}{item.title}
                      </span>
                      <Tag tone="gold">{stepDuration(current, item)} min</Tag>
                    </div>
                    {st.notes ? (
                      <div className="small muted pre-wrap" style={{ marginTop: 4 }}>{st.notes}</div>
                    ) : null}
                  </div>
                );
              })
              : current.items.map((item, i) => {
                const lib = item.kind === 'library' ? byId(item.libraryId) : null;
                return (
                  <div className="row row--tight" key={item.uid || i}>
                    <span style={{ flex: 1 }}>
                      <span className="bold">{i + 1}. {lib ? lib.name : item.label}</span>
                      {lib ? <span className="small muted" style={{ display: 'block' }}>{lib.description}</span> : null}
                    </span>
                    <Tag tone="gold">{item.durationMinutes} min</Tag>
                  </div>
                );
              })}
          </div>
        </Card>

        {isForge && current.formatCard && Object.values(current.formatCard).some(Boolean) ? (
          <>
            <div className="section-title">Format card</div>
            <Card>
              <div className="stack-sm">
                {FORGE.formatCardFields.map((field) => (
                  current.formatCard[field.key] ? (
                    <div key={field.key}>
                      <div className="label">{field.label}</div>
                      <div className="small pre-wrap">{current.formatCard[field.key]}</div>
                    </div>
                  ) : null
                ))}
              </div>
            </Card>
          </>
        ) : null}

        <div className="section-title">Actions</div>
        <Card>
          {isForge ? (
            <>
              <div className="label" style={{ marginBottom: 8 }}>Worksheet</div>
              <div className="btn-grid">
                <button type="button" className="btn btn--primary" aria-label="Export worksheet as PDF" onClick={() => doExport(current, 'forge', 'pdf')}>
                  <IconDownload /> {busy === `${current.id}-forge-pdf` ? 'Building…' : 'PDF'}
                </button>
                <button type="button" className="btn" aria-label="Export worksheet as DOCX" onClick={() => doExport(current, 'forge', 'docx')}>
                  <IconDownload /> {busy === `${current.id}-forge-docx` ? 'Building…' : 'DOCX'}
                </button>
              </div>
              <button
                type="button"
                className="btn btn--gold btn--block"
                style={{ marginTop: 12 }}
                onClick={() => sendToLibrary(current)}
              >
                <IconSend /> Send to Format Library
              </button>
            </>
          ) : (
            <>
              <div className="label" style={{ marginBottom: 8 }}>Trainer Guide</div>
              <div className="btn-grid">
                <button type="button" className="btn btn--primary" aria-label="Re-export Trainer Guide as PDF" onClick={() => doExport(current, 'trainer', 'pdf')}>
                  <IconDownload /> {busy === `${current.id}-trainer-pdf` ? 'Building…' : 'PDF'}
                </button>
                <button type="button" className="btn" aria-label="Re-export Trainer Guide as DOCX" onClick={() => doExport(current, 'trainer', 'docx')}>
                  <IconDownload /> {busy === `${current.id}-trainer-docx` ? 'Building…' : 'DOCX'}
                </button>
              </div>
              <div className="label" style={{ margin: '16px 0 8px' }}>Player Guide</div>
              <div className="btn-grid">
                <button type="button" className="btn btn--primary" aria-label="Re-export Player Guide as PDF" onClick={() => doExport(current, 'player', 'pdf')}>
                  <IconDownload /> {busy === `${current.id}-player-pdf` ? 'Building…' : 'PDF'}
                </button>
                <button type="button" className="btn" aria-label="Re-export Player Guide as DOCX" onClick={() => doExport(current, 'player', 'docx')}>
                  <IconDownload /> {busy === `${current.id}-player-docx` ? 'Building…' : 'DOCX'}
                </button>
              </div>
              <button
                type="button"
                className="btn btn--block"
                style={{ marginTop: 12 }}
                onClick={() => duplicateToBuilder(current)}
              >
                <IconEdit /> Duplicate &amp; edit
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn--gold btn--block"
            style={{ marginTop: 8 }}
            onClick={() => requireUnlock(() => setDebriefFor(current.id))}
          >
            {unlocked ? <IconNotes /> : <IconLock />} Debrief
          </button>
        </Card>

        {current.debriefs && current.debriefs.length ? (
          <>
            <div className="section-title">Debriefs</div>
            <div className="stack-sm">
              {current.debriefs.map((debrief, index) => (
                <Disclosure
                  key={debrief.id || index}
                  title={`Run on ${prettyDate(debrief.runDate)}`}
                  subtitle={debrief.worked ? debrief.worked.slice(0, 70) : 'No notes'}
                >
                  <DebriefBody debrief={debrief} />
                  <ConfirmButton
                    className="btn btn--danger btn--sm"
                    confirmLabel="Tap again to delete"
                    onConfirm={() => requireUnlock(() => updateEntry(current.id, (entry) => ({
                      ...entry, debriefs: entry.debriefs.filter((_, i) => i !== index),
                    })))}
                  >
                    Delete debrief
                  </ConfirmButton>
                </Disclosure>
              ))}
            </div>
          </>
        ) : null}

        <ConfirmButton
          className="btn btn--danger btn--block"
          confirmLabel="Tap again to delete this entry"
          onConfirm={() => requireUnlock(() => {
            patch((prev) => ({ archive: prev.archive.filter((e) => e.id !== current.id) }));
            showToast('Deleted from archive');
            navigate('archive');
          })}
        >
          Delete from archive
        </ConfirmButton>

        {debriefFor ? (
          <DebriefSheet
            entry={current}
            onClose={() => setDebriefFor(null)}
            onSave={(debrief) => {
              updateEntry(current.id, (entry) => ({
                ...entry, debriefs: [...(entry.debriefs || []), debrief],
              }));
              setDebriefFor(null);
              showToast('Debrief saved');
            }}
          />
        ) : null}
      </div>
    );
  }

  /* ------------------------------- list ------------------------------- */
  return (
    <div className="stack">
      <div className="row row--tight">
        {SORTS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`chip${sort === option.id ? ' is-active' : ''}`}
            onClick={() => setSort(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="row row--tight">
        {[
          { id: 'all', label: 'All' },
          { id: 'session', label: 'Sessions' },
          { id: 'format-forge', label: 'Forge days' },
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            className={`chip${typeFilter === option.id ? ' is-active' : ''}`}
            onClick={() => { setTypeFilter(option.id); if (option.id === 'format-forge') setTagFilter('all'); }}
          >
            {option.label}
          </button>
        ))}
      </div>
      {allTags.length ? (
        <select
          className="select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          aria-label="Filter by topic tag"
        >
          <option value="all">All topics</option>
          {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      ) : null}

      {visible.length === 0 ? (
        <Empty>
          Nothing archived yet. Build a session and use &laquo;Save to Archive&raquo;, or save a Format
          Forge day from the Forge tab.
        </Empty>
      ) : (
        visible.map((entry) => {
          const isForge = entry.type === 'format-forge';
          return (
            <button
              key={entry.id}
              type="button"
              className="pick"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('archive', entry.id)}
            >
              <div className="pick__top">
                <div className="pick__body">
                  <div className="pick__name">{entry.title}</div>
                  <div className="card__desc">{isForge ? forgeSummary(entry) : summarise(entry)}</div>
                  <div className="pick__meta">
                    <Tag tone={isForge ? 'gold' : 'accent'}>{isForge ? 'Forge day' : 'Session'}</Tag>
                    <Tag>{durationOf(entry)} min</Tag>
                    <Tag>{prettyDate(entry.savedAt || entry.createdAt)}</Tag>
                    {entry.debriefs && entry.debriefs.length ? <Tag tone="good">Debriefed</Tag> : null}
                  </div>
                </div>
                <span style={{ color: 'var(--text-faint)', alignSelf: 'center' }}>
                  <IconChevron width={18} height={18} />
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}

function DebriefBody({ debrief }) {
  const rows = [
    ['What worked well', debrief.worked],
    ['What did not work / timing reality', debrief.didNotWork],
    ['Casting and group size', debrief.casting],
    ['Corrections to carry forward', debrief.corrections],
  ].filter(([, value]) => value);

  if (!rows.length) return <p className="small muted">No notes recorded.</p>;
  return (
    <div className="stack-sm" style={{ marginBottom: 12 }}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="label">{label}</div>
          <div className="small pre-wrap">{value}</div>
        </div>
      ))}
    </div>
  );
}

function DebriefSheet({ entry, onClose, onSave }) {
  const [form, setForm] = useState({
    runDate: todayISO(),
    worked: '',
    didNotWork: '',
    casting: '',
    corrections: '',
  });
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Sheet
      title="Debrief"
      subtitle={entry.title}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => onSave({ ...form, id: uid('debrief'), savedAt: new Date().toISOString() })}
        >
          Save debrief
        </button>
      }
    >
      <div className="stack-sm">
        <TextInput label="Date of the run" type="date" value={form.runDate} onChange={set('runDate')} />
        <TextArea label="What worked well" value={form.worked} onChange={set('worked')} rows={3} />
        <TextArea
          label="What did not work / timing reality vs plan"
          value={form.didNotWork}
          onChange={set('didNotWork')}
          rows={3}
        />
        <TextArea
          label="Casting and group-size issues"
          value={form.casting}
          onChange={set('casting')}
          rows={3}
        />
        <TextArea
          label="Corrections to carry forward"
          hint="This is the field that feeds back into the exercise library over time."
          value={form.corrections}
          onChange={set('corrections')}
          rows={3}
        />
      </div>
    </Sheet>
  );
}
