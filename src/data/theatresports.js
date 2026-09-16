/**
 * Theatersport (Theatresports) game data.
 *
 * Source: Daniela Landert, "Theatersport moderieren – Tipps und Tricks",
 * the Spielesammlung (game collection) and the example show plan. This is a
 * self-contained, German short-form repertoire grouped by characteristic,
 * and it is used ONLY by the Theatresports evening generator. The Session
 * Builder keeps using the Improv Encyclopedia library; the two do not mix,
 * because only this list reproduces the kind of evening the manual describes.
 *
 * Each theme is a "thematically similar" bucket: in a split round both teams
 * play a different game drawn from the same theme, so the moderator can give
 * one kind of suggestion and see two takes on it.
 *
 * Roles:
 *   (default)      split round: two distinct games, one per team
 *   joint: true    a single scene both teams play together (Gemeinsame Szene)
 *   group: true    a whole-group finale that fills the stage
 */

const g = (name, hint) => (hint ? { name, hint } : { name });

export const TS_THEMES = [
  {
    id: 'sprache',
    label: 'Sprache',
    inspirations: ['Titel', 'Thema', 'erster Satz'],
    games: [
      g('Word at a time (Wort-für-Wort)'),
      g('Kein «n» sagen', 'auf Deutsch besser als «s»'),
      g('Gibberish'),
      g('Eine bestimmte Anzahl Wörter pro Satz'),
      g('Ohne Worte', 'z.B. Starbucks'),
      g('One Voice'),
      g('ABC-Spiel'),
      g('Möse Miester'),
    ],
  },
  {
    id: 'wechsel',
    label: 'Schnelle Wechsel',
    inspirations: ['Beziehung', 'Ort', 'Beruf'],
    games: [
      g('Switch + Change'),
      g('New Choice'),
      g('Speed dating'),
      g('Rein und raus'),
      g('N Orte in X Minuten'),
      g('2 Räume'),
      g('Hat Game'),
    ],
  },
  {
    id: 'naehe',
    label: 'Nähe + Distanz',
    inspirations: ['Beziehung', 'Emotion'],
    games: [
      g('Nur sprechen bei Berühren'),
      g('Sexy, smelly, funny'),
      g('Emotion A bei Nähe, B bei Distanz'),
    ],
  },
  {
    id: 'ratespiele',
    label: 'Ratespiele',
    inspirations: ['Beruf', 'Gegenstand', 'Erfindung'],
    games: [
      g('Erfinder'),
      g('Bewerbungsgespräch'),
      g('Reklamation'),
      g('Eheberatung'),
    ],
  },
  {
    id: 'kommunikation',
    label: 'Kommunikation teilen',
    inspirations: ['Thema', 'Ort'],
    games: [
      g('Synchronsprechen'),
      g('Fremde Arme'),
      g('Small Voice'),
      g('Reclam / mis Handy'),
      g('Zettelspiel'),
    ],
  },
  {
    id: 'replay',
    label: 'Replay',
    inspirations: ['Genre', 'Ort'],
    games: [
      g('Genre-Replay'),
      g('Shorty'),
      g('4-3-2-1'),
      g('Teamwechsel'),
    ],
  },
  {
    id: 'brainfuck',
    label: 'Brain fuck',
    inspirations: ['Thema'],
    games: [
      g('A spricht, B spricht C'),
      g('Rückwärtsinterview'),
    ],
  },
  {
    id: 'erzaehlen',
    label: 'Erzählen',
    inspirations: ['Titel', 'Ort', 'erster Satz'],
    note: 'Fokus auf Geschichte',
    games: [
      g('3 Tote'),
      g('Hörspiel'),
      g('Weil das so ist'),
      g('Sätze ergänzen, wiederholen, gemeinsam sagen'),
      g('Typewriter'),
    ],
  },
  {
    id: 'parallele',
    label: 'Parallele / verschiedene Szenen',
    joint: true,
    inspirations: ['Tätigkeit', 'Beziehung', 'Gegenstand', 'erster Satz'],
    games: [
      g('Dutch Square'),
      g('Erster Satz, letzter Satz'),
      g('Pyramide'),
    ],
  },
  {
    id: 'emotionen',
    label: 'Emotionen',
    inspirations: ['Emotion', 'Ort', 'Beziehung'],
    games: [
      g('Emotionsquadrat'),
      g('Emotionsachterbahn'),
      g('Hitchhiker'),
      g('3 Emotionen', 'wie sitzen – liegen – stehen'),
    ],
  },
  {
    id: 'musik',
    label: 'Musik',
    inspirations: ['Stil', 'Thema', 'Titel'],
    liveMusic: true,
    games: [
      g('Das klingt nach einem Lied'),
      g('Musical'),
      g('Lied mit Vorgaben'),
      g('Ode an ein Objekt'),
      g('CD-Sampler', 'verschiedene Stile zu einem Thema'),
      g('Jukebox'),
    ],
  },
  {
    id: 'publikum',
    label: 'Mit Publikum',
    inspirations: ['Thema'],
    games: [
      g('Publikumsmitglied sitzt am Rand und ergänzt Sätze'),
      g('Puppets', 'Publikum bewegt die Spieler:innen'),
    ],
  },
  {
    id: 'gruppen',
    label: 'Grosse Gruppen',
    group: true,
    inspirations: ['Überthema', 'Thema'],
    games: [
      g('Toaster', 'mit Überthema'),
      g('Radio'),
      g('Dia-Show'),
    ],
  },
  {
    id: 'verschiedenes',
    label: 'Verschiedenes',
    inspirations: ['Ort', 'Beziehung', 'Beruf'],
    games: [
      g('Das Ding', 'jemand spielt alle Objekte'),
      g('Tiermantras'),
      g('Definierte Schlussposition'),
      g('Selbsterfundenes Game'),
      g('Freie Szene'),
    ],
  },
  {
    id: 'character',
    label: 'Charaktere',
    // No games in the manual's collection; this theme exists to surface the
    // encyclopedia's large set of character games in the wide pool.
    inspirations: ['Beruf', 'Beziehung', 'Emotion'],
    games: [],
  },
  {
    id: 'endowment',
    label: 'Wer oder was bin ich?',
    // Endowment games: a player discovers who or what they are from how the
    // others treat them. Encyclopedia-only, wide pool.
    inspirations: ['Beruf', 'Gegenstand', 'Beziehung'],
    games: [],
  },
  {
    id: 'objektraum',
    label: 'Objekt- & Raumarbeit',
    // Mime, space objects and environment. Encyclopedia-only, wide pool.
    inspirations: ['Ort', 'Gegenstand', 'Tätigkeit'],
    games: [],
  },
];

