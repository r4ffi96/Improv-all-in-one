import { useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { exportAll, parseImport, defaultState } from '../lib/storage.js';
import { Sheet, Switch, ConfirmButton } from './ui.jsx';
import { IconDownload, IconMoon, IconSun, IconUpload } from './Icons.jsx';

export default function SettingsSheet({ onClose }) {
  const { state, patch, replaceAll, showToast } = useApp();
  const fileRef = useRef(null);

  const sessions = state.archive.filter((a) => a.type === 'session').length;
  const forgeDays = state.archive.filter((a) => a.type === 'format-forge').length;
  const debriefs = state.archive.reduce((n, a) => n + (a.debriefs ? a.debriefs.length : 0), 0);

  const doExport = () => {
    const blob = new Blob([exportAll(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `improv-all-in-one-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast('Backup downloaded');
  };

  const doImport = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const next = parseImport(await file.text());
      replaceAll(next);
      showToast('Data imported');
      onClose();
    } catch (err) {
      showToast(`Import failed: ${err.message}`);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Sheet title="Settings" subtitle="Theme, backup and storage" onClose={onClose}>
      <div className="stack">
        <div className="card card--flat">
          <div className="row">
            <span style={{ color: 'var(--text-dim)', display: 'flex' }}>
              {state.theme === 'dark' ? <IconMoon width={20} height={20} /> : <IconSun width={20} height={20} />}
            </span>
            <div className="spacer" />
            <Switch
              checked={state.theme === 'light'}
              onChange={(on) => patch({ theme: on ? 'light' : 'dark' })}
              label={state.theme === 'light' ? 'Light mode' : 'Dark mode'}
              hint="Dark is the default. Exports stay print-style either way."
            />
          </div>
        </div>

        <div className="card card--flat">
          <div className="bold" style={{ marginBottom: 4 }}>Your data</div>
          <div className="small muted">
            {sessions} session{sessions === 1 ? '' : 's'}, {forgeDays} forge day{forgeDays === 1 ? '' : 's'},{' '}
            {debriefs} debrief{debriefs === 1 ? '' : 's'}, {state.suggestions.saved.length} starred suggestion
            {state.suggestions.saved.length === 1 ? '' : 's'}.
          </div>
          <div className="small muted" style={{ marginTop: 8 }}>
            Everything is stored in this browser only. Export a backup before clearing site data or moving to
            another device.
          </div>
          <div className="btn-grid" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--primary" onClick={doExport}>
              <IconDownload /> Export all (JSON)
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current && fileRef.current.click()}>
              <IconUpload /> Import data
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={doImport}
            style={{ display: 'none' }}
          />
        </div>

        <div className="card card--flat">
          <div className="bold" style={{ marginBottom: 6 }}>Reset</div>
          <div className="small muted" style={{ marginBottom: 10 }}>
            Deletes archived sessions, debriefs, the Format Forge run in progress and starred suggestions.
            Export a backup first.
          </div>
          <ConfirmButton
            className="btn btn--danger btn--block"
            confirmLabel="Tap again to erase everything"
            onConfirm={() => { replaceAll({ ...defaultState(), theme: state.theme }); showToast('All data cleared'); onClose(); }}
          >
            Clear all data
          </ConfirmButton>
        </div>

        <div className="tiny faint center">
          Improv All-in-One &middot; built for Sandro Raffaele &middot; no accounts, no backend, no tracking.
        </div>
      </div>
    </Sheet>
  );
}
