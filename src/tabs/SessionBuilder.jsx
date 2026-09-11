import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LIBRARY, TYPE_LABELS, TYPE_ORDER, FREEZE_TAG_ID, byId, ensureLibraryDetails,
} from '../data/library.js';
import { useApp } from '../context/AppContext.jsx';
import {
  DURATION_PRESETS, applyFreezeTag, emptySession, findCandidates, groupByType,
  makeBreak, makeLibraryItem, moveItem, totalMinutes,
} from '../lib/session.js';
import { buildPlayerGuide, buildTrainerGuide } from '../export/builders.js';
import { exportDocument, formatMinutes, getStrings } from '../export/index.js';
import LibraryItem from '../components/LibraryItem.jsx';
import { Card, ConfirmButton, Empty, Meter, Sheet, Switch, Tag, TextInput } from '../components/ui.jsx';
import {
  IconArrowDown, IconArrowUp, IconClock, IconDownload, IconMinus, IconPlus, IconSearch,
  IconStar, IconStarFilled, IconTrash,
} from '../components/Icons.jsx';

const strings = getStrings('en');

export default function SessionBuilder({ navigate, setSubtitle }) {
  const { state, patch, showToast } = useApp();
  const session = state.builder || null;
  const [browseAll, setBrowseAll] = useState(false);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [topicDraft, setTopicDraft] = useState(session ? session.topic : '');
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [busy, setBusy] = useState('');

  const setSession = useCallback(
    (updater) => patch((prev) => ({
      builder: typeof updater === 'function' ? updater(prev.builder) : updater,
    })),
    [patch],
  );

  // Start a draft on first visit so the screen is never a dead end.
  useEffect(() => {
    if (!state.builder) {
      const fresh = emptySession();
      fresh.items = applyFreezeTag([], true);
      setSession(fresh);
    }
  }, [state.builder, setSession]);

  const total = session ? totalMinutes(session) : 0;
  const target = session ? session.targetMinutes : 0;

  useEffect(() => {
    if (!session) return undefined;
    setSubtitle(`${total} / ${target} min`);
    return () => setSubtitle('');
  }, [setSubtitle, total, target, session]);

  const hidden = useMemo(() => new Set(state.hidden.library), [state.hidden.library]);
  const favourites = useMemo(() => new Set(state.favourites.library), [state.favourites.library]);

  const candidates = useMemo(
    () => (session && session.topic ? findCandidates(session.topic) : []),
    [session],
  );
  const visibleLibrary = useMemo(() => {
    const pool = browseAll || candidates.length === 0
      ? LIBRARY.filter((i) => i.id !== FREEZE_TAG_ID)
      : candidates;
    // Blocks switched off in settings stay out of the picker, but items
    // already in a session (or an archived one) still resolve by id.
    return groupByType(pool.filter(
      (i) => !hidden.has(i.id) && (!favouritesOnly || favourites.has(i.id)),
    ));
  }, [browseAll, candidates, hidden, favouritesOnly, favourites]);

  if (!session) return <Empty>Loading&hellip;</Empty>;

  const selectedIds = new Set(
    session.items.filter((i) => i.kind === 'library').map((i) => i.libraryId),
  );
  const visibleCount = TYPE_ORDER.reduce((sum, type) => sum + visibleLibrary[type].length, 0);

  const toggleLibraryItem = (libraryItem) => {
    setSession((prev) => {
      const exists = prev.items.some((i) => i.kind === 'library' && i.libraryId === libraryItem.id);
      const items = exists
        ? prev.items.filter((i) => !(i.kind === 'library' && i.libraryId === libraryItem.id))
        : [...prev.items, makeLibraryItem(libraryItem)];
      return { ...prev, items: applyFreezeTag(items, prev.freezeTag) };
    });
  };

  const setDuration = (itemUid, minutes) => {
    setSession((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.uid === itemUid ? { ...i, durationMinutes: Math.max(1, Math.min(600, minutes)) } : i),
    }));
  };

  const removeItem = (itemUid) => {
    setSession((prev) => {
      const removed = prev.items.find((i) => i.uid === itemUid);
      const isFreeze = removed && removed.kind === 'library' && removed.libraryId === FREEZE_TAG_ID;
      const items = prev.items.filter((i) => i.uid !== itemUid);
      return { ...prev, freezeTag: isFreeze ? false : prev.freezeTag, items };
    });
  };

  const runningTone = (() => {
    if (!target) return 'accent';
    const diff = total - target;
    if (diff > 0) return 'bad';
    if (diff < -Math.max(10, target * 0.1)) return 'warn';
    return 'good';
  })();

  const runningMessage = (() => {
    const diff = total - target;
    if (diff === 0) return 'Exactly on target.';
    if (diff > 0) return `${diff} min over budget.`;
    return `${-diff} min still to fill.`;
  })();

  const doExport = async (kind, format) => {
    setBusy(`${kind}-${format}`);
    try {
      await ensureLibraryDetails();
      const doc = kind === 'trainer'
        ? buildTrainerGuide({ ...session, title: session.title || 'Training Session' })
        : buildPlayerGuide({ ...session, title: session.title || 'Training Session' });
      await exportDocument(doc, format);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const saveToArchive = () => {
    const title = saveTitle.trim();
    if (!title) return;
    const entry = {
      ...session,
      id: session.id,
      title,
      savedAt: new Date().toISOString(),
      createdAt: session.createdAt || new Date().toISOString(),
      debriefs: session.debriefs || [],
    };
    patch((prev) => {
      const existing = prev.archive.findIndex((a) => a.id === entry.id);
      const archive = existing >= 0
        ? prev.archive.map((a, i) => (i === existing ? entry : a))
        : [entry, ...prev.archive];
      return { archive, builder: { ...prev.builder, title } };
    });
    setSaveOpen(false);
    setSaveTitle('');
    showToast('Saved to archive');
  };

  return (
    <div className="stack">
      {/* ---------------- duration ---------------- */}
      <Card>
        <div className="label" style={{ marginBottom: 8 }}>Session length</div>
        <div className="chip-row">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`chip${target === preset ? ' is-active' : ''}`}
              onClick={() => setSession((prev) => ({ ...prev, targetMinutes: preset }))}
            >
              {preset} min
            </button>
          ))}
          <input
            className="input"
            style={{ width: 110, minHeight: 38, padding: '6px 10px' }}
            type="number"
            min="10"
            max="600"
            step="5"
            value={target}
            onChange={(e) => setSession((prev) => ({ ...prev, targetMinutes: Number(e.target.value) || 0 }))}
            aria-label="Custom session length in minutes"
          />
        </div>
        <div className="divider" />
        <Switch
          checked={session.freezeTag}
          onChange={(on) => setSession((prev) => ({
            ...prev, freezeTag: on, items: applyFreezeTag(prev.items, on),
          }))}
          label="Close with Freeze Tag"
          hint="Reserves the closer at the end of the running order."
        />
      </Card>

      {/* ---------------- topic ---------------- */}
      <Card>
        <div className="label" style={{ marginBottom: 8 }}>What do you want to focus on?</div>
        <div className="row row--tight" style={{ flexWrap: 'nowrap' }}>
          <input
            className="input"
            placeholder="status, Harold structure, listening, It's Tuesday"
            value={topicDraft}
            onChange={(e) => setTopicDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSession((prev) => ({ ...prev, topic: topicDraft.trim() }));
                setBrowseAll(false);
              }
            }}
            aria-label="Session focus"
          />
          <button
            type="button"
            className="btn btn--primary btn--icon"
            aria-label="Find blocks"
            onClick={() => {
              setSession((prev) => ({ ...prev, topic: topicDraft.trim() }));
              setBrowseAll(false);
            }}
          >
            <IconSearch />
          </button>
        </div>
        {session.topic ? (
          <div className="row row--tight" style={{ marginTop: 10 }}>
            <Tag tone="accent">{session.topic}</Tag>
            <span className="tiny faint">
              {visibleCount} matching block{visibleCount === 1 ? '' : 's'}
            </span>
          </div>
        ) : null}
        {session.topic && candidates.length === 0 ? (
          <div className="banner banner--warn" style={{ marginTop: 10 }}>
            Nothing matched that focus. The full library is shown below instead.
          </div>
        ) : null}
        {candidates.length > 0 ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--block"
            style={{ marginTop: 12 }}
            onClick={() => setBrowseAll((v) => !v)}
          >
            {browseAll ? 'Show matches only' : 'Browse the full library instead'}
          </button>
        ) : null}
        <div className="row row--tight" style={{ marginTop: 12 }}>
          <button
            type="button"
            className={`chip${favouritesOnly ? ' is-active' : ''}`}
            onClick={() => setFavouritesOnly((v) => !v)}
            aria-pressed={favouritesOnly}
          >
            {favouritesOnly ? <IconStarFilled width={15} height={15} /> : <IconStar width={15} height={15} />}
            Favourites only
          </button>
          <span className="tiny faint">{favourites.size} starred</span>
        </div>
      </Card>

      {/* ---------------- candidates ---------------- */}
      {favouritesOnly && visibleCount === 0 ? (
        <Empty>
          Nothing starred yet. Tap the star on a block to keep it here.
        </Empty>
      ) : null}

      {TYPE_ORDER.map((type) => {
        const items = visibleLibrary[type];
        if (!items.length) return null;
        return (
          <div key={type}>
            <div className="section-title">
              {TYPE_LABELS[type]} <span className="faint">({items.length})</span>
            </div>
            <div className="stack-sm">
              {items.map((item) => (
                <LibraryItem
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggle={() => toggleLibraryItem(item)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ---------------- running order ---------------- */}
      <div className="section-title">Running order</div>
      {session.items.length === 0 ? (
        <Empty>Nothing selected yet. Tick blocks above to build the session.</Empty>
      ) : (
        <div className="stack-sm">
          {session.items.map((item, index) => {
            const lib = item.kind === 'library' ? byId(item.libraryId) : null;
            const isFreeze = item.kind === 'library' && item.libraryId === FREEZE_TAG_ID;
            return (
              <Card key={item.uid} className="card--flat" style={{ padding: 13 }}>
                <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bold">
                      {index + 1}. {lib ? lib.name : item.label}
                      {isFreeze ? <span className="tiny faint"> (closer)</span> : null}
                    </div>
                    {lib ? <div className="small muted">{lib.description}</div> : null}
                    {item.kind === 'break' ? (
                      <input
                        className="input"
                        style={{ marginTop: 8, minHeight: 38 }}
                        placeholder="Break note (optional)"
                        value={item.note || ''}
                        onChange={(e) => setSession((prev) => ({
                          ...prev,
                          items: prev.items.map((i) => (i.uid === item.uid ? { ...i, note: e.target.value } : i)),
                        }))}
                      />
                    ) : null}
                  </div>
                  <div className="stack-sm" style={{ gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      style={{ minHeight: 32, width: 32 }}
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => setSession((prev) => ({ ...prev, items: moveItem(prev.items, index, -1) }))}
                    >
                      <IconArrowUp width={15} height={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      style={{ minHeight: 32, width: 32 }}
                      aria-label="Move down"
                      disabled={index === session.items.length - 1}
                      onClick={() => setSession((prev) => ({ ...prev, items: moveItem(prev.items, index, 1) }))}
                    >
                      <IconArrowDown width={15} height={15} />
                    </button>
                  </div>
                </div>
                <div className="row row--tight" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn--sm btn--icon"
                    aria-label="Five minutes less"
                    onClick={() => setDuration(item.uid, item.durationMinutes - 5)}
                  >
                    <IconMinus width={15} height={15} />
                  </button>
                  <input
                    className="input"
                    style={{ width: 74, minHeight: 36, padding: '4px 8px', textAlign: 'center' }}
                    type="number"
                    min="1"
                    max="600"
                    value={item.durationMinutes}
                    onChange={(e) => setDuration(item.uid, Number(e.target.value) || 1)}
                    aria-label="Duration in minutes"
                  />
                  <button
                    type="button"
                    className="btn btn--sm btn--icon"
                    aria-label="Five minutes more"
                    onClick={() => setDuration(item.uid, item.durationMinutes + 5)}
                  >
                    <IconPlus width={15} height={15} />
                  </button>
                  <span className="tiny faint">min</span>
                  <div className="spacer" />
                  <button
                    type="button"
                    className="btn btn--ghost btn--icon"
                    aria-label="Remove from session"
                    onClick={() => removeItem(item.uid)}
                  >
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="btn btn--block"
        onClick={() => setSession((prev) => ({
          ...prev, items: applyFreezeTag([...prev.items, makeBreak()], prev.freezeTag),
        }))}
      >
        <IconClock /> Add a break block
      </button>
      {target >= 240 && !session.items.some((i) => i.kind === 'break') ? (
        <div className="banner banner--warn">
          A session this long needs scheduled breaks. Two 15 minute breaks is the usual shape for a full day.
        </div>
      ) : null}

      {/* ---------------- details + export ---------------- */}
      <div className="section-title">Session details</div>
      <Card>
        <div className="stack-sm">
          <TextInput
            label="Title"
            placeholder="Descriptive title, e.g. Status and the pleaser trap"
            value={session.title}
            onChange={(e) => setSession((prev) => ({ ...prev, title: e.target.value }))}
          />
          <div className="btn-grid">
            <TextInput
              label="Group size"
              placeholder="6-8"
              value={session.groupSize}
              onChange={(e) => setSession((prev) => ({ ...prev, groupSize: e.target.value }))}
            />
            <TextInput
              label="Level"
              placeholder="Intermediate"
              value={session.level}
              onChange={(e) => setSession((prev) => ({ ...prev, level: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      <div className="section-title">Export</div>
      <Card>
        <div className="label" style={{ marginBottom: 8 }}>Trainer Guide</div>
        <div className="btn-grid">
          <button
            type="button"
            className="btn btn--primary"
            aria-label="Export Trainer Guide as PDF"
            disabled={busy === 'trainer-pdf' || !session.items.length}
            onClick={() => doExport('trainer', 'pdf')}
          >
            <IconDownload /> {busy === 'trainer-pdf' ? 'Building…' : 'PDF'}
          </button>
          <button
            type="button"
            className="btn"
            aria-label="Export Trainer Guide as DOCX"
            disabled={busy === 'trainer-docx' || !session.items.length}
            onClick={() => doExport('trainer', 'docx')}
          >
            <IconDownload /> {busy === 'trainer-docx' ? 'Building…' : 'DOCX'}
          </button>
        </div>
        <div className="label" style={{ margin: '16px 0 8px' }}>Player Guide</div>
        <div className="btn-grid">
          <button
            type="button"
            className="btn btn--primary"
            aria-label="Export Player Guide as PDF"
            disabled={busy === 'player-pdf' || !session.items.length}
            onClick={() => doExport('player', 'pdf')}
          >
            <IconDownload /> {busy === 'player-pdf' ? 'Building…' : 'PDF'}
          </button>
          <button
            type="button"
            className="btn"
            aria-label="Export Player Guide as DOCX"
            disabled={busy === 'player-docx' || !session.items.length}
            onClick={() => doExport('player', 'docx')}
          >
            <IconDownload /> {busy === 'player-docx' ? 'Building…' : 'DOCX'}
          </button>
        </div>
      </Card>

      <div className="btn-grid">
        <button
          type="button"
          className="btn btn--gold"
          disabled={!session.items.length}
          onClick={() => { setSaveTitle(session.title); setSaveOpen(true); }}
        >
          Save to Archive
        </button>
        <ConfirmButton
          className="btn btn--danger"
          confirmLabel="Tap again to clear"
          onConfirm={() => {
            const fresh = emptySession();
            fresh.items = applyFreezeTag([], true);
            setSession(fresh);
            setTopicDraft('');
            showToast('Started a new session');
          }}
        >
          Start over
        </ConfirmButton>
      </div>

      {/* ---------------- sticky budget ---------------- */}
      <div className="dock">
        <div className="row row--tight" style={{ marginBottom: 8 }}>
          <span className="bold">{formatMinutes(total, strings)}</span>
          <span className="small muted">of {formatMinutes(target, strings)}</span>
          <div className="spacer" />
          <Tag tone={runningTone}>{runningMessage}</Tag>
        </div>
        <Meter value={total} max={target} tone={runningTone} />
      </div>

      {saveOpen ? (
        <Sheet
          title="Save to archive"
          subtitle="Give it a title you will recognise later. No numbering."
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
            placeholder="e.g. Status and the pleaser trap"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            autoFocus
          />
          <div className="small muted" style={{ marginTop: 12 }}>
            Saving stores the full session: every selection, the durations, the running order and the
            Freeze Tag choice. Re-open it from the Archive tab to re-export or debrief it.
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
