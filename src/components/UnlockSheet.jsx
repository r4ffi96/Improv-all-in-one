import { useState } from 'react';
import { verifyPassphrase } from '../lib/archiveLock.js';
import { Sheet, TextInput } from './ui.jsx';

/**
 * Passphrase prompt in front of saving to the archive. Unlocking lasts until
 * the app is reloaded, so a session of saves only needs it once.
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
      title="Archive locked"
      subtitle="Enter the passphrase to save."
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
        Unlocks saving until you reload the app. Browsing, exporting and debriefing
        are not affected.
      </div>
    </Sheet>
  );
}
