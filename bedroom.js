const interaction = document.getElementById('bedInteraction');
const bedHotspot = document.getElementById('bedHotspot');
const closeButton = document.getElementById('dialogueClose');
const backdrop = document.getElementById('bedInteractionBackdrop');
const actions = document.getElementById('bedActions');
const title = document.getElementById('bedDialogueTitle');
const text = document.getElementById('bedDialogueText');
const name = document.getElementById('bedDialogueName');
const chibiImageA = document.getElementById('chibiImageA');
const chibiImageB = document.getElementById('chibiImageB');
const dialogue = document.querySelector('.bed-dialogue');
const aaruHotspot = document.getElementById('aaruHotspot');
const somoHotspot = document.getElementById('somoHotspot');
const aaruSpeech = document.getElementById('aaruSpeech');
const somoSpeech = document.getElementById('somoSpeech');

const assetBase = 'assets/bed-chibis/';
const transitionMs = 360;
let activeLayer = chibiImageA;
let queuedTimer = null;

const assets = {
  initial: 'initial image.png',

  // Hold hands
  hold: '1. First handhold.png',
  holdInHand: '1.1 Hold hands tight.png',
  kissHands: '1.2 Kiss hands.png',
  biteHands: '1.3 Bite fingers.png',

  // Hug
  hug: '2 Hug initial.png',
  holdTight: '2.1 Hold tight.png',
  cuddle: '2.2 Cuddle.png',
  pat: '2.3 Pat head.png',
  meTooPat: '2.4 Me too pat.png',

  // Forehead kiss
  forehead: '3 Forehead kiss.png',
  foreheadMeToo: '3.1 Me too Forehead kiss.png',

  // Cheek kiss
  cheek: 'Cheek-kiss-transparent.png',
  cheekMeToo: 'Cheek kiss Me too.png',

  // Actual kiss
  kiss: 'Kiss.png'
};

const labels = {
  hold: '🤝 Hold hands',
  hug: '🤗 Hug',
  forehead: '💋 Forehead kiss',
  cheek: '😘 Cheek kiss',
  kiss: '💋 Kiss',

  holdInHand: '🫶 Hold hands in hand',
  kissHands: '💋 Kiss hands',
  biteHands: '😈 Bite fingers',

  holdTight: '🫂 Hold tight',
  cuddle: '🥰 Cuddle',
  pat: '🤍 Pat',
  meTooPat: '🥹 Me too',

  foreheadMeToo: '🥹 Me too',
  foreheadMore: '💋 More',
  foreheadAgain: '🥰 Me again',

  cheekMeToo: '😘 Me too',

  mainOptions: '↩️ Main options'
};

const MAIN_OPTIONS = ['hold', 'hug', 'forehead', 'cheek', 'kiss'];
const loveLines = {
  aaru: [
    'I love you baby ❤️',
    'My baby ❤️',
    'My honey ❤️',
    'My kuchupuchu ❤️',
    'My Man ❤️',
    'My Babu ❤️',
    'I missed you ❤️'
  ],
  somo: [
    'I love you baby ❤️',
    'My baby ❤️',
    'My Darling ❤️',
    'My kuchupuchu ❤️',
    'My love ❤️',
    'My lovely girl ❤️',
    'My Shona ❤️',
    'I missed you ❤️'
  ]
};

let lastLoveLineAaru = -1;
let lastLoveLineSomo = -1;
let currentState = 'initial';
let dialogueSequenceTimer = null;

