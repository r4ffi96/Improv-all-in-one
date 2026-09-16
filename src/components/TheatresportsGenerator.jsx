import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  generateEvening, rerollSplitGame, rerollSingleGame, patchMatch,
  poolForTheme, availableSplitThemes, setSplitGame, setSingleGame,
  changeSplitTheme, addSplitRound, removeRow, usedGameNames,
} from '../lib/theatresports.js';
import {
  TS_THEME_BY_ID, TS_JOINT_THEME_IDS, TS_FINALE_GAMES, TS_WARMUPS, TS_INSPIRATIONS,
} from '../data/theatresports.js';
import { buildTheatresportsPlan } from '../export/builders.js';
import { exportDocument } from '../export/index.js';
import {
  Card, Sheet, Switch, TextInput, TextArea, CheckBox,
} from './ui.jsx';
import { IconDice, IconDownload, IconTrash, IconPlus } from './Icons.jsx';

const norm = (s) => String(s || '').trim().toLowerCase();

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
            {gspec.name}{mark}{isUsed ? ' · schon geplant' : ''}
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
      placeholder="Inspiration"
      value={value || ''}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function TheatresportsGenerator({ onClose }) {
  const { state, patch, showToast } = useApp();
  const plan = state.theatresports;
  const [teamCount, setTeamCount] = useState(plan?.teamCount || 4);
  const [rounds, setRounds] = useState(plan?.rounds || 5);
  const [widePool, setWidePool] = useState(plan?.widePool ?? true);
  const [exporting, setExporting] = useState('');

  const setPlan = (next) => patch({ theatresports: next });
  const generate = () => setPlan(generateEvening({ teamCount, rounds, widePool }));

  const doExport = async (format) => {
    setExporting(format);
    try {
      await exportDocument(buildTheatresportsPlan(plan), format);
    } catch (err) {
      showToast(`Export fehlgeschlagen: ${err.message}`);
    } finally {
      setExporting('');
    }
  };

  const updateCell = (mi, rowIdValue, side, partial) => setPlan({
    ...plan,
    matches: plan.matches.map((m, i) => (i !== mi ? m : {
      ...m,
      rows: m.rows.map((r) => (r.id === rowIdValue ? { ...r, [side]: { ...r[side], ...partial } } : r)),
    })),
  });
  const updateRow = (mi, rowIdValue, partial) => setPlan({
    ...plan,
    matches: plan.matches.map((m, i) => (i !== mi ? m : {
      ...m,
      rows: m.rows.map((r) => (r.id === rowIdValue ? { ...r, ...partial } : r)),
    })),
  });

  /* ----- intro / setup ----- */

  if (!plan) {
    return (
      <Sheet title="Theatersport-Abend" subtitle="Einen Showplan generieren" onClose={onClose}>
        <div className="stack">
          <Card className="card--flat">
            <p className="small" style={{ marginTop: 0 }}>
              Erzeugt einen zufälligen Showplan im Stil des Moderationsleitfadens: pro
              Team-Paarung eine Tabelle mit Aufwärmen und mehreren Runden. In den meisten
              Runden spielen beide Teams je ein anderes Spiel aus dem gleichen Thema, dazu
              kommen eine gemeinsame Szene, eine Teamwunsch-Runde und ein Gruppen-Finale.
              Kein Spiel wird zweimal gespielt.
            </p>
          </Card>

          <Card className="card--flat">
            <Switch
              checked={widePool}
              onChange={setWidePool}
              label="Grosser Spielpool"
              hint="Zusätzlich zu den Spielen aus dem Leitfaden auch passende Kurzform-Spiele aus der Encyclopedia-Bibliothek (mit ◇ markiert, inklusive kurzer Erklärung für die Moderation)."
            />
          </Card>

          <Card className="card--flat">
            <div className="field">
              <span className="label">Anzahl Teams</span>
              <div className="row row--tight">
                {[2, 4].map((n) => (
                  <button key={n} type="button" className={`chip${teamCount === n ? ' is-active' : ''}`} onClick={() => setTeamCount(n)} aria-pressed={teamCount === n}>
                    {n} Teams
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <span className="label">Runden pro Match</span>
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
            <IconDice /> Showplan generieren
          </button>
        </div>
      </Sheet>
    );
  }

  /* ----- editor ----- */

  const themeOptions = availableSplitThemes(plan);

  const CellEditor = ({ mi, row, side, teamName }) => {
    const cell = row[side];
    const letter = (side === 'a') === row.startLeft ? 'A' : 'B';
    const pool = poolForTheme(row.themeId, plan.widePool);
    return (
      <div className={`ts-cell${cell.include ? '' : ' ts-cell--off'}`}>
        <div className="row row--tight" style={{ marginBottom: 4 }}>
          <span className="ts-badge">{letter}</span>
          <span className="tiny bold" style={{ flex: 1, minWidth: 0 }}>{teamName}</span>
          <CheckBox checked={cell.include} onChange={(v) => updateCell(mi, row.id, side, { include: v })} ariaLabel={`${teamName}: Spiel einplanen`} />
        </div>
        <div className="row row--tight">
          <div style={{ flex: 1, minWidth: 0 }}>
            <GameSelect value={cell.game} pool={pool} plan={plan} ariaLabel={`${teamName}: Spiel`} onChange={(v) => setPlan(setSplitGame(plan, mi, row.id, side, v))} />
          </div>
          <button type="button" className="btn btn--icon" aria-label={`${teamName}: anderes Spiel würfeln`} onClick={() => setPlan(rerollSplitGame(plan, mi, row.id, side))}>
            <IconDice />
          </button>
        </div>
        {cell.explain ? <div className="ts-explain">{cell.explain}</div> : null}
        <div style={{ marginTop: 6 }}>
          <InspirationInput value={cell.inspiration} ariaLabel={`${teamName}: Inspiration`} onChange={(v) => updateCell(mi, row.id, side, { inspiration: v })} />
        </div>
      </div>
    );
  };

  const RowEditor = ({ mi, row, teamA, teamB }) => {
    const header = (
      <div className="row row--tight ts-rowhead">
        <span className="bold" style={{ flex: 1, minWidth: 0 }}>{row.label}</span>
        <label className="tiny faint ts-flex">
          <CheckBox checked={Boolean(row.flexible)} onChange={(v) => updateRow(mi, row.id, { flexible: v })} ariaLabel="Flexible Runde" />
          flexibel (*)
        </label>
        <button type="button" className="btn btn--icon" aria-label="Runde entfernen" onClick={() => setPlan(removeRow(plan, mi, row.id))}>
          <IconTrash />
        </button>
      </div>
    );

    if (row.kind === 'split') {
      return (
        <div className="ts-row">
          {header}
          <div className="field" style={{ marginTop: 2 }}>
            <select className="input" value={row.themeId} aria-label="Thema der Runde" onChange={(e) => setPlan(changeSplitTheme(plan, mi, row.id, e.target.value))}>
              {themeOptions.map((id) => <option key={id} value={id}>{TS_THEME_BY_ID[id].label}</option>)}
            </select>
          </div>
          <div className="ts-cells">
            <CellEditor mi={mi} row={row} side="a" teamName={teamA} />
            <CellEditor mi={mi} row={row} side="b" teamName={teamB} />
          </div>
        </div>
      );
    }

    if (row.kind === 'teamwunsch') {
      return (
        <div className="ts-row">
          {header}
          <div className="ts-span small muted">
            Teamwunsch (Spielwahlrunde): beide Teams wählen selbst. Startseite wechselt.
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
          <div className="tiny bold" style={{ marginBottom: 4 }}>{isJoint ? 'Gemeinsame Szene' : 'Gruppen-Finale'}</div>
          <div className="row row--tight">
            <label className="ts-flex tiny faint" style={{ marginRight: 4 }}>
              <CheckBox checked={row.include !== false} onChange={(v) => updateRow(mi, row.id, { include: v })} ariaLabel="Szene einplanen" />
            </label>
            <div style={{ flex: 1, minWidth: 0 }}>
              <GameSelect value={row.game} pool={pool} plan={plan} ariaLabel="Spiel" onChange={(v) => setPlan(setSingleGame(plan, mi, row.id, v))} />
            </div>
            <button type="button" className="btn btn--icon" aria-label="anderes Spiel würfeln" onClick={() => setPlan(rerollSingleGame(plan, mi, row.id))}>
              <IconDice />
            </button>
          </div>
          {row.explain ? <div className="ts-explain">{row.explain}</div> : null}
          {isJoint ? (
            <div style={{ marginTop: 6 }}>
              <InspirationInput value={row.inspiration} ariaLabel="Inspiration" onChange={(v) => updateRow(mi, row.id, { inspiration: v })} />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <Sheet title="Theatersport-Abend" subtitle="Showplan bearbeiten" onClose={onClose}>
      <datalist id="ts-inspirations">
        {TS_INSPIRATIONS.map((i) => <option key={i} value={i} />)}
      </datalist>

      <div className="stack">
        <Card className="card--flat">
          <button type="button" className="btn btn--primary btn--block" onClick={generate}>
            <IconDice /> Neu generieren
          </button>
          <div style={{ marginTop: 10 }}>
            <Switch checked={widePool} onChange={setWidePool} label="Grosser Spielpool" hint="Auch Kurzform-Spiele aus der Encyclopedia (◇). Wirkt beim nächsten «Neu generieren» und beim Würfeln." />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <span className="label">Teams & Runden</span>
            <div className="row row--tight">
              {[2, 4].map((n) => (
                <button key={n} type="button" className={`chip${teamCount === n ? ' is-active' : ''}`} onClick={() => setTeamCount(n)}>{n} Teams</button>
              ))}
              {[3, 4, 5, 6, 7].map((n) => (
                <button key={n} type="button" className={`chip${rounds === n ? ' is-active' : ''}`} onClick={() => setRounds(n)}>{n} Rd.</button>
              ))}
            </div>
          </div>
        </Card>

        {plan.matches.map((match, mi) => (
          <Card key={mi} className="card--flat">
            <div className="ts-cells" style={{ marginBottom: 8 }}>
              <TextInput label="Team links" value={match.teamA} onChange={(e) => setPlan(patchMatch(plan, mi, { teamA: e.target.value }))} />
              <TextInput label="Team rechts" value={match.teamB} onChange={(e) => setPlan(patchMatch(plan, mi, { teamB: e.target.value }))} />
            </div>
            <div className="field">
              <span className="label">Aufwärmen</span>
              <input className="input" list="ts-warmups" value={match.warmup || ''} onChange={(e) => setPlan(patchMatch(plan, mi, { warmup: e.target.value }))} aria-label="Aufwärmspiel" />
            </div>
            <div className="stack-sm" style={{ marginTop: 8 }}>
              {match.rows.map((row) => <RowEditor key={row.id} mi={mi} row={row} teamA={match.teamA} teamB={match.teamB} />)}
            </div>
            <button type="button" className="btn btn--ghost btn--sm btn--block" style={{ marginTop: 8 }} onClick={() => setPlan(addSplitRound(plan, mi))}>
              <IconPlus /> Runde hinzufügen
            </button>
          </Card>
        ))}

        <datalist id="ts-warmups">
          {TS_WARMUPS.map((w) => <option key={w} value={w} />)}
        </datalist>

        <Card className="card--flat">
          <div className="bold" style={{ marginBottom: 6 }}>Back-up-Spiele</div>
          <div className="small muted">Gemeinsame Szenen: {(plan.backupJoint || []).join(', ') || '—'}</div>
          <div className="small muted" style={{ marginTop: 4 }}>Einzelne Szenen: {(plan.backupSolo || []).join(', ') || '—'}</div>
        </Card>

        <Card className="card--flat">
          <TextArea label="Moderationsnotizen" hint="Erscheinen im PDF. Frei anpassbar." rows={8} value={plan.notes || ''} onChange={(e) => setPlan({ ...plan, notes: e.target.value })} />
        </Card>

        <div className="btn-grid">
          <button type="button" className="btn btn--primary" disabled={exporting === 'pdf'} onClick={() => doExport('pdf')}>
            <IconDownload /> {exporting === 'pdf' ? 'Erzeuge…' : 'PDF'}
          </button>
          <button type="button" className="btn" disabled={exporting === 'docx'} onClick={() => doExport('docx')}>
            <IconDownload /> {exporting === 'docx' ? 'Erzeuge…' : 'DOCX'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
