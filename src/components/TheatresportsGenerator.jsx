import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  generateEvening, rerollSplitGame, rerollSingleGame, patchMatch, replaceRow,
  poolForTheme, availableSplitThemes, setSplitGame, setSingleGame,
  changeSplitTheme, addSplitRound, removeRow, usedGameNames,
} from '../lib/theatresports.js';
import {
  TS_THEME_BY_ID, TS_JOINT_THEME_IDS, TS_FINALE_GAMES, TS_WARMUPS, TS_INSPIRATIONS,
  TS_MODERATOR_ESSENTIALS,
} from '../data/theatresports.js';
import { ensureLibraryDetails, fullById } from '../data/library.js';
import { buildTheatresportsPlan } from '../export/builders.js';
import { exportDocument } from '../export/index.js';
import {
  Card, Sheet, Switch, TextInput, TextArea, CheckBox,
} from './ui.jsx';
import {
  IconDice, IconDownload, IconTrash, IconPlus,
} from './Icons.jsx';

const norm = (s) => String(s || '').trim().toLowerCase();

const setCellField = (plan, mi, rowId, side, partial) => replaceRow(
  plan, mi, rowId, (r) => ({ ...r, [side]: { ...r[side], ...partial } }),
);
const setRowField = (plan, mi, rowId, partial) => replaceRow(
  plan, mi, rowId, (r) => ({ ...r, ...partial }),
);

/* ---- module-scope subcomponents (stable types, so a background re-render
   never remounts them and closes an open <select>) ---- */

function GameSelect({ value, pool, plan, onChange, ariaLabel }) {
  const used = usedGameNames(plan);
  const known = new Set(pool.map((g) => norm(g.name)));
  return (
    <select className="input" value={value || ''} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)}>
      {value && !known.has(norm(value)) ? <option value={value}>{value}</option> : null}
      {pool.map((gspec) => {
        const isUsed = used.has(norm(gspec.name)) && norm(gspec.name) !== norm(value);
        const mark = gspec.source === 'encyclopedia' ? ' ◇' : '';
        return (
          <option key={gspec.name} value={gspec.name}>
            {gspec.name}{mark}{isUsed ? ' · already planned' : ''}
          </option>
        );
      })}
    </select>
  );
}

