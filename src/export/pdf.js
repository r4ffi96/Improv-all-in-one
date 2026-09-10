import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PRINT, rgbFromHex } from './printTheme.js';
import { getStrings } from './labels.js';

/* ------------------------------------------------------------------ */
/* WinAnsi safety                                                      */
/* ------------------------------------------------------------------ */

// pdf-lib's standard fonts are WinAnsi encoded. Guillemets, en/em dashes and
// curly quotes are all covered; arrows and similar are not, so they get
// mapped to an ASCII equivalent rather than throwing at draw time.
const WIN_ANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

const CHAR_MAP = {
  '→': '->', '←': '<-', '↔': '<->', '⇒': '=>',
  '–': '–', '≤': '<=', '≥': '>=', '≈': '~',
  '×': 'x', '✓': 'v', '✗': 'x', '‑': '-',
  ' ': ' ', ' ': ' ', ' ': ' ', '​': '',
  '′': "'", '″': '"',
};

function isWinAnsi(cp) {
  return (cp >= 32 && cp <= 126) || (cp >= 160 && cp <= 255) || WIN_ANSI_EXTRA.has(cp);
}

export function sanitize(input) {
  const text = String(input == null ? '' : input);
  let out = '';
  for (const ch of text) {
    if (ch === '\n' || ch === '\t') {
      out += ch;
      continue;
    }
    if (CHAR_MAP[ch] !== undefined) {
      out += CHAR_MAP[ch];
      continue;
    }
    const cp = ch.codePointAt(0);
    if (isWinAnsi(cp)) {
      out += ch;
      continue;
    }
    const folded = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
    for (const f of folded) {
      if (isWinAnsi(f.codePointAt(0))) out += f;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

const C = PRINT.color;
const S = PRINT.size;
const col = (hexStr) => {
  const { r, g, b } = rgbFromHex(hexStr);
  return rgb(r, g, b);
};

class PdfRenderer {
  constructor(doc, pdf, fonts) {
    this.doc = doc;
    this.pdf = pdf;
    this.f = fonts;
    this.strings = getStrings(doc.lang);
    this.pages = [];
    this.page = null;
    this.y = 0;

    // Compact mode is used by single-page documents such as the Player Guide.
    this.compact = Boolean(doc.compact);
    const k = this.compact ? 0.88 : 1;
    this.S = Object.fromEntries(
      Object.entries(S).map(([key, value]) => [key, key === 'title' ? value * (this.compact ? 0.92 : 1) : value * k]),
    );
    this.lead = this.compact ? 1.3 : PRINT.lead;
    this.blockGap = this.compact ? 6 : PRINT.blockGap;
    this.sectionGap = this.compact ? 9 : PRINT.sectionGapBefore;
    this.rowUnit = this.compact ? 0.82 : 1;
  }

  get left() { return PRINT.margin.left; }
  get right() { return PRINT.page.width - PRINT.margin.right; }
  get width() { return this.right - this.left; }
  get bottom() { return PRINT.margin.bottom; }

  newPage() {
    this.page = this.pdf.addPage([PRINT.page.width, PRINT.page.height]);
    this.pages.push(this.page);
    this.y = PRINT.page.height - PRINT.margin.top;
    return this.page;
  }

  /** Make sure `h` points are available, otherwise start a page. */
  need(h) {
    if (!this.page) this.newPage();
    if (this.y - h < this.bottom) this.newPage();
  }

  measure(text, font, size) {
    return font.widthOfTextAtSize(sanitize(text), size);
  }

  /** Wrap one logical line into rendered lines that fit `maxWidth`. */
  wrap(text, font, size, maxWidth) {
    const clean = sanitize(text).replace(/\r/g, '');
    const out = [];
    for (const para of clean.split('\n')) {
      if (!para.trim()) {
        out.push('');
        continue;
      }
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !line) {
          // A single word wider than the column gets hard-split.
          if (!line && font.widthOfTextAtSize(word, size) > maxWidth) {
            let chunk = '';
            for (const ch of word) {
              if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
                out.push(chunk);
                chunk = ch;
              } else {
                chunk += ch;
              }
            }
            line = chunk;
          } else {
            line = candidate;
          }
        } else {
          out.push(line);
          line = word;
        }
      }
      if (line) out.push(line);
    }
    return out;
  }

  text(str, x, y, { font, size, color }) {
    this.page.drawText(sanitize(str), { x, y, size, font, color: col(color) });
  }

  /** Draw wrapped lines with automatic page breaks. */
  flowLines(lines, { x, width, font, size, color, lead = null, indent = 0 }) {
    const lh = size * (lead || this.lead);
    for (const line of lines) {
      this.need(lh);
      if (line) this.text(line, x + indent, this.y - size, { font, size, color });
      this.y -= lh;
    }
    void width;
  }

  rect(x, y, w, h, { fill, border, borderWidth = 0.7 }) {
    this.page.drawRectangle({
      x, y, width: w, height: h,
      color: fill ? col(fill) : undefined,
      borderColor: border ? col(border) : undefined,
      borderWidth: border ? borderWidth : 0,
    });
  }

  line(x1, y1, x2, y2, colorHex, thickness = 0.7) {
    this.page.drawLine({
      start: { x: x1, y: y1 }, end: { x: x2, y: y2 },
      thickness, color: col(colorHex),
    });
  }

  /* --------------------------- header --------------------------- */

  renderHeader() {
    this.newPage();
    const titleLines = this.wrap(this.doc.title, this.f.bold, this.S.title, this.width);
    for (const line of titleLines) {
      this.need(this.S.title * 1.2);
      this.text(line, this.left, this.y - this.S.title, {
        font: this.f.bold, size: this.S.title, color: C.title,
      });
      this.y -= this.S.title * 1.2;
    }

    if (this.doc.subtitle) {
      this.y -= 3;
      const subLines = this.wrap(this.doc.subtitle, this.f.regular, this.S.subtitle, this.width);
      for (const line of subLines) {
        this.need(this.S.subtitle * 1.35);
        this.text(line, this.left, this.y - this.S.subtitle, {
          font: this.f.regular, size: this.S.subtitle, color: C.subtitle,
        });
        this.y -= this.S.subtitle * 1.35;
      }
    }

    // Horizontal rule under the header block.
    this.y -= 9;
    this.line(this.left, this.y, this.right, this.y, C.rule, 1);
    this.y -= 14;

    if (this.doc.meta.length) this.renderMetaBlock(this.doc.meta);
  }

  renderMetaBlock(meta) {
    const padX = 12;
    const padY = 9;
    const colGap = 16;
    const inner = this.width - padX * 2;
    const cols = Math.min(meta.length, this.width > 400 ? 4 : 2);
    const colW = (inner - colGap * (cols - 1)) / cols;

    // Lay out into a grid of label/value pairs.
    const cells = meta.map((m) => ({
      label: m.label,
      valueLines: this.wrap(m.value, this.f.bold, this.S.meta, colW),
    }));
    const rows = [];
    for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));

    const rowHeights = rows.map(
      (row) => this.S.meta * 1.25 + Math.max(...row.map((c) => c.valueLines.length)) * this.S.meta * 1.3,
    );
    const boxH = padY * 2 + rowHeights.reduce((a, b) => a + b, 0) + (rows.length - 1) * 6;

    this.need(boxH + 6);
    const top = this.y;
    this.rect(this.left, top - boxH, this.width, boxH, { fill: C.metaBg });

    let cy = top - padY;
    rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const x = this.left + padX + ci * (colW + colGap);
        this.text(cell.label.toUpperCase(), x, cy - this.S.meta, {
          font: this.f.bold, size: this.S.meta - 1.4, color: C.metaLabel,
        });
        let vy = cy - this.S.meta - this.S.meta * 1.25 + 2;
        for (const vline of cell.valueLines) {
          this.text(vline, x, vy, { font: this.f.bold, size: this.S.meta, color: C.metaValue });
          vy -= this.S.meta * 1.3;
        }
      });
      cy -= rowHeights[ri] + 6;
    });

    this.y = top - boxH - this.blockGap - 3;
  }

  /* --------------------------- blocks --------------------------- */

  renderBlock(block) {
    switch (block.t) {
      case 'section': return this.blockSection(block);
      case 'sub': return this.blockSub(block);
      case 'p': return this.blockParagraph(block);
      case 'bullets': return this.blockList(block.items, 'bullet');
      case 'numbered': return this.blockList(block.items, 'number');
      case 'coaching': return this.blockBoxedList(block);
      case 'callout': return this.blockCallout(block);
      case 'kv': return this.blockKv(block);
      case 'agenda': return this.blockAgenda(block);
      case 'table': return this.blockTable(block);
      case 'diagram': return this.blockDiagram(block);
      case 'rule': return this.blockRule();
      case 'space': return this.blockSpace(block);
      case 'pagebreak': return this.newPage();
      default: return undefined;
    }
  }

  blockSection(block) {
    const pillW = block.timing
      ? this.measure(block.timing, this.f.bold, this.S.pill) + 16
      : 0;
    const titleW = this.width - (pillW ? pillW + 12 : 0);
    const lines = this.wrap(block.title, this.f.bold, this.S.section, titleW);
    const blockH = lines.length * this.S.section * 1.28 + 10;

    this.y -= this.sectionGap;
    this.need(blockH + 26);

    const top = this.y;
    lines.forEach((line, i) => {
      this.text(line, this.left, top - this.S.section - i * this.S.section * 1.28, {
        font: this.f.bold, size: this.S.section, color: C.section,
      });
    });

    if (block.timing) {
      const pillH = 15;
      const py = top - pillH + 2;
      this.rect(this.right - pillW, py, pillW, pillH, { fill: C.pillBg });
      const tw = this.measure(block.timing, this.f.bold, this.S.pill);
      this.text(block.timing, this.right - pillW + (pillW - tw) / 2, py + 4.4, {
        font: this.f.bold, size: this.S.pill, color: C.pillText,
      });
    }

    this.y = top - lines.length * this.S.section * 1.28 - 4;
    this.line(this.left, this.y, this.right, this.y, C.sectionRule, 0.8);
    this.y -= 10;
  }

  blockSub(block) {
    this.y -= 4;
    const lines = this.wrap(block.text, this.f.bold, this.S.sub, this.width);
    this.flowLines(lines, {
      x: this.left, width: this.width, font: this.f.bold, size: this.S.sub, color: C.body,
    });
    this.y -= 3;
  }

  blockParagraph(block) {
    const paras = String(block.text).split(/\n{2,}/);
    paras.forEach((para, i) => {
      const lines = this.wrap(para, this.f.regular, this.S.body, this.width);
      this.flowLines(lines, {
        x: this.left, width: this.width, font: this.f.regular, size: this.S.body, color: C.body,
      });
      if (i < paras.length - 1) this.y -= 5;
    });
    this.y -= this.blockGap - 3;
  }

  blockList(items, kind) {
    const markerW = kind === 'number' ? 17 : 12;
    const textW = this.width - markerW;
    items.forEach((item, index) => {
      const lines = this.wrap(item, this.f.regular, this.S.body, textW);
      const lh = this.S.body * this.lead;
      this.need(lh);
      const marker = kind === 'number' ? `${index + 1}.` : '•';
      this.text(marker, this.left, this.y - this.S.body, {
        font: kind === 'number' ? this.f.bold : this.f.regular,
        size: this.S.body,
        color: kind === 'number' ? C.section : C.body,
      });
      lines.forEach((line, li) => {
        if (li > 0) this.need(lh);
        this.text(line, this.left + markerW, this.y - this.S.body, {
          font: this.f.regular, size: this.S.body, color: C.body,
        });
        this.y -= lh;
      });
      this.y -= 2;
    });
    this.y -= this.blockGap - 5;
  }

  /** Cream COACHING FOCUS box. Splits across pages if it has to. */
  blockBoxedList(block) {
    const title = (block.title || this.strings.coachingFocus).toUpperCase();
    const padX = 12;
    const padY = 10;
    const bulletW = 11;
    const innerW = this.width - padX * 2 - bulletW;

    const entries = block.items.map((item) => this.wrap(item, this.f.regular, this.S.body, innerW));
    const lh = this.S.body * this.lead;
    const titleH = this.S.small * 1.6;

    this.y -= 4;

    let index = 0;
    let first = true;
    while (index < entries.length) {
      if (!this.page) this.newPage();
      let avail = this.y - this.bottom - padY * 2 - (first ? titleH : 0);
      if (avail < lh * 2) {
        this.newPage();
        avail = this.y - this.bottom - padY * 2 - (first ? titleH : 0);
      }

      const chunk = [];
      let used = 0;
      while (index < entries.length) {
        const h = entries[index].length * lh + 3;
        if (used + h > avail && chunk.length) break;
        chunk.push(entries[index]);
        used += h;
        index += 1;
      }

      const boxH = padY * 2 + used + (first ? titleH : 0);
      const top = this.y;
      this.rect(this.left, top - boxH, this.width, boxH, {
        fill: C.coachBg, border: C.coachBorder, borderWidth: 0.8,
      });
      this.rect(this.left, top - boxH, 3.2, boxH, { fill: C.coachBorder });

      let cy = top - padY;
      if (first) {
        this.text(title, this.left + padX, cy - this.S.small, {
          font: this.f.bold, size: this.S.small - 0.6, color: C.coachTitle,
        });
        cy -= titleH;
      }
      for (const lines of chunk) {
        this.text('•', this.left + padX, cy - this.S.body, {
          font: this.f.regular, size: this.S.body, color: C.coachTitle,
        });
        lines.forEach((line) => {
          this.text(line, this.left + padX + bulletW, cy - this.S.body, {
            font: this.f.regular, size: this.S.body, color: C.coachBody,
          });
          cy -= lh;
        });
        cy -= 3;
      }

      this.y = top - boxH;
      first = false;
      if (index < entries.length) this.newPage();
    }
    this.y -= this.blockGap;
  }

  /** Cream highlight callout for key theory statements and quotes. */
  blockCallout(block) {
    const padX = 13;
    const padY = 11;
    const innerW = this.width - padX * 2;
    const lines = this.wrap(block.text, this.f.italic, this.S.body + 0.4, innerW);
    const lh = (this.S.body + 0.4) * 1.42;

    this.y -= 4;
    let index = 0;
    while (index < lines.length) {
      if (!this.page) this.newPage();
      let avail = this.y - this.bottom - padY * 2;
      if (avail < lh * 2) {
        this.newPage();
        avail = this.y - this.bottom - padY * 2;
      }
      const count = Math.max(1, Math.min(lines.length - index, Math.floor(avail / lh)));
      const chunk = lines.slice(index, index + count);
      const boxH = padY * 2 + chunk.length * lh;
      const top = this.y;

      this.rect(this.left, top - boxH, this.width, boxH, {
        fill: C.calloutBg, border: C.calloutBorder, borderWidth: 0.8,
      });
      let cy = top - padY;
      for (const line of chunk) {
        this.text(line, this.left + padX, cy - (this.S.body + 0.4), {
          font: this.f.italic, size: this.S.body + 0.4, color: C.calloutText,
        });
        cy -= lh;
      }

      this.y = top - boxH;
      index += count;
      if (index < lines.length) this.newPage();
    }
    this.y -= this.blockGap;
  }

  blockKv(block) {
    const labelW = Math.min(
      124,
      Math.max(...block.rows.map(([k]) => this.measure(k, this.f.bold, this.S.body))) + 12,
    );
    const valueW = this.width - labelW;
    for (const [k, v] of block.rows) {
      const lines = this.wrap(v, this.f.regular, this.S.body, valueW);
      const lh = this.S.body * this.lead;
      this.need(lh);
      this.text(k, this.left, this.y - this.S.body, {
        font: this.f.bold, size: this.S.body, color: C.section,
      });
      lines.forEach((line, i) => {
        if (i > 0) this.need(lh);
        this.text(line, this.left + labelW, this.y - this.S.body, {
          font: this.f.regular, size: this.S.body, color: C.body,
        });
        this.y -= lh;
      });
      this.y -= 2;
    }
    this.y -= this.blockGap - 4;
  }

  blockAgenda(block) {
    const durW = 54;
    const labelW = this.width - durW - 10;
    for (const row of block.rows) {
      const lines = this.wrap(row.label, this.f.bold, this.S.body, labelW);
      const noteLines = row.note ? this.wrap(row.note, this.f.regular, this.S.small, labelW) : [];
      const lh = this.S.body * 1.32;
      const nh = this.S.small * 1.3;
      const h = lines.length * lh + noteLines.length * nh + 7;
      this.need(h);

      const top = this.y;
      lines.forEach((line, i) => {
        this.text(line, this.left, top - this.S.body - i * lh, {
          font: this.f.bold, size: this.S.body, color: C.body,
        });
      });
      if (row.duration) {
        const w = this.measure(row.duration, this.f.bold, this.S.pill);
        const pillW = w + 14;
        this.rect(this.right - pillW, top - 13, pillW, 14, { fill: C.pillBg });
        this.text(row.duration, this.right - pillW + 7, top - 9.6, {
          font: this.f.bold, size: this.S.pill, color: C.pillText,
        });
      }
      let ny = top - lines.length * lh;
      noteLines.forEach((line) => {
        this.text(line, this.left, ny - this.S.small, {
          font: this.f.italic, size: this.S.small, color: C.subtitle,
        });
        ny -= nh;
      });
      this.y = ny - 4;
      this.line(this.left, this.y + 1, this.right, this.y + 1, C.tableLine, 0.5);
      this.y -= 4;
    }
    this.y -= this.blockGap - 4;
  }

  blockTable(block) {
    const cols = block.head.length;
    const colW = this.width / cols;
    const padX = 5;
    const lh = this.S.small * 1.32;

    const drawHead = () => {
      const headLines = block.head.map((h) => this.wrap(h, this.f.bold, this.S.small, colW - padX * 2));
      const hh = Math.max(...headLines.map((l) => l.length)) * lh + 8;
      this.need(hh + lh);
      const top = this.y;
      this.rect(this.left, top - hh, this.width, hh, { fill: C.tableHeadBg });
      headLines.forEach((lines, ci) => {
        lines.forEach((line, li) => {
          this.text(line, this.left + ci * colW + padX, top - 4 - this.S.small - li * lh, {
            font: this.f.bold, size: this.S.small, color: C.section,
          });
        });
      });
      this.y = top - hh;
    };

    drawHead();
    for (const row of block.rows) {
      const cells = row.map((cell) => this.wrap(cell, this.f.regular, this.S.small, colW - padX * 2));
      const rh = Math.max(...cells.map((c) => c.length)) * lh + 7;
      if (this.y - rh < this.bottom) {
        this.newPage();
        drawHead();
      }
      const top = this.y;
      cells.forEach((lines, ci) => {
        lines.forEach((line, li) => {
          this.text(line, this.left + ci * colW + padX, top - 4 - this.S.small - li * lh, {
            font: this.f.regular, size: this.S.small, color: C.body,
          });
        });
      });
      this.y = top - rh;
      this.line(this.left, this.y, this.right, this.y, C.tableLine, 0.5);
    }
    this.y -= this.blockGap;
  }

  /** Harold structure, drawn with primitives rather than an image asset. */
  blockDiagram(block) {
    if (block.kind !== 'harold') return;
    const rowH = 21 * this.rowUnit;
    const gap = 9 * this.rowUnit;
    const rows = 6;
    const total = rows * rowH + (rows - 1) * gap + 16;
    this.need(total);

    const top = this.y;
    let y = top;
    const w = this.width;
    const triW = (w - gap * 2) / 3;

    const box = (x, yy, ww, label, accent) => {
      this.rect(x, yy - rowH, ww, rowH, {
        fill: accent ? C.diagramAccent : C.diagramBox,
        border: accent ? C.diagramAccentLine : C.diagramBoxLine,
        borderWidth: 0.8,
      });
      const size = this.S.small - 0.3;
      const tw = this.measure(label, this.f.bold, size);
      this.text(label, x + Math.max(4, (ww - tw) / 2), yy - rowH + (rowH - size) / 2 + 1.6, {
        font: this.f.bold, size, color: C.diagramText,
      });
    };

    const connector = (yy) => {
      this.line(this.left + w / 2, yy, this.left + w / 2, yy - gap, C.diagramBoxLine, 0.7);
    };

    box(this.left, y, w, 'Opening / Invocation', false);
    connector(y - rowH); y -= rowH + gap;

    ['A1', 'B1', 'C1'].forEach((label, i) => box(this.left + i * (triW + gap), y, triW, label, false));
    connector(y - rowH); y -= rowH + gap;

    box(this.left, y, w, 'Group Game 1', true);
    connector(y - rowH); y -= rowH + gap;

    ['A2', 'B2', 'C2'].forEach((label, i) => box(this.left + i * (triW + gap), y, triW, label, false));
    connector(y - rowH); y -= rowH + gap;

    box(this.left, y, w, 'Group Game 2', true);
    connector(y - rowH); y -= rowH + gap;

    ['A3', 'B3', 'C3'].forEach((label, i) => box(this.left + i * (triW + gap), y, triW, label, false));
    y -= rowH;

    const caption = 'Beat 1 finds the game. Beat 2 heightens it. Beat 3 lets the worlds touch and the callbacks land.';
    y -= 4;
    const capLines = this.wrap(caption, this.f.italic, this.S.small - 0.5, w);
    capLines.forEach((line) => {
      this.text(line, this.left, y - (this.S.small - 0.5), {
        font: this.f.italic, size: this.S.small - 0.5, color: C.subtitle,
      });
      y -= (this.S.small - 0.5) * 1.3;
    });

    this.y = y - this.blockGap;
  }

  blockRule() {
    this.need(10);
    this.y -= 4;
    this.line(this.left, this.y, this.right, this.y, C.rule, 0.8);
    this.y -= 8;
  }

  blockSpace(block) {
    this.y -= block.h || 6;
  }

  /* --------------------------- footer --------------------------- */

  renderFooters() {
    const total = this.pages.length;
    this.pages.forEach((page, i) => {
      const y = PRINT.margin.bottom - 22;
      page.drawLine({
        start: { x: this.left, y: y + 14 },
        end: { x: this.right, y: y + 14 },
        thickness: 0.5,
        color: col(C.tableLine),
      });
      page.drawText(sanitize(this.strings.author), {
        x: this.left, y, size: this.S.footer, font: this.f.regular, color: col(C.footer),
      });
      const label = `${i + 1} / ${total}`;
      const w = this.f.regular.widthOfTextAtSize(label, this.S.footer);
      page.drawText(label, {
        x: this.right - w, y, size: this.S.footer, font: this.f.regular, color: col(C.footer),
      });
    });
  }
}

/** Render a document model to PDF bytes. */
export async function renderPdf(doc) {
  const pdf = await PDFDocument.create();
  const fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };

  pdf.setTitle(sanitize(doc.title));
  pdf.setAuthor(getStrings(doc.lang).author);
  pdf.setCreator(getStrings(doc.lang).author);
  pdf.setProducer('Improv All-in-One');

  const r = new PdfRenderer(doc, pdf, fonts);
  r.renderHeader();
  for (const block of doc.blocks) r.renderBlock(block);
  r.renderFooters();

  return pdf.save();
}
