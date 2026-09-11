import { useState } from 'react';
import { verifyPassphrase } from '../lib/editLock.js';
import { Sheet, TextInput } from './ui.jsx';

/**
 * Passphrase prompt in front of any action that changes saved data.
 * Unlocking lasts until the app is reloaded, so a working session only needs
 * it once however many things are saved, deleted or starred.
 */
export default function UnlockSheet({ onClose, onUnlocked }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (!value || checking) return;
    setChecking(true);
    setError('');
    const ok = await verifyPassphrase(value);
    setChecking(false);
    if (ok) {
      onUnlocked();
      return;
    }
    setError('That passphrase does not match.');
    setValue('');
  };

  return (
    <Sheet
      title="Locked"
      subtitle="Enter the passphrase to change saved data."
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!value || checking}
          onClick={submit}
        >
          {checking ? 'Checking…' : 'Unlock'}
        </button>
      }
    >
      <TextInput
        label="Passphrase"
        type="password"
        autoComplete="current-password"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        autoFocus
      />
      {error ? (
        <div className="banner banner--bad" style={{ marginTop: 12 }}>{error}</div>
      ) : null}
      <div className="small muted" style={{ marginTop: 12 }}>
        Covers saving to the archive, deleting from it, starring, clearing and
        importing, until you reload the app. Browsing, exporting and building a
        session are never locked.
      </div>
    </Sheet>
  );
}
