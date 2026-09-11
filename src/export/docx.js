import {
  AlignmentType, BorderStyle, Document, Footer, Packer, PageNumber, Paragraph,
  ShadingType, Table, TableCell, TableRow, TabStopPosition, TabStopType, TextRun,
  VerticalAlign, WidthType,
} from 'docx';
import { PRINT, hex } from './printTheme.js';
import { getStrings } from './labels.js';

const C = PRINT.color;
const S = PRINT.size;

/* docx sizes are half-points; twips are 1/20 pt. */
const hp = (pt) => Math.round(pt * 2);
const tw = (pt) => Math.round(pt * 20);

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
};
const solid = (color, size = 6) => ({ style: BorderStyle.SINGLE, size, color: hex(color) });

const shading = (color) => ({ type: ShadingType.CLEAR, color: 'auto', fill: hex(color) });

function run(text, opts = {}) {
  return new TextRun({
    text: String(text == null ? '' : text),
    bold: opts.bold,
    italics: opts.italics,
    color: hex(opts.color || C.body),
    size: hp(opts.size || S.body),
    allCaps: opts.allCaps,
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: Array.isArray(text) ? text : [run(text, opts)],
    spacing: { before: tw(opts.before || 0), after: tw(opts.after == null ? 4 : opts.after), line: 264 },
    alignment: opts.align,
    bullet: opts.bullet ? { level: 0 } : undefined,
    indent: opts.indent,
    border: opts.border,
    keepNext: opts.keepNext,
  });
}

/** Multi-paragraph text, split on blank lines and single newlines. */
function textParagraphs(text, opts = {}) {
  return String(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => para(line, opts));
}

function fullWidthTable(rows, opts = {}) {
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: opts.borders || noBorders,
    margins: opts.margins || { top: tw(5), bottom: tw(5), left: tw(7), right: tw(7) },
  });
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function sectionBlock(block) {
  const cells = [
    new TableCell({
      children: [para(block.title, { bold: true, size: S.section, color: C.section, after: 0 })],
      width: { size: block.timing ? 78 : 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      verticalAlign: VerticalAlign.CENTER,
    }),
  ];
  if (block.timing) {
    cells.push(
      new TableCell({
        children: [
          para(block.timing, {
            bold: true, size: S.pill, color: C.pillText, align: AlignmentType.CENTER, after: 0,
          }),
        ],
        width: { size: 22, type: WidthType.PERCENTAGE },
        shading: shading(C.pillBg),
        borders: noBorders,
        verticalAlign: VerticalAlign.CENTER,
      }),
    );
  }
  return [
    new Paragraph({ text: '', spacing: { after: tw(6) } }),
    fullWidthTable([new TableRow({ children: cells })]),
    new Paragraph({
      text: '',
      spacing: { after: tw(7) },
      border: { bottom: solid(C.sectionRule, 6) },
    }),
  ];
}

function boxTable(children, { fill, border }) {
  return fullWidthTable(
    [
      new TableRow({
        children: [
          new TableCell({
            children,
            shading: shading(fill),
            borders: {
              top: solid(border, 6), bottom: solid(border, 6),
              left: solid(border, 18), right: solid(border, 6),
            },
          }),
        ],
      }),
    ],
    { margins: { top: tw(7), bottom: tw(7), left: tw(9), right: tw(9) } },
  );
}

function coachingBlock(block, strings) {
  const children = [
    para(block.title || strings.coachingFocus, {
      bold: true, size: S.small - 0.6, color: C.coachTitle, allCaps: true, after: 4,
    }),
    ...block.items.map((item) => para(item, { color: C.coachBody, bullet: true, after: 2 })),
  ];
  return [boxTable(children, { fill: C.coachBg, border: C.coachBorder }), spacer()];
}

function calloutBlock(block) {
  const children = textParagraphs(block.text, {
    italics: true, color: C.calloutText, size: S.body + 0.4, after: 2,
  });
  return [boxTable(children, { fill: C.calloutBg, border: C.calloutBorder }), spacer()];
}

function agendaBlock(block) {
  const rows = block.rows.map(
    (row) =>
      new TableRow({
        children: [
          new TableCell({
            children: [
              para(row.label, { bold: true, after: row.note ? 2 : 0 }),
              ...(row.note ? [para(row.note, { italics: true, size: S.small, color: C.subtitle, after: 0 })] : []),
            ],
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: { ...noBorders, bottom: solid(C.tableLine, 4) },
          }),
          new TableCell({
            children: [
              para(row.duration || '', {
                bold: true, size: S.pill, color: C.pillText, align: AlignmentType.RIGHT, after: 0,
              }),
            ],
            width: { size: 18, type: WidthType.PERCENTAGE },
            shading: row.duration ? shading(C.pillBg) : undefined,
            borders: { ...noBorders, bottom: solid(C.tableLine, 4) },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
  );
  return [fullWidthTable(rows), spacer()];
}

function kvBlock(block) {
  const rows = block.rows.map(
    ([k, v]) =>
      new TableRow({
        children: [
          new TableCell({
            children: [para(k, { bold: true, color: C.section, after: 0 })],
            width: { size: 28, type: WidthType.PERCENTAGE },
            borders: noBorders,
          }),
          new TableCell({
            children: textParagraphs(v, { after: 0 }),
            width: { size: 72, type: WidthType.PERCENTAGE },
            borders: noBorders,
          }),
        ],
      }),
  );
  return [fullWidthTable(rows), spacer()];
}

function tableBlock(block) {
  const head = new TableRow({
    tableHeader: true,
    children: block.head.map(
      (h) =>
        new TableCell({
          children: [para(h, { bold: true, size: S.small, color: C.section, after: 0 })],
          shading: shading(C.tableHeadBg),
          borders: { ...noBorders, bottom: solid(C.tableLine, 4) },
        }),
    ),
  });
  const body = block.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: textParagraphs(cell, { size: S.small, after: 0 }),
              borders: { ...noBorders, bottom: solid(C.tableLine, 4) },
            }),
        ),
      }),
  );
  return [fullWidthTable([head, ...body]), spacer()];
}

