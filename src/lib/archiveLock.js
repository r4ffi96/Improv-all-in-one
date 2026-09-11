/**
 * Casual lock on saving to the archive.
 *
 * This is a gate, not security. The app is client-side only, so anyone with
 * the browser devtools can read the bundle, skip the check or write to
 * localStorage directly. The passphrase is stored as a salted hash rather
 * than in plain text purely so it is not sitting readable in the bundle.
 *
 * To change the passphrase, hash the new one with the same salt and replace
 * both constants below:
 *   node -e "const c=require('node:crypto');const s='improv-all-in-one/archive';
 *   const p='YOUR PASSPHRASE';
 *   console.log(c.createHash('sha256').update(s+p).digest('hex'));
 *   let h=5381;for(const ch of (s+p))h=((h*33)^ch.codePointAt(0))>>>0;
 *   console.log(h.toString(16));"
 */

const SALT = 'improv-all-in-one/archive';
const SHA256 = 'd4dc25e05739bac30a29b73857540255145bfd50406580f3bd56290898e70b88';
const FALLBACK = 'd82b2af3';

/** djb2 over the salted input, used where Web Crypto is unavailable. */
function weakHash(input) {
  let h = 5381;
  for (const ch of input) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0;
  return h.toString(16);
}

async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check a passphrase. Uses SHA-256 where the browser offers it, which needs
 * a secure context; over plain http it falls back to the weaker hash so the
 * app still works on a local network.
 */
export async function verifyPassphrase(input) {
  const salted = SALT + String(input || '');
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      return (await sha256Hex(salted)) === SHA256;
    } catch {
      // fall through to the non-crypto path
    }
  }
  return weakHash(salted) === FALLBACK;
}
