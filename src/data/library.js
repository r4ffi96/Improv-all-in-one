/**
 * Session building blocks for the Session Builder.
 *
 * Schema per item:
 *   id, name, type: 'warmup' | 'exercise' | 'main' | 'theory',
 *   categoryTags: string[], description, fullText, coachingNotes: string[],
 *   variations: string[], durationMinutes, groupSizeFit, source
 *
 * Optional extras used by the Trainer Guide export:
 *   setup: string, debriefQuestions: string[]
 *
 * This file holds the hand-written blocks. Everything imported from the
 * Improv Encyclopedia lives in encyclopedia-games.json and is merged in below.
 */

import ENCYCLOPEDIA_INDEX from './encyclopedia-games.json';

const CURATED = [
  /* ------------------------------------------------------------------ */
  /* WARM-UPS                                                            */
  /* ------------------------------------------------------------------ */
  {
    id: 'wu-association-circle',
    name: 'Association Circle',
    type: 'warmup',
    categoryTags: ['Association', 'Warm-up', 'Group', 'Spontaneity'],
    description:
      'Circle word association that shifts from words to sensory images, warming up associative speed without cleverness.',
    fullText:
      'Everyone stands in a circle. One player says a word, the next says the first word that arrives, around the circle at a steady tempo. After two or three laps, change the instruction: instead of a word, respond with a concrete sensory image (a smell, a texture, a piece of light, a sound). Keep the tempo. The point is to build a shared associative reflex and to move the room from head to body before any content work starts.',
    setup: 'Standing circle, no props. Coach keeps the tempo with a clap if the circle slows down.',
    coachingNotes: [
      'Speed over quality. The first thought is the offer.',
      'When a player pauses to find something clever, name the pattern, not the player.',
      'The image lap is the point of the exercise. Do not skip it to save time.',
      'Also usable mid-session as a two-minute reset when the room goes heady.',
    ],
    variations: [
      'Association in pairs, walking, at double tempo.',
      'Sound-only association: respond with a noise rather than a word.',
      'Contradiction round: respond with the association you would normally reject.',
    ],
    debriefQuestions: [
      'Where did you censor yourself?',
      'What changed when we moved from words to images?',
    ],
    durationMinutes: 10,
    groupSizeFit: '4+',
    source: 'Improv Encyclopedia (Association) / Sandro adaptation',
  },
  {
    id: 'wu-zip-zap-zop',
    name: 'Zip Zap Zop',
    type: 'warmup',
    categoryTags: ['Energy', 'Concentration', 'Warm-up', 'Look and Listen'],
    description: 'Classic energy pass with three sounds, sharpening eye contact and clean sending.',
    fullText:
      'Circle. A player sends "Zip" to another player with a clear point and eye contact. That player sends "Zap" onward, the next sends "Zop", then back to "Zip". Drop players who hesitate or break the sequence only if you want competition; otherwise keep it collaborative and raise the tempo instead.',
    setup: 'Standing circle, arm space between players.',
    coachingNotes: [
      'The failure mode is a vague send. Insist on eye contact before the sound.',
      'Raise tempo rather than adding rules if the group is already warm.',
      'A group that never drops the ball is not going fast enough.',
    ],
    variations: [
      'Add a fourth sound with a physical shape.',
      'Silent version: the send is only eye contact plus a gesture.',
    ],
    debriefQuestions: ['What did you do differently when you knew you were about to receive?'],
    durationMinutes: 7,
    groupSizeFit: '5+',
    source: 'Improv Encyclopedia (Energy)',
  },
  {
    id: 'wu-name-toss',
    name: 'Name Toss',
    type: 'warmup',
    categoryTags: ['Introduction', 'Concentration', 'Warm-up', 'Group'],
    description: 'Ball pattern built on names, used for a new or partly new group.',
    fullText:
      'Circle. Each player says their own name once. Then a player says another player\'s name and tosses an imaginary or real ball to them. Build one fixed pattern that repeats, then add a second and third ball into the same pattern.',
    setup: 'Circle, one soft ball if available, otherwise mimed.',
    coachingNotes: [
      'Fix one pattern before adding balls. Groups tend to add too early and lose it.',
      'Use this when the group is new to each other. Skip it when they are not.',
    ],
    variations: [
      'Reverse the pattern.',
      'Add a second pattern with a different object type and run both at once.',
    ],
    debriefQuestions: ['Whose name do you still not know?'],
    durationMinutes: 8,
    groupSizeFit: '5+',
    source: 'Improv Encyclopedia (Introduction)',
  },
  {
    id: 'wu-count-to-twenty',
    name: 'Count to Twenty',
    type: 'warmup',
    categoryTags: ['Group', 'Look and Listen', 'Concentration', 'Trust'],
    description:
      'The group counts to twenty with no order agreed; two voices at once resets to one.',
    fullText:
      'Group stands or sits, eyes open or closed. Anyone may say the next number. If two players speak at once, the group starts again at one. No system, no order, no rhythm agreements. The exercise trains the group to listen for the impulse of others rather than plan their own entrance.',
    setup: 'Standing circle or scattered in the room. Eyes closed raises the difficulty.',
    coachingNotes: [
      'When a group invents a system, take it away and restart. The system defeats the exercise.',
      'A group that reaches twenty quickly is either listening or cheating. Ask them which.',
      'Do not let this run past five minutes of frustration. Land it and move on.',
    ],
    variations: [
      'Count with eyes closed.',
      'Count with words of a shared sentence instead of numbers.',
    ],
    debriefQuestions: ['How did you know it was your turn?', 'What happened just before a collision?'],
    durationMinutes: 8,
    groupSizeFit: '4+',
    source: 'Improv Encyclopedia (Concentration)',
  },
  {
    id: 'wu-mirror',
    name: 'Mirror',
    type: 'warmup',
    categoryTags: ['Trust', 'Look and Listen', 'Concentration', 'Physicality'],
    description: 'Pairs mirror movement, then hand over the lead until no one is leading.',
    fullText:
      'Pairs face each other. A leads, B mirrors, slow enough that an outside eye cannot tell who leads. Swap. Then remove the assignment: the lead passes back and forth without agreement. Finish with a lap where both partners try to have no leader at all.',
    setup: 'Pairs with space. Soft music helps the tempo stay slow.',
    coachingNotes: [
      'Speed is the enemy here. Slow is what makes the lead invisible.',
      'Eye contact stays soft, on the whole partner, not on the hands.',
      'This is the physical version of joint authorship. Name that link out loud.',
    ],
    variations: [
      'Mirror with sound as well as movement.',
      'Group mirror: a circle with a shifting, unannounced leader.',
    ],
    debriefQuestions: ['When did the lead actually change?', 'What did it feel like to stop deciding?'],
    durationMinutes: 10,
    groupSizeFit: 'any (pairs)',
    source: 'Improv Encyclopedia (Trust)',
  },
  {
    id: 'wu-last-word-response',
    name: 'Last Word Response',
    type: 'warmup',
    categoryTags: ['Look and Listen', 'Listening', 'Accepting', 'Warm-up'],
    description:
      'Every line must begin with the last word of the partner\'s line, forcing real listening to the end of a sentence.',
    fullText:
      'Pairs or a small circle. Player A speaks a sentence. Player B must begin their sentence with the exact last word A used, then continue freely. Run it as a conversation first, then as a scene with a relationship. The mechanic makes it impossible to prepare a line while the partner is still speaking.',
    setup: 'Pairs standing, or a circle of four for the scene version.',
    coachingNotes: [
      'Players will start planning again as soon as the mechanic becomes easy. Add a relationship to raise the load.',
      'Do not let the last word turn into a joke generator. The content still has to mean something.',
      'This is the cleanest diagnostic for a group that talks over each other.',
    ],
    variations: [
      'Last two words instead of one.',
      'Scene version: keep the rule, add a relationship and a location.',
      'Silent variant: respond to the last gesture rather than the last word.',
    ],
    debriefQuestions: [
      'What did you hear that you would normally have missed?',
      'Where did the rule make the scene better rather than just harder?',
    ],
    durationMinutes: 15,
    groupSizeFit: 'any (pairs)',
    source: 'Sandro original',
  },
  {
    id: 'wu-what-are-you-doing',
    name: 'What Are You Doing?',
    type: 'warmup',
    categoryTags: ['Spontaneity', 'Warm-up', 'Energy'],
    description: 'Mimed activity plus a mismatched verbal answer, the standard spontaneity drill.',
    fullText:
      'Two lines facing each other. Player A mimes an activity. Player B asks "What are you doing?" A answers with a different activity than the one being mimed. B now mimes the answer, and the next player asks. Keep the pace relentless.',
    setup: 'Two lines, players rotate to the back after their turn.',
    coachingNotes: [
      'Tempo is the whole exercise. A pause is the only real mistake.',
      'Celebrate the bad answers loudly so nobody starts curating.',
    ],
    variations: [
      'Answers must fit a category (kitchen, funeral, one specific film).',
      'Answers must be emotional states rather than activities.',
    ],
    debriefQuestions: ['What kind of answer did you keep reaching for?'],
    durationMinutes: 10,
    groupSizeFit: '6+',
    source: 'Improv Encyclopedia (Spontaneity)',
  },
  {
    id: 'wu-status-walks',
    name: 'Status Walks',
    type: 'warmup',
    categoryTags: ['Status', 'Warm-up', 'Physicality', 'Character'],
    description:
      'Walking the room at numbered status levels, then meeting other players and adjusting.',
    fullText:
      'Players walk the room neutrally. Coach calls a number from one to ten: one is the lowest status the player can play, ten the highest. Players adjust posture, tempo, eye contact and where the weight sits. After a few calls, players meet in pairs at their called number and hold ten seconds of silent contact. Finally, call two numbers at once and let pairs of different levels meet.',
    setup: 'Open floor. Coach calls numbers over the walking.',
    coachingNotes: [
      'Status is behaviour, not rank. A ten can be quiet and a one can be loud.',
      'Watch for the pleaser: a player who plays "nice" and calls it low status. Name the difference here, it saves an hour later.',
      'Head stillness and eye contact carry more than volume. Point at that specifically.',
    ],
    variations: [
      'Status pull: two players secretly try to end up one point above the other.',
      'Status of the space: play status towards objects and the room, not people.',
    ],
    debriefQuestions: [
      'Which number was hardest, and what did you do instead of playing it?',
      'What changed in your body between a four and a six?',
    ],
    durationMinutes: 12,
    groupSizeFit: '4+',
    source: 'Johnstone - Impro / Improv Encyclopedia (Status)',
  },
  {
    id: 'wu-laban-walks',
    name: 'Laban Effort Walks',
    type: 'warmup',
    categoryTags: ['Physicality', 'Character', 'Energy', 'Laban'],
    description:
      'Walking the eight Laban effort actions as a physical vocabulary for character building.',
    fullText:
      'Players walk neutrally. Coach names one effort action at a time and the group walks it: press, flick, punch, float, wring, dab, slash, glide. Give each roughly forty seconds. Then call an action and add a simple task (open a door, greet someone, pick something up) so the effort has to survive contact with an action. Close by letting each player pick the one that felt least like them and walk it for a minute.',
    setup: 'Open floor, no props. Optional: printed list of the eight actions on the wall.',
    coachingNotes: [
      'Effort is weight, time and space, not mood. Do not let players collapse it into an emotion.',
      'The action they dislike is usually the most useful character seed.',
      'Keep this physical. Explanation should stay under two minutes.',
    ],
    variations: [
      'Pairs: one effort each, play a thirty-second silent scene.',
      'Shift effort mid-scene on a coach clap and let the character change with it.',
    ],
    debriefQuestions: [
      'Which effort do you default to on stage?',
      'What character arrived without you deciding anything?',
    ],
    durationMinutes: 15,
    groupSizeFit: '3+',
    source: 'Laban / Sandro adaptation',
  },
  {
    id: 'wu-emotional-ripple',
    name: 'Emotional Ripple',
    type: 'warmup',
    categoryTags: ['Energy', 'Emotion', 'Group', 'Warm-up'],
    description: 'One player seeds an emotional state at full size, the circle catches and passes it.',
    fullText:
      'Circle. One player steps in with a sound and a full-body emotional state at about eighty percent size. The circle copies it exactly, holds it for five seconds, then the next player transforms it into a new state. No naming the emotion out loud. The purpose is permission to be large before any scene work asks for it.',
    setup: 'Circle with room to move into the middle.',
    coachingNotes: [
      'Copy exactly before transforming. Groups skip the copy and lose the training value.',
      'Push size. Most players offer thirty percent and think it is a hundred.',
    ],
    variations: [
      'Pass around the circle rather than through the middle.',
      'Add a single word of text at the height of the state.',
    ],
    debriefQuestions: ['What size felt embarrassing, and what did it look like from outside?'],
    durationMinutes: 10,
    groupSizeFit: '5+',
    source: 'Improv Encyclopedia (Energy) / Sandro adaptation',
  },
  {
    id: 'wu-checkin-circle',
    name: 'Check-in Circle',
    type: 'warmup',
    categoryTags: ['Introduction', 'Group', 'Trust', 'Warm-up'],
    description: 'A single framed question each, opening the session and reading the room.',
    fullText:
      'Circle. Each player answers one framed question in two sentences maximum. Choose the frame to match the session topic, for example: "Name a fictional world you would like to spend an evening in, and what pulls you there" for a world-building day, or "One thing that is taking up space in your head right now" for a session on presence. The coach answers too.',
    setup: 'Circle, seated or standing. Coach sets the frame and models the length.',
    coachingNotes: [
      'Two sentences. Enforce it kindly or the check-in eats fifteen minutes.',
      'The answers are casting information for the rest of the day. Write them down.',
    ],
    variations: [
      'Physical check-in: a shape and a sound instead of words.',
      'Weather report: describe your state as weather.',
    ],
    debriefQuestions: [],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'Sandro original',
  },
  {
    id: 'wu-sound-ball',
    name: 'Sound Ball',
    type: 'warmup',
    categoryTags: ['Spontaneity', 'Energy', 'Warm-up'],
    description: 'Throwing an invented sound as an object, received in the same shape.',
    fullText:
      'Circle. A player throws an imaginary ball with an invented sound. The receiver catches it and repeats the sound exactly as thrown, then transforms it into a new sound and throws on. The transformation is where players notice how quickly they reach for language.',
    setup: 'Circle with throwing space.',
    coachingNotes: [
      'The received sound must be repeated, not approximated. That is the accepting part.',
      'If sounds turn into words, restart with a nonsense-only rule.',
    ],
    variations: [
      'The ball has weight and size that must match the sound.',
      'Two balls in circulation.',
    ],
    debriefQuestions: [],
    durationMinutes: 7,
    groupSizeFit: '5+',
    source: 'Improv Encyclopedia (Spontaneity)',
  },
  {
    id: 'wu-yes-lets',
    name: 'Yes Let\'s',
    type: 'warmup',
    categoryTags: ['Accepting', 'Warm-up', 'Group', 'Energy'],
    description: 'Any player proposes an activity, everyone answers "Yes let\'s" and does it.',
    fullText:
      'Players move through the room. Anyone may call out an activity ("Let\'s climb a rope ladder"). Everyone answers "Yes let\'s" and does it physically until the next proposal arrives. Run for a few minutes, then add the rule that a proposal must build on the last one rather than replace it.',
    setup: 'Open floor.',
    coachingNotes: [
      'The build variant is the actual training. The first version is only the on-ramp.',
      'Watch for players who never propose. Give them a silent quota.',
    ],
    variations: [
      'Building version only: every proposal must accept the previous world.',
      'Silent version: proposals are physical, acceptance is joining.',
    ],
    debriefQuestions: ['What proposal did you swallow, and why?'],
    durationMinutes: 8,
    groupSizeFit: '4+',
    source: 'Improv Encyclopedia (Accepting)',
  },

  /* ------------------------------------------------------------------ */
  /* EXERCISES                                                           */
  /* ------------------------------------------------------------------ */
  {
    id: 'ex-i-am-i-am',
    name: '"I am, I am" (Continuous Tableau)',
    type: 'exercise',
    categoryTags: ['Group', 'Association', 'Spontaneity', 'Format Forge', 'Free Play'],
    description:
      'Players build a continuous picture by naming what they are, entering and leaving without ever resetting.',
    fullText:
      'One player enters the space and names what they are: «I am a tree». Each following player enters and completes the picture with a further offer. Nothing is taken out, there is no reset, and there is no narration of what the picture "means". Players step out when they no longer complete the picture, and step back in with a new offer under the question "if this is true, what else is true?". Run rounds of six to seven minutes.\n\nThis is the free-play engine of the Format Forge: the same "if this is true" logic that later drives the consequence chain, but played with bodies instead of a whiteboard.',
    setup:
      'Open playing area, the group watching from one side. One outside eye per round, rotating, taking keyword-level notes: laughter, sudden silence, leaning in, images that return.',
    coachingNotes: [
      'Watch for emotional heat, not cleverness. The notes should record where the room reacted, not where the joke landed.',
      'If play goes flat and wordy, side-coach towards bodies and images.',
      'Name the bridge out loud: this mindset is the same engine as the consequence chain.',
      'No taking-out and no reset. Both are the group avoiding the picture it has already made.',
    ],
    variations: [
      'Silent version: enter with a shape only.',
      'Category constraint: everything in the picture must belong to one world.',
      'Two-picture version: two tableaux running in parallel that eventually have to meet.',
    ],
    debriefQuestions: [
      'Which image came back more than once?',
      'Where did the room go quiet, and what was on stage at that moment?',
    ],
    durationMinutes: 30,
    groupSizeFit: '3-8',
    source: 'Sandro original (Formatschmiede)',
  },
  {
    id: 'ex-collective-character',
    name: 'Collective Character',
    type: 'exercise',
    categoryTags: ['Group', 'Character', 'Concentration', 'Trust'],
    description:
      'Several players play one single character together, sharing voice, body and decisions.',
    fullText:
      'Three to five players form one character. They stand close, share a posture, and speak as one, either in unison or by handing single words along the line. The character then plays a simple scene against a single player. The group character has to make one decision at a time, which forces the players to give up individual authorship and listen at a very fine grain.',
    setup:
      'Group character stands together downstage, one solo player opposite. Give the solo player a clear want so the scene has pressure.',
    coachingNotes: [
      'Unison speech will fail first. Let it fail, then switch to word-by-word handover.',
      'The collective character must have one body, not three. Watch feet and breath.',
      'Do not let the group character become a monster or a chorus of jokes. Give it a want.',
    ],
    variations: [
      'Two collective characters against each other.',
      'One player is the body, another is the voice, a third is the impulse.',
      'The collective character is a group under stress: a family, a committee, a company.',
    ],
    debriefQuestions: [
      'When did you stop trying to steer?',
      'What did the character want, and who decided that?',
    ],
    durationMinutes: 25,
    groupSizeFit: '4-6',
    source: 'Sandro original',
  },
  {
    id: 'ex-silent-hand-raise',
    name: 'Silent Hand-Raise Scene Work',
    type: 'exercise',
    categoryTags: ['Look and Listen', 'Group', 'Concentration', 'Trust'],
    description:
      'Scenes are started only by silent hand raises, with no verbal negotiation about who goes.',
    fullText:
      'The group sits facing the playing area. When a player has a genuine impulse, they raise a hand silently. When two hands are up, those two players go and start a scene immediately, with no discussion, no "you go", no eye-rolling. If three hands go up, the group has to solve it silently. Scenes are short, two to three minutes, edited by the coach.\n\nThe exercise removes the social negotiation that normally eats the energy between scenes and makes players own their impulse instead of waiting to be picked.',
    setup: 'Chairs or floor on one side, clean playing area. Coach edits with a clap.',
    coachingNotes: [
      'The rule is silence, not politeness. A player who lowers their hand to be nice is the note.',
      'Track who never raises a hand and who always does. That is the real data of the exercise.',
      'Do not fill the gaps. The silence before a scene is part of the training.',
    ],
    variations: [
      'One hand only: a solo piece.',
      'Hands stay up until the scene starts, so the group sees the shape of everyone\'s impulse.',
      'Add a topic constraint from the session focus.',
    ],
    debriefQuestions: [
      'What stopped you raising your hand?',
      'What did you notice about the scenes that started fastest?',
    ],
    durationMinutes: 25,
    groupSizeFit: '5-10',
    source: 'Sandro original',
  },
  {
    id: 'ex-its-tuesday-scenes',
    name: 'It\'s Tuesday Scenes',
    type: 'exercise',
    categoryTags: ['Game of the Scene', 'Emotion', 'Reaction', 'UCB'],
    description:
      'A tiny ordinary exchange triggers an oversized emotional reaction, and the scene finds out why it matters.',
    fullText:
      'Two players. The scene starts with a completely mundane exchange, for example one player saying it is Tuesday. The second player reacts far larger than the line deserves. Neither player explains the reaction at once. The scene then investigates why this small thing matters so much to this person, and the answer becomes the game.\n\nThe exercise breaks the habit of finding the unusual thing in the content. Here the content is deliberately empty, so the unusual thing can only come from the reaction.',
    setup: 'Two chairs or an empty stage. Coach can feed the mundane opening line.',
    coachingNotes: [
      'The reaction must come before the reason. Players who explain first kill the game.',
      'Ask for the second and third example of the same behaviour rather than a new idea.',
      '"Why does it matter to this person" is the only question the scene has to answer.',
    ],
    variations: [
      'The reacting player is the one who chooses the mundane line.',
      'Reaction is physical only for the first thirty seconds.',
      'Three-line version: mundane line, huge reaction, one line that reveals the stakes.',
    ],
    debriefQuestions: [
      'What was the actual game, in one sentence?',
      'Where did the scene explain instead of play?',
    ],
    durationMinutes: 25,
    groupSizeFit: '2-8',
    source: 'UCB lineage / Sandro adaptation',
  },
  {
    id: 'ex-platform-tilt',
    name: 'Platform and Tilt',
    type: 'exercise',
    categoryTags: ['Narrative', 'Platform', 'Status', 'Johnstone'],
    description:
      'Build a boring, detailed everyday platform, then introduce exactly one tilt and follow it.',
    fullText:
      'Two players build a platform: a routine, a relationship and a place, with real detail and no story pressure. The coach lets the platform run for a genuinely uncomfortable amount of time, ninety seconds or more. Then one player introduces a single tilt, something that breaks the routine. From there the scene follows the consequences of the tilt rather than adding a second one.',
    setup: 'Bare stage. Coach times the platform and calls "tilt" if the players will not commit.',
    coachingNotes: [
      'Groups tilt far too early because the platform feels boring to play. Boring to play is often interesting to watch.',
      'One tilt. A second tilt is avoidance dressed as generosity.',
      'The detail in the platform is what makes the tilt land. Ask for specifics: names, objects, habits.',
    ],
    variations: [
      'Platform only: no tilt at all, five minutes.',
      'The tilt comes from an offstage player as a single line or sound.',
      'Reincorporate the tilt at the end as a return to the routine.',
    ],
    debriefQuestions: [
      'What was the routine, precisely?',
      'What did the tilt change about who these people are to each other?',
    ],
    durationMinutes: 25,
    groupSizeFit: '2-8',
    source: 'Johnstone - Impro',
  },
  {
    id: 'ex-status-transaction',
    name: 'Status Transaction Scenes',
    type: 'exercise',
    categoryTags: ['Status', 'Character', 'Johnstone'],
    description:
      'Two players play a simple transaction while secretly holding assigned status levels, then swap during the scene.',
    fullText:
      'Give each player a secret status number from one to ten. They play a simple transaction: buying something, returning something, asking for a day off. The status is played through behaviour only, never announced. Halfway through, the coach claps and the players must swap positions on the status ladder inside the fiction, without a new event being invented to justify it.\n\nThe swap is the training. It shows that status is something you do, not something you are given by the plot.',
    setup: 'Two chairs, a counter or a desk. Numbers handed out on paper so nobody hears them.',
    coachingNotes: [
      'The audience should be able to guess both numbers within twenty seconds. If not, the behaviour is too general.',
      'A pleaser is not low status. Name the distinction the moment it appears.',
      'The swap must be behavioural: eye contact, stillness, who fills silences, who touches what.',
    ],
    variations: [
      'Both players play the same number.',
      'Status towards an offstage third party who never appears.',
      'Silent version, transaction only in physicality.',
    ],
    debriefQuestions: [
      'What did you actually change when you swapped?',
      'Where did status come from the words rather than the body?',
    ],
    durationMinutes: 25,
    groupSizeFit: '2-8',
    source: 'Johnstone - Impro',
  },
  {
    id: 'ex-restraint-scenes',
    name: 'Restraint Scenes',
    type: 'exercise',
    categoryTags: ['Restraint', 'Precision', 'Emotion', 'Character'],
    description:
      'Scenes played with a hard limit on output, where less has to mean more precise rather than less committed.',
    fullText:
      'Play a scene with high stakes under a strict restriction: five words per line, or no gestures above the waist, or the whole scene sitting still. The restriction is not there to make the players smaller. It is there to force each remaining choice to carry the weight. Run the same scenario twice, once unrestricted and once restricted, and compare.\n\nThe framing matters: restraint is precision, not withholding. A player who simply disappears has misread the exercise.',
    setup: 'Two players, one clear high-stakes situation given by the coach. Run the unrestricted version first.',
    coachingNotes: [
      'Withholding looks like restraint from the inside and like absence from the outside. Say this before you start.',
      'Ask which of the two versions the audience believed more, not which was more comfortable.',
      'Keep the stakes high. Restraint on a low-stakes scene teaches nothing.',
    ],
    variations: [
      'Restriction changes mid-scene.',
      'One player restricted, the other not.',
      'Restriction is emotional: the character may not show the one feeling driving them.',
    ],
    debriefQuestions: [
      'Where did you stop playing rather than play smaller?',
      'Which single moment carried the most, and how big was it actually?',
    ],
    durationMinutes: 25,
    groupSizeFit: '2-8',
    source: 'Sandro original',
  },
  {
    id: 'ex-waif-mask',
    name: 'Waif and Mask Work',
    type: 'exercise',
    categoryTags: ['Character', 'Mask', 'Trust', 'Johnstone'],
    description:
      'Character built from a source of behaviour rather than a set of surface qualities, using mask logic.',
    fullText:
      'Players work with a neutral or half mask, or without a mask using a mirror and a fixed physical starting point. The instruction is not to decide who the character is. Instead, adopt one physical source (a held breath, a weight in one hip, a fixed gaze) and let behaviour follow from it. The waif is the classic reference: a character defined by a way of needing, not by a list of traits.\n\nAfter the physical phase, play short scenes and keep asking where the behaviour comes from rather than what the character is like.',
    setup:
      'Masks if available, otherwise a mirror or a partner as mirror. Quiet room, low talk. Coach works one player at a time while the group watches.',
    coachingNotes: [
      'Surface qualities (funny, shy, arrogant) are results. Ask for the source instead.',
      'This work needs a settled room. Do not place it directly after a high-energy game.',
      'Watch for players performing the mask rather than being worn by it. Slow them down.',
      'If a player becomes emotionally loaded, take it at a break, privately.',
    ],
    variations: [
      'Neutral mask only, no scenes, pure walking.',
      'Two masks meet with no text.',
      'Remove the mask mid-scene and try to keep the source.',
    ],
    debriefQuestions: [
      'Where in your body did the character live?',
      'What did the character need, and what did it do to get it?',
    ],
    durationMinutes: 35,
    groupSizeFit: '3-8',
    source: 'Johnstone - Impro / mask tradition',
  },
  {
    id: 'ex-gibberish-interpreter',
    name: 'Gibberish Interpreter',
    type: 'exercise',
    categoryTags: ['Gibberish', 'Look and Listen', 'Accepting', 'Spontaneity'],
    description:
      'One player speaks gibberish, another translates, and the translation must honour what was actually expressed.',
    fullText:
      'Player A speaks only gibberish, with full emotional and physical commitment. Player B translates for a third player or the audience. The translation must match the length, energy and emotional shape of what A produced. Then reverse: B translates first and A has to make the gibberish fit.',
    setup: 'Three players: speaker, interpreter, and a listener who has a reason to need the translation.',
    coachingNotes: [
      'Translations that are much shorter than the gibberish are the interpreter ignoring their partner.',
      'Gibberish must not become a single repeated sound. Ask for a language with grammar-shaped rhythm.',
      'Give the listener a stake so the scene is not just a demonstration.',
    ],
    variations: [
      'Interpreter translates badly on purpose and both players justify it.',
      'Two gibberish speakers, one interpreter for both.',
      'Emotional mismatch: the translation carries the opposite feeling and the scene deals with it.',
    ],
    debriefQuestions: ['What did you understand before the translation arrived?'],
    durationMinutes: 20,
    groupSizeFit: '3-9',
    source: 'Improv Encyclopedia (Gibberish)',
  },
  {
    id: 'ex-endowment-scenes',
    name: 'Endowment Scenes',
    type: 'exercise',
    categoryTags: ['Endowment', 'Accepting', 'Character'],
    description:
      'A player is given who they are by the partner and has to accept it without arguing or over-explaining.',
    fullText:
      'Player B leaves the room or turns away. The group and player A agree an endowment: an occupation, a history, a quality. The scene starts and A treats B as that person from the first line, without naming it directly. B accepts everything and plays what the behaviour implies. Once B is confident, they may state it, and the scene continues with it established.',
    setup: 'One player briefly out of earshot, group agrees the endowment in ten seconds.',
    coachingNotes: [
      'Endowments should be about behaviour or relationship, not guessing games about objects.',
      'The endowed player accepts. Any "no I am not" ends the exercise.',
      'The endower must show, not label. If they have to say it, they have not played it.',
    ],
    variations: [
      'Mutual endowment: both players endow each other simultaneously.',
      'Emotional endowment only.',
      'The endowment is a relationship history rather than an identity.',
    ],
    debriefQuestions: ['What was the first clue you picked up?', 'What did you resist, and why?'],
    durationMinutes: 20,
    groupSizeFit: '3-10',
    source: 'Improv Encyclopedia (Accepting)',
  },
  {
    id: 'ex-if-this-is-true',
    name: 'If This Is True, What Else Is True?',
    type: 'exercise',
    categoryTags: ['Game of the Scene', 'UCB', 'Heightening', 'Association'],
    description:
      'A single unusual premise is heightened by finding further consequences of the same logic, not new ideas.',
    fullText:
      'Two players. The scene establishes one unusual thing early. From then on, every heightening move must be a consequence of that same premise, never a new unusual thing. The coach can side-coach with the title question. Run three scenes, then run one where the group deliberately adds a second unusual thing so everyone can feel the difference.',
    setup: 'Bare stage. Coach may hand the first unusual thing to remove the search phase.',
    coachingNotes: [
      'The second unusual thing is the most common failure. Show it deliberately once so the group can recognise it.',
      'Heightening is not volume. Ask for the next logical consequence, at the same size.',
      'The same logic drives the Format Forge consequence chain. Say so if the group is heading that way.',
    ],
    variations: [
      'Three-ring version: the scene must reach a consequence of a consequence of a consequence.',
      'Group version at the whiteboard before playing it.',
      'The premise is drawn from a starred suggestion.',
    ],
    debriefQuestions: [
      'What was the premise in one sentence?',
      'Which move was a consequence and which was a new idea?',
    ],
    durationMinutes: 25,
    groupSizeFit: '2-8',
    source: 'UCB lineage',
  },
  {
    id: 'ex-your-deal',
    name: 'Your Deal (Napier Openings)',
    type: 'exercise',
    categoryTags: ['Character', 'Your Deal', 'Napier', 'Spontaneity'],
    description:
      'The first player enters with a strong point of view already in the body and takes responsibility for the scene.',
    fullText:
      'One player enters and, before any dialogue, has a deal: a physical state, an opinion, an emotional weather system. The first line comes from that deal, not from a question. The second player accepts and gives themselves an equally clear deal instead of servicing the first one. The exercise trains entering with something rather than waiting to be given something.',
    setup: 'Line of players offstage. Coach edits after ninety seconds regardless of resolution.',
    coachingNotes: [
      'A question in the first line is the standard avoidance. Ban questions for the first three lines.',
      '"Take care of yourself first" is the note. Two selfish players make a generous scene.',
      'Watch for the second player becoming an assistant. They need their own deal.',
    ],
    variations: [
      'Both players enter at the same time with separate deals.',
      'Deal is assigned by the group as a single word.',
      'Enter mid-activity so the deal is already in motion.',
    ],
    debriefQuestions: [
      'What was your deal before you spoke?',
      'Where did you drop it to help your partner?',
    ],
    durationMinutes: 25,
    groupSizeFit: '3-10',
    source: 'Mick Napier - Improvise',
  },
  {
    id: 'ex-environment-solo',
    name: 'Environment Solo',
    type: 'exercise',
    categoryTags: ['Environment', 'Object Work', 'Concentration'],
    description:
      'A solo player builds a specific place through object work alone, then a partner enters and inherits it.',
    fullText:
      'One player works alone in a place for two minutes with no dialogue: real object work, consistent sizes, consistent positions. Then a second player enters and must use at least three of the established objects correctly before speaking. The exercise makes space a shared asset instead of a private mime.',
    setup: 'Clean floor, no chairs unless the player builds them. Group watches in silence.',
    coachingNotes: [
      'Consistency beats detail. A door that moves is worse than a plain door.',
      'The entering player has to look before they act. Most will not.',
      'Two minutes of silence feels long to the player and short to the audience.',
    ],
    variations: [
      'Third player enters and changes one thing about the space.',
      'The place is from the world being built in a Format Forge day.',
      'Remove object work and build the space with sound only.',
    ],
    debriefQuestions: ['Where was the door?', 'What did you learn about the character from the space?'],
    durationMinutes: 20,
    groupSizeFit: '2-10',
    source: 'Improv Encyclopedia (Environment)',
  },
  {
    id: 'ex-freeze-tag',
    name: 'Freeze Tag',
    type: 'exercise',
    categoryTags: ['Closer', 'Spontaneity', 'Callback', 'Energy', 'Warm-up'],
    description:
      'Standing closer: players freeze a scene, replace a body position and start something new, ideally calling back the session.',
    fullText:
      'Two players start a physical scene. Any watching player calls «Freeze», taps out one player, takes the exact physical position and justifies it with a completely new scene. Run continuously.\n\nAs a session closer, add a callback focus: the new scenes should reach back to images, characters or phrases from the session that just happened. That turns the game from a warm-up into a shared memory exercise and sends the group out with the material still live.',
    setup:
      'Standing circle around an open area, everyone on their feet. Coach plays too if the group is small.',
    coachingNotes: [
      'Take the position exactly. Adjusting the position before justifying is the standard cheat.',
      'Freeze early and often. Long scenes here are avoidance.',
      'For the closer, name the callback focus explicitly. Without it players default to generic gags.',
      'Ten minutes standing. Do not sit the group down for this.',
    ],
    variations: [
      'Callback-only version: every new scene must use material from the session.',
      'Freeze from an image rather than a position.',
      'Two pairs alternating so nobody waits long.',
    ],
    debriefQuestions: ['Which image from today came back on its own?'],
    durationMinutes: 12,
    groupSizeFit: '4+',
    source: 'Improv Encyclopedia (Warm-up) / Sandro adaptation',
  },
  {
    id: 'ex-heightening-ladder',
    name: 'Heightening Ladder',
    type: 'exercise',
    categoryTags: ['Heightening', 'Game of the Scene', 'Emotion'],
    description:
      'The same game played three times at deliberately different intensities to make heightening a choice.',
    fullText:
      'Establish a simple game in a scene. Then replay the same scene three times: at a quarter of the intensity, at the original intensity, and at four times the intensity. Same game, same characters, same beats. The group watches which version is actually the most watchable, which is usually not the loudest one.',
    setup: 'Two players, one established game. Coach counts the group into each version.',
    coachingNotes: [
      'Heightening usually means more specific, not louder. This exercise proves it visually.',
      'The quarter-intensity version is often the strongest. Let the group discover that rather than telling them.',
    ],
    variations: [
      'Heighten only through stakes, keeping volume fixed.',
      'Heighten through frequency: the same behaviour, more often.',
    ],
    debriefQuestions: ['Which version did you believe?', 'What actually changed between versions?'],
    durationMinutes: 20,
    groupSizeFit: '2-8',
    source: 'UCB lineage / Sandro adaptation',
  },

  /* ------------------------------------------------------------------ */
  /* MAIN EXERCISES / LONG-FORM RUNS                                     */
  /* ------------------------------------------------------------------ */
  {
    id: 'main-harold-run',
    name: 'Harold Run (Full Structure)',
    type: 'main',
    categoryTags: ['Long Form', 'Harold', 'UCB', 'Group', 'Callback'],
    description:
      'A complete Harold: opening, three beats of three scenes with two group games, and callbacks in the third beat.',
    fullText:
      'Take one suggestion. Run the opening (Invocation or another group opening) to generate material. Then:\n\nBeat one: three unrelated scenes, A, B and C, each finding its own game.\nGroup game one.\nBeat two: A2, B2, C2, each heightening its own game rather than continuing the plot.\nGroup game two.\nBeat three: A3, B3, C3, where the three worlds are allowed to touch and earlier material returns.\n\nRun it once without stopping, then debrief with the whole group before optionally running a second one.',
    setup:
      'Full group on the back line, clean stage. Coach takes the suggestion and does not edit during the run. Time the whole run: twenty-five to thirty-five minutes.',
    coachingNotes: [
      'Do not coach during the run. Take notes and give everything afterwards.',
      'Second beats are for heightening the game, not for continuing the story.',
      'The most common failure is edits that come too late. Note edit points specifically.',
      'Group games are for generating and connecting material, not for filling time.',
    ],
    variations: [
      'Half Harold: two beats only, one group game.',
      'Harold with a fixed opening from the session material.',
      'Silent third beat: the connections are made physically.',
    ],
    debriefQuestions: [
      'What was the game of each first-beat scene?',
      'Which callback in beat three was earned and which was decorative?',
      'Where should an edit have happened?',
    ],
    durationMinutes: 45,
    groupSizeFit: '5-10',
    source: 'UCB Manual',
  },
  {
    id: 'main-invocation',
    name: 'Harold Invocation (Four Stages)',
    type: 'main',
    categoryTags: ['Long Form', 'Harold', 'UCB', 'Opening', 'Group'],
    description:
      'The four-stage UCB opening that moves a suggestion from outside description to first-person embodiment.',
    fullText:
      'The group takes a single word and moves through four stages, each one step closer to the thing itself.\n\nStage one, «It is…»: the group describes the thing from the outside. Third person, observational.\nStage two, «You are…»: the group addresses the thing directly. Second person, still outside but now in relationship to it.\nStage three, «You all are…»: the group addresses it as a plurality, widening it into a group of instances.\nStage four, «I am…»: players become it and speak from inside.\n\nEstablished German rendering, kept as a reference artifact: «Es ist…», «Du bist…», «Ihr seid…», «Ich bin…». Note that «Ihr seid» carries an archaic ihrzen register in German, which is part of what makes the third stage feel ceremonial; the alternative «O Du…» form can be used for stage two if a more invocatory tone is wanted.\n\nRun the invocation on its own several times before using it as an opening for a full Harold.',
    setup:
      'Group in a loose semicircle facing out or in, moving freely. Coach calls the stage transitions.',
    coachingNotes: [
      'Each stage should last long enough to run out of the easy material. That is where the useful offers arrive.',
      'Stage four is physical. Players who stay verbal at «I am» have not made the jump.',
      'The invocation is material generation, not a poem. Harvest concrete images, not moods.',
      'Do not explain the four stages for more than two minutes. Run it and explain afterwards.',
    ],
    variations: [
      'Invocation on a word taken from a starred suggestion.',
      'Two stages only, «It is» and «I am», for a short session.',
      'Invocation as a closer rather than an opener.',
    ],
    debriefQuestions: [
      'Which stage was hardest, and what did you do to avoid it?',
      'Which three images from the invocation would you take into a scene?',
    ],
    durationMinutes: 30,
    groupSizeFit: '4-10',
    source: 'UCB Manual',
  },
  {
    id: 'main-armando-run',
    name: 'Armando Run',
    type: 'main',
    categoryTags: ['Long Form', 'Armando', 'Monologue', 'Group'],
    description:
      'A true personal monologue seeds a set of scenes, with the monologist returning between scene groups.',
    fullText:
      'One player (or a guest) tells a true personal story from a suggestion, three to four minutes, without performing it as a bit. The group then plays scenes inspired by any element of the monologue: a detail, a relationship, a feeling, a turn of phrase. After two or three scenes, the monologist returns with a second story, prompted by what they just watched. Repeat for a total of three monologue blocks.',
    setup: 'Chair downstage for the monologist. Group on the back line. Coach handles the suggestion.',
    coachingNotes: [
      'Scenes should be inspired by, not illustrations of, the monologue.',
      'The monologist must not perform. The truer and less shaped, the better the scenes.',
      'A second monologue should be triggered by the scenes, not pre-planned.',
    ],
    variations: [
      'Rotating monologist, one per block.',
      'Monologue drawn from the session\'s check-in answers.',
    ],
    debriefQuestions: [
      'Which detail of the monologue produced the strongest scene?',
      'Where did a scene simply retell the story?',
    ],
    durationMinutes: 40,
    groupSizeFit: '5-9',
    source: 'Improv Encyclopedia (Long Form)',
  },
  {
    id: 'main-montage-run',
    name: 'Montage Run',
    type: 'main',
    categoryTags: ['Long Form', 'Montage', 'Association', 'Group'],
    description:
      'A free sequence of unrelated scenes connected only by association, edited fast.',
    fullText:
      'One suggestion, then a chain of two-person scenes with no obligation to a plot. Each scene is edited as soon as its game is visible. Connections between scenes are made by association: an image, a phrase, a physical shape carried across the edit. Run for twenty to twenty-five minutes without stopping.\n\nUse a montage when a group is over-thinking structure or when you want to see what a group naturally makes when nothing is required of them.',
    setup: 'Back line, clean stage, coach edits or players sweep.',
    coachingNotes: [
      'Edit early. A montage dies from long scenes, not from short ones.',
      'Association is the connective tissue. Ask for the thing you just saw, not a clever link.',
      'This is also the associative test mode used in the Format Forge test rounds.',
    ],
    variations: [
      'Themed montage from a single session topic.',
      'Montage with a hard three-minute cap per scene.',
      'Silent transitions, physical only.',
    ],
    debriefQuestions: ['Which associations carried, and which needed explaining?'],
    durationMinutes: 25,
    groupSizeFit: '4-10',
    source: 'Improv Encyclopedia (Long Form)',
  },
  {
    id: 'main-themed-scene-block',
    name: 'Themed Scene Block',
    type: 'main',
    categoryTags: ['Scene Work', 'Theme', 'Group'],
    description:
      'A block of scenes all built around the session topic, with a coached note between each.',
    fullText:
      'Three to five scenes, all playing the session topic explicitly, with a short coaching note between each. Unlike a montage, this block is deliberately interrupted: after each scene the coach names one thing that worked and one adjustment, and the next pair applies it. Use this as the centrepiece for a topic-focused class where the point is transfer, not performance.',
    setup: 'Pairs assigned or volunteered. Timer at three to five minutes per scene.',
    coachingNotes: [
      'One note per scene. Two notes is one too many.',
      'Notes are for the next pair as much as for the pair that just played.',
      'Keep the topic visible on a flipchart so scenes do not drift.',
    ],
    variations: [
      'Same scenario played by every pair.',
      'Second round where each pair replays their own scene with the note applied.',
    ],
    debriefQuestions: [
      'What note came up more than once across the block?',
      'What would you change if you played it again now?',
    ],
    durationMinutes: 35,
    groupSizeFit: '4-10',
    source: 'Sandro original',
  },
  {
    id: 'main-la-ronde',
    name: 'La Ronde Run',
    type: 'main',
    categoryTags: ['Long Form', 'La Ronde', 'Two-person', 'Structure'],
    description:
      'A chain of two-person scenes where one player always carries over into the next scene.',
    fullText:
      'Scene one is played by A and B. Scene two is B and C, in a new situation. Scene three is C and D, and so on, until the chain closes back on A. The carried-over player may keep or change character. The form makes relationship the through-line and gives a group a clean, low-risk long form to run.',
    setup: 'Fix the player order before starting so nobody has to negotiate mid-run.',
    coachingNotes: [
      'The carried player should change something. An identical character across scenes flattens the form.',
      'Keep scenes short, three minutes maximum.',
      'Closing the ring back to A is the payoff. Protect enough time for it.',
    ],
    variations: [
      'Each scene is one location further from the first.',
      'Carried player keeps the same emotional state throughout.',
    ],
    debriefQuestions: ['What did the carried player bring across each time?'],
    durationMinutes: 30,
    groupSizeFit: '4-8',
    source: 'Improv Encyclopedia (Long Form)',
  },
  {
    id: 'main-emotion-experiment-run',
    name: 'Emotion Experiment Run',
    type: 'main',
    categoryTags: ['Long Form', 'Format Forge', 'Narrator', 'Structure'],
    description:
      'Run of the forged narrator-framed format: neutral world, time jump, the experiment, closing moral.',
    fullText:
      'A fixed-sequence format with a narrator frame. Narrator sets the scene and establishes the world premise. The neutral world is played out in one or two scenes. The narrator jumps time. The experiment happens and feeling breaks through the neutral surface. The narrator closes with a moral.\n\nUse this as a main block when the group has forged the format and needs repetitions, or as a worked example of a fixed-sequence format for a group that has only ever played montages.',
    setup:
      'Assign the narrator deliberately. One audience-controlled variable may be taken at the beat where the world is already established.',
    coachingNotes: [
      'The narrator is the highest-skill role: frame, tempo, audience contact. Rotate it across runs.',
      'What is fixed (premise, sequence, narrator frame) and what is variable (setting, characters, the concrete instance) must be clear before the run starts.',
      'Five to six beats is plenty. Adding beats weakens the form.',
    ],
    variations: [
      'Run with a different setting each time to test how portable the sequence is.',
      'Run without a narrator to see what the frame was actually doing.',
    ],
    debriefQuestions: [
      'Did the narrator stay in charge?',
      'Which beat carried, and which one only explained?',
    ],
    durationMinutes: 30,
    groupSizeFit: '3-6',
    source: 'Sandro original (Format Forge output)',
  },
  {
    id: 'main-deconstruction',
    name: 'Deconstruction Run',
    type: 'main',
    categoryTags: ['Long Form', 'Deconstruction', 'Group', 'Structure'],
    description:
      'A single opening scene is broken apart, with later scenes exploring its characters, moments and implications.',
    fullText:
      'Play one full two-person scene, three to five minutes, as truthfully as possible. Then take it apart: scenes that show a moment from the first scene from another angle, scenes with one character in a different part of their life, scenes that literalise a phrase or an image from it. Return to the original relationship at least twice. The base scene is the entire source material for the run.',
    setup: 'Choose the opening pair deliberately. Everyone else stays on the back line and edits in.',
    coachingNotes: [
      'The first scene has to be played straight. A jokey base scene gives nothing to deconstruct.',
      'Deconstruction is not flashback. It is investigation.',
      'Keep the base scene visible: refer back to specific lines rather than to a general theme.',
    ],
    variations: [
      'Base scene taken from an earlier exercise in the session.',
      'Deconstruct a single line rather than the whole scene.',
    ],
    debriefQuestions: ['What did the deconstruction reveal that the base scene only implied?'],
    durationMinutes: 35,
    groupSizeFit: '5-10',
    source: 'Improv Encyclopedia (Long Form)',
  },

  /* ------------------------------------------------------------------ */
  /* THEORY BLOCKS                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'th-game-of-the-scene',
    name: 'Game of the Scene',
    type: 'theory',
    categoryTags: ['Theory', 'Game of the Scene', 'UCB'],
    description:
      'The UCB logic of finding one unusual thing and playing its pattern rather than adding new ideas.',
    fullText:
      'A scene begins with a base reality: two people, a relationship, something they are doing. Somewhere in the first exchanges, one unusual thing appears. The game of the scene is the pattern built by repeating that unusual thing in new but logically connected forms.\n\nThe engine question is: if this is true, what else is true? Each heightening move is a consequence of the same premise, not a fresh idea. A second unusual thing does not heighten a scene, it replaces it.\n\nThree practical markers: name the game in one sentence, find the second example before you find the third, and let the characters keep caring about the base reality while the pattern grows.',
    setup: 'Whiteboard or flipchart. Draw the base reality, the first unusual thing, and the ladder of examples.',
    coachingNotes: [
      'Keep this under ten minutes. It is learned by playing, not by hearing.',
      'Use a scene the group just played as the example rather than a canonical one.',
      'The distinction that costs groups the most time is game versus plot. Make it explicit.',
    ],
    variations: [],
    debriefQuestions: ['Name the game of the last scene in one sentence.'],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'UCB Manual',
  },
  {
    id: 'th-status-platform-tilt',
    name: 'Status, Platform and Tilt',
    type: 'theory',
    categoryTags: ['Theory', 'Status', 'Platform', 'Johnstone'],
    description:
      'Johnstone\'s scene grammar: status as behaviour, platform as the routine, tilt as the single break.',
    fullText:
      'Status is not rank, it is behaviour: what you do with eye contact, stillness, space, silences and the right to interrupt. Every exchange has a status transaction in it, and playing status deliberately is the fastest way to make an ordinary scene watchable.\n\nThe platform is the routine before anything happens: who these people are to each other, where they are, what they normally do. The tilt is the single event that breaks the routine. A scene that tilts before it has a platform has nothing to break.\n\nPractical rule: spend longer on the platform than feels comfortable, then tilt once and follow the consequences rather than adding a second tilt.',
    setup: 'Flipchart with three words: platform, tilt, consequences. Refer back to a scene the group played.',
    coachingNotes: [
      'Say the definition of status as behaviour out loud. Groups reliably hear "rank" instead.',
      'Give one physical demonstration of a status shift rather than three verbal examples.',
    ],
    variations: [],
    debriefQuestions: ['What was the platform in that scene, in one sentence?'],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'Johnstone - Impro',
  },
  {
    id: 'th-your-deal',
    name: 'Your Deal (Napier)',
    type: 'theory',
    categoryTags: ['Theory', 'Your Deal', 'Napier', 'Character'],
    description:
      'Take care of yourself first: enter with a point of view instead of waiting to be given one.',
    fullText:
      'Mick Napier\'s correction to a misread yes-and culture: a player who enters empty and waits to serve their partner puts the whole burden on that partner. Instead, enter with your deal already present, a state, an opinion, a physical weather system, and let the scene be built from two people who both brought something.\n\nThis does not license steamrolling. It reframes generosity: the most generous thing you can do at the top of a scene is to be someone specific, so your partner has something real to play with.',
    setup: 'Two minutes of framing, then straight into a Your Deal exercise.',
    coachingNotes: [
      'Pair this with an exercise immediately. As pure theory it invites arguments about yes-and.',
      'The failure mode after this input is aggressive players getting louder. Say in advance that the deal can be very quiet.',
    ],
    variations: [],
    debriefQuestions: ['What was your deal before you spoke?'],
    durationMinutes: 8,
    groupSizeFit: 'any',
    source: 'Mick Napier - Improvise',
  },
  {
    id: 'th-laban',
    name: 'Laban Effort Actions',
    type: 'theory',
    categoryTags: ['Theory', 'Laban', 'Physicality', 'Character'],
    description:
      'Eight effort actions as a physical vocabulary built from weight, time and space.',
    fullText:
      'Laban describes movement through three factors: weight (light or strong), time (sustained or sudden) and space (direct or indirect). Combining them gives eight effort actions: float, punch, glide, slash, dab, wring, flick, press.\n\nFor improv the value is practical: an effort action is a character seed that lives in the body and does not require a backstory. It also gives a coach a precise vocabulary. "More press, less flick" is a more usable note than "be more serious".',
    setup: 'List the eight actions visibly. Demonstrate two of them physically, do not describe all eight.',
    coachingNotes: [
      'Do not turn effort into emotion. Weight, time and space are the axes.',
      'Five minutes standing, then straight into Laban walks.',
    ],
    variations: [],
    debriefQuestions: ['Which effort is your stage default?'],
    durationMinutes: 8,
    groupSizeFit: 'any',
    source: 'Laban',
  },
  {
    id: 'th-pleaser-vs-low-status',
    name: 'Pleaser vs Low Status',
    type: 'theory',
    categoryTags: ['Theory', 'Status', 'Character'],
    description:
      'A pleaser avoids friction and gives the audience nothing; low status is a played behaviour with wants.',
    fullText:
      'The pleaser is a player, not a character: someone who agrees with everything, laughs along, and never lets a scene cost them anything. It often gets mistaken for low status, but the two are opposites in practice.\n\nA low-status character wants something, fails to get it in a specific way, and keeps trying. That is watchable. A pleaser wants the scene to be comfortable, which is not a want the audience can follow.\n\nThe diagnostic question is simple: what does this person want, and what does it cost them not to get it? A pleaser cannot answer it.',
    setup: 'Best delivered directly after a status exercise where a pleaser has appeared.',
    coachingNotes: [
      'Name the mechanism, never the player. "That scene had a pleaser in it" lands differently from naming someone.',
      'Give the diagnostic question as a takeaway the group can use on itself.',
    ],
    variations: [],
    debriefQuestions: ['What did your character want, and what did failing cost them?'],
    durationMinutes: 7,
    groupSizeFit: 'any',
    source: 'Johnstone lineage / Sandro original',
  },
  {
    id: 'th-restraint',
    name: 'Restraint: Precision, Not Withholding',
    type: 'theory',
    categoryTags: ['Theory', 'Restraint', 'Precision', 'Emotion'],
    description:
      'Less means each remaining choice carries more, not that the player commits less.',
    fullText:
      'Restraint gets taught as "do less" and heard as "give less". They are different things. Precision means the number of choices goes down and the weight of each one goes up: one look, held; one sentence, meant. Withholding means the player has stepped out of the scene and is protecting themselves.\n\nFrom the outside these look nothing alike. Withholding reads as absence and the audience disengages. Precision reads as pressure and the audience leans in.\n\nThe check is stakes: restraint only works when the stakes stay high. Lower the stakes and it is just a quiet scene.',
    setup: 'Show a thirty-second demonstration of both versions rather than explaining the difference.',
    coachingNotes: [
      'Demonstrate. This distinction almost never survives being explained only in words.',
      'Follow immediately with Restraint Scenes so the group can feel it.',
    ],
    variations: [],
    debriefQuestions: ['Was that restraint or was that leaving?'],
    durationMinutes: 7,
    groupSizeFit: 'any',
    source: 'Sandro original',
  },
  {
    id: 'th-waif-source-of-behavior',
    name: 'Mask Work and the Waif',
    type: 'theory',
    categoryTags: ['Theory', 'Mask', 'Character', 'Johnstone'],
    description:
      'Build character from a source of behaviour rather than from a list of surface qualities.',
    fullText:
      'Surface qualities (shy, arrogant, cheerful) are results. They give a player nothing to do beyond signalling. Mask work reverses the order: you take on a physical source, a held breath, a weight, a gaze, and the behaviour arrives from it. The character is discovered, not designed.\n\nThe waif is the classic reference case: a character defined by a way of needing. The waif is not "sad" or "sweet". The waif is a specific relationship to what is missing, and every behaviour follows from that.\n\nFor a coach this changes the note. Instead of "play him more nervous", the useful note is "where in your body does this come from".',
    setup: 'Quiet room, low light if possible. Do not schedule after a high-energy game.',
    coachingNotes: [
      'This work opens people up. Watch the room and take anything loaded to a private moment at a break.',
      'Keep the theory short and get to the physical work.',
    ],
    variations: [],
    debriefQuestions: ['Where did the character live in your body?'],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'Johnstone - Impro / mask tradition',
  },
  {
    id: 'th-its-tuesday',
    name: 'It\'s Tuesday',
    type: 'theory',
    categoryTags: ['Theory', 'Emotion', 'Game of the Scene', 'Reaction'],
    description:
      'A small exchange plus a big emotional reaction, and then the scene finds out why it matters.',
    fullText:
      'The pattern: a completely mundane line ("it is Tuesday"), an oversized emotional reaction to it, and then a scene that discovers why this small thing matters so much to this person.\n\nIt solves a specific problem. Players hunt for an unusual thing in the content and end up inventing premises. Here the content is deliberately empty, so the only place the unusual thing can come from is the reaction. That trains emotional initiation and makes the game emerge from a person rather than from an idea.\n\nOrder matters: reaction first, reason second. A player who explains first has traded the game for exposition.',
    setup: 'One demonstration is enough. Then play it.',
    coachingNotes: [
      'The reason must be discovered in play, not decided in advance.',
      'Keep the trigger line genuinely boring. Anything colourful ruins the exercise.',
    ],
    variations: [],
    debriefQuestions: ['Why did it matter to that person?'],
    durationMinutes: 7,
    groupSizeFit: 'any',
    source: 'Sandro original / UCB lineage',
  },
  {
    id: 'th-harold-structure',
    name: 'Harold Structure Overview',
    type: 'theory',
    categoryTags: ['Theory', 'Harold', 'Long Form', 'UCB', 'Structure'],
    description: 'The shape of a Harold: opening, three beats of three scenes, two group games, callbacks.',
    fullText:
      'Opening (often an Invocation) generates material from a single suggestion. Beat one plays three separate scenes, A, B and C, each finding its own game. A group game follows, using the material rather than telling a story. Beat two heightens each game, A2, B2, C2, rather than continuing plots. A second group game follows. Beat three lets the three worlds touch, and earlier material returns as callbacks.\n\nTwo things groups reliably get wrong: treating second beats as sequels, and treating callbacks as decoration. A second beat heightens the pattern. A callback is only earned if the material was strong when it first appeared.',
    setup: 'Draw the structure as boxes on a flipchart. The Player Guide carries the same diagram.',
    coachingNotes: [
      'Draw it, do not only say it. The visual saves ten minutes of questions.',
      'Ten minutes maximum before running one.',
    ],
    variations: [],
    debriefQuestions: ['Which beat is the hardest for this group, and why?'],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'UCB Manual',
  },
  {
    id: 'th-four-corners',
    name: 'The Four Corners Test',
    type: 'theory',
    categoryTags: ['Theory', 'Format Forge', 'World Building', 'Structure'],
    description:
      'A premise needs a cause, a solution, a conflict and actors, otherwise it collapses into cliché.',
    fullText:
      'A world premise is only playable when four corners are filled:\n\nCause: why is the world like this?\nSolution: what does the world do about it?\nConflict: what pushes back?\nActors: who has a stake, and on which side?\n\nA premise that only describes a state has none of these, and scenes inside it collapse into the first shared cliché. The recurring diagnosis is: the world is a state, not a system. Reference case: a rehab-clinic premise that turned every test scene into zombies, because the world had a condition but no cause, no counter-force and no system.\n\nThe fix is not a better idea, it is more consequence. Ask why instead of describing the state, and extend the chain until all four corners are filled.',
    setup: 'Four corners drawn on the whiteboard, filled in live from the group\'s own premise.',
    coachingNotes: [
      'Use the group\'s own premise, never a hypothetical one.',
      'Clichés in a test are information, not errors. Name the mechanism, not the players.',
    ],
    variations: [],
    debriefQuestions: ['Which corner is still empty?'],
    durationMinutes: 10,
    groupSizeFit: 'any',
    source: 'Sandro original (Format Forge)',
  },
  {
    id: 'th-callbacks',
    name: 'Callback Mechanics',
    type: 'theory',
    categoryTags: ['Theory', 'Callback', 'Long Form', 'Structure'],
    description: 'What makes a callback land: the material was strong, the return is timed, the meaning has moved.',
    fullText:
      'A callback is the return of earlier material at a point where it now means something different. Three conditions: the material was strong when it first appeared, the return is timed rather than immediate, and the second appearance carries a shift in meaning.\n\nRepetition alone is not a callback. Bringing back a line because the audience laughed at it is a repeat. Bringing it back when the situation has changed underneath it is a callback.\n\nIn practice: note the two or three strongest images of a set, and hold them until the last third.',
    setup: 'Refer to a specific moment from earlier in the session as the worked example.',
    coachingNotes: [
      'Pair with Freeze Tag as a closer so the group practices callbacks with the session\'s own material.',
      'Warn against the callback avalanche in the final beat.',
    ],
    variations: [],
    debriefQuestions: ['Which callback was earned, and which was decorative?'],
    durationMinutes: 7,
    groupSizeFit: 'any',
    source: 'UCB Manual / Sandro original',
  },
  {
    id: 'th-format-vs-game',
    name: 'Format vs Game',
    type: 'theory',
    categoryTags: ['Theory', 'Format', 'Structure', 'anundpfirsich'],
    description:
      'A game is a rule for one scene; a format is a repeatable frame with a fixed asset and variable content.',
    fullText:
      'A game is a rule that shapes one scene: a constraint, a mechanic, an engine. A format is a repeatable frame for a whole show: a fixed structure, a defined relationship to the audience, and a clear split between what stays the same every night and what changes.\n\nThe practical consequence for format development: a format needs a fixed asset that does the heavy lifting (a world premise, a sequence, a narrator frame) and a small number of variable slots. Groups that make everything variable have a game night. Groups that make everything fixed have a play.\n\nIn the anundpfirsich and BIG.BANG.IMPRO sense, the format is what the audience learns to expect, and the game is what surprises them inside it.',
    setup: 'Two columns on the flipchart: fixed and variable. Fill them for a format the group knows.',
    coachingNotes: [
      'Use a format the group has actually seen, otherwise this stays abstract.',
      'This is the theory input that makes Format Forge step 8 land.',
    ],
    variations: [],
    debriefQuestions: ['In your format, what is fixed and what is variable?'],
    durationMinutes: 8,
    groupSizeFit: 'any',
    source: 'anundpfirsich / Sandro original',
  },
];

/**
 * The full library: curated blocks first, then everything imported from the
 * Improv Encyclopedia. Nine encyclopedia games that duplicate a curated block
 * were dropped at import time, so every name appears once.
 */
const ENCYCLOPEDIA_GAMES = ENCYCLOPEDIA_INDEX.map((item) => ({
  ...item,
  fullText: '',
  coachingNotes: [],
  variations: [],
  detailsPending: true,
}));

export const LIBRARY = [...CURATED, ...ENCYCLOPEDIA_GAMES];

export const CURATED_LIBRARY = CURATED;

/*
 * The encyclopedia instructions are about 240 kB, which is most of the app's
 * payload and is only needed once a block is opened or exported. The index
 * above (name, tags, duration, summary) is enough to search and pick, so the
 * bodies load on demand and are cached for the rest of the session.
 */
let DETAILS = null;
let detailsPromise = null;

export function libraryDetailsLoaded() {
  return DETAILS !== null;
}

export function ensureLibraryDetails() {
  if (DETAILS) return Promise.resolve(DETAILS);
  if (!detailsPromise) {
    detailsPromise = import('./encyclopedia-games-details.json')
      .then((mod) => {
        DETAILS = mod.default;
        return DETAILS;
      })
      .catch((err) => {
        detailsPromise = null;
        throw err;
      });
  }
  return detailsPromise;
}

/** An item with its instructions filled in, if they have been loaded. */
export function withDetails(item) {
  if (!item || !item.detailsPending) return item;
  const found = DETAILS && DETAILS[item.id];
  return found ? { ...item, ...found, detailsPending: false } : item;
}

export const TYPE_LABELS = {
  warmup: 'Warm-ups',
  exercise: 'Exercises',
  main: 'Main Exercise / Long-form run',
  theory: 'Theory blocks',
};

export const TYPE_ORDER = ['warmup', 'exercise', 'main', 'theory'];

export const FREEZE_TAG_ID = 'ex-freeze-tag';

export const byId = (id) => LIBRARY.find((item) => item.id === id) || null;

/** Look up a block with its instructions attached. */
export const fullById = (id) => withDetails(byId(id));

export const ALL_TAGS = Array.from(
  new Set(LIBRARY.flatMap((item) => item.categoryTags)),
).sort((a, b) => a.localeCompare(b));
