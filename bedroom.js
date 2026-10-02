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

const base = 'assets/';

function setMood(person, mood) {
  const image = person === 'aaru' ? aaru : somo;
  image.src = `${base}${person}/${person}-${mood}.png`;
}

function openInteraction() {
  setMood('aaru', 'idle');
  setMood('somo', 'idle');
  name.textContent = 'Aaru & Somo';
  title.textContent = 'A quiet little moment, just for us. ♡';
  text.textContent = 'Come sit with me for a while.';
  renderActions(['hold', 'hug', 'closer', 'kiss']);
  interaction.classList.add('is-open');
  interaction.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialogue-open');
}

function closeInteraction() {
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

function chooseAction(id) {
  if (id === 'close') {
    closeInteraction();
    return;
  }

  const data = actionData[id];
  if (!data) return;

  setMood('aaru', data.aaruMood);
  setMood('somo', data.somoMood);
  name.textContent = data.name;
  title.textContent = data.title;
  text.textContent = data.text;
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
