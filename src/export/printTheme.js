/**
 * Print theme for generated documents.
 *
 * Exported documents are print documents: light background, dark text,
 * always, regardless of the app's active (dark by default) theme.
 */

export const PRINT = {
  page: { width: 595.28, height: 841.89 },
  margin: { top: 54, right: 54, bottom: 58, left: 54 },

  color: {
    title: '#000000',
    subtitle: '#6B7280',
    rule: '#C4CAD3',
    body: '#1A1D23',
    metaBg: '#F1F3F7',
    metaLabel: '#6E7787',
    metaValue: '#2B313C',
    section: '#1B4F9C',
    sectionRule: '#D6DEEA',
    pillBg: '#F7D65D',
    pillText: '#4A3A00',
    coachBg: '#FDF4DA',
    coachBorder: '#E4C263',
    coachTitle: '#8A6A08',
    coachBody: '#3B3427',
    calloutBg: '#FAF0D4',
    calloutBorder: '#E0C271',
    calloutText: '#2E2A1E',
    tableLine: '#DCE1E9',
    tableHeadBg: '#F1F3F7',
    footer: '#8A9099',
    diagramBox: '#EDF2FA',
    diagramBoxLine: '#9FB8DA',
    diagramAccent: '#F7D65D',
    diagramAccentLine: '#D8B23C',
    diagramText: '#1B2431',
  },

  size: {
    title: 21,
    subtitle: 11,
    meta: 9,
    section: 13,
    sub: 10.5,
    body: 10.2,
    small: 9,
    pill: 8.5,
    footer: 8.5,
  },

  lead: 1.38,
  blockGap: 9,
  sectionGapBefore: 16,
};

/** Hex string to a pdf-lib friendly {r,g,b} in 0..1. */
export function rgbFromHex(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

/** docx wants hex without the leading hash. */
export const hex = (v) => v.replace('#', '').toUpperCase();