/**
 * Encyclopedia category tags that belong to each theme. Used only when the
 * wide pool is on, to widen a theme with short-form stage games from the
 * Session Builder library. Themes left out (or mapped to []) stay curated:
 * their character is too specific to fill reliably from tags.
 */
export const TS_THEME_TAGS = {
  sprache: ['Gibberish', 'Verbal wit'],
  wechsel: ['Speed', 'Freeze', 'Continuation'],
  naehe: ['Physicality', 'Movement', 'Trust'],
  ratespiele: ['Guessing', 'Questions'],
  // 'Kommunikation teilen' is about shared control, not discovery, so it has
  // no clean encyclopedia tag and stays curated-only.
  replay: ['Continuation'],
  erzaehlen: ['Storytelling', 'Narration'],
  emotionen: ['Emotion'],
  musik: ['Musical', 'SingSong', 'Sound'],
  publikum: ['Audience Participation'],
  character: ['Character', 'Characters'],
  endowment: ['Endowment'],
  objektraum: ['Props', 'Object Work', 'Environment'],
};

export const TS_THEME_BY_ID = Object.fromEntries(TS_THEMES.map((t) => [t.id, t]));

/**
 * Themes usable for a normal split round. Whether a theme actually has room
 * for a round depends on the active pool (curated only vs. wide), so this is
 * just the structural list; availability is checked at generation time.
 */
export const TS_SPLIT_THEME_IDS = TS_THEMES
  .filter((t) => !t.joint && !t.group)
  .map((t) => t.id);

/** Themes that see how impro works, good for the opener. */
export const TS_OPENER_THEME_IDS = ['sprache', 'wechsel'];

/** Joint-scene themes (a single scene both teams play). */
export const TS_JOINT_THEME_IDS = TS_THEMES.filter((t) => t.joint).map((t) => t.id);

/** Whole-group finale games that fill the stage. */
export const TS_FINALE_GAMES = [
  '4-3-2-1',
  'Toaster (mit Überthema)',
  'Radio',
  'Dia-Show',
  'Teamwechsel',
];

// Audience warm-ups first, so a four-team evening gives each match a
// different one across the break.
export const TS_WARMUPS = [
  'Filmtitel raten mit dem Publikum und beiden Teams',
  '«Sommer oder Winter»-Rufspiel mit dem Publikum',
  'Alle stellen sich mit Namen vor und beantworten die gleiche Frage (z.B. «Welches Haushaltsgerät wärst du?»)',
  'Gemeinsames Aufwärmen: Körper, Stimme und Inspirationen',
];

export const TS_BACKUP_JOINT = [
  'Toaster mit Überthema',
  'Pyramide',
  'Switch & Change',
];

export const TS_BACKUP_SOLO = [
  'Genre-Replay',
  'Emotionsquadrat',
  'Gibberisch switch',
  'Mis Handy (Reclamspiel mit Gruppenchat)',
];

/** Suggestion prompts the moderator can collect from the audience. */
export const TS_INSPIRATIONS = [
  'Titel', 'Thema', 'Ort', 'Beruf', 'Hobby', 'Beziehung', 'Tätigkeit',
  'Gegenstand', 'erster Satz', 'Überthema', 'Stil', 'Genre', 'Emotion', 'Nichts',
];

export const TS_DEFAULT_TEAMS = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];

export const TS_TEAMWUNSCH = 'Teamwunsch';

/**
 * Default moderation notes for the export, drawn from the manual. Editable
 * per plan; this is only the seed text.
 */
export const TS_MODERATION_NOTES = [
  'Energie und Timing: keine Energielöcher, die Bühne nie leer lassen. Bei Black bereits auf der Bühne stehen und ohne Unterbruch zur nächsten Szene überleiten.',
  'Spiele erklären, nicht benennen. Erkläre jede Szene fürs Publikum, kurz und mit hoher Energie.',
  'Szenen beenden: lieber früher als später, auf einem Höhepunkt. Absprechen, mit welchem Zeichen und wer beenden darf.',
  'Abwechslung: keine ähnlichen Spiele aufeinander folgen lassen (schnell/langsam, sprachlich/körperlich). Längere Szenen in die Mitte.',
  'Nicht immer das gleiche Team startet: die Startseite (A) pro Runde wechseln.',
  'Flexibilität: die mit * markierte Runde kann bei Zeitnot gestrichen werden; Back-up-Spiele bereithalten, falls eine Runde mehr nötig ist.',
  'Inspirationen im Vorfeld überlegen und pro Szene variieren; immer ein Ein-Wort-Input aus dem Publikum.',
  'Eingreifen bei Grenzüberschreitungen: «Freeze» rufen, ruhig und sachlich die Szene lenken. Dem eigenen Impuls vertrauen.',
];
