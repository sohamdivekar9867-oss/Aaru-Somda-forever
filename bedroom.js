const interaction = document.getElementById('bedInteraction');
const bedHotspot = document.getElementById('bedHotspot');
const closeButton = document.getElementById('dialogueClose');
const backdrop = document.getElementById('bedInteractionBackdrop');
const actions = document.getElementById('bedActions');
const title = document.getElementById('bedDialogueTitle');
const text = document.getElementById('bedDialogueText');
const name = document.getElementById('bedDialogueName');
const aaru = document.getElementById('aaruCharacter');
const somo = document.getElementById('somoCharacter');
const aaruWrap = document.getElementById('aaruCharacterWrap');
const somoWrap = document.getElementById('somoCharacterWrap');

const base = 'assets/';
let moodTransitionToken = 0;

function moodPath(person, mood) {
  return `${base}${person}/${person}-${mood}.png`;
}

function setMoodImmediate(person, mood) {
  const image = person === 'aaru' ? aaru : somo;
  image.src = moodPath(person, mood);
}

function preloadMood(person, mood) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = moodPath(person, mood);
  });
}

async function transitionMoods(aaruMood, somoMood) {
  const token = ++moodTransitionToken;
  aaruWrap.classList.add('is-changing');
  somoWrap.classList.add('is-changing');

  await Promise.all([
    preloadMood('aaru', aaruMood),
    preloadMood('somo', somoMood)
  ]);

  if (token !== moodTransitionToken) return;

  // Swap while the characters are faded out, then let them ease back in.
  setMoodImmediate('aaru', aaruMood);
  setMoodImmediate('somo', somoMood);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (token !== moodTransitionToken) return;
      aaruWrap.classList.remove('is-changing');
      somoWrap.classList.remove('is-changing');
    });
  });
}

function openInteraction() {
  moodTransitionToken++;
  setMoodImmediate('aaru', 'idle');
  setMoodImmediate('somo', 'idle');
  aaruWrap.classList.remove('is-changing');
  somoWrap.classList.remove('is-changing');
  name.textContent = 'Aaru & Somo';
  title.textContent = 'A quiet little moment, just for us. ♡';
  text.textContent = 'Come sit with me for a while.';
  renderActions(['hold', 'hug', 'closer', 'kiss']);
  interaction.classList.add('is-open');
  interaction.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialogue-open');
}

function closeInteraction() {
  moodTransitionToken++;
  interaction.classList.remove('is-open');
  interaction.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('dialogue-open');
}

const actionData = {
  hold: {
    aaruMood: 'shy-blushing',
    somoMood: 'shy-blushing',
    name: 'Aaru & Somo',
    title: 'Hold hands',
    text: 'Your hands find each other. Neither of you lets go.',
    next: ['hug', 'closer', 'kiss']
  },
  hug: {
    aaruMood: 'affectionate',
    somoMood: 'affectionate',
    name: 'Aaru & Somo',
    title: 'A warm hug',
    text: 'You pull each other a little closer and stay there for a moment.',
    next: ['closer', 'kiss', 'cuddle']
  },
  closer: {
    aaruMood: 'shy-blushing',
    somoMood: 'affectionate',
    name: 'Aaru & Somo',
    title: 'Sit a little closer',
    text: 'A little less distance. A little more warmth.',
    next: ['cuddle', 'forehead', 'kiss']
  },
  kiss: {
    aaruMood: 'shy-blushing',
    somoMood: 'shy-blushing',
    name: 'Aaru & Somo',
    title: 'A little kiss',
    text: 'For a moment, everything else disappears. ♡',
    next: ['cuddle', 'forehead', 'stay']
  },
  forehead: {
    aaruMood: 'shy-blushing',
    somoMood: 'affectionate',
    name: 'Somo',
    title: 'A tiny forehead kiss',
    text: 'Just because. No other reason needed.',
    next: ['cuddle', 'kiss', 'stay']
  },
  cuddle: {
    aaruMood: 'affectionate',
    somoMood: 'affectionate',
    name: 'Aaru & Somo',
    title: 'Cuddle',
    text: 'This is probably where you both wanted to be anyway.',
    next: ['forehead', 'stay']
  },
  stay: {
    aaruMood: 'affectionate',
    somoMood: 'affectionate',
    name: 'Aaru & Somo',
    title: 'Stay close',
    text: 'Some moments do not need anything more. ♡',
    next: ['close']
  }
};

const labels = {
  hold: '🤝 Hold hands',
  hug: '🤗 Hug',
  closer: '🥰 Sit closer',
  kiss: '💋 Kiss',
  forehead: '😚 Forehead kiss',
  cuddle: '🫶 Cuddle',
  stay: '💕 Stay close',
  close: '← Back to bedroom'
};

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

async function chooseAction(id) {
  if (id === 'close') {
    closeInteraction();
    return;
  }

  const data = actionData[id];
  if (!data) return;

  [...actions.querySelectorAll('button')].forEach((button) => {
    button.disabled = true;
  });

  // Update the words immediately; the character transition carries the visual change.
  name.textContent = data.name;
  title.textContent = data.title;
  text.textContent = data.text;

  await transitionMoods(data.aaruMood, data.somoMood);
  if (!interaction.classList.contains('is-open')) return;
  renderActions(data.next);
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
