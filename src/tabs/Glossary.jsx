import { useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY, GLOSSARY_GROUPS } from '../data/glossary.js';
import { useApp } from '../context/AppContext.jsx';
import { Empty, Tag } from '../components/ui.jsx';
import { IconChevron, IconCopy, IconSearch, IconClose } from '../components/Icons.jsx';

/** v1 renders English; the de fields exist in the data for a later pass. */
const LANG = 'en';
const pick = (bilingual) => bilingual[LANG] || bilingual.en || '';

export default function Glossary({ route, navigate, setSubtitle }) {
  const { showToast } = useApp();
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('all');
  const [group, setGroup] = useState('all');
  const refs = useRef({});
  const openId = route.params[0] || null;

  const sorted = useMemo(
    () => [...GLOSSARY].sort((a, b) => pick(a.term).localeCompare(pick(b.term))),
    [],
  );

  useEffect(() => {
    setSubtitle(`${GLOSSARY.length} entries`);
    return () => setSubtitle('');
  }, [setSubtitle]);

  // Both languages stay searchable regardless of what is displayed.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((entry) => {
      if (group !== 'all' && entry.group !== group) return false;
      if (letter !== 'all' && !pick(entry.term).toUpperCase().startsWith(letter)) return false;
      if (!q) return true;
      const haystack = [
        entry.term.en, entry.term.de, entry.definition.en, entry.definition.de, entry.sourceReference,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [sorted, query, letter, group]);

  const letters = useMemo(() => {
    const pool = group === 'all' ? sorted : sorted.filter((e) => e.group === group);
    const set = new Set(pool.map((e) => pick(e.term)[0].toUpperCase()));
    return ['all', ...Array.from(set).sort()];
  }, [sorted, group]);

  const groupCounts = useMemo(() => {
    const counts = { all: sorted.length };
    sorted.forEach((e) => { counts[e.group] = (counts[e.group] || 0) + 1; });
    return counts;
  }, [sorted]);

  useEffect(() => {
    if (!openId) return;
    const node = refs.current[openId];
    if (node) node.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [openId]);

  const toggle = (id) => navigate('glossary', ...(openId === id ? [] : [id]));

  const copy = async (entry) => {
    const text = `${pick(entry.term)}: ${pick(entry.definition)}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Definition copied');
    } catch {
      showToast('Clipboard not available in this browser');
    }
  };

  return (
    <div className="stack">
      <div className="row row--tight" style={{ flexWrap: 'nowrap' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-faint)' }}>
            <IconSearch width={19} height={19} />
          </span>
          <input
            className="input"
            style={{ paddingLeft: 39, paddingRight: query ? 40 : 13 }}
            placeholder="Search terms and definitions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label="Search glossary"
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
      </div>

      <div className="chip-row">
        {GLOSSARY_GROUPS.filter((g) => groupCounts[g.id]).map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip${group === g.id ? ' is-active' : ''}`}
            onClick={() => { setGroup(g.id); setLetter('all'); }}
          >
            {g.label} <span className="tiny faint">{groupCounts[g.id]}</span>
          </button>
        ))}
      </div>

      <div className="alpha-bar">
        {letters.map((l) => (
          <button
            key={l}
            type="button"
            className={letter === l ? 'is-active' : ''}
            onClick={() => setLetter(l)}
          >
            {l === 'all' ? 'All' : l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty>No term matches that search.</Empty>
      ) : (
        <div className="stack-sm">
          {filtered.map((entry) => {
            const isOpen = openId === entry.id;
            return (
              <div
                key={entry.id}
                className="disclosure"
                ref={(node) => { refs.current[entry.id] = node; }}
              >
                <button
                  type="button"
                  className={`disclosure__btn${isOpen ? ' is-open' : ''}`}
                  onClick={() => toggle(entry.id)}
                  aria-expanded={isOpen}
                >
                  <IconChevron className="chev" />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="bold">{pick(entry.term)}</span>
                    {!isOpen ? (
                      <span
                        className="small muted"
                        style={{
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {pick(entry.definition)}
                      </span>
                    ) : null}
                  </span>
                </button>
                {isOpen ? (
                  <div className="disclosure__body">
                    <div className="small" style={{ margin: '0 0 12px', color: 'var(--text-dim)' }}>
                      {pick(entry.definition).split('\n\n').map((para, i) => (
                        <p
                          key={i}
                          className="pre-wrap"
                          style={{ margin: i === 0 ? '0 0 8px' : '0 0 8px' }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                    {entry.relatedTerms.length ? (
                      <>
                        <div className="label" style={{ marginBottom: 6 }}>Related</div>
                        <div className="chip-row" style={{ marginBottom: 12 }}>
                          {entry.relatedTerms.map((id) => {
                            const related = GLOSSARY.find((g) => g.id === id);
                            if (!related) return null;
                            return (
                              <button
                                key={id}
                                type="button"
                                className="chip"
                                onClick={() => navigate('glossary', id)}
                              >
                                {pick(related.term)}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                    <div className="row">
                      {entry.group && entry.group !== 'term' ? (
                        <Tag tone="accent">
                          {entry.group === 'improviser' ? 'Improviser'
                            : entry.group === 'book' ? 'Book' : 'Philosophy'}
                        </Tag>
                      ) : null}
                      <Tag>{entry.sourceReference}</Tag>
                      <div className="spacer" />
                      <button type="button" className="btn btn--sm" onClick={() => copy(entry)}>
                        <IconCopy /> Copy
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
