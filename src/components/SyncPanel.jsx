import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  checkConnection, describeUrlProblem, fetchState, fetchVersion, fetchVersions, guessDeviceName,
} from '../lib/sync.js';
import { prettyDate } from '../export/index.js';
import { Card, ConfirmButton, Sheet, Switch, TextInput } from './ui.jsx';
import { IconDownload, IconRefresh, IconUpload } from './Icons.jsx';

const STATUS = {
  idle: { label: 'Off', tone: '' },
  checking: { label: 'Checking…', tone: '' },
  pushing: { label: 'Saving to server…', tone: '' },
  ok: { label: 'In sync', tone: 'good' },
  behind: { label: 'Server has newer data', tone: 'warn' },
  conflict: { label: 'Conflict', tone: 'bad' },
  offline: { label: 'Server unreachable', tone: 'warn' },
};

function whenText(iso) {
  if (!iso) return 'never';
  return `${prettyDate(iso)} at ${new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function SyncPanel({ onClose }) {
  const {
    state, setSync, syncStatus, serverMeta, refreshMeta, runPush, applyServerState, showToast,
  } = useApp();
  const sync = state.sync;

  const [url, setUrl] = useState(sync.url);
  const [token, setToken] = useState(sync.token);
  const [deviceName, setDeviceName] = useState(sync.deviceName || guessDeviceName());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [busy, setBusy] = useState('');
  const [versions, setVersions] = useState(null);

  const status = STATUS[syncStatus] || STATUS.idle;

  const save = () => {
    setSync({ url: url.trim().replace(/\/+$/, ''), token: token.trim(), deviceName: deviceName.trim() });
    showToast('Server settings saved');
  };

  const test = async () => {
    const problem = describeUrlProblem(url, token);
    if (problem) { setTestResult({ ok: false, message: problem }); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const meta = await checkConnection({ url: url.trim(), token: token.trim() });
      setTestResult({
        ok: true,
        message: meta.version
          ? `Connected. The server holds version ${meta.version}, saved by ${meta.device} on ${whenText(meta.updatedAt)}.`
          : 'Connected. The server has nothing stored yet.',
      });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const doPull = async () => {
    setBusy('pull');
    try {
      applyServerState(await fetchState(sync));
      showToast('Pulled from server');
      onClose();
    } catch (err) {
      showToast(`Pull failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const doPush = async (force) => {
    setBusy('push');
    const meta = await runPush(force);
    setBusy('');
    showToast(meta ? `Pushed as version ${meta.version}` : 'Push failed');
  };

  const loadVersions = async () => {
    setBusy('versions');
    try {
      const res = await fetchVersions(sync);
      setVersions(res.versions);
    } catch (err) {
      showToast(`Could not list versions: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const restore = async (version) => {
    setBusy(`restore-${version}`);
    try {
      applyServerState(await fetchVersion(sync, version));
      showToast(`Restored version ${version}`);
      onClose();
    } catch (err) {
      showToast(`Restore failed: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  const configured = Boolean(sync.url && sync.token);
  const dirty = url.trim().replace(/\/+$/, '') !== sync.url
    || token.trim() !== sync.token
    || deviceName.trim() !== (sync.deviceName || '');

  return (
    <Sheet title="Sync" subtitle="Back up and share data between your devices" onClose={onClose}>
      <div className="stack">
        <Card className="card--flat">
          <div className="row row--tight">
            <span className="bold">Status</span>
            <div className="spacer" />
            <span className={`tag${status.tone ? ` tag--${status.tone}` : ''}`}>{status.label}</span>
          </div>
          {configured ? (
            <div className="small muted" style={{ marginTop: 8 }}>
              This device is at version {sync.syncedVersion || 0}
              {serverMeta ? `, the server at ${serverMeta.version || 0}` : ''}.
              <br />
              Last saved to server: {whenText(sync.lastPushedAt)}.
              <br />
              Last pulled: {whenText(sync.lastPulledAt)}.
            </div>
          ) : (
            <div className="small muted" style={{ marginTop: 8 }}>
              Not set up. Everything stays in this browser only.
            </div>
          )}
          {sync.lastError ? (
            <div className="banner banner--warn" style={{ marginTop: 10 }}>{sync.lastError}</div>
          ) : null}
        </Card>

        {syncStatus === 'conflict' ? (
          <Card className="card--flat" style={{ borderColor: 'var(--bad)' }}>
            <div className="bold" style={{ marginBottom: 6 }}>Both sides changed</div>
            <div className="small muted" style={{ marginBottom: 12 }}>
              Another device saved to the server after this one last synced, so neither copy is
              simply newer. Nothing has been overwritten. Choose which side to keep; the other
              is still recoverable from the version list below.
            </div>
            <div className="btn-grid">
              <button type="button" className="btn btn--primary" disabled={busy === 'pull'} onClick={doPull}>
                <IconDownload /> Keep the server&rsquo;s
              </button>
              <button type="button" className="btn" disabled={busy === 'push'} onClick={() => doPush(true)}>
                <IconUpload /> Keep this device&rsquo;s
              </button>
            </div>
          </Card>
        ) : null}

        {syncStatus === 'behind' ? (
          <Card className="card--flat" style={{ borderColor: 'var(--warn)' }}>
            <div className="bold" style={{ marginBottom: 6 }}>The server has newer data</div>
            <div className="small muted" style={{ marginBottom: 12 }}>
              {serverMeta && serverMeta.device
                ? `Saved by ${serverMeta.device} on ${whenText(serverMeta.updatedAt)}.`
                : 'Another device has saved since this one last synced.'}
              {' '}Pull it before working here, or this device&rsquo;s next change will conflict.
            </div>
            <button type="button" className="btn btn--primary btn--block" disabled={busy === 'pull'} onClick={doPull}>
              <IconDownload /> Pull from server
            </button>
          </Card>
        ) : null}

        <Card className="card--flat">
          <Switch
            checked={sync.enabled}
            onChange={(on) => setSync({ enabled: on })}
            label="Sync with my server"
            hint="Changes are saved to the server in the background. The app still works offline."
          />
        </Card>

        <Card className="card--flat">
          <div className="stack-sm">
            <TextInput
              label="Server address"
              placeholder="https://mac-mini.your-tailnet.ts.net"
              hint="The HTTPS address from tailscale serve."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setTestResult(null); }}
              autoComplete="off"
              inputMode="url"
            />
            <TextInput
              label="Token"
              type="password"
              placeholder="printed by the server on startup"
              value={token}
              onChange={(e) => { setToken(e.target.value); setTestResult(null); }}
              autoComplete="off"
            />
            <TextInput
              label="Name for this device"
              placeholder={guessDeviceName()}
              hint="Shown in the version list so you can tell which device saved what."
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
          </div>
          {testResult ? (
            <div className={`banner banner--${testResult.ok ? 'good' : 'bad'}`} style={{ marginTop: 12 }}>
              {testResult.message}
            </div>
          ) : null}
          <div className="btn-grid" style={{ marginTop: 12 }}>
            <button type="button" className="btn" disabled={testing} onClick={test}>
              {testing ? 'Testing…' : 'Test connection'}
            </button>
            <button type="button" className="btn btn--primary" disabled={!dirty} onClick={save}>
              Save settings
            </button>
          </div>
        </Card>

        {configured ? (
          <Card className="card--flat">
            <div className="bold" style={{ marginBottom: 10 }}>Manual</div>
            <div className="btn-grid">
              <button type="button" className="btn" disabled={busy === 'push'} onClick={() => doPush(false)}>
                <IconUpload /> Push now
              </button>
              <button type="button" className="btn" disabled={busy === 'pull'} onClick={doPull}>
                <IconDownload /> Pull now
              </button>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              style={{ marginTop: 8 }}
              onClick={refreshMeta}
            >
              <IconRefresh /> Check the server
            </button>
          </Card>
        ) : null}

        {configured ? (
          <Card className="card--flat">
            <div className="bold" style={{ marginBottom: 6 }}>Version history</div>
            <div className="small muted" style={{ marginBottom: 10 }}>
              The server keeps the recent saves. Restoring replaces what is on this device.
            </div>
            {versions === null ? (
              <button
                type="button"
                className="btn btn--block"
                disabled={busy === 'versions'}
                onClick={loadVersions}
              >
                {busy === 'versions' ? 'Loading…' : 'Show versions'}
              </button>
            ) : versions.length === 0 ? (
              <div className="small muted">Nothing stored on the server yet.</div>
            ) : (
              <div className="stack-sm">
                {versions.map((v) => (
                  <div className="row row--tight" key={v.version}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="bold">Version {v.version}</span>
                      <span className="tiny faint" style={{ display: 'block' }}>
                        {v.device} &middot; {whenText(v.updatedAt)} &middot; {(v.bytes / 1024).toFixed(1)} kB
                      </span>
                    </span>
                    <ConfirmButton
                      className="btn btn--sm"
                      confirmLabel="Tap again to restore"
                      onConfirm={() => restore(v.version)}
                    >
                      Restore
                    </ConfirmButton>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        <div className="tiny faint">
          The server address and token stay on this device. They are not included in the JSON
          backup and are never sent to another device.
        </div>
      </div>
    </Sheet>
  );
}
