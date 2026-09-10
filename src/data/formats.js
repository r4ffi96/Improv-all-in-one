/**
 * Format Library: whole show / format structures.
 * Reference data only in v1, edit this file to add formats.
 *
 * Schema: id, name, origin, structureSummary,
 *         stages: { name, description }[], typicalDuration, notes,
 *         relatedTheory: string[]  (ids from data/glossary.js)
 */

export const FORMATS = [
  {
    id: 'fmt-harold',
    name: 'Harold',
    origin: 'UCB / Del Close lineage',
    structureSummary:
      'A single suggestion feeds a group opening, then three beats of three scenes separated by two group games, with earlier material returning as callbacks in the final beat. The Harold is a pattern machine: each scene finds a game and heightens it, and the payoff comes from the collisions and returns in beat three.',
    stages: [
      {
        name: 'Opening (Invocation or other group opening)',
        description:
          'One suggestion is worked by the whole group to generate images, phrases and relationships. The Invocation moves through four stages: «It is…», «You are…», «You all are…», «I am…».',
      },
      {
        name: 'Beat one: scenes A, B, C',
        description:
          'Three unrelated two-person scenes. Each establishes a base reality and finds one unusual thing that becomes its game.',
      },
      {
        name: 'Group game one',
        description:
          'A whole-group piece that uses material from the opening and the first beat. It generates and connects, it does not tell a story.',
      },
      {
        name: 'Beat two: A2, B2, C2',
        description:
          'Each scene returns and heightens its own game. Second beats are not sequels: the pattern grows, the plot does not have to.',
      },
      {
        name: 'Group game two',
        description:
          'A second whole-group piece, usually looser and more associative, that starts pulling the three worlds towards each other.',
      },
      {
        name: 'Beat three: A3, B3, C3 and callbacks',
        description:
          'The three worlds are allowed to touch. Characters cross over, earlier images return with new meaning, and the strongest material of the set pays off.',
      },
    ],
    typicalDuration: '25-35 min',
    notes:
      'The German rendering of the Invocation kept as an established reference artifact: «Es ist…», «Du bist…», «Ihr seid…», «Ich bin…». The «Ihr seid» stage uses an archaic ihrzen register, which is part of why the third stage feels ceremonial; «O Du…» is an alternative, more invocatory form for the second stage.\n\nCommon failures: second beats played as sequels, edits that come too late, and callbacks used as decoration rather than as returns of material that was strong the first time.',
    relatedTheory: ['gl-game-of-the-scene', 'gl-invocation', 'gl-callback', 'gl-offer'],
  },
  {
    id: 'fmt-big-bang-impro',
    name: 'BIG.BANG.IMPRO',
    origin: 'anundpfirsich (pfirsi.ch)',
    structureSummary:
      'A format-driven show built around a strong fixed frame with a small number of variable slots. The audience learns what to expect from the frame, and the surprise lives in the games played inside it. The design principle is the one that matters most for format development: decide deliberately what is fixed every night and what changes.',
    stages: [
      {
        name: 'Frame set-up',
        description:
          'The show establishes its own rules to the audience clearly and quickly. The audience needs to know what kind of evening this is within the first minutes.',
      },
      {
        name: 'Audience input',
        description:
          'A defined, limited input from the audience at a fixed point. Limited input protects the fixed asset of the format.',
      },
      {
        name: 'Played sequence',
        description:
          'The content block runs inside the frame: scenes and games whose shape is fixed, whose material is not.',
      },
      {
        name: 'Frame return',
        description:
          'The format returns to its own frame to close, so the evening reads as one designed thing rather than a set of sketches.',
      },
    ],
    typicalDuration: '60-90 min',
    notes:
      'Listed here as a reference point for the fixed-versus-variable distinction rather than as a step-by-step reconstruction. When using it as a teaching example, put two columns on the flipchart and fill them in with the group.',
    relatedTheory: ['gl-format-vs-game', 'gl-offer'],
  },
  {
    id: 'fmt-emotion-experiment',
    name: 'Emotion Experiment',
    origin: 'Format Forge output (Sandro Raffaele)',
    structureSummary:
      'A narrator-framed fixed-sequence format built in a Format Forge day. A world where emotions have been erased is shown as neutral, then a time jump lands on the experiment where feeling breaks through, and the narrator closes with a moral. The world premise, the sequence and the narrator frame are fixed; setting, characters and the concrete instance change every show.',
    stages: [
      {
        name: 'Narrator establishes the setting',
        description:
          'The narrator addresses the audience directly and states the world premise in a couple of sentences. Frame, tempo and audience contact are set here.',
      },
      {
        name: 'The neutral world',
        description:
          'One or two scenes show the world working as designed: people functioning without the thing that has been removed. Played straight, without commenting on the strangeness.',
      },
      {
        name: 'Narrator jumps time',
        description:
          'The narrator moves the story forward. The jump is a structural tool: it skips the explanation and lands on consequence.',
      },
      {
        name: 'The experiment',
        description:
          'The central beat. The experiment is run and feeling breaks through the neutral surface. This is where the format pays off, so it gets the most stage time.',
      },
      {
        name: 'Narrator closes with a moral',
        description:
          'The narrator returns and delivers a moral. The moral is a frame device, not a lesson: it lands the evening as a designed shape.',
      },
    ],
    typicalDuration: '25-35 min',
    notes:
      'Casting the narrator is the main production decision: frame, tempo and audience contact are high-skill. Rotate it in rehearsal, then cast deliberately.\n\nFive to six beats is enough. Adding beats dilutes the fixed asset. One audience-controlled variable only, placed at a beat where the world is already established.',
    relatedTheory: ['gl-format-vs-game', 'gl-four-corners', 'gl-platform'],
  },
  {
    id: 'fmt-armando',
    name: 'Armando',
    origin: 'iO Chicago',
    structureSummary:
      'A true personal monologue seeds a block of scenes, and the monologist returns between blocks with a new story prompted by what they just watched.',
    stages: [
      { name: 'Suggestion', description: 'A single suggestion is taken for the monologist.' },
      {
        name: 'Monologue',
        description: 'Three to four minutes of true personal storytelling, told rather than performed.',
      },
      {
        name: 'Scene block',
        description:
          'Two or three scenes inspired by any element of the monologue: a detail, a relationship, a phrase. Inspired by, not illustrating.',
      },
      {
        name: 'Return monologue',
        description:
          'The monologist comes back with a second story triggered by the scenes, and the cycle repeats, usually three times.',
      },
    ],
    typicalDuration: '30-45 min',
    notes:
      'Works well with a guest monologist. The truer and less shaped the storytelling, the better the scenes it produces.',
    relatedTheory: ['gl-offer', 'gl-callback'],
  },
  {
    id: 'fmt-montage',
    name: 'Montage',
    origin: 'Improv Encyclopedia (Long Form)',
    structureSummary:
      'A free chain of unrelated scenes from one suggestion, connected by association rather than plot, edited fast.',
    stages: [
      { name: 'Suggestion or short opening', description: 'One suggestion, optionally a brief group opening.' },
      {
        name: 'Scene chain',
        description:
          'Two-person scenes, each edited as soon as its game is visible. No obligation to a story.',
      },
      {
        name: 'Associative links',
        description:
          'An image, phrase or physical shape carries across an edit and seeds the next scene.',
      },
      {
        name: 'Late returns',
        description:
          'In the last third, earlier characters and images come back. The shape appears retrospectively.',
      },
    ],
    typicalDuration: '20-25 min',
    notes:
      'The best diagnostic form for a group: what they make when nothing is required of them. Also the associative test mode used in the Format Forge test rounds.',
    relatedTheory: ['gl-game-of-the-scene', 'gl-callback'],
  },
  {
    id: 'fmt-la-ronde',
    name: 'La Ronde',
    origin: 'After Schnitzler / Improv Encyclopedia (Long Form)',
    structureSummary:
      'A chain of two-person scenes in which one player always carries over into the next, closing the ring back to the first player.',
    stages: [
      { name: 'Fixed order', description: 'The player order is fixed before the run so nothing is negotiated on stage.' },
      { name: 'Scene chain', description: 'A plays with B, then B with C, then C with D, each in a new situation.' },
      { name: 'Carry-over change', description: 'The carried player changes something: character, status, emotional state.' },
      { name: 'Closing the ring', description: 'The last scene returns to the first player, which is the payoff of the form.' },
    ],
    typicalDuration: '25-35 min',
    notes: 'Low-risk long form for a group new to structure. Keep scenes under three minutes and protect time for the closing scene.',
    relatedTheory: ['gl-status', 'gl-platform'],
  },
  {
    id: 'fmt-deconstruction',
    name: 'Deconstruction',
    origin: 'Annoyance / iO lineage',
    structureSummary:
      'One honest opening scene is the entire source material; everything after it investigates that scene from other angles.',
    stages: [
      { name: 'Base scene', description: 'One two-person scene, three to five minutes, played completely straight.' },
      { name: 'Break out', description: 'Scenes take a moment, a line or a character from the base scene and explore it elsewhere.' },
      { name: 'Literalisation', description: 'Images and phrases from the base scene are taken literally and played out.' },
      { name: 'Returns to the base', description: 'The original relationship is revisited at least twice, changed by what has been shown.' },
    ],
    typicalDuration: '30-40 min',
    notes: 'A jokey base scene gives nothing to deconstruct. Cast the opening pair deliberately.',
    relatedTheory: ['gl-platform', 'gl-tilt', 'gl-callback'],
  },
  {
    id: 'fmt-invocation-opening',
    name: 'Invocation (as a standalone opening)',
    origin: 'UCB',
    structureSummary:
      'The four-stage group opening that moves a single word from outside description to first-person embodiment. Usable as the opening of a Harold or as a piece in its own right.',
    stages: [
      { name: '«It is…»', description: 'The group describes the thing from outside, in third person. Observational.' },
      { name: '«You are…»', description: 'The group addresses the thing directly. Second person, in relationship to it.' },
      { name: '«You all are…»', description: 'The thing is addressed as a plurality. German: «Ihr seid…», an archaic ihrzen register that gives the stage its ceremonial feel.' },
      { name: '«I am…»', description: 'Players become the thing and speak from inside it. This stage is physical, not verbal.' },
    ],
    typicalDuration: '5-10 min',
    notes:
      'German rendering kept as reference: «Es ist…», «Du bist…», «Ihr seid…», «Ich bin…». «O Du…» is an alternative form for the second stage. Each stage should run long enough that the easy material runs out.',
    relatedTheory: ['gl-invocation', 'gl-offer'],
  },
];

export const formatById = (id) => FORMATS.find((f) => f.id === id) || null;