// Head anchors are percentages of the chibi stage. Because the bubbles live
// inside the same stage as the character artwork, they travel with each pose
// instead of staying pinned to the top of the screen.
const bubbleAnchors = {
  initial: { aaru: [25, 22], somo: [74, 16] },
  hold: { aaru: [38, 26], somo: [63, 18] },
  holdInHand: { aaru: [35, 25], somo: [64, 17] },
  kissHands: { aaru: [34, 25], somo: [64, 22] },
  biteHands: { aaru: [35, 24], somo: [63, 20] },
  hug: { aaru: [39, 27], somo: [63, 20] },
  holdTight: { aaru: [39, 24], somo: [61, 17] },
  cuddle: { aaru: [39, 29], somo: [62, 17] },
  pat: { aaru: [38, 26], somo: [62, 19] },
  meTooPat: { aaru: [39, 24], somo: [61, 27] },
  forehead: { aaru: [39, 30], somo: [61, 18] },
  foreheadMeToo: { aaru: [40, 21], somo: [61, 29] },
  foreheadMore: { aaru: [39, 30], somo: [61, 18] },
  foreheadAgain: { aaru: [40, 21], somo: [61, 29] },
  cheek: { aaru: [38, 24], somo: [62, 15] },
  cheekMeToo: { aaru: [39, 24], somo: [61, 21] },
  kiss: { aaru: [40, 26], somo: [61, 21] }
};

function setBubbleAnchors(stateId) {
  const anchors = bubbleAnchors[stateId] || bubbleAnchors.initial;
  const stage = document.getElementById('chibiStage');
  stage.style.setProperty('--aaru-bubble-x', anchors.aaru[0] + '%');
  stage.style.setProperty('--aaru-bubble-y', anchors.aaru[1] + '%');
  stage.style.setProperty('--somo-bubble-x', anchors.somo[0] + '%');
  stage.style.setProperty('--somo-bubble-y', anchors.somo[1] + '%');
}

function clearDialogueSequenceTimer() {
  if (dialogueSequenceTimer) {
    clearTimeout(dialogueSequenceTimer);
    dialogueSequenceTimer = null;
  }
}

function hideSpeechBubbles() {
  clearDialogueSequenceTimer();
  [aaruSpeech, somoSpeech].forEach((bubble) => {
    bubble.classList.remove('is-visible');
    bubble.setAttribute('aria-hidden', 'true');
  });
}

function showLoveLine(character) {
  setBubbleAnchors('initial');
  const bubble = character === 'aaru' ? aaruSpeech : somoSpeech;
  const lines = loveLines[character];
  const previous = character === 'aaru' ? lastLoveLineAaru : lastLoveLineSomo;
  let index = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && index === previous) {
    index = (index + 1) % lines.length;
  }
  if (character === 'aaru') lastLoveLineAaru = index;
  else lastLoveLineSomo = index;

  bubble.textContent = lines[index];
  bubble.classList.remove('is-visible');
  bubble.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => bubble.classList.add('is-visible'));
}


/*
 * All dialogue text is intentionally kept simple for now.
 * We can replace the title/text for each state later with the
 * exact dialogues you give me.
 */