/** Harold structure as a shaded grid, the DOCX counterpart of the drawn diagram. */
function haroldDiagram() {
  const cell = (text, span, accent) =>
    new TableCell({
      children: [
        para(text, {
          bold: true, size: S.small - 0.3, color: C.diagramText,
          align: AlignmentType.CENTER, after: 0,
        }),
      ],
      columnSpan: span,
      shading: shading(accent ? C.diagramAccent : C.diagramBox),
      borders: {
        top: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
        bottom: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
        left: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
        right: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
      },
    });

  const rows = [
    new TableRow({ children: [cell('Opening / Invocation', 3, false)] }),
    new TableRow({ children: ['A1', 'B1', 'C1'].map((t) => cell(t, 1, false)) }),
    new TableRow({ children: [cell('Group Game 1', 3, true)] }),
    new TableRow({ children: ['A2', 'B2', 'C2'].map((t) => cell(t, 1, false)) }),
    new TableRow({ children: [cell('Group Game 2', 3, true)] }),
    new TableRow({ children: ['A3', 'B3', 'C3'].map((t) => cell(t, 1, false)) }),
  ];

  return [
    fullWidthTable(rows, { margins: { top: tw(4), bottom: tw(4), left: tw(5), right: tw(5) } }),
    para(
      'Beat 1 finds the game. Beat 2 heightens it. Beat 3 lets the worlds touch and the callbacks land.',
      { italics: true, size: S.small - 0.5, color: C.subtitle, before: 3, after: 8 },
    ),
  ];
}

/** The game-of-the-scene funnel, the DOCX counterpart of the drawn diagram. */
function funnelDiagram() {
  const rows = [
    ['Base reality + yes-and', 'Explore the world, establish the W-questions', false],
    ['First unusual thing', "The partner's reaction makes it obvious", false],
    ['GAME: if this is true, what else is true?', 'Escalate along the same pattern', true],
  ];
  const out = [];
  rows.forEach(([label, note, accent]) => {
    out.push(
      fullWidthTable(
        [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  para(label, {
                    bold: true, size: S.small - 0.3, color: C.diagramText,
                    align: AlignmentType.CENTER, after: 0,
                  }),
                ],
                shading: shading(accent ? C.diagramAccent : C.diagramBox),
                borders: {
                  top: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
                  bottom: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
                  left: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
                  right: solid(accent ? C.diagramAccentLine : C.diagramBoxLine, 4),
                },
              }),
            ],
          }),
        ],
        { margins: { top: tw(4), bottom: tw(4), left: tw(5), right: tw(5) } },
      ),
      para(note, {
        italics: true, size: S.small - 0.8, color: C.subtitle,
        align: AlignmentType.CENTER, before: 2, after: 5,
      }),
    );
  });
  return out;
}

