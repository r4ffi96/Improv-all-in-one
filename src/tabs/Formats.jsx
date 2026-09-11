import { useEffect, useMemo, useState } from 'react';
import { FORMATS } from '../data/formats.js';
import { GLOSSARY } from '../data/glossary.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, ConfirmButton, Empty, Tag } from '../components/ui.jsx';
import { IconBack, IconChevron, IconStar, IconStarFilled } from '../components/Icons.jsx';

/** First sentence of the summary, for the list card. */
function summarise(format) {
  const text = String(format.structureSummary || '').replace(/\s+/g, ' ').trim();
  const stop = text.search(/(?<!e\.g|i\.e|etc)\.\s/);
  const first = stop > 30 ? text.slice(0, stop + 1) : text;
  return first.length > 190 ? `${first.slice(0, 187).trimEnd()}...` : first;
}

export default function Formats({ route, navigate, setSubtitle }) {
  const { state, patch, showToast, toggleFavourite, requireUnlock } = useApp();
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const hidden = useMemo(() => new Set(state.hidden.formats), [state.hidden.formats]);
  const favourites = useMemo(() => new Set(state.favourites.formats), [state.favourites.formats]);
  const all = useMemo(
    () => [...state.formats.map((f) => ({ ...f, userAdded: true })), ...FORMATS]
      .filter((f) => !hidden.has(f.id)),
    [state.formats, hidden],
  );
  const openId = route.params[0] || null;
  const current = openId ? all.find((f) => f.id === openId) : null;

  useEffect(() => {
    setSubtitle(current ? current.origin : `${all.length} formats`);
    return () => setSubtitle('');
  }, [setSubtitle, current, all.length]);

  if (current) {
    return (
      <div className="stack">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('formats')}>
          <IconBack /> All formats
        </button>

        <Card>
          <div className="card__title" style={{ fontSize: 21 }}>{current.name}</div>
          <div className="small muted" style={{ marginTop: 4 }}>{current.origin}</div>
          <div className="row row--tight" style={{ marginTop: 10 }}>
            <button
              type="button"
              className={`star-btn${favourites.has(current.id) ? ' is-on' : ''}`}
              style={{ alignSelf: 'center' }}
              onClick={() => requireUnlock(() => toggleFavourite('formats', current.id))}
              aria-label={favourites.has(current.id) ? 'Unfavourite this format' : 'Favourite this format'}
              aria-pressed={favourites.has(current.id)}
            >
              {favourites.has(current.id) ? <IconStarFilled /> : <IconStar />}
            </button>
            <Tag tone="gold">{current.typicalDuration}</Tag>
            {current.userAdded ? <Tag tone="accent">From a forge day</Tag> : null}
            {(current.categoryTags || []).map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
          <div className="divider" />
          <p className="pre-wrap" style={{ margin: 0, fontSize: 15 }}>{current.structureSummary}</p>
        </Card>

        {current.stages.length ? (
          <>
            <div className="section-title">Structure</div>
            <Card>
              <div className="beat-list">
                {current.stages.map((stage, i) => (
                  <div className="beat" key={`${stage.name}-${i}`}>
                    <div className="beat__name">{stage.name}</div>
                    {stage.description ? <div className="beat__desc">{stage.description}</div> : null}
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : null}

        {current.notes ? (
          <>
            <div className="section-title">Notes</div>
            <Card>
              <p className="pre-wrap" style={{ margin: 0, fontSize: 14.5, color: 'var(--text-dim)' }}>
                {current.notes}
              </p>
            </Card>
          </>
        ) : null}

        {current.relatedTheory && current.relatedTheory.length ? (
          <>
            <div className="section-title">Related theory</div>
            <div className="chip-row">
              {current.relatedTheory.map((id) => {
                const term = GLOSSARY.find((g) => g.id === id);
                if (!term) return null;
                return (
                  <button key={id} type="button" className="chip" onClick={() => navigate('glossary', id)}>
                    {term.term.en}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {current.userAdded ? (
          <ConfirmButton
            className="btn btn--danger btn--block"
            confirmLabel="Tap again to remove this format"
            onConfirm={() => requireUnlock(() => {
              patch({ formats: state.formats.filter((f) => f.id !== current.id) });
              showToast('Format removed');
              navigate('formats');
            })}
          >
            Remove from library
          </ConfirmButton>
        ) : null}
      </div>
    );
  }

  const listed = favouritesOnly ? all.filter((f) => favourites.has(f.id)) : all;

  return (
    <div className="stack">
      <p className="small muted" style={{ margin: '0 0 2px' }}>
        Whole show structures. Individual exercises live in the Session Builder library.
      </p>
      <div className="row row--tight">
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
      {listed.length === 0 ? (
        <Empty>
          {favouritesOnly ? 'Nothing starred yet. Tap the star on a format to keep it here.' : 'No formats yet.'}
        </Empty>
      ) : null}
      {listed.map((format) => (
        <div
          key={format.id}
          className="pick"
          role="button"
          tabIndex={0}
          onClick={() => navigate('formats', format.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate('formats', format.id);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="pick__top">
            <div className="pick__body">
              <div className="pick__name">{format.name}</div>
              <div className="card__desc">{format.structureSummary.split('. ')[0]}.</div>
              <div className="pick__meta">
                <Tag>{format.origin}</Tag>
                <Tag tone="gold">{format.typicalDuration}</Tag>
                <Tag tone="accent">{format.stages.length} stages</Tag>
                {format.userAdded ? <Tag tone="good">From a forge day</Tag> : null}
              </div>
            </div>
            <span
              className="stack-sm"
              style={{ alignItems: 'center', gap: 6, alignSelf: 'center' }}
            >
              <button
                type="button"
                className={`star-btn${favourites.has(format.id) ? ' is-on' : ''}`}
                style={{ alignSelf: 'center' }}
                onClick={(e) => { e.stopPropagation(); requireUnlock(() => toggleFavourite('formats', format.id)); }}
                aria-label={favourites.has(format.id) ? `Unfavourite ${format.name}` : `Favourite ${format.name}`}
                aria-pressed={favourites.has(format.id)}
              >
                {favourites.has(format.id) ? <IconStarFilled /> : <IconStar />}
              </button>
              <span style={{ color: 'var(--text-faint)', lineHeight: 0 }}>
                <IconChevron width={18} height={18} />
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
