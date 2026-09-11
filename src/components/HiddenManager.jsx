import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { LIBRARY, TYPE_LABELS } from '../data/library.js';
import { FORMATS } from '../data/formats.js';
import { Empty, Sheet, Tag } from './ui.jsx';
import { IconClose, IconSearch } from './Icons.jsx';

const KINDS = {
  library: {
    title: 'Games & exercises',
    subtitle: 'Switch off anything you never use. Hidden blocks disappear from the Session Builder.',
    source: () => LIBRARY,
    meta: (item) => `${TYPE_LABELS[item.type].replace(/s$/, '')} · ${item.durationMinutes} min`,
    tags: (item) => item.categoryTags.slice(0, 3),
  },
  formats: {
    title: 'Formats',
    subtitle: 'Switch off formats you do not want in the Formats tab.',
    source: () => FORMATS,
    meta: (item) => `${item.origin} · ${item.typicalDuration}`,
    tags: (item) => (item.categoryTags || []).slice(0, 3),
  },
};

/**
 * Hiding never deletes: an archived session that uses a hidden block still
 * resolves it, and switching it back on restores it everywhere.
 */
export default function HiddenManager({ kind, onClose }) {
  const { state, patch, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [onlyHidden, setOnlyHidden] = useState(false);
  const config = KINDS[kind];
  const hidden = state.hidden[kind] || [];
  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return config.source()
      .filter((item) => (onlyHidden ? hiddenSet.has(item.id) : true))
      .filter((item) => {
        if (!q) return true;
        const hay = [item.name, item.description || item.structureSummary, ...(item.categoryTags || [])]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 400);
  }, [config, query, onlyHidden, hiddenSet]);

  const toggle = (id) => {
    patch((prev) => {
      const list = prev.hidden[kind] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { hidden: { ...prev.hidden, [kind]: next } };
    });
  };

  const restoreAll = () => {
    patch((prev) => ({ hidden: { ...prev.hidden, [kind]: [] } }));
    showToast('All restored');
  };

  return (
    <Sheet
      title={config.title}
      subtitle={`${hidden.length} hidden of ${config.source().length}`}
      onClose={onClose}
    >
      <p className="small muted" style={{ margin: '0 0 14px' }}>{config.subtitle}</p>

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <span style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-faint)' }}>
          <IconSearch width={19} height={19} />
        </span>
        <input
          className="input"
          style={{ paddingLeft: 39, paddingRight: query ? 40 : 13 }}
          placeholder="Search by name or tag"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          aria-label="Search"
        />
        {query ? (
          <button
            type="button"
            className="btn btn--ghost btn--icon"
            style={{ position: 'absolute', right: 2, top: 3, minHeight: 38, width: 38, border: 0 }}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <IconClose />
          </button>
        ) : null}
      </div>

      <div className="row row--tight" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`chip${onlyHidden ? ' is-active' : ''}`}
          onClick={() => setOnlyHidden((v) => !v)}
        >
          Hidden only
        </button>
        <div className="spacer" />
        <button type="button" className="btn btn--sm btn--ghost" disabled={!hidden.length} onClick={restoreAll}>
          Restore all
        </button>
      </div>

      {items.length === 0 ? (
        <Empty>{onlyHidden ? 'Nothing hidden.' : 'No match.'}</Empty>
      ) : (
        <div className="stack-sm">
          {items.map((item) => {
            const off = hiddenSet.has(item.id);
            return (
              <label
                key={item.id}
                className="card card--flat"
                style={{ padding: 12, display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={!off}
                  onChange={() => toggle(item.id)}
                  style={{ width: 22, height: 22, marginTop: 2, flex: 'none', accentColor: 'var(--accent)' }}
                  aria-label={`Show ${item.name}`}
                />
                <span style={{ minWidth: 0, flex: 1, opacity: off ? 0.5 : 1 }}>
                  <span className="bold">{item.name}</span>
                  <span className="tiny faint" style={{ display: 'block' }}>{config.meta(item)}</span>
                  <span className="row row--tight" style={{ marginTop: 6 }}>
                    {config.tags(item).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                    {off ? <Tag tone="bad">Hidden</Tag> : null}
                  </span>
                </span>
              </label>
            );
          })}
          {config.source().length > items.length + 0 && items.length === 400 ? (
            <div className="tiny faint center">Showing the first 400. Narrow the search to see more.</div>
          ) : null}
        </div>
      )}
    </Sheet>
  );
}
