# Improv All-in-One

A mobile-first improv coaching toolkit: design training sessions, generate scene
suggestions, run a Format Forge day, and keep a library of formats, past sessions
and terminology. Everything runs client-side; there is no backend and no account.

## The six tabs

| Tab | What it does |
| --- | --- |
| **Session Builder** | Pick a duration and a focus, choose warm-ups, exercises, a main long-form block and theory blocks from a 441-block library, order them, insert breaks, and export a Trainer Guide and a Player Guide as PDF or DOCX. Blocks can be starred and the picker filtered to favourites only. |
| **Suggestions** | Random scene-suggestion generator: 13 categories, 50 entries each, per-card reroll, auto-reroll on a timer, and a starred list you can copy or download as plain text. |
| **Formats** | 32 whole-show structures, starrable and filterable to favourites, (Harold, BIG.BANG.IMPRO, Emotion Experiment, Theatresports, Gorilla Theatre, Micetro, Soap Series, Armando, Montage, La Ronde, Deconstruction, Invocation and more) with their stage breakdowns. |
| **Archive** | Saved sessions and Format Forge days, filterable and sortable, each re-exportable, duplicable into the builder, and debriefable (debriefs are stored as a list, so a session can be run more than once). Three written-up sessions ship with the app and are seeded here on first run. |
| **Format Forge** | Live facilitation tool for the nine-step format development method: stepper, per-step timer, live notes, the on-the-fly adjustment reference, a format card, and a worksheet export. |
| **Glossary** | 130 entries in four groups: Terms, Improvisers, Books and Philosophy. Search covers every definition, related terms cross-link, and each entry has a copy button. |

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

### Sessions that ship with the app

Three sessions are seeded into the archive on first run, each reproducing a
Trainer Guide and a Player Guide written outside the app:

- **Game of the Scene: Character Games** (2 h) — finding, naming and playing the unusual pattern
- **Less Is More: Economy of Speech** (2 h) — breaking the info-dump reflex
- **Accepting and Giving Offers** (2 h) — listening and the blocking / accepting / over-accepting spectrum

They are ordinary archive entries once seeded: editable, debriefable,
duplicable and deletable, and deleting one does not bring it back. Their
block durations match the printed guides exactly, including where a guide's
own running order does not add up to its stated target.

A session can carry its own coach's notes (pitfalls, adjustments, source
connections), its own player-guide definition, distinctions and rules of
thumb, and per-item `overrides` that adapt a library block for that run (a
different prompt, its own debrief questions) without forking the library
entry.

### Hiding and favourites

Games, formats and glossary entries can be switched off individually under
**Settings → Library**. Hiding is reversible, applies to the Session Builder and
the Formats tab, and never touches archived sessions.

Seed content is edited directly in these files, there is no in-app editor:

- `src/data/library.js` — 64 hand-written session blocks, merged with the import below
- `src/data/preset-sessions.js` — the three sessions seeded into the archive
- `src/data/encyclopedia-games.json` — 377 games from the Improv Encyclopedia (index)
- `src/data/encyclopedia-games-details.json` — their instructions, notes and variations, loaded on demand
- `src/data/suggestions.json` — 13 suggestion categories, 50 entries each
- `src/data/formats.js` — 8 hand-written formats, merged with the import below
- `src/data/encyclopedia-formats.json` — 24 Long Form and Format entries from the encyclopedia
- `src/data/format-forge-steps.json` — the nine steps, session shell, breaks and adjustments
- `src/data/glossary.js` — 22 hand-written terms, merged with the imports below
- `src/data/encyclopedia-keywords.json` — 91 keywords from the encyclopedia glossary
- `src/data/encyclopedia-entries.json` — 17 encyclopedia entries grouped as improvisers, books and philosophy

### Imported content

Games, keywords and encyclopedia entries come from the Improv Encyclopedia
(v2.0.6, www.improvencyclopedia.org). Each game keeps the source's own
categories (Accepting, Concentration, Look and Listen, Solo, Limitations and so
on) and gains derived labels such as Circle, Two-person, Storytelling or
Suggestion-driven so the focus search can find it. Games tagged Long Form or
Format appear both in the Formats tab and as Main blocks in the Session Builder.
Nine encyclopedia games that duplicate a hand-written block were dropped at
import, so every name appears once.

The instruction bodies are about 240 kB, so they are split out and fetched the
first time a block is opened or exported. Searching, picking and timing all work
from the index alone.

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
