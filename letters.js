const SUPABASE_URL = 'https://swqaakxywwajesuajflz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G';
const EDIT_PIN = 'RT2026';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const staticLetter = {
  id: 'static-love-letter',
  title: 'An I Love You Letter',
  recipient: 'Aaru',
  content: `I don't think I will ever find words big enough to explain
what you mean to me, but I want to spend a lifetime trying.

I love you because of the way you make me feel, not just
when we're laughing together or having a beautiful day, but even in the quiet
moments, when I simply know that you are mine and I am yours. You have brought
a kind of warmth into my life that I didn't know I was missing. Somehow,
ordinary days feel more special because you are a part of them.

I love your sweetness, your little quirks, your thoughts,
your smile, and the person you are when you let your guard down with me. I love
the way you care, the way you make me feel seen, and the way you pout when mad.
But more than all of that, I love you.

You mean so much more to me than a girlfriend, more than
someone I get to call when I miss her. You are someone whose happiness
genuinely matters to me. I want to know how your day went, what made you smile,
what bothered you, what you're dreaming about, and what you don't always say
out loud. I want to be someone you can turn to, someone who makes life feel a
little softer and love feel a little safer.

And God, I love you passionately. I love the thought of
holding you close, kissing you, looking at you and knowing that this beautiful
person is the one I get to love. I love missing you when we're apart and
looking forward to the next moment I get to be beside you. I love that you can
make my heart feel so full just by being yourself.

You have become such a precious part of my life, Aaru. My
happiness has your smile in it. My plans have a place for you. And when I think
about the future, I find myself wishing for more ordinary moments with you: more
conversations, more dates, more laughter, more holding your hand, more days
where I get to remind you how loved you are.

I don't love you because you're perfect. I love you because
you're you, and somehow, that is more than enough to make my heart choose you
again and again.

Thank you for letting me love you. Thank you for being you.
And thank you for making me feel that love can be something so beautiful, so
exciting, and so deeply comforting at the same time.

I love you, Aaru. More than this letter can hold, and in
more ways than I will ever stop discovering.`,
  signature: 'Yours, always. Somda ❤️'
};

let editingUnlocked = false;
let letters = [];
let currentPage = 0; // 0 = index, 1 onward = letter pages
const LETTERS_PER_PAGE = 2;

const indexView = document.getElementById('indexView');
const indexList = document.getElementById('letterIndexList');
const emptyIndexMessage = document.getElementById('emptyIndexMessage');
const letterPages = document.getElementById('letterPages');
const editToggle = document.getElementById('editToggle');
const addButton = document.getElementById('addLetterButton');
const formPanel = document.getElementById('letterFormPanel');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[char]));
}

function allLetters() {
  return [staticLetter, ...letters];
}

function totalLetterPages() {
  return Math.max(1, Math.ceil(allLetters().length / LETTERS_PER_PAGE));
}

function letterTitle(letter) {
  const title = letter.title?.trim();
  return (!title || title === 'A little letter') ? `A letter to ${letter.recipient || 'you'}` : title;
}

function renderIndex() {
  const items = allLetters();
  indexList.innerHTML = '';

  items.forEach((letter, index) => {
    const pageNumber = Math.floor(index / LETTERS_PER_PAGE) + 1;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'index-entry';
    item.innerHTML = `
      <span class="index-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="index-title">${escapeHtml(letterTitle(letter))}</span>
      <span class="index-page">${String(pageNumber + 1).padStart(2, '0')}</span>
      ${!letter.id || letter.id === staticLetter.id ? '' : (editingUnlocked
        ? `<span class="index-delete" data-delete-id="${escapeHtml(letter.id)}">Delete</span>` : '')}
    `;

    item.addEventListener('click', event => {
      if (event.target.closest('[data-delete-id]')) return;
      currentPage = pageNumber;
      renderView();
    });

    const deleteButton = item.querySelector('[data-delete-id]');
    if (deleteButton) {
      deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteLetter(deleteButton.dataset.deleteId);
      });
    }

    indexList.appendChild(item);
  });

  emptyIndexMessage.classList.toggle('hidden', items.length > 0);
}

function makeCard(letter, isStatic) {
  const card = document.createElement('article');
  card.className = `letter-card${isStatic ? ' static-letter' : ''}`;
  card.innerHTML = `
    <div class="letter-card-number">${isStatic ? '01' : ''}</div>
    <div class="letter-recipient">Dear ${escapeHtml(letter.recipient || '')},</div>
    <div class="letter-content">${escapeHtml(letter.content || '')}</div>
    <div class="letter-signature">${escapeHtml(letter.signature || '')}</div>
    ${!isStatic && editingUnlocked ? `
      <div class="letter-actions">
        <button class="small-button" data-action="edit" data-id="${escapeHtml(letter.id)}">Edit</button>
        <button class="small-button delete" data-action="delete" data-id="${escapeHtml(letter.id)}">Delete</button>
      </div>` : ''}
  `;
  return card;
}

