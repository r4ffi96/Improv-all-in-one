/**
 * Terminology Glossary.
 *
 * Schema: id, term: {en, de}, definition: {en, de},
 *         relatedTerms: string[] (ids), sourceReference: string
 *
 * v1 seeds English only. The German fields are present in the shape so a
 * German pass can be added later without restructuring; empty strings fall
 * back to English at read time.
 */

export const GLOSSARY = [
  {
    id: 'gl-status',
    term: { en: 'Status', de: '' },
    definition: {
      en: 'Behaviour, not rank. Status is what a person does with eye contact, stillness, space, silence and the right to interrupt. Every exchange contains a status transaction, and status can be raised or lowered at will inside a scene without the plot providing a reason. A common confusion is to treat a pleaser as low status: a low-status character wants something and fails to get it in a specific way, which is watchable; a pleaser wants the scene to be comfortable, which is not.',
      de: '',
    },
    relatedTerms: ['gl-pleaser', 'gl-platform', 'gl-tilt'],
    sourceReference: 'Johnstone - Impro',
  },
  {
    id: 'gl-platform',
    term: { en: 'Platform', de: '' },
    definition: {
      en: 'The routine established before anything happens: who these people are to each other, where they are, and what they normally do here. A platform is built with specifics (names, habits, objects) and needs to run longer than feels comfortable to the players. Without a platform there is nothing for a tilt to break.',
      de: '',
    },
    relatedTerms: ['gl-tilt', 'gl-status', 'gl-offer'],
    sourceReference: 'Johnstone - Impro',
  },
  {
    id: 'gl-tilt',
    term: { en: 'Tilt', de: '' },
    definition: {
      en: 'The single event that breaks the routine of the platform. One tilt is enough: a scene that adds a second tilt is usually avoiding the consequences of the first. After the tilt the scene follows what the break changes about the people in it.',
      de: '',
    },
    relatedTerms: ['gl-platform', 'gl-game-of-the-scene'],
    sourceReference: 'Johnstone - Impro',
  },
  {
    id: 'gl-game-of-the-scene',
    term: { en: 'Game of the Scene', de: '' },
    definition: {
      en: 'The pattern a scene builds by repeating one unusual thing in new but logically connected forms. The engine question is: if this is true, what else is true? Each heightening move is a consequence of the same premise rather than a new idea, and a second unusual thing replaces the game instead of heightening it. A usable game can be named in one sentence.',
      de: '',
    },
    relatedTerms: ['gl-heightening', 'gl-offer', 'gl-its-tuesday', 'gl-tilt'],
    sourceReference: 'UCB Manual',
  },
  {
    id: 'gl-heightening',
    term: { en: 'Heightening', de: '' },
    definition: {
      en: 'Growing the game by making it more specific or more frequent, not louder. Volume is the most common substitute for heightening. Practically: find the second example of the pattern before reaching for the third, and let the stakes rather than the decibels rise.',
      de: '',
    },
    relatedTerms: ['gl-game-of-the-scene', 'gl-callback'],
    sourceReference: 'UCB Manual',
  },
  {
    id: 'gl-waif',
    term: { en: 'Waif', de: '' },
    definition: {
      en: 'A character defined by a way of needing rather than by surface qualities. The waif is not "sad" or "sweet": it is a specific relationship to what is missing, and every behaviour follows from that source. The waif is the standard reference case for building character from a source of behaviour, which is the logic of mask work generally.',
      de: '',
    },
    relatedTerms: ['gl-mask-work', 'gl-status'],
    sourceReference: 'Johnstone - Impro',
  },
  {
    id: 'gl-mask-work',
    term: { en: 'Mask Work', de: '' },
    definition: {
      en: 'Character work that starts from a physical source (a held breath, a weight in one hip, a fixed gaze) and lets behaviour arrive from it, instead of deciding traits in advance. Surface qualities are results; the source is what a player can actually play. For a coach the practical shift is from "play him more nervous" to "where in your body does this come from".',
      de: '',
    },
    relatedTerms: ['gl-waif', 'gl-laban'],
    sourceReference: 'Johnstone - Impro / mask tradition',
  },
  {
    id: 'gl-offer',
    term: { en: 'Offer', de: '' },
    definition: {
      en: 'Anything a player puts into the scene that the other players can build on: a line, a gesture, a silence, a change of status, an object. Accepting an offer means treating it as true and adding to it. Most blocked scenes are not blocked by refusal but by offers that are noticed and then dropped.',
      de: '',
    },
    relatedTerms: ['gl-endowment', 'gl-platform', 'gl-your-deal'],
    sourceReference: 'Johnstone - Impro',
  },
  {
    id: 'gl-your-deal',
    term: { en: 'Your Deal', de: '' },
    definition: {
      en: "Mick Napier's instruction to take care of yourself first: enter a scene with a point of view, a state or a physical weather system already present, rather than waiting to be given one. It is a correction to a misread yes-and culture in which both players enter empty and each waits to serve the other. The deal can be very quiet; it just has to be specific.",
      de: '',
    },
    relatedTerms: ['gl-offer', 'gl-game-of-the-scene'],
    sourceReference: 'Mick Napier - Improvise',
  },
  {
    id: 'gl-laban',
    term: { en: 'Laban Effort Actions', de: '' },
    definition: {
      en: 'Eight movement qualities built from three factors: weight (light or strong), time (sustained or sudden) and space (direct or indirect). The eight are float, punch, glide, slash, dab, wring, flick and press. For improv they work as character seeds that live in the body and require no backstory, and they give a coach precise language: "more press, less flick" is more usable than "be more serious".',
      de: '',
    },
    relatedTerms: ['gl-mask-work', 'gl-status'],
    sourceReference: 'Laban',
  },
  {
    id: 'gl-pleaser',
    term: { en: 'Pleaser', de: '' },
    definition: {
      en: 'A player, not a character: someone who agrees with everything, laughs along and never lets the scene cost them anything. It is frequently mistaken for low status, but the two are opposites in practice. The diagnostic question is: what does this person want, and what does it cost them not to get it? A pleaser cannot answer it. Name the mechanism, never the player.',
      de: '',
    },
    relatedTerms: ['gl-status', 'gl-restraint'],
    sourceReference: 'Johnstone lineage / Sandro original',
  },
  {
    id: 'gl-restraint',
    term: { en: 'Restraint', de: '' },
    definition: {
      en: 'Precision, not withholding. Restraint means fewer choices, each carrying more weight: one look, held; one sentence, meant. Withholding means the player has stepped out of the scene to protect themselves. From outside, withholding reads as absence and precision reads as pressure. Restraint only works while the stakes stay high.',
      de: '',
    },
    relatedTerms: ['gl-pleaser', 'gl-status'],
    sourceReference: 'Sandro original',
  },
  {
    id: 'gl-gibberish',
    term: { en: 'Gibberish', de: '' },
    definition: {
      en: 'Invented language with full emotional and physical commitment, used to strip meaning out of the words so that intention, rhythm and relationship have to carry the scene. Good gibberish has grammar-shaped rhythm; a single repeated sound is not gibberish. Frequently paired with an interpreter whose translation must match the length and emotional shape of what was produced.',
      de: '',
    },
    relatedTerms: ['gl-offer', 'gl-endowment'],
    sourceReference: 'Improv Encyclopedia',
  },
  {
    id: 'gl-endowment',
    term: { en: 'Endowment', de: '' },
    definition: {
      en: 'Giving another player who they are, what they have or how they feel, through behaviour rather than labels. A strong endowment is about relationship or behaviour; a weak one turns the scene into a guessing game. The endowed player accepts it and plays what the behaviour implies.',
      de: '',
    },
    relatedTerms: ['gl-offer', 'gl-status'],
    sourceReference: 'Improv Encyclopedia',
  },
  {
    id: 'gl-callback',
    term: { en: 'Callback', de: '' },
    definition: {
      en: 'The return of earlier material at a point where it now means something different. Three conditions: the material was strong when it first appeared, the return is timed rather than immediate, and the second appearance carries a shift in meaning. Repetition on its own is a repeat, not a callback.',
      de: '',
    },
    relatedTerms: ['gl-heightening', 'gl-game-of-the-scene'],
    sourceReference: 'UCB Manual / Sandro original',
  },
  {
    id: 'gl-invocation',
    term: { en: 'Invocation (UCB)', de: '' },
    definition: {
      en: 'A four-stage group opening that moves a single suggestion from outside description to first-person embodiment: «It is…», «You are…», «You all are…», «I am…». Established German rendering: «Es ist…», «Du bist…», «Ihr seid…», «Ich bin…», where «Ihr seid» uses an archaic ihrzen register that gives the third stage its ceremonial quality; «O Du…» is an alternative, more invocatory form for the second stage. The fourth stage is physical: players who stay verbal at «I am» have not made the jump.',
      de: '',
    },
    relatedTerms: ['gl-offer', 'gl-callback', 'gl-game-of-the-scene'],
    sourceReference: 'UCB Manual',
  },
  {
    id: 'gl-format-vs-game',
    term: { en: 'Format vs Game', de: '' },
    definition: {
      en: 'A game is a rule that shapes one scene. A format is a repeatable frame for a whole show: a fixed structure, a defined relationship to the audience, and an explicit split between what stays the same every night and what changes. A format needs a fixed asset doing the heavy lifting (a world premise, a sequence, a narrator frame) and a small number of variable slots. Everything variable is a game night; everything fixed is a play.',
      de: '',
    },
    relatedTerms: ['gl-four-corners', 'gl-game-of-the-scene'],
    sourceReference: 'anundpfirsich (BIG.BANG.IMPRO) / Sandro original',
  },
  {
    id: 'gl-four-corners',
    term: { en: 'Four Corners Test', de: '' },
    definition: {
      en: 'A world premise is playable only when four corners are filled: cause (why is the world like this), solution (what the world does about it), conflict (what pushes back) and actors (who has a stake, and on which side). A premise that only describes a state collapses into the first shared cliché. The recurring diagnosis is: the world is a state, not a system. The fix is more consequence, not a better idea.',
      de: '',
    },
    relatedTerms: ['gl-consequence-chain', 'gl-format-vs-game', 'gl-anti-brief'],
    sourceReference: 'Sandro original (Format Forge)',
  },
  {
    id: 'gl-consequence-chain',
    term: { en: 'Consequence Chain', de: '' },
    definition: {
      en: 'A whiteboard technique for building world logic by repeating one question: if this is true, what else is true? The first ring produces direct consequences, which are usually shared cultural clichés. The second ring, consequences of consequences, is where the world actually starts. Steer the chain towards the four corners and mark them as they appear.',
      de: '',
    },
    relatedTerms: ['gl-four-corners', 'gl-game-of-the-scene'],
    sourceReference: 'Sandro original (Format Forge)',
  },
  {
    id: 'gl-anti-brief',
    term: { en: 'Anti-brief', de: '' },
    definition: {
      en: 'The list of what a group currently finds terrible, kept visible throughout a format development day as a drift check. It is a design constraint rather than negativity: if the emerging format is drifting towards the anti-brief, that is information the group needs early rather than at the first performance.',
      de: '',
    },
    relatedTerms: ['gl-four-corners', 'gl-format-vs-game'],
    sourceReference: 'Sandro original (Format Forge)',
  },
  {
    id: 'gl-its-tuesday',
    term: { en: "It's Tuesday", de: '' },
    definition: {
      en: 'A scene pattern: a completely mundane exchange, an oversized emotional reaction to it, and then a scene that discovers why this small thing matters so much to this person. It solves the habit of hunting for an unusual thing in the content: the content is deliberately empty, so the unusual thing can only come from the reaction. Order matters, reaction first and reason second.',
      de: '',
    },
    relatedTerms: ['gl-game-of-the-scene', 'gl-heightening'],
    sourceReference: 'Sandro original / UCB lineage',
  },
  {
    id: 'gl-narrator-frame',
    term: { en: 'Narrator Frame', de: '' },
    definition: {
      en: 'A structural level in a format where a narrator addresses the audience directly, sets the world, jumps time and closes. It alternates with the content level, where the world premise is played out. The narrator is the highest-skill role in such a format because it carries frame, tempo and audience contact at once, and casting it is a deliberate production decision.',
      de: '',
    },
    relatedTerms: ['gl-format-vs-game', 'gl-four-corners'],
    sourceReference: 'Sandro original (Format Forge)',
  },
];

export const glossaryById = (id) => GLOSSARY.find((g) => g.id === id) || null;
