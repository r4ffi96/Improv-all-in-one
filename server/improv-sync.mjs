#!/usr/bin/env node
/**
 * Improv All-in-One sync server.
 *
 * A single-user backup and sync endpoint for the webapp. Deliberately tiny:
 * no dependencies, no database, no build step. State is one JSON blob per
 * version, written atomically, with the recent versions kept for rollback.
 *
 * It listens on localhost only. Put it on your tailnet with:
 *   tailscale serve --bg --https=443 http://127.0.0.1:8787
 * which also gives it a real HTTPS certificate, without which the browser
 * blocks the app (served over HTTPS) from calling it.
 *
 * Usage:
 *   node improv-sync.mjs
 *
 * Environment:
 *   IMPROV_SYNC_PORT     default 8787
 *   IMPROV_SYNC_HOST     default 127.0.0.1
 *   IMPROV_SYNC_DIR      default ~/.improv-all-in-one
 *   IMPROV_SYNC_TOKEN    shared secret; generated and stored on first run
 *   IMPROV_SYNC_ORIGINS  comma-separated allowed origins
 *   IMPROV_SYNC_KEEP     versions to retain, default 50
 */

import http from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const PORT = Number(process.env.IMPROV_SYNC_PORT || 8787);
const HOST = process.env.IMPROV_SYNC_HOST || '127.0.0.1';
const DIR = process.env.IMPROV_SYNC_DIR || path.join(os.homedir(), '.improv-all-in-one');
const KEEP = Number(process.env.IMPROV_SYNC_KEEP || 50);
const MAX_BODY = 8 * 1024 * 1024; // the whole app state is far under a megabyte

const DEFAULT_ORIGINS = [
  'https://r4ffi96.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];
const ORIGINS = (process.env.IMPROV_SYNC_ORIGINS || '')
  .split(',').map((o) => o.trim()).filter(Boolean);
const ALLOWED = ORIGINS.length ? ORIGINS : DEFAULT_ORIGINS;

const VERSIONS_DIR = path.join(DIR, 'versions');
const META_FILE = path.join(DIR, 'meta.json');
const CONFIG_FILE = path.join(DIR, 'config.json');

/* ------------------------------------------------------------------ */
/* storage                                                             */
/* ------------------------------------------------------------------ */

async function ensureDirs() {
  await fs.mkdir(VERSIONS_DIR, { recursive: true });
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/** Write via a temp file and rename, so a crash never leaves a half file. */
async function writeJsonAtomic(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value), 'utf8');
  await fs.rename(tmp, file);
}

const emptyMeta = () => ({ version: 0, updatedAt: null, device: null, bytes: 0, hash: null });

const readMeta = () => readJson(META_FILE, emptyMeta());

const versionFile = (version) => path.join(VERSIONS_DIR, `${String(version).padStart(6, '0')}.json`);

async function writeVersion(data, device) {
  const meta = await readMeta();
  const version = meta.version + 1;
  const body = JSON.stringify(data);
  const record = {
    version,
    updatedAt: new Date().toISOString(),
    device: device || 'unknown',
    bytes: Buffer.byteLength(body),
    hash: createHash('sha256').update(body).digest('hex').slice(0, 16),
  };
  await writeJsonAtomic(versionFile(version), { ...record, data });
  await writeJsonAtomic(META_FILE, record);
  await pruneVersions(version);
  return record;
}

async function pruneVersions(latest) {
  if (!Number.isFinite(KEEP) || KEEP <= 0) return;
  const cutoff = latest - KEEP;
  if (cutoff < 1) return;
  const entries = await fs.readdir(VERSIONS_DIR).catch(() => []);
  await Promise.all(entries.map(async (name) => {
    const n = Number(name.replace('.json', ''));
    if (Number.isFinite(n) && n <= cutoff) {
      await fs.rm(path.join(VERSIONS_DIR, name), { force: true });
    }
  }));
}

