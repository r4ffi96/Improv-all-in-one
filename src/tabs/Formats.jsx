import { useEffect, useMemo } from 'react';
import { FORMATS } from '../data/formats.js';
import { GLOSSARY } from '../data/glossary.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, ConfirmButton, Empty, Tag } from '../components/ui.jsx';
import { IconBack, IconChevron } from '../components/Icons.jsx';

export default function Formats({ route, navigate, setSubtitle }) {
  const { state, patch, showToast } = useApp();
  const all = useMemo(
    () => [...state.formats.map((f) => ({ ...f, userAdded: true })), ...FORMATS],
    [state.formats],
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
            <Tag tone="gold">{current.typicalDuration}</Tag>
            {current.userAdded ? <Tag tone="accent">From a forge day</Tag> : null}
          </div>
          <div className="divider" />
          <p style={{ margin: 0, fontSize: 15 }}>{current.structureSummary}</p>
        </Card>

        <div className="section-title">Structure</div>
        <Card>
          <div className="beat-list">
            {current.stages.map((stage, i) => (
              <div className="beat" key={`${stage.name}-${i}`}>
                <div className="beat__name">{stage.name}</div>
                <div className="beat__desc">{stage.description}</div>
              </div>
            ))}
          </div>
        </Card>

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
            onConfirm={() => {
              patch({ formats: state.formats.filter((f) => f.id !== current.id) });
              showToast('Format removed');
              navigate('formats');
            }}
          >
            Remove from library
          </ConfirmButton>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="small muted" style={{ margin: '0 0 2px' }}>
        Whole show structures. Individual exercises live in the Session Builder library.
      </p>
      {all.length === 0 ? <Empty>No formats yet.</Empty> : null}
      {all.map((format) => (
        <button
          key={format.id}
          type="button"
          className="pick"
          onClick={() => navigate('formats', format.id)}
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
            <span style={{ color: 'var(--text-faint)', alignSelf: 'center' }}>
              <IconChevron width={18} height={18} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