const actionData = {
  initial: {
    asset: 'initial',
    name: 'Aaru & Somo',
    title: 'A quiet little moment, just for us. ♡',
    text: 'Come sit with me for a while.',
    next: MAIN_OPTIONS
  },

  // HOLD HANDS
  hold: {
    asset: 'hold',
    name: 'Aaru & Somo',
    title: 'Hold hands',
    text: '',
    dialogues: { somo: 'Come here, baby… let me hold your hand. ❤️', aaru: 'Okay… but don’t let go, Somo. ❤️' },
    next: ['holdInHand', 'kissHands', 'biteHands', 'mainOptions']
  },
  holdInHand: {
    asset: 'holdInHand',
    name: 'Somo',
    title: 'Hold hands in hand',
    text: '',
    dialogues: { somo: 'Your hand fits perfectly in mine. ❤️', aaru: 'Hehe… I don’t think I want to take it back now. ❤️' },
    next: ['kissHands', 'biteHands', 'mainOptions']
  },
  kissHands: {
    asset: 'kissHands',
    name: 'Somo',
    title: 'Kiss hands',
    text: '',
    dialogues: { somo: 'I think your hand deserves a little kiss. ❤️', aaru: 'Somo… you’re making me blush. ❤️' },
    next: ['biteHands', 'holdInHand', 'mainOptions']
  },
  biteHands: {
    asset: 'biteHands',
    name: 'Somo',
    title: 'Bite fingers',
    text: '',
    dialogues: { somo: 'Hmm… these fingers are looking a little too cute. ❤️', aaru: 'Heyyy! Don’t bite me… unless you’re going to be this cute about it. ❤️' },
    next: ['kissHands', 'holdInHand', 'mainOptions']
  },

  // HUG
  hug: {
    asset: 'hug',
    name: 'Aaru & Somo',
    title: 'Hug',
    text: '',
    dialogues: { somo: 'Come here, my love… I need a hug from you. ❤️', aaru: 'Come here… I was waiting for you to hug me. ❤️' },
    next: ['holdTight', 'cuddle', 'pat', 'meTooPat', 'mainOptions']
  },
  holdTight: {
    asset: 'holdTight',
    name: 'Somo',
    title: 'Hold tight',
    text: '',
    dialogues: { somo: 'I’m not letting you go anytime soon. ❤️', aaru: 'Then hold me tighter… I like being this close to you. ❤️' },
    next: ['cuddle', 'pat', 'meTooPat', 'mainOptions']
  },
  cuddle: {
    asset: 'cuddle',
    name: 'Aaru & Somo',
    title: 'Cuddle',
    text: '',
    dialogues: { somo: 'Just rest here, baby… you belong right here with me. ❤️', aaru: 'Your chest is so comfy… can I stay like this a little longer? ❤️' },
    next: ['pat', 'meTooPat', 'mainOptions']
  },
  pat: {
    asset: 'pat',
    name: 'Somo',
    title: 'Pat',
    text: '',
    dialogues: { somo: 'Come here, my little baby… let me spoil you. ❤️', aaru: 'Aww… I feel so loved when you do that. ❤️' },
    next: ['meTooPat', 'cuddle', 'mainOptions']
  },
  meTooPat: {
    asset: 'meTooPat',
    name: 'Aaru',
    title: 'Me too',
    text: '',
    dialogues: { somo: 'Oh? Now it’s my turn to be spoiled? ❤️', aaru: 'Of course… my Somo deserves some love too. ❤️' },
    next: ['pat', 'cuddle', 'mainOptions']
  },

  // FOREHEAD KISS
  forehead: {
    asset: 'forehead',
    name: 'Somo',
    title: 'Forehead kiss',
    text: '',
    dialogues: { somo: 'Come here, my darling… I want to kiss your forehead. ❤️', aaru: 'Somo… you’re making my heart melt already. ❤️' },
    next: ['foreheadMeToo', 'foreheadMore', 'foreheadAgain', 'mainOptions']
  },
  foreheadMeToo: {
    asset: 'foreheadMeToo',
    name: 'Aaru',
    title: 'Me too',
    text: '',
    dialogues: { somo: 'Aww… my baby wants to kiss me too? ❤️', aaru: 'Yes… come here, my love. ❤️' },
    next: ['foreheadMore', 'foreheadAgain', 'mainOptions']
  },
  foreheadMore: {
    asset: 'forehead',
    name: 'Somo',
    title: 'More',
    text: '',
    dialogues: { somo: 'One wasn’t enough… come here again. ❤️', aaru: 'Hehe… okay, one more. ❤️' },
    next: ['foreheadMeToo', 'foreheadAgain', 'mainOptions']
  },
  foreheadAgain: {
    asset: 'foreheadMeToo',
    name: 'Aaru',
    title: 'Me again',
    text: '',
    dialogues: { somo: 'You’re getting addicted to my forehead kisses, aren’t you? ❤️', aaru: 'Maybe… because I really, really like them. ❤️' },
    next: ['foreheadMore', 'foreheadMeToo', 'mainOptions']
  },

  // CHEEK KISS
  cheek: {
    asset: 'cheek',
    name: 'Aaru & Somo',
    title: 'Cheek kiss',
    text: '',
    dialogues: { somo: 'Come closer, baby… I want a little kiss on your cheek. ❤️', aaru: 'My cheeks are getting all shy now… but okay. ❤️' },
    next: ['cheekMeToo', 'mainOptions']
  },
  cheekMeToo: {
    asset: 'cheekMeToo',
    name: 'Somo',
    title: 'Me too',
    text: '',
    dialogues: { somo: 'Hehe… my turn to get one from you? ❤️', aaru: 'Of course… come here, my baby. ❤️' },
    next: ['mainOptions']
  },

  // ACTUAL KISS
  kiss: {
    asset: 'hold',
    name: 'Aaru & Somo',
    title: 'A little kiss',
    text: '',
    kissSequence: [
      { speaker: 'somo', line: 'Aaru… come a little closer. I just want to look at you for a while. ❤️', asset: 'hold' },
      { speaker: 'aaru', line: 'Why are you looking at me like that, Somo…? ❤️', asset: 'hold' },
      { speaker: 'somo', line: 'Because every time I look at you, I fall for you a little more. ❤️', asset: 'hold' },
      { speaker: 'aaru', line: 'You make me so shy when you say things like that… ❤️', asset: 'hold' },
      { speaker: 'somo', line: 'Then let me stay this close to you, my love. ❤️', asset: 'hold' },
      { speaker: 'aaru', line: 'Okay… I’m right here. ❤️', asset: 'hold' },
      { speaker: 'kiss', line: '', asset: 'kiss', pauseAfter: 2200 }
    ],
    next: ['mainOptions']
  }
};

