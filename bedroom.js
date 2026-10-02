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

const assetBase = 'assets/bed-chibis/';
const transitionMs = 360;
let activeLayer = chibiImageA;
let queuedTimer = null;

const assets = {
  initial: '1. First handhold.png',

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
    text: 'Aaru keeps one hand on the bed. Somo keeps one on it.',
    next: ['holdInHand', 'kissHands', 'biteHands', 'mainOptions']
  },
  holdInHand: {
    asset: 'holdInHand',
    name: 'Somo',
    title: 'Hold hands in hand',
    text: 'Somo gently takes Aaru’s hand and brings it close to his chest.',
    next: ['kissHands', 'biteHands', 'mainOptions']
  },
  kissHands: {
    asset: 'kissHands',
    name: 'Somo',
    title: 'Kiss hands',
    text: 'Somo gives Aaru’s hand a tiny, affectionate kiss. ♡',
    next: ['biteHands', 'holdInHand', 'mainOptions']
  },
  biteHands: {
    asset: 'biteHands',
    name: 'Somo',
    title: 'Bite fingers',
    text: 'A tiny playful bite, just to make Aaru laugh.',
    next: ['kissHands', 'holdInHand', 'mainOptions']
  },

  // HUG
  hug: {
    asset: 'hug',
    name: 'Aaru & Somo',
    title: 'Hug',
    text: 'Somo wraps one arm around Aaru and pulls her close.',
    next: ['holdTight', 'cuddle', 'pat', 'meTooPat', 'mainOptions']
  },
  holdTight: {
    asset: 'holdTight',
    name: 'Somo',
    title: 'Hold tight',
    text: 'Somo wraps both arms around Aaru and holds her tightly.',
    next: ['cuddle', 'pat', 'meTooPat', 'mainOptions']
  },
  cuddle: {
    asset: 'cuddle',
    name: 'Aaru & Somo',
    title: 'Cuddle',
    text: 'Aaru buries her face in Somo’s chest and stays there.',
    next: ['pat', 'meTooPat', 'mainOptions']
  },
  pat: {
    asset: 'pat',
    name: 'Somo',
    title: 'Pat',
    text: 'Somo gently pats Aaru’s head. ♡',
    next: ['meTooPat', 'cuddle', 'mainOptions']
  },
  meTooPat: {
    asset: 'meTooPat',
    name: 'Aaru',
    title: 'Me too',
    text: 'Aaru reaches up and pats Somo’s head too.',
    next: ['pat', 'cuddle', 'mainOptions']
  },

  // FOREHEAD KISS
  forehead: {
    asset: 'forehead',
    name: 'Somo',
    title: 'Forehead kiss',
    text: 'A soft little kiss, right on Aaru’s forehead. ♡',
    next: ['foreheadMeToo', 'foreheadMore', 'foreheadAgain', 'mainOptions']
  },
  foreheadMeToo: {
    asset: 'foreheadMeToo',
    name: 'Aaru',
    title: 'Me too',
    text: 'Aaru gives Somo a soft forehead kiss too. ♡',
    next: ['foreheadMore', 'foreheadAgain', 'mainOptions']
  },
  foreheadMore: {
    asset: 'forehead',
    name: 'Somo',
    title: 'More',
    text: 'Somo leans in for another little forehead kiss.',
    next: ['foreheadMeToo', 'foreheadAgain', 'mainOptions']
  },
  foreheadAgain: {
    asset: 'foreheadMeToo',
    name: 'Aaru',
    title: 'Me again',
    text: 'Aaru smiles and gives Somo another forehead kiss.',
    next: ['foreheadMore', 'foreheadMeToo', 'mainOptions']
  },

  // CHEEK KISS
  cheek: {
    asset: 'cheek',
    name: 'Aaru & Somo',
    title: 'Cheek kiss',
    text: 'Aaru gives Somo a sweet little kiss on the cheek. ♡',
    next: ['cheekMeToo', 'mainOptions']
  },
  cheekMeToo: {
    asset: 'cheekMeToo',
    name: 'Somo',
    title: 'Me too',
    text: 'Somo gives Aaru a cheek kiss back. ♡',
    next: ['mainOptions']
  },

  // ACTUAL KISS
  kiss: {
    asset: 'kiss',
    name: 'Aaru & Somo',
    title: 'A little kiss',
    text: 'They lean in and share a sweet little kiss. ♡',
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

  setChibi(data.asset, instant);
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
  if (id === 'mainOptions') {
    transitionDialogue(() => applyState('initial'));
    return;
  }

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