const spacer = (pt = 5) => new Paragraph({ text: '', spacing: { after: tw(pt) } });

function renderBlock(block, strings) {
  switch (block.t) {
    case 'section': return sectionBlock(block);
    case 'sub': return [para(block.text, { bold: true, size: S.sub, before: 4, after: 3, keepNext: true })];
    case 'p': return [...textParagraphs(block.text, { after: 5 })];
    case 'bullets': return block.items.map((i) => para(i, { bullet: true, after: 2 }));
    case 'numbered': return block.items.map((i, idx) => para(`${idx + 1}.  ${i}`, { after: 2 }));
    case 'coaching': return coachingBlock(block, strings);
    case 'callout': return calloutBlock(block);
    case 'kv': return kvBlock(block);
    case 'agenda': return agendaBlock(block);
    case 'table': return tableBlock(block);
    case 'diagram':
      if (block.kind === 'harold') return haroldDiagram();
      if (block.kind === 'funnel') return funnelDiagram();
      return [];
    case 'rule': return [new Paragraph({ text: '', spacing: { after: tw(8) }, border: { bottom: solid(C.rule, 6) } })];
    case 'space': return [spacer(block.h || 6)];
    case 'pagebreak': return [new Paragraph({ text: '', pageBreakBefore: true })];
    default: return [];
  }
}

function headerBlocks(doc) {
  const out = [
    para(doc.title, { bold: true, size: S.title, color: C.title, after: 2 }),
  ];
  if (doc.subtitle) {
    out.push(para(doc.subtitle, { size: S.subtitle, color: C.subtitle, after: 4 }));
  }
  out.push(new Paragraph({ text: '', spacing: { after: tw(8) }, border: { bottom: solid(C.rule, 8) } }));

  if (doc.meta.length) {
    const perRow = Math.min(doc.meta.length, 4);
    const rows = [];
    for (let i = 0; i < doc.meta.length; i += perRow) {
      const slice = doc.meta.slice(i, i + perRow);
      rows.push(
        new TableRow({
          children: slice.map(
            (m) =>
              new TableCell({
                children: [
                  para(m.label, { bold: true, size: S.meta - 1.4, color: C.metaLabel, allCaps: true, after: 1 }),
                  para(m.value, { bold: true, size: S.meta, color: C.metaValue, after: 0 }),
                ],
                width: { size: Math.floor(100 / slice.length), type: WidthType.PERCENTAGE },
                shading: shading(C.metaBg),
                borders: noBorders,
              }),
          ),
        }),
      );
    }
    out.push(
      fullWidthTable(rows, { margins: { top: tw(7), bottom: tw(7), left: tw(9), right: tw(9) } }),
      spacer(8),
    );
  }
  return out;
}

/** Render a document model to DOCX bytes (Blob). */
export async function renderDocx(doc) {
  const strings = getStrings(doc.lang);

  const footer = new Footer({
    children: [
      new Paragraph({
        border: { top: solid(C.tableLine, 4) },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        spacing: { before: tw(4) },
        children: [
          new TextRun({ text: strings.author, size: hp(S.footer), color: hex(C.footer) }),
          new TextRun({ text: '\t', size: hp(S.footer) }),
          new TextRun({ children: [PageNumber.CURRENT], size: hp(S.footer), color: hex(C.footer) }),
          new TextRun({ text: ' / ', size: hp(S.footer), color: hex(C.footer) }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: hp(S.footer), color: hex(C.footer) }),
        ],
      }),
    ],
  });

  const children = [...headerBlocks(doc)];
  for (const block of doc.blocks) children.push(...renderBlock(block, strings));

  const document = new Document({
    creator: strings.author,
    title: doc.title,
    description: doc.subtitle,
    styles: {
      default: {
        document: {
          run: { font: 'Helvetica', size: hp(S.body), color: hex(C.body) },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: tw(PRINT.margin.top), right: tw(PRINT.margin.right),
              bottom: tw(PRINT.margin.bottom), left: tw(PRINT.margin.left),
            },
          },
        },
        footers: { default: footer },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