function getAssetUrl(key) {
  return `${assetBase}${assets[key]}`;
}

function preloadAssets() {
  Object.keys(assets).forEach((key) => {
    const img = new Image();
    img.src = getAssetUrl(key);
  });
}

function setChibi(key, instant = false) {
  const src = getAssetUrl(key);
  if (queuedTimer) clearTimeout(queuedTimer);

  const incoming = activeLayer === chibiImageA ? chibiImageB : chibiImageA;
  incoming.src = src;

  if (instant) {
    chibiImageA.classList.remove('is-visible');
    chibiImageB.classList.remove('is-visible');
    incoming.classList.add('is-visible');
    activeLayer = incoming;
    return;
  }

  incoming.classList.add('is-visible');
  activeLayer.classList.remove('is-visible');
  activeLayer = incoming;
}

function transitionDialogue(callback) {
  dialogue.classList.add('is-changing');
  queuedTimer = setTimeout(() => {
    callback();
    requestAnimationFrame(() => dialogue.classList.remove('is-changing'));
  }, 150);
}

function renderActions(actionIds) {
  actions.innerHTML = '';

  actionIds.forEach((id) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = id;

    if (id === 'mainOptions') {
      button.classList.add('main-options-button');
    }

    button.textContent = labels[id];
    actions.appendChild(button);
  });
}

function applyState(id, instant = false) {
  const data = actionData[id];
  if (!data) return;

  currentState = id;
  document.getElementById('chibiStage').classList.toggle('initial-state', id === 'initial');
  setBubbleAnchors(id);
  setChibi(data.asset, instant);
  name.textContent = data.name;
  title.textContent = data.title;
  text.textContent = id === 'initial' ? data.text : '';
  renderActions(data.next);

  if (id === 'initial') {
    hideSpeechBubbles();
  } else if (data.kissSequence) {
    showDialoguePair(data.kissSequence);
  } else if (data.dialogues) {
    showDialoguePair(data.dialogues);
  } else {
    hideSpeechBubbles();
  }
}

