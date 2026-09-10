export { B, buildDocument, compact, quote, slugify, formatMinutes, todayISO, prettyDate } from './docModel.js';
export { getStrings, DOC_STRINGS } from './labels.js';

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give Safari a moment before revoking, otherwise the download can abort.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Render a document model and hand it to the browser as a file.
 * `format` is 'pdf' or 'docx'.
 *
 * The two rendering engines are loaded on demand: they are by far the
 * largest dependencies, and a coach opening the app in a rehearsal room
 * should not pay for them until an export is actually requested.
 */
export async function exportDocument(doc, format) {
  if (format === 'docx') {
    const { renderDocx } = await import('./docx.js');
    download(await renderDocx(doc), `${doc.fileBase}.docx`);
    return;
  }
  const { renderPdf } = await import('./pdf.js');
  const bytes = await renderPdf(doc);
  download(new Blob([bytes], { type: 'application/pdf' }), `${doc.fileBase}.pdf`);
}
