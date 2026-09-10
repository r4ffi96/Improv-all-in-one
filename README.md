# Improv All-in-One

A mobile-first improv coaching toolkit: design training sessions, generate scene
suggestions, run a Format Forge day, and keep a library of formats, past sessions
and terminology. Everything runs client-side; there is no backend and no account.

## The six tabs

| Tab | What it does |
| --- | --- |
| **Session Builder** | Pick a duration and a focus, choose warm-ups, exercises, a main long-form block and theory blocks from the seeded library, order them, insert breaks, and export a Trainer Guide and a Player Guide as PDF or DOCX. |
| **Suggestions** | Random scene-suggestion generator: 12 categories, 30 entries each, per-card reroll, auto-reroll on a timer, and a starred list you can copy or download as plain text. |
| **Formats** | Reference entries for whole show structures (Harold, BIG.BANG.IMPRO, Emotion Experiment, Armando, Montage, La Ronde, Deconstruction, Invocation) with their stage breakdowns. |
| **Archive** | Saved sessions and Format Forge days, filterable and sortable, each re-exportable, duplicable into the builder, and debriefable (debriefs are stored as a list, so a session can be run more than once). |
| **Format Forge** | Live facilitation tool for the nine-step format development method: stepper, per-step timer, live notes, the on-the-fly adjustment reference, a format card, and a worksheet export. |
| **Glossary** | 22 terms with definitions, cross-links between related terms, and a copy button. |

## Generated documents

All exports go through one shared template module (`src/export/`), so the Trainer
Guide, Player Guide and Format Forge worksheet look identical: black bold title,
grey subtitle, rule under the header, light-grey metadata block, blue section
headers with a yellow timing pill, cream coaching-focus boxes, cream callouts,
German guillemets for quoted lines, and a "Sandro Raffaele" plus page-number
footer on every page. Documents are always print-style (light background, dark
text) regardless of the app theme, and they never contain session numbering.

- `src/export/docModel.js` builds the document model
- `src/export/pdf.js` renders it with `pdf-lib` (the Harold diagram is drawn with
  primitives, not an image asset)
- `src/export/docx.js` renders the same model with the `docx` package
- `src/export/builders.js` turns sessions and forge runs into document models

## Data

Everything the user creates lives in `localStorage` under `improv-all-in-one:v1`.
Settings has an **Export all data (JSON)** / **Import data (JSON)** pair so a
backup can be moved between devices by hand.

Seed content is edited directly in these files, there is no in-app editor:

- `src/data/library.js` — 48 session blocks (warm-ups, exercises, long-form runs, theory)
- `src/data/suggestions.json` — 12 suggestion categories
- `src/data/formats.js` — 8 documented formats
- `src/data/format-forge-steps.json` — the nine steps, session shell, breaks and adjustments
- `src/data/glossary.js` — 22 glossary entries

Schemas for the Suggestion Generator and the Glossary carry `{ en, de }` fields
so German can be added later without restructuring. v1 seeds English only and
has no language toggle; empty German arrays and strings fall back to English at
read time.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages. Enable it once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**.

Vite is configured with `base: './'`, so the same build works on a project page,
a custom domain and locally. Routing is hash-based (`#/builder`, `#/glossary/gl-status`),
so no SPA 404 fallback is needed.

The app ships a web manifest and icons, so it can be added to a phone home screen
and runs standalone.
