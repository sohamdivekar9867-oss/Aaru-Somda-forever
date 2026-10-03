const SUPABASE_URL = 'https://swqaakxywwajesuajflz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G';
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: window.sessionStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const PROFILE_EMAILS = {
  Aaru: 'aaru.saru090901@gmail.com',
  Somo: 'sohamdivekar9867@gmail.com'
};

let currentUser = null;
let myProfile = '';
let selectedProfile = 'Aaru';
let photos = [];
let viewerIndex = -1;

const grid = document.getElementById('photoGrid');
const input = document.getElementById('photoInput');
const uploadLabel = document.getElementById('uploadLabel');
const statusEl = document.getElementById('uploadStatus');
const titleEl = document.getElementById('galleryTitle');
const noteEl = document.getElementById('galleryNote');
const viewer = document.getElementById('photoViewer');
const viewerBackdrop = document.getElementById('viewerBackdrop');
const viewerClose = document.getElementById('viewerClose');
const viewerImage = document.getElementById('viewerImage');
const viewerCaption = document.getElementById('viewerCaption');
const viewerPrev = document.getElementById('viewerPrev');
const viewerNext = document.getElementById('viewerNext');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
}

function profileFromEmail(email = '') {
  const e = email.toLowerCase();
  if (e === PROFILE_EMAILS.Aaru) return 'Aaru';
  if (e === PROFILE_EMAILS.Somo) return 'Somo';
  return '';
}

function setStatus(message = '') { statusEl.textContent = message; }

function updateProfileUI() {
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.profile === selectedProfile);
  });
  titleEl.textContent = `${selectedProfile}'s screenshots`;
  const isOwner = selectedProfile === myProfile;
  noteEl.textContent = isOwner
    ? 'This is your collection. You can add as many photos as you like.'
    : `Viewing ${selectedProfile}'s collection. Only ${selectedProfile} can add photos here.`;
  uploadLabel.classList.toggle('is-disabled', !isOwner);
  input.disabled = !isOwner;
}

async function loadPhotos() {
  setStatus('Loading memories…');
  const { data, error } = await client
    .from('chat_photos')
    .select('id, profile_name, storage_path, original_name, mime_type, created_by, created_at')
    .eq('profile_name', selectedProfile)
    .order('created_at', { ascending: false });
  if (error) {
    console.error(error);
    grid.innerHTML = '<div class="photo-empty">I could not open this gallery. ❤️<small>Run PHONE_PHOTOS_SETUP.sql in Supabase first.</small></div>';
    setStatus('');
    return;
  }
  photos = [];
  for (const row of (data || [])) {
    const { data: signed, error: signError } = await client.storage.from('chat-photos').createSignedUrl(row.storage_path, 60 * 60);
    if (!signError && signed?.signedUrl) photos.push({ ...row, url: signed.signedUrl });
  }
  renderPhotos();
  setStatus('');
}

function renderPhotos() {
  if (!photos.length) {
    grid.innerHTML = `<div class="photo-empty">No screenshots here yet. ❤️<small>${selectedProfile === myProfile ? 'Add your first little memory above.' : 'Your little memories will appear here.'}</small></div>`;
    return;
  }
  grid.innerHTML = photos.map((photo, index) => `
    <article class="photo-card" data-index="${index}" tabindex="0" role="button" aria-label="Open photo ${index + 1}">
      <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.original_name || 'Chat memory')}" loading="lazy">
      ${photo.created_by === currentUser.id ? `<button class="photo-delete" type="button" data-delete-id="${escapeHtml(photo.id)}" aria-label="Delete this photo">×</button>` : ''}
    </article>`).join('');
}

async function uploadPhotos(files) {
  if (!files.length || selectedProfile !== myProfile) return;
  setStatus(`Uploading ${files.length} photo${files.length === 1 ? '' : 's'}…`);
  let uploaded = 0;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'photo';
    const path = `${myProfile}/${currentUser.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: storageError } = await client.storage.from('chat-photos').upload(path, file, {
      cacheControl: '31536000', upsert: false, contentType: file.type
    });
    if (storageError) {
      console.error(storageError);
      alert(`Could not upload ${file.name}: ${storageError.message}`);
      continue;
    }
    const { error: dbError } = await client.from('chat_photos').insert({
      profile_name: myProfile, storage_path: path, original_name: file.name, mime_type: file.type, created_by: currentUser.id
    });
    if (dbError) {
      await client.storage.from('chat-photos').remove([path]);
      console.error(dbError);
      alert(`Could not save ${file.name}: ${dbError.message}`);
      continue;
    }
    uploaded += 1;
  }
  input.value = '';
  setStatus(`${uploaded} photo${uploaded === 1 ? '' : 's'} added. ❤️`);
  await loadPhotos();
}

async function deletePhoto(id) {
  const photo = photos.find(p => String(p.id) === String(id));
  if (!photo || photo.created_by !== currentUser.id) return;
  if (!confirm('Delete this screenshot from your gallery?')) return;
  setStatus('Removing…');
  const { error: storageError } = await client.storage.from('chat-photos').remove([photo.storage_path]);
  if (storageError) { alert(storageError.message); setStatus(''); return; }
  const { error } = await client.from('chat_photos').delete().eq('id', id).eq('created_by', currentUser.id);
  if (error) { alert(error.message); setStatus(''); return; }
  await loadPhotos();
}

function openViewer(index) {
  if (!photos[index]) return;
  viewerIndex = index;
  viewerImage.src = photos[index].url;
  viewerImage.alt = photos[index].original_name || 'Chat memory';
  viewerCaption.textContent = `${selectedProfile} · ${index + 1} / ${photos.length}`;
  viewer.classList.add('is-open');
  viewer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeViewer() {
  viewer.classList.remove('is-open');
  viewer.setAttribute('aria-hidden', 'true');
  viewerImage.src = '';
  document.body.style.overflow = '';
}
function stepViewer(direction) {
  if (!photos.length) return;
  viewerIndex = (viewerIndex + direction + photos.length) % photos.length;
  openViewer(viewerIndex);
}

document.querySelectorAll('.profile-tab').forEach(btn => btn.addEventListener('click', async () => {
  selectedProfile = btn.dataset.profile;
  updateProfileUI();
  await loadPhotos();
}));

input.addEventListener('change', () => uploadPhotos(Array.from(input.files || [])));
grid.addEventListener('click', event => {
  const deleteBtn = event.target.closest('[data-delete-id]');
  if (deleteBtn) { event.stopPropagation(); deletePhoto(deleteBtn.dataset.deleteId); return; }
  const card = event.target.closest('.photo-card');
  if (card) openViewer(Number(card.dataset.index));
});
grid.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.photo-card')) {
    event.preventDefault();
    openViewer(Number(event.target.closest('.photo-card').dataset.index));
  }
});
viewerClose.addEventListener('click', closeViewer);
viewerBackdrop.addEventListener('click', closeViewer);
viewerPrev.addEventListener('click', () => stepViewer(-1));
viewerNext.addEventListener('click', () => stepViewer(1));
document.addEventListener('keydown', event => {
  if (!viewer.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeViewer();
  if (event.key === 'ArrowLeft') stepViewer(-1);
  if (event.key === 'ArrowRight') stepViewer(1);
});

async function init() {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    window.location.replace('login.html');
    return;
  }
  currentUser = user;
  myProfile = profileFromEmail(user.email || '');
  if (!myProfile) {
    alert('This gallery is only available to Aaru and Somo.');
    return;
  }
  selectedProfile = myProfile;
  updateProfileUI();
  await loadPhotos();
}

init();
