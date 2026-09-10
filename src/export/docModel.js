/**
 * The shared document model. Every export in the app (Trainer Guide,
 * Player Guide, Format Forge worksheet) builds one of these and hands it to
 * the PDF or DOCX renderer, so the Global Visual Template lives in exactly
 * one place.
 *
 * Document:
 *   { title, subtitle, meta: [{label, value}], lang, blocks: Block[] }
 *
 * Blocks:
 *   { t: 'section',  title, timing? }        blue header + yellow timing pill
 *   { t: 'sub',      text }                  bold sub-heading
 *   { t: 'p',        text }                  paragraph (\n\n splits)
 *   { t: 'bullets',  items }                 bulleted list
 *   { t: 'numbered', items }                 numbered list
 *   { t: 'coaching', title?, items }         cream COACHING FOCUS box
 *   { t: 'callout',  text }                  cream highlight callout
 *   { t: 'kv',       rows: [[k, v]] }        label / value lines
 *   { t: 'agenda',   rows: [{label, duration, note?}] }
 *   { t: 'table',    head: [], rows: [[]] }
 *   { t: 'diagram',  kind: 'harold' }
 *   { t: 'rule' }
 *   { t: 'space',    h? }
 *   { t: 'pagebreak' }
 */

export const B = {
  section: (title, timing) => ({ t: 'section', title, timing }),
  sub: (text) => ({ t: 'sub', text }),
  p: (text) => ({ t: 'p', text }),
  bullets: (items) => ({ t: 'bullets', items: items.filter(Boolean) }),
  numbered: (items) => ({ t: 'numbered', items: items.filter(Boolean) }),
  coaching: (items, title) => ({ t: 'coaching', items: items.filter(Boolean), title }),
  callout: (text) => ({ t: 'callout', text }),
  kv: (rows) => ({ t: 'kv', rows: rows.filter((r) => r && r[1]) }),
  agenda: (rows) => ({ t: 'agenda', rows }),
  table: (head, rows) => ({ t: 'table', head, rows }),
  diagram: (kind) => ({ t: 'diagram', kind }),
  rule: () => ({ t: 'rule' }),
  space: (h = 6) => ({ t: 'space', h }),
  pagebreak: () => ({ t: 'pagebreak' }),
};

/** Drop empty blocks so callers can build lists with conditionals. */
export function compact(blocks) {
  return blocks.filter((b) => {
    if (!b) return false;
    if (b.t === 'bullets' || b.t === 'numbered' || b.t === 'coaching') return b.items.length > 0;
    if (b.t === 'kv') return b.rows.length > 0;
    if (b.t === 'agenda' || b.t === 'table') return b.rows.length > 0;
    if (b.t === 'p' || b.t === 'callout' || b.t === 'sub') return Boolean(String(b.text || '').trim());
    return true;
  });
}

export function buildDocument({ title, subtitle, meta = [], blocks = [], lang = 'en', fileBase, compact: isCompact = false }) {
  return {
    title,
    subtitle: subtitle || '',
    meta: meta.filter((m) => m && m.value),
    blocks: compact(blocks),
    lang,
    compact: isCompact,
    fileBase: fileBase || slugify(title),
  };
}

export function slugify(text) {
  return String(text || 'document')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[«»"'']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 70) || 'document';
}

/** Quote a spoken line with German guillemets, used in both languages. */
export const quote = (text) => `«${text}»`;

export function formatMinutes(minutes, strings) {
  const n = Math.round(Number(minutes) || 0);
  if (n < 60) return `${n} ${strings.min}`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} ${strings.min}`;
}

export function todayISO() {
  const d = new Date();
  const p = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function prettyDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