function renderLetterPage() {
  const start = (currentPage - 1) * LETTERS_PER_PAGE;
  const pageLetters = allLetters().slice(start, start + LETTERS_PER_PAGE);

  letterPages.innerHTML = '';
  const spread = document.createElement('div');
  spread.className = 'letter-spread';

  pageLetters.forEach((letter, offset) => {
    spread.appendChild(makeCard(letter, start + offset === 0));
  });

  letterPages.appendChild(spread);
}

function renderView() {
  const isIndex = currentPage === 0;
  indexView.classList.toggle('hidden', !isIndex);
  letterPages.classList.toggle('hidden', isIndex);

  if (isIndex) {
    renderIndex();
    pageIndicator.textContent = 'Index';
  } else {
    renderLetterPage();
    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalLetterPages() + 1}`;
  }

  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage >= totalLetterPages();
  previousButton.classList.toggle('disabled', previousButton.disabled);
  nextButton.classList.toggle('disabled', nextButton.disabled);
}

async function loadLetters() {
  const { data, error } = await supabaseClient
    .from('love_letters')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    alert('The letters could not be loaded. Please check the Supabase table setup.');
    return;
  }

  letters = data || [];
  if (currentPage > totalLetterPages()) currentPage = 0;
  renderView();
}

function unlockOrLock() {
  if (editingUnlocked) {
    editingUnlocked = false;
    closeForm();
    addButton.classList.add('hidden');
    editToggle.textContent = 'Edit Letters';
    renderView();
    return;
  }

  const pin = prompt('Enter the private PIN to edit letters:');
  if (pin !== EDIT_PIN) {
    if (pin !== null) alert('Incorrect PIN.');
    return;
  }

  editingUnlocked = true;
  editToggle.textContent = 'Lock editing 🔒';
  addButton.classList.remove('hidden');
  renderView();
}

function openForm() {
  formPanel.classList.remove('hidden');
  document.getElementById('titleInput').focus();
}

function closeForm() {
  formPanel.classList.add('hidden');
  document.getElementById('titleInput').value = '';
  document.getElementById('recipientInput').value = '';
  document.getElementById('contentInput').value = '';
  document.getElementById('signatureInput').value = '';
}

async function createLetter() {
  const title = document.getElementById('titleInput').value.trim();
  const recipient = document.getElementById('recipientInput').value.trim();
  const content = document.getElementById('contentInput').value.trim();
  const signature = document.getElementById('signatureInput').value.trim();

  if (!title || !recipient || !content || !signature) {
    alert('Please fill in the title, recipient, content, and signature.');
    return;
  }

  const { error } = await supabaseClient.from('love_letters').insert({
    title, recipient, content, signature, display_order: letters.length + 1
  });

  if (error) {
    alert(`Could not create the letter: ${error.message}`);
    return;
  }

  closeForm();
  currentPage = totalLetterPages() + 1;
  await loadLetters();
}

async function editLetter(id) {
  const letter = letters.find(item => String(item.id) === String(id));
  if (!letter) return;

  const title = prompt('Letter title:', letter.title || '');
  if (title === null) return;
  const recipient = prompt('Dear...', letter.recipient || '');
  if (recipient === null) return;
  const content = prompt('Letter content:', letter.content || '');
  if (content === null) return;
  const signature = prompt('Signed by:', letter.signature || '');
  if (signature === null) return;

  const { error } = await supabaseClient
    .from('love_letters')
    .update({
      title, recipient, content, signature,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    alert(`Could not save the letter: ${error.message}`);
    return;
  }

  await loadLetters();
}

async function deleteLetter(id) {
  if (!confirm('Delete this entire letter?')) return;

  const { data, error } = await supabaseClient
    .from('love_letters')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    alert(`Could not delete the letter: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    alert('The letter was not deleted. Please check the Supabase DELETE policy.');
    return;
  }

  currentPage = 0;
  await loadLetters();
}

editToggle.addEventListener('click', unlockOrLock);
addButton.addEventListener('click', openForm);
document.getElementById('cancelLetterButton').addEventListener('click', closeForm);
document.getElementById('createLetterButton').addEventListener('click', createLetter);

previousButton.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage -= 1;
    renderView();
  }
});

nextButton.addEventListener('click', () => {
  if (currentPage < totalLetterPages()) {
    currentPage += 1;
    renderView();
  }
});

letterPages.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'edit') editLetter(button.dataset.id);
  if (button.dataset.action === 'delete') deleteLetter(button.dataset.id);
});

loadLetters();