function showDialoguePair(dialogues) {
  clearDialogueSequenceTimer();
  hideSpeechBubbles();

  // Special staged kiss sequence: slow conversation, hand-holding/eye contact,
  // then the actual kiss asset.
  if (currentState === 'kiss' && Array.isArray(dialogues)) {
    runDialogueSequence(dialogues);
    return;
  }

  // Standard interactions: Somo speaks first unless Aaru is performing
  // the affectionate action.
  const aaruFirst = ['meTooPat', 'foreheadMeToo', 'foreheadAgain', 'cheekMeToo'].includes(currentState);
  const first = aaruFirst ? ['aaru', dialogues.aaru] : ['somo', dialogues.somo];
  const second = aaruFirst ? ['somo', dialogues.somo] : ['aaru', dialogues.aaru];

  runDialogueSequence([
    { speaker: first[0], line: first[1] },
    { speaker: second[0], line: second[1] }
  ]);
}

function runDialogueSequence(sequence) {
  clearDialogueSequenceTimer();
  hideSpeechBubbles();

  let index = 0;

  const next = () => {
    if (index >= sequence.length) return;

    const step = sequence[index++];
    if (!step) return;

    // The final kiss step has no bubble: switch to the kiss artwork after
    // the preceding dialogue has had time to breathe.
    if (step.speaker === 'kiss') {
      hideSpeechBubbles();
      setBubbleAnchors('kiss');
      setChibi(step.asset || 'kiss', false);

      // Hold the actual kiss moment before returning to the main options.
      dialogueSequenceTimer = setTimeout(() => {
        if (currentState === 'kiss') {
          renderActions(['mainOptions']);
        }
      }, step.pauseAfter || 2200);
      return;
    }

    if (step.asset) {
      setBubbleAnchors(step.asset);
      setChibi(step.asset, false);
    }

    const bubble = step.speaker === 'aaru' ? aaruSpeech : somoSpeech;
    const other = step.speaker === 'aaru' ? somoSpeech : aaruSpeech;

    // Bubble formation: clear the previous bubble, then grow the new one
    // above the correct character.
    [bubble, other].forEach((el) => {
      el.classList.remove('is-visible');
      el.setAttribute('aria-hidden', 'true');
    });

    bubble.textContent = step.line || '';
    bubble.setAttribute('aria-hidden', step.line ? 'false' : 'true');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => bubble.classList.add('is-visible'));
    });

    // Longer, readable pacing. Longer text gets a little extra time.
    const readingMs = Math.max(3200, Math.min(5200, 2300 + (step.line || '').length * 34));

    dialogueSequenceTimer = setTimeout(() => {
      // Let the current bubble gently dissolve before the next one forms.
      bubble.classList.remove('is-visible');

      dialogueSequenceTimer = setTimeout(() => {
        next();
      }, 650);
    }, readingMs);
  };

  next();
}

function openInteraction() {
  hideSpeechBubbles();
  setBubbleAnchors('initial');
  applyState('initial', true);
  interaction.classList.add('is-open');
  interaction.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialogue-open');
}

function closeInteraction() {
  hideSpeechBubbles();
  interaction.classList.remove('is-open');
  interaction.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('dialogue-open');
}

function chooseAction(id) {
  if (id === 'mainOptions') {
    transitionDialogue(() => applyState('initial'));
    return;
  }

  if (!actionData[id]) return;
  transitionDialogue(() => applyState(id));
}

bedHotspot.addEventListener('click', openInteraction);

aaruHotspot.addEventListener('click', (event) => {
  event.stopPropagation();
  if (currentState === 'initial') {
    showLoveLine('aaru');
  } else {
    const data = actionData[currentState];
    if (data?.kissSequence) return;
    if (data?.dialogues) showDialoguePair(data.dialogues);
  }
});

somoHotspot.addEventListener('click', (event) => {
  event.stopPropagation();
  if (currentState === 'initial') {
    showLoveLine('somo');
  } else {
    const data = actionData[currentState];
    if (data?.kissSequence) return;
    if (data?.dialogues) showDialoguePair(data.dialogues);
  }
});

actions.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (button) chooseAction(button.dataset.action);
});

closeButton.addEventListener('click', closeInteraction);
backdrop.addEventListener('click', closeInteraction);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeInteraction();
});

preloadAssets();
