import { useState } from 'react';
import { CheckBox, Tag } from './ui.jsx';

const TYPE_TONE = { warmup: 'good', exercise: 'accent', main: 'gold', theory: 'warn' };
const TYPE_SHORT = { warmup: 'Warm-up', exercise: 'Exercise', main: 'Main', theory: 'Theory' };

/** One library block, selectable and expandable. Shared by builder and archive. */
export default function LibraryItem({ item, selected, onToggle, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

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
      </div>

      {open ? (
        <div className="pick__detail">
          {item.setup ? (
            <>
              <h5>Setup</h5>
              <p className="pre-wrap" style={{ margin: 0 }}>{item.setup}</p>
            </>
          ) : null}
          <h5>Instructions</h5>
          <p className="pre-wrap" style={{ margin: 0 }}>{item.fullText}</p>
          {item.coachingNotes.length ? (
            <>
              <h5>Coaching focus</h5>
              <ul>{item.coachingNotes.map((note, i) => <li key={i}>{note}</li>)}</ul>
            </>
          ) : null}
          {item.variations.length ? (
            <>
              <h5>Variations</h5>
              <ul>{item.variations.map((v, i) => <li key={i}>{v}</li>)}</ul>
            </>
          ) : null}
          {item.debriefQuestions && item.debriefQuestions.length ? (
            <>
              <h5>Debrief questions</h5>
              <ul>{item.debriefQuestions.map((q, i) => <li key={i}>&laquo;{q}&raquo;</li>)}</ul>
            </>
          ) : null}
          <h5>Source</h5>
          <p style={{ margin: 0 }}>{item.source}</p>
        </div>
      ) : null}
    </div>
  );
}