function InspirationInput({ value, onChange, ariaLabel }) {
  return (
    <input
      className="input"
      list="ts-inspirations"
      placeholder="Suggestion"
      value={value || ''}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function InfoButton({ refId, name, onInfo }) {
  if (!refId) return null;
  return (
    <button type="button" className="btn btn--icon" aria-label={`${name}: full explanation`} onClick={() => onInfo(refId, name)}>
      <span className="ts-i">i</span>
    </button>
  );
}

function CellEditor({
  plan, setPlan, mi, row, side, teamName, onInfo,
}) {
  const cell = row[side];
  const letter = (side === 'a') === row.startLeft ? 'A' : 'B';
  const pool = poolForTheme(row.themeId, plan.widePool);
  return (
    <div className={`ts-cell${cell.include ? '' : ' ts-cell--off'}`}>
      <div className="row row--tight" style={{ marginBottom: 4 }}>
        <span className="ts-badge">{letter}</span>
        <span className="tiny bold" style={{ flex: 1, minWidth: 0 }}>{teamName}</span>
        <CheckBox checked={cell.include} onChange={(v) => setPlan(setCellField(plan, mi, row.id, side, { include: v }))} ariaLabel={`${teamName}: include this game`} />
      </div>
      <div className="row row--tight">
        <div style={{ flex: 1, minWidth: 0 }}>
          <GameSelect value={cell.game} pool={pool} plan={plan} ariaLabel={`${teamName}: game`} onChange={(v) => setPlan(setSplitGame(plan, mi, row.id, side, v))} />
        </div>
        <InfoButton refId={cell.refId} name={cell.game} onInfo={onInfo} />
        <button type="button" className="btn btn--icon" aria-label={`${teamName}: re-roll game`} onClick={() => setPlan(rerollSplitGame(plan, mi, row.id, side))}>
          <IconDice />
        </button>
      </div>
      {cell.explain ? <div className="ts-explain">{cell.explain}</div> : null}
      <div style={{ marginTop: 6 }}>
        <InspirationInput value={cell.inspiration} ariaLabel={`${teamName}: suggestion`} onChange={(v) => setPlan(setCellField(plan, mi, row.id, side, { inspiration: v }))} />
      </div>
    </div>
  );
}

function RowEditor({
  plan, setPlan, mi, row, teamA, teamB, themeOptions, onInfo,
}) {
  const header = (
    <div className="row row--tight ts-rowhead">
      <span className="bold" style={{ flex: 1, minWidth: 0 }}>{row.label}</span>
      <label className="tiny faint ts-flex">
        <CheckBox checked={Boolean(row.flexible)} onChange={(v) => setPlan(setRowField(plan, mi, row.id, { flexible: v }))} ariaLabel="Flexible round" />
        flexible (*)
      </label>
      <button type="button" className="btn btn--icon" aria-label="Remove round" onClick={() => setPlan(removeRow(plan, mi, row.id))}>
        <IconTrash />
      </button>
    </div>
  );

  if (row.kind === 'split') {
    return (
      <div className="ts-row">
        {header}
        <div className="field" style={{ marginTop: 2 }}>
          <select className="input" value={row.themeId} aria-label="Round theme" onChange={(e) => setPlan(changeSplitTheme(plan, mi, row.id, e.target.value))}>
            {themeOptions.map((id) => <option key={id} value={id}>{TS_THEME_BY_ID[id].label}</option>)}
          </select>
        </div>
        <div className="ts-cells">
          <CellEditor plan={plan} setPlan={setPlan} mi={mi} row={row} side="a" teamName={teamA} onInfo={onInfo} />
          <CellEditor plan={plan} setPlan={setPlan} mi={mi} row={row} side="b" teamName={teamB} onInfo={onInfo} />
        </div>
      </div>
    );
  }

  if (row.kind === 'teamwunsch') {
    return (
      <div className="ts-row">
        {header}
        <div className="ts-span small muted">
          Team choice (Teamwunsch): both teams pick their own game. Starting side alternates.
        </div>
      </div>
    );
  }

  const isJoint = row.kind === 'joint';
  const pool = isJoint
    ? TS_JOINT_THEME_IDS.flatMap((id) => poolForTheme(id, plan.widePool))
    : TS_FINALE_GAMES.map((name) => ({ name, source: 'sammlung' }));
  return (
    <div className="ts-row">
      {header}
      <div className="ts-span">
        <div className="tiny bold" style={{ marginBottom: 4 }}>{isJoint ? 'Joint scene (Gemeinsame Szene)' : 'Group finale'}</div>
        <div className="row row--tight">
          <label className="ts-flex tiny faint" style={{ marginRight: 4 }}>
            <CheckBox checked={row.include !== false} onChange={(v) => setPlan(setRowField(plan, mi, row.id, { include: v }))} ariaLabel="Include this scene" />
          </label>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GameSelect value={row.game} pool={pool} plan={plan} ariaLabel="Game" onChange={(v) => setPlan(setSingleGame(plan, mi, row.id, v))} />
          </div>
          <InfoButton refId={row.refId} name={row.game} onInfo={onInfo} />
          <button type="button" className="btn btn--icon" aria-label="re-roll game" onClick={() => setPlan(rerollSingleGame(plan, mi, row.id))}>
            <IconDice />
          </button>
        </div>
        {row.explain ? <div className="ts-explain">{row.explain}</div> : null}
        {isJoint ? (
          <div style={{ marginTop: 6 }}>
            <InspirationInput value={row.inspiration} ariaLabel="Suggestion" onChange={(v) => setPlan(setRowField(plan, mi, row.id, { inspiration: v }))} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoSheet({ refId, name, onClose }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    ensureLibraryDetails().then(() => {
      if (live) { setGame(fullById(refId)); setLoading(false); }
    });
    return () => { live = false; };
  }, [refId]);
  return (
    <Sheet title={name} subtitle="Game explanation" onClose={onClose}>
      {loading ? (
        <div className="small muted">Loading…</div>
      ) : !game ? (
        <div className="small muted">No explanation available.</div>
      ) : (
        <div className="stack">
          {game.categoryTags && game.categoryTags.length ? (
            <div className="chip-row">
              {game.categoryTags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          ) : null}
          {game.fullText ? <p className="pre-wrap" style={{ margin: 0, fontSize: 15 }}>{game.fullText}</p> : null}
          {game.coachingNotes && game.coachingNotes.length ? (
            <div>
              <div className="section-title">Coaching notes</div>
              <ul className="ts-ul">{game.coachingNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          ) : null}
          {game.variations && game.variations.length ? (
            <div>
              <div className="section-title">Variations</div>
              <ul className="ts-ul">{game.variations.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          ) : null}
        </div>
      )}
    </Sheet>
  );
}

export default function TheatresportsGenerator({ onClose }) {
  const { state, patch, showToast } = useApp();
  const plan = state.theatresports;
  const [teamCount, setTeamCount] = useState(plan?.teamCount || 4);
  const [rounds, setRounds] = useState(plan?.rounds || 5);
  const [widePool, setWidePool] = useState(plan?.widePool ?? true);
  const [exporting, setExporting] = useState('');
  const [info, setInfo] = useState(null);

  const setPlan = (next) => patch({ theatresports: next });
  const generate = () => setPlan(generateEvening({ teamCount, rounds, widePool }));
  const onInfo = (refId, name) => setInfo({ refId, name });

  const doExport = async (format) => {
    setExporting(format);
    try {
      // The full game explanations are lazy-loaded; make sure they are in
      // memory so the export can include them.
      await ensureLibraryDetails();
      await exportDocument(buildTheatresportsPlan(plan), format);
    } catch (err) {
      showToast(`Export failed: ${err.message}`);
    } finally {
      setExporting('');
    }
  };

  /* ----- intro / setup ----- */

  if (!plan) {
    return (
      <Sheet title="Theatresports evening" subtitle="Generate a show plan" onClose={onClose}>
        <div className="stack">
          <Card className="card--flat">
            <p className="small" style={{ marginTop: 0 }}>
              Creates a random show plan in the style of the moderation guide: one table per
              team pairing, with a warm-up row and several rounds. In most rounds both teams
              play a different game from the same theme; there is also a joint scene
              (Gemeinsame Szene), a team-choice round (Teamwunsch) and a whole-group finale.
              No game is played twice.
            </p>
          </Card>

          <Card className="card--flat">
            <Switch
              checked={widePool}
              onChange={setWidePool}
              label="Wider game pool"
              hint="Also include short-form stage games from the Encyclopedia library (marked ◇), each with a short explanation for the moderator. Turn off for the guide's own game collection only."
            />
          </Card>

          <Card className="card--flat">
            <div className="field">
              <span className="label">Number of teams</span>
              <div className="row row--tight">
                {[2, 4].map((n) => (
                  <button key={n} type="button" className={`chip${teamCount === n ? ' is-active' : ''}`} onClick={() => setTeamCount(n)} aria-pressed={teamCount === n}>
                    {n} teams
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <span className="label">Rounds per match</span>
              <div className="row row--tight">
                {[3, 4, 5, 6, 7].map((n) => (
                  <button key={n} type="button" className={`chip${rounds === n ? ' is-active' : ''}`} onClick={() => setRounds(n)} aria-pressed={rounds === n}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <button type="button" className="btn btn--primary btn--block" onClick={generate}>
            <IconDice /> Generate show plan
          </button>
        </div>
      </Sheet>
    );
  }

  /* ----- editor ----- */

  const themeOptions = availableSplitThemes(plan);

  return (
    <Sheet title="Theatresports evening" subtitle="Edit the show plan" onClose={onClose}>
      <datalist id="ts-inspirations">
        {TS_INSPIRATIONS.map((i) => <option key={i} value={i} />)}
      </datalist>

      <div className="stack">
        <div className="ts-essentials">
          <div className="ts-essentials__title">Wichtig für die Moderation</div>
          <ul className="ts-ul">
            {TS_MODERATOR_ESSENTIALS.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <Card className="card--flat">
          <button type="button" className="btn btn--primary btn--block" onClick={generate}>
            <IconDice /> Regenerate
          </button>
          <div style={{ marginTop: 10 }}>
            <Switch checked={widePool} onChange={setWidePool} label="Wider game pool" hint="Also short-form stage games from the Encyclopedia (◇). Applies on the next Regenerate and when re-rolling." />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <span className="label">Teams & rounds</span>
            <div className="row row--tight">
              {[2, 4].map((n) => (
                <button key={n} type="button" className={`chip${teamCount === n ? ' is-active' : ''}`} onClick={() => setTeamCount(n)}>{n} teams</button>
              ))}
              {[3, 4, 5, 6, 7].map((n) => (
                <button key={n} type="button" className={`chip${rounds === n ? ' is-active' : ''}`} onClick={() => setRounds(n)}>{n} rds</button>
              ))}
            </div>
          </div>
        </Card>

        {plan.matches.map((match, mi) => (
          <Card key={mi} className="card--flat">
            <div className="ts-cells" style={{ marginBottom: 8 }}>
              <TextInput label="Left team" value={match.teamA} onChange={(e) => setPlan(patchMatch(plan, mi, { teamA: e.target.value }))} />
              <TextInput label="Right team" value={match.teamB} onChange={(e) => setPlan(patchMatch(plan, mi, { teamB: e.target.value }))} />
            </div>
            <div className="field">
              <span className="label">Warm-up</span>
              <input className="input" list="ts-warmups" value={match.warmup || ''} onChange={(e) => setPlan(patchMatch(plan, mi, { warmup: e.target.value }))} aria-label="Warm-up game" />
            </div>
            <div className="stack-sm" style={{ marginTop: 8 }}>
              {match.rows.map((row) => (
                <RowEditor key={row.id} plan={plan} setPlan={setPlan} mi={mi} row={row} teamA={match.teamA} teamB={match.teamB} themeOptions={themeOptions} onInfo={onInfo} />
              ))}
            </div>
            <button type="button" className="btn btn--ghost btn--sm btn--block" style={{ marginTop: 8 }} onClick={() => setPlan(addSplitRound(plan, mi))}>
              <IconPlus /> Add round
            </button>
          </Card>
        ))}

        <datalist id="ts-warmups">
          {TS_WARMUPS.map((w) => <option key={w} value={w} />)}
        </datalist>

        <Card className="card--flat">
          <div className="bold" style={{ marginBottom: 6 }}>Back-up games</div>
          <div className="small muted">Joint scenes: {(plan.backupJoint || []).join(', ') || '—'}</div>
          <div className="small muted" style={{ marginTop: 4 }}>Solo scenes: {(plan.backupSolo || []).join(', ') || '—'}</div>
        </Card>

        <Card className="card--flat">
          <TextArea label="Moderator notes" hint="Shown in the PDF. Freely editable." rows={8} value={plan.notes || ''} onChange={(e) => setPlan({ ...plan, notes: e.target.value })} />
        </Card>

        <div className="btn-grid">
          <button type="button" className="btn btn--primary" disabled={exporting === 'pdf'} onClick={() => doExport('pdf')}>
            <IconDownload /> {exporting === 'pdf' ? 'Generating…' : 'PDF'}
          </button>
          <button type="button" className="btn" disabled={exporting === 'docx'} onClick={() => doExport('docx')}>
            <IconDownload /> {exporting === 'docx' ? 'Generating…' : 'DOCX'}
          </button>
        </div>
      </div>

      {info ? <InfoSheet refId={info.refId} name={info.name} onClose={() => setInfo(null)} /> : null}
    </Sheet>
  );
}