async function listVersions() {
  const entries = await fs.readdir(VERSIONS_DIR).catch(() => []);
  const out = [];
  for (const name of entries.sort().reverse()) {
    const record = await readJson(path.join(VERSIONS_DIR, name));
    if (!record) continue;
    const { data, ...rest } = record;
    void data;
    out.push(rest);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* auth                                                                */
/* ------------------------------------------------------------------ */

async function loadToken() {
  if (process.env.IMPROV_SYNC_TOKEN) return process.env.IMPROV_SYNC_TOKEN;
  const config = await readJson(CONFIG_FILE);
  if (config && config.token) return config.token;
  const token = randomBytes(24).toString('base64url');
  await writeJsonAtomic(CONFIG_FILE, { token, createdAt: new Date().toISOString() });
  await fs.chmod(CONFIG_FILE, 0o600).catch(() => {});
  return token;
}

function tokenMatches(given, expected) {
  const a = Buffer.from(String(given || ''));
  const b = Buffer.from(expected);
  // Compare hashes so the lengths always match and the comparison stays
  // constant-time regardless of what was sent.
  return timingSafeEqual(
    createHash('sha256').update(a).digest(),
    createHash('sha256').update(b).digest(),
  );
}

/* ------------------------------------------------------------------ */
/* http                                                                */
/* ------------------------------------------------------------------ */

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let aborted = false;
    req.on('data', (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > MAX_BODY) {
        aborted = true;
        chunks.length = 0;
        // Drain rather than destroy, so the 413 response still reaches the
        // client instead of the socket dying mid-request.
        req.resume();
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(Object.assign(new Error('Body is not valid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

async function handle(req, res, token) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/health') {
    send(res, 200, { ok: true, service: 'improv-sync' });
    return;
  }

  if (!tokenMatches((req.headers.authorization || '').replace(/^Bearer\s+/i, ''), token)) {
    send(res, 401, { error: 'Bad or missing token' });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/meta') {
    send(res, 200, await readMeta());
    return;
  }

  if (req.method === 'GET' && pathname === '/api/state') {
    const meta = await readMeta();
    if (!meta.version) {
      send(res, 404, { error: 'Nothing stored yet', ...emptyMeta() });
      return;
    }
    const record = await readJson(versionFile(meta.version));
    if (!record) {
      send(res, 500, { error: 'Stored version is missing on disk' });
      return;
    }
    send(res, 200, record);
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/state') {
    const body = await readBody(req);
    if (!body || typeof body.data !== 'object' || body.data === null) {
      send(res, 400, { error: 'Expected { data: object }' });
      return;
    }
    const meta = await readMeta();
    const force = url.searchParams.get('force') === '1';
    // A push carrying a stale baseVersion means the other device wrote first.
    // Refuse rather than overwrite, and let the app offer the choice.
    if (!force && body.baseVersion !== undefined && body.baseVersion !== meta.version) {
      send(res, 409, { error: 'Server has newer state', ...meta });
      return;
    }
    send(res, 200, await writeVersion(body.data, body.device));
    return;
  }

  if (req.method === 'GET' && pathname === '/api/versions') {
    send(res, 200, { versions: await listVersions() });
    return;
  }

  const match = pathname.match(/^\/api\/versions\/(\d+)$/);
  if (req.method === 'GET' && match) {
    const record = await readJson(versionFile(Number(match[1])));
    if (!record) {
      send(res, 404, { error: 'No such version' });
      return;
    }
    send(res, 200, record);
    return;
  }

  send(res, 404, { error: 'Not found' });
}

/* ------------------------------------------------------------------ */

async function main() {
  await ensureDirs();
  const token = await loadToken();

  const server = http.createServer((req, res) => {
    cors(req, res);
    handle(req, res, token).catch((err) => {
      const status = err.status || 500;
      if (status >= 500) console.error('[improv-sync]', err);
      send(res, status, { error: err.message || 'Server error' });
    });
  });

  server.listen(PORT, HOST, async () => {
    const meta = await readMeta();
    console.log(`improv-sync listening on http://${HOST}:${PORT}`);
    console.log(`data directory: ${DIR}`);
    console.log(`stored versions: ${meta.version} (latest ${meta.updatedAt || 'none'})`);
    console.log('');
    console.log('Paste this into the app under Settings > Sync:');
    console.log(`  token: ${token}`);
    console.log('');
    console.log('Expose it on your tailnet with:');
    console.log(`  tailscale serve --bg --https=443 http://127.0.0.1:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
