import { useEffect, useState } from 'react';
import { ensureLibraryDetails, withDetails } from '../data/library.js';
import { useApp } from '../context/AppContext.jsx';
import { CheckBox, Tag } from './ui.jsx';
import { IconStar, IconStarFilled } from './Icons.jsx';

const TYPE_TONE = { warmup: 'good', exercise: 'accent', main: 'gold', theory: 'warn' };
const TYPE_SHORT = { warmup: 'Warm-up', exercise: 'Exercise', main: 'Main', theory: 'Theory' };

/** One library block, selectable and expandable. Shared by builder and archive. */
export default function LibraryItem({ item, selected, onToggle, defaultOpen = false }) {
  const { state, toggleFavourite, requireUnlock } = useApp();
  const [open, setOpen] = useState(defaultOpen);
  const [detail, setDetail] = useState(() => withDetails(item));
  const starred = state.favourites.library.includes(item.id);

  // Encyclopedia instructions are fetched the first time a card is opened.
  useEffect(() => {
    setDetail(withDetails(item));
    if (!open || !item.detailsPending) return undefined;
    let alive = true;
    ensureLibraryDetails().then(() => { if (alive) setDetail(withDetails(item)); });
    return () => { alive = false; };
  }, [open, item]);

  return (
    <div className={`pick${selected ? ' is-selected' : ''}`}>
      <div className="pick__top">
        {onToggle ? (
          <CheckBox checked={selected} onChange={onToggle} ariaLabel={`Select ${item.name}`} />
        ) : null}
        <div
          className="pick__body"
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
          aria-expanded={open}
        >
          <div className="pick__name">{item.name}</div>
          <div className="card__desc">{item.description}</div>
          <div className="pick__meta">
            <Tag tone={TYPE_TONE[item.type]}>{TYPE_SHORT[item.type]}</Tag>
            <Tag tone="gold">{item.durationMinutes} min</Tag>
            <Tag>{item.groupSizeFit}</Tag>
            {item.categoryTags
              .filter((tag) => tag.toLowerCase() !== TYPE_SHORT[item.type].toLowerCase())
              .slice(0, 3)
              .map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
          <div className="tiny faint" style={{ marginTop: 8 }}>
            {open ? 'Tap to collapse' : 'Tap for full instructions'}
          </div>
        </div>
        <button
          type="button"
          className={`star-btn${starred ? ' is-on' : ''}`}
          style={{ alignSelf: 'flex-start', marginTop: 1 }}
          onClick={(e) => { e.stopPropagation(); requireUnlock(() => toggleFavourite('library', item.id)); }}
          aria-label={starred ? `Unfavourite ${item.name}` : `Favourite ${item.name}`}
          aria-pressed={starred}
        >
          {starred ? <IconStarFilled /> : <IconStar />}
        </button>
      </div>

      {open ? (
        <div className="pick__detail">
          {detail.detailsPending ? <p style={{ margin: 0 }}>Loading instructions&hellip;</p> : null}
          {detail.setup ? (
            <>
              <h5>Setup</h5>
              <p className="pre-wrap" style={{ margin: 0 }}>{detail.setup}</p>
            </>
          ) : null}
          {detail.fullText ? (
            <>
              <h5>Instructions</h5>
              <p className="pre-wrap" style={{ margin: 0 }}>{detail.fullText}</p>
            </>
          ) : null}
          {detail.coachingNotes.length ? (
            <>
              <h5>Coaching focus</h5>
              <ul>{detail.coachingNotes.map((note, i) => <li key={i}>{note}</li>)}</ul>
            </>
          ) : null}
          {detail.variations.length ? (
            <>
              <h5>Variations</h5>
              <ul>{detail.variations.map((v, i) => <li key={i}>{v}</li>)}</ul>
            </>
          ) : null}
          {detail.debriefQuestions && detail.debriefQuestions.length ? (
            <>
              <h5>Debrief questions</h5>
              <ul>{detail.debriefQuestions.map((q, i) => <li key={i}>&laquo;{q}&raquo;</li>)}</ul>
            </>
          ) : null}
          <h5>Source</h5>
          <p style={{ margin: 0 }}>{detail.source}</p>
        </div>
      ) : null}
    </div>
  );
}
