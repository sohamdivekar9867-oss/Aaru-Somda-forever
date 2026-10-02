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
const idlePair = document.getElementById('idlePair');

const assetBase = 'assets/bed-chibis/';
const transitionMs = 360;
let activeLayer = chibiImageA;
let queuedTimer = null;

// These are the user's latest revised interaction assets from Chibis.zip.
const assets = {
  hold: '1. First handhold.png',
  holdInHand: '1.1 Hold hands tight.png',
  kissHands: '1.2 Kiss hands.png',
  biteHands: '1.3 Bite fingers.png',
  hug: '2.1 Hold tight.png',
  holdTight: '2.1 Hold tight.png',
  cuddle: '2.2 Cuddle.png',
  pat: '2.3 Pat head.png',
  meTooPat: '2.4 Me too pat.png',
  forehead: '3 Forehead kiss.png',
  meTooForehead: '3.1 Me too Forehead kiss.png',
  moreForehead: '3 Forehead kiss.png',
  meAgainForehead: '3.1 Me too Forehead kiss.png'
};

const labels = {
  hold: '🤝 Hold hands',
  hug: '🤗 Hug',
  forehead: '💋 Forehead kiss',
  holdInHand: '🫶 Hold hands in hand',
  kissHands: '💋 Kiss hands',
  biteHands: '😈 Bite fingers',
  holdTight: '🫂 Hold tight',
  cuddle: '🥰 Cuddle',
  pat: '🤍 Pat',
  meTooPat: '🥹 Me too',
  meTooForehead: '🥰 Me too',
  moreForehead: '💋 More',
  meAgainForehead: '💕 Me again'
};

// Flow currently stops at the initial Forehead kiss pose.
// More / Me again are intentionally not included yet.
const actionData = {
  initial: {
    asset: null,
    name: 'Aaru & Somo',
    title: 'A quiet little moment, just for us. ♡',
    text: 'Come sit with me for a while.',
    next: ['hold', 'hug', 'forehead']
  },
  hold: {
    asset: 'hold',
    name: 'Aaru & Somo',
    title: 'Hold hands',
    text: 'Aaru keeps one hand on the bed. Somo keeps one on it.',
    next: ['holdInHand', 'kissHands', 'biteHands', 'hug', 'forehead', 'main']
  },
  holdInHand: {
    asset: 'holdInHand',
    name: 'Somo',
    title: 'Hold hands in hand',
    text: 'Somo gently takes Aaru’s hand and brings it close to his chest.',
    next: ['kissHands', 'biteHands', 'hold']
  },
  kissHands: {
    asset: 'kissHands',
    name: 'Somo',
    title: 'Kiss hands',
    text: 'Somo gives Aaru’s hand a tiny, affectionate kiss. ♡',
    next: ['biteHands', 'holdInHand', 'hold']
  },
  biteHands: {
    asset: 'biteHands',
    name: 'Somo',
    title: 'Bite fingers',
    text: 'A tiny playful bite, just to make Aaru laugh.',
    next: ['kissHands', 'holdInHand', 'hold']
  },
  hug: {
    asset: 'hug',
    name: 'Aaru & Somo',
    title: 'Hug',
    text: 'Somo wraps his arm around Aaru and pulls her close.',
    next: ['holdTight', 'cuddle', 'pat', 'meTooPat']
  },
  holdTight: {
    asset: 'holdTight',
    name: 'Somo',
    title: 'Hold tight',
    text: 'Somo wraps both arms around Aaru and holds her tightly.',
    next: ['cuddle', 'pat', 'meTooPat', 'hug']
  },
  cuddle: {
    asset: 'cuddle',
    name: 'Aaru & Somo',
    title: 'Cuddle',
    text: 'Aaru buries her face in Somo’s chest and stays there.',
    next: ['pat', 'meTooPat', 'forehead']
  },
  pat: {
    asset: 'pat',
    name: 'Somo',
    title: 'Pat',
    text: 'Somo gently pats Aaru’s head. ♡',
    next: ['meTooPat', 'cuddle', 'forehead']
  },
  meTooPat: {
    asset: 'meTooPat',
    name: 'Aaru',
    title: 'Me too',
    text: 'Aaru reaches up and pats Somo’s head too.',
    next: ['pat', 'cuddle', 'forehead']
  },
  main: {
    asset: null,
    name: 'Aaru & Somo',
    title: 'A quiet little moment, just for us. ♡',
    text: 'Come sit with me for a while.',
    next: ['hold', 'hug', 'forehead']
  },
  forehead: {
    asset: 'forehead',
    name: 'Aaru & Somo',
    title: 'Forehead kiss',
    text: 'A soft little kiss, right on the forehead. ♡',
    next: ['meTooForehead', 'moreForehead', 'meAgainForehead']
  },
  meTooForehead: {
    asset: 'meTooForehead',
    name: 'Aaru',
    title: 'Me too',
    text: 'Aaru gives Somo a little forehead kiss too. ♡',
    next: ['moreForehead', 'meAgainForehead', 'forehead', 'main']
  },
  moreForehead: {
    asset: 'moreForehead',
    name: 'Somo',
    title: 'More',
    text: 'Somo gives Aaru another little forehead kiss. ♡',
    next: ['meAgainForehead', 'meTooForehead', 'forehead', 'main']
  },
  meAgainForehead: {
    asset: 'meAgainForehead',
    name: 'Aaru',
    title: 'Me again',
    text: 'Aaru kisses Somo’s forehead again. ♡',
    next: ['moreForehead', 'meTooForehead', 'forehead', 'main']
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
    button.textContent = labels[id];
    actions.appendChild(button);
  });
}

function applyState(id, instant = false) {
  const data = actionData[id];
  if (!data) return;

  if (id === 'initial' || id === 'main') {
    if (idlePair) idlePair.classList.add('is-visible');
    chibiImageA.classList.remove('is-visible');
    chibiImageB.classList.remove('is-visible');
  } else {
    if (idlePair) idlePair.classList.remove('is-visible');
    setChibi(data.asset, instant);
  }

  name.textContent = data.name;
  title.textContent = data.title;
  text.textContent = data.text;
  renderActions(data.next);
}

function openInteraction() {
  applyState('initial', true);
  interaction.classList.add('is-open');
  interaction.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialogue-open');
}

function closeInteraction() {
  interaction.classList.remove('is-open');
  interaction.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('dialogue-open');
}

function chooseAction(id) {
  if (!actionData[id]) return;
  transitionDialogue(() => applyState(id));
}

bedHotspot.addEventListener('click', openInteraction);
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
