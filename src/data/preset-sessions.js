/**
 * Sessions that ship with the app and are seeded into the archive on first
 * run. Once seeded they are ordinary archive entries: editable, debriefable,
 * duplicable and deletable. Deleting one does not bring it back.
 *
 * Both were written up as Trainer and Player guides first; the block
 * durations here match those documents exactly, including where the printed
 * running order does not add up to the stated target.
 */

export const PRESET_SESSIONS = [
  {
    id: 'preset-game-of-the-scene',
    type: 'session',
    title: 'Game of the Scene: Character Games',
    topic: 'game of the scene',
    groupSize: 'any size',
    level: 'Intermediate',
    targetMinutes: 120,
    freezeTag: true,
    createdAt: '2026-09-11T00:00:00.000Z',
    savedAt: '2026-09-11T00:00:00.000Z',
    debriefs: [],
    items: [
      { uid: 'gots-1', kind: 'library', libraryId: 'sr-checkin-quirk', durationMinutes: 5 },
      { uid: 'gots-2', kind: 'library', libraryId: 'sr-pattern-game', durationMinutes: 10 },
      { uid: 'gots-3', kind: 'library', libraryId: 'sr-i-am-i-am-i-take', durationMinutes: 10 },
      { uid: 'gots-4', kind: 'library', libraryId: 'th-game-of-the-scene', durationMinutes: 15 },
      { uid: 'gots-5', kind: 'library', libraryId: 'sr-tableau-image-building', durationMinutes: 10 },
      { uid: 'gots-6', kind: 'library', libraryId: 'sr-coached-scenework-platform', durationMinutes: 20 },
      { uid: 'gots-7', kind: 'library', libraryId: 'sr-coached-scenework-full', durationMinutes: 25 },
      { uid: 'gots-8', kind: 'library', libraryId: 'ex-freeze-tag', durationMinutes: 15 },
      { uid: 'gots-9', kind: 'library', libraryId: 'sr-session-debrief', durationMinutes: 10 },
      { uid: 'gots-10', kind: 'library', libraryId: 'sr-checkout-one-word', durationMinutes: 5 },
    ],
    subtitle: 'Finding, naming and playing the unusual pattern',
    skillFocus:
      'Finding the game of the scene and escalating it via «if this is true, what else is true?»',
    coachNotes: {
      pitfalls: [
        'Hunting for the game too early. Without a base reality nothing can be unusual, because unusual only exists in contrast to normal.',
        'Multiple games: players find something unusual, play it for two beats, then introduce a second one. One game per scene, go deeper not wider.',
        'Intellectual game-finding: players identify the pattern conceptually but do not embody it. Redirect to character and emotion.',
        'Confusing game of the scene with short-form game. Game of the scene is not a format, it is a pattern of behaviour that emerges from the scene itself.',
        'Neglecting the why. Mechanical heightening without emotional justification does not land.',
      ],
      adjustments: [
        'If the group struggles with platform-building in Part 1, run more scenes there before moving to Part 2.',
        'If game-finding comes easily in Part 2, add a constraint: find the game in the first 60 seconds, then play it for three minutes without dropping it.',
        'If the group is very small (4 to 5 people), cut Tableau and extend scenework time. Pattern Game already covers the pattern-recognition ground.',
      ],
      sources: [
        'UCB tradition: game is the first unusual thing, heightened through «if this is true, what else is true?»',
        'Napier (Improvise): your deal is your road map; do something twice and you establish a pattern; hold on and heighten.',
        'Johnstone: platform to tilt maps onto base reality to first unusual thing, and the reaction to the tilt is what makes it real.',
      ],
    },
    playerNotes: {
      definition:
        'Game of the scene is the single specific idea that makes a scene funny.',
      diagram: 'funnel',
      distinctions: [
        'Short-form game is not the game of the scene. Short-form games are formats; game of the scene is a scenic principle.',
        '«Top of your intelligence» means responding truthfully, not being clever.',
        'One game per scene. Go deeper, not wider.',
      ],
      rulesOfThumb: [
        'Build the platform before hunting for the game. Unusual only exists in contrast to normal.',
        'The partner’s reaction is what makes the unusual thing visible.',
        'Play the game, do not announce it. Stay in character.',
        'Escalate with an authentic reason. Ask why this matters, not just what is next.',
      ],
    },
  },
  {
    id: 'preset-less-is-more',
    type: 'session',
    title: 'Less Is More: Economy of Speech',
    topic: 'economy of speech',
    groupSize: '3 players',
    level: 'Intermediate',
    targetMinutes: 120,
    freezeTag: true,
    createdAt: '2026-09-11T00:00:00.000Z',
    savedAt: '2026-09-11T00:00:00.000Z',
    debriefs: [],
    items: [
      { uid: 'lim-1', kind: 'library', libraryId: 'sr-checkin-six-words', durationMinutes: 5 },
      { uid: 'lim-2', kind: 'library', libraryId: 'ie-word-at-a-time-story', durationMinutes: 10 },
      { uid: 'lim-3', kind: 'library', libraryId: 'wu-sound-ball', durationMinutes: 10 },
      { uid: 'lim-4', kind: 'library', libraryId: 'sr-one-sentence-scenes', durationMinutes: 40 },
      { uid: 'lim-5', kind: 'library', libraryId: 'sr-free-scene-diagnostic', durationMinutes: 25 },
      { uid: 'lim-6', kind: 'library', libraryId: 'sr-session-debrief', durationMinutes: 10 },
      { uid: 'lim-7', kind: 'library', libraryId: 'ex-freeze-tag', durationMinutes: 10 },
    ],
    subtitle: 'Breaking the info-dump reflex',
    skillFocus:
      'Speaking in shorter units so a scene partner can actually react to what has been said',
    coachNotes: {
      pitfalls: [
        'Timing: the core block and the free scene carry ranges (35 to 40 and 20 to 25 minutes). At the low end the day runs 105 to 110 minutes, at the high end a full 120. The ranges are the slack that lands it on time.',
        'Self-coaching: if you run this session as a player as well as a facilitator, and you share the over-talking pattern being addressed, coaching yourself out of it while facilitating is hard to do credibly in the moment. Build in a moment where another player gives you direct feedback in the debrief rather than relying on your own read.',
      ],
      adjustments: [
        'Core block runs 35 to 40 minutes and the free scene 20 to 25. Take the low end if the check-in or warm-ups overran.',
        'With three players, rotate so the watcher role comes round to everyone at least once in the core block.',
        'If the info-dump reflex is already gone by the free scene, spend the remaining time on a second free scene rather than adding a new constraint.',
      ],
      sources: [
        'Design note: this session was assembled by combining the strongest elements of two drafted approaches rather than running either wholesale. The check-in, both warm-ups and the one-sentence constraint were kept; the alphabet-scene, emotional-orchestra and reported-speech blocks of the alternate draft were set aside as unnecessary with a group this small.',
      ],
    },
    playerNotes: {
      definition:
        'Less is more: give your partner less to process per line, so they can actually react to what you gave them.',
      distinctions: [
        'One sentence is not one short thought crammed with clauses. «And then» is still two jobs in one line.',
        'Cutting words is not the same as cutting meaning. Say less, mean the same.',
      ],
      rulesOfThumb: [
        'If you notice yourself explaining, stop. You have already said enough.',
        'A single specific detail beats three vague ones.',
        'Trust your partner to fill in what you did not say.',
        'Watch for the info-dump reflex creeping back once no one is counting.',
      ],
    },
  },
  {
    id: 'preset-accepting-giving-offers',
    type: 'session',
    title: 'Accepting and Giving Offers',
    topic: 'accepting offers',
    groupSize: '4-6 players',
    level: 'Intermediate',
    targetMinutes: 120,
    freezeTag: true,
    createdAt: '2026-09-11T00:00:00.000Z',
    savedAt: '2026-09-11T00:00:00.000Z',
    debriefs: [],
    items: [
      { uid: 'ago-1', kind: 'library', libraryId: 'sr-checkin-yes-no', durationMinutes: 5 },
      { uid: 'ago-2', kind: 'library', libraryId: 'sr-word-sound-movement-pass', durationMinutes: 10 },
      {
        uid: 'ago-3',
        kind: 'library',
        libraryId: 'wu-mirror',
        durationMinutes: 10,
        overrides: {
          setup:
            'Whole group in a circle rather than in pairs. Everyone copies everyone until the motion and sound blend into one shared image.',
          coachingNotes: [
            'Pure partner connection with no words and no story pressure, just attention to the group.',
            'Name the moments when the group is truly synced against the moments when one person is subtly leading.',
          ],
        },
      },
      { uid: 'ago-4', kind: 'library', libraryId: 'th-listening-and-offers', durationMinutes: 10 },
      {
        uid: 'ago-5',
        kind: 'library',
        libraryId: 'ie-presents',
        durationMinutes: 15,
        overrides: {
          setup:
            'Pairs. Player A mimes giving a wrapped gift. Player B opens it, names what it is with the first thing that comes to mind, and reacts with genuine delight. Player A must justify why they gave that specific thing. Rotate roles, then rotate partners.',
          coachingNotes: [
            'Watch for Player B censoring their first impulse and trying to be clever.',
            'Watch for Player A failing to justify and just saying «yeah». The justification is the yes-and.',
            'Watch for over-accepting: Player B going so wild with the reaction that Player A cannot get a word in.',
            'After a few rounds, side-coach «accept it even more» to push deliberately toward over-accepting. That sets up It’s Tuesday.',
          ],
          debriefQuestions: ['What did you give, and why that?'],
        },
      },
      {
        uid: 'ago-6',
        kind: 'library',
        libraryId: 'ex-its-tuesday-scenes',
        durationMinutes: 20,
        overrides: {
          setup:
            'Pairs. Player A makes a simple mundane statement. Player B over-accepts, treating it as the most significant, dramatic, world-altering information possible. Player A deals with the consequences of B’s over-acceptance.',
          coachingNotes: [
            'The teaching point: over-accepting creates as many problems as blocking. It shifts the whole burden onto one player.',
            'Watch for B escalating so far that A has nowhere to go, or making the scene about themselves rather than responding to A’s offer.',
            'Short exchanges, a big emotional reaction first, then find the why. Emotional justification, not comedy escalation.',
            'Hint for actors, accessing real emotion: recall a real-life event that made you feel this way, or ask where the emotion lives in the body (dread in the stomach, panic in the chest, joy in the face) and lead with that. The second technique draws on Chekhov’s psychophysical approach: the body produces the feeling, not the other way around.',
            'With a less experienced group, add Two Realities (Johnstone, p. 103-104) before Presents as a contrasting bad example of blocking.',
          ],
          debriefQuestions: [
            'What does healthy acceptance look like, between blocking and over-accepting?',
          ],
        },
      },
      { uid: 'ago-7', kind: 'library', libraryId: 'sr-the-gap', durationMinutes: 15 },
      { uid: 'ago-8', kind: 'library', libraryId: 'ex-freeze-tag', durationMinutes: 15 },
      {
        uid: 'ago-9',
        kind: 'library',
        libraryId: 'sr-session-debrief',
        durationMinutes: 15,
        overrides: {
          debriefQuestions: [
            'Where on the blocking to accepting to over-accepting spectrum do you tend to default? Did you notice a pattern today?',
            'During the warm-ups, what happened to your plan for what to say or do next?',
            'In It’s Tuesday, what did it feel like to be on the receiving end of over-acceptance? How is that different from blocking, and how is it similar?',
          ],
        },
      },
      { uid: 'ago-10', kind: 'library', libraryId: 'sr-checkout-next-scene', durationMinutes: 5 },
    ],
    subtitle: 'Listening, receiving, and the spectrum from blocking to over-accepting',
    skillFocus:
      'Seeing an offer, accepting it, and staying connected without over- or under-accepting',
    coachNotes: {
      pitfalls: [
        'It’s Tuesday turning into a comedy competition rather than an exploration of the dynamic. If that happens, slow it down: ask the over-accepter to try it at 50 per cent intensity and see whether the scene actually gets better.',
        'Players using the Gap’s pause to rehearse their next line. The pause is for receiving, not for planning.',
        'Blocking read as rudeness. Most blocking at this level is inattention, not refusal. Name the mechanism, not the player.',
      ],
      adjustments: [
        'Sequencing logic: pure listening in the warm-ups, then theory that names what the players just experienced, then practical exploration of the offer spectrum through Presents and It’s Tuesday, then disciplined acceptance under constraint in the Gap. Each block builds on the one before it.',
        'With 4 to 6 people everyone plays every exercise. Rotate partners between exercises. In Freeze Tag the small group keeps everyone active, with no hiding on the sideline.',
        'The plan totals roughly 115 minutes. Spend the flex time on whichever exercise generates the most energy, or extend Freeze Tag if the group is on a roll.',
      ],
      sources: [
        'Johnstone: blocking, accepting and the status of an offer; Two Realities (p. 103-104) as a contrasting exercise for less experienced groups.',
        'Chekhov: the psychophysical approach behind the actor hint, where the body produces the feeling rather than the other way around.',
      ],
    },
    playerNotes: {
      definition:
        'You cannot accept what you do not hear. Everything is an offer: a word, a gesture, a silence, a shift in posture.',
      distinctions: [
        'Blocking: refusing or ignoring the offer.',
        'Accepting: taking the offer and building on it.',
        'Over-accepting: accepting so extremely that you derail the scene or take over. It creates as many problems as blocking, just shifted onto one player.',
        'It’s Tuesday coaching emphasis: short exchanges, big emotional reaction first, then find the why. Not comedy escalation.',
      ],
      rulesOfThumb: [
        'Receive the whole offer: word, tone and body, not just the words.',
        'The justification is the yes-and. Do not just accept, build a reason.',
        'Let the offer land before responding. Do not pre-load your next line.',
        'Healthy acceptance sits between blocking and over-accepting.',
        'Accessing real emotion: recall a real-life event that made you feel this way, or ask where the emotion lives in your body and lead with that.',
      ],
    },
  },
];

export const PRESET_SESSION_IDS = PRESET_SESSIONS.map((s) => s.id);
