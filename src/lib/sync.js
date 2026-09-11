/**
 * Talking to the sync server.
 *
 * The app stays local-first: localStorage remains the source of truth and
 * everything keeps working when the server is unreachable. Pushes are
 * best-effort backups of the whole state; pulls are explicit.
 *
 * Conflicts are never resolved silently. A push carries the server version
 * it was based on, and the server refuses a stale one, so the app can ask
 * which side should win.
 */

/** Fields that describe this device's relationship to the server, not the data. */
export const SYNC_KEYS = ['sync'];

export function defaultSync() {
  return {
    url: '',
    token: '',
    enabled: false,
    deviceName: '',
    syncedVersion: 0,      // the server version this device last agreed with
    lastPushedAt: null,
    lastPulledAt: null,
    lastError: null,
  };
}

/** A sensible default label so the version list says where a change came from. */
export function guessDeviceName() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  return 'browser';
}

function baseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

export function describeUrlProblem(url, token) {
  const clean = baseUrl(url);
  if (!clean) return 'Enter the server address.';
  let parsed;
  try {
    parsed = new URL(clean);
  } catch {
    return 'That is not a valid address.';
  }
  if (!/^https?:$/.test(parsed.protocol)) return 'The address must start with http:// or https://';
  // A page served over HTTPS cannot call a plain http:// address; the browser
  // blocks it as mixed content before the request is even made.
  if (
    typeof window !== 'undefined'
    && window.location.protocol === 'https:'
    && parsed.protocol === 'http:'
    && !/^(localhost|127\.0\.0\.1)$/.test(parsed.hostname)
  ) {
    return 'This app is served over HTTPS, so it cannot reach an http:// server. '
      + 'Put the server behind HTTPS (tailscale serve does this) and use that address.';
  }
  if (!token) return 'Enter the token the server printed on startup.';
  return null;
}

async function call(sync, path, { method = 'GET', body, signal } = {}) {
  const url = `${baseUrl(sync.url)}${path}`;
  const res = await fetch(url, {
    method,
    signal,
    headers: {
      Authorization: `Bearer ${sync.token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const error = new Error(
      res.status === 401 ? 'The token was rejected.'
        : (payload && payload.error) || `Server returned ${res.status}.`,
    );
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function checkConnection(sync) {
  const res = await fetch(`${baseUrl(sync.url)}/api/health`);
  if (!res.ok) throw new Error(`Server returned ${res.status}.`);
  const health = await res.json().catch(() => null);
  if (!health || health.service !== 'improv-sync') {
    throw new Error('That address answered, but it is not an improv-sync server.');
  }
  // Confirm the token as well, so a bad one is caught here rather than later.
  return call(sync, '/api/meta');
}

export const fetchMeta = (sync, signal) => call(sync, '/api/meta', { signal });

export const fetchState = (sync) => call(sync, '/api/state');

export function pushState(sync, data, { force = false } = {}) {
  return call(sync, `/api/state${force ? '?force=1' : ''}`, {
    method: 'PUT',
    body: {
      data,
      device: sync.deviceName || guessDeviceName(),
      ...(force ? {} : { baseVersion: sync.syncedVersion || 0 }),
    },
  });
}

export const fetchVersions = (sync) => call(sync, '/api/versions');

export const fetchVersion = (sync, version) => call(sync, `/api/versions/${version}`);

/** Strip the per-device sync settings so they are never copied between devices. */
export function syncablePart(state) {
  const copy = { ...state };
  SYNC_KEYS.forEach((key) => { delete copy[key]; });
  return copy;
}
