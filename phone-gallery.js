(() => {
  // Keep this feature isolated from auth.js/protect.js so global const names cannot collide.
  const PHONE_SUPABASE_URL = 'https://swqaakxywwajesuajflz.supabase.co';
  const PHONE_SUPABASE_KEY = 'sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G';
  const phoneClient = window.supabase.createClient(PHONE_SUPABASE_URL, PHONE_SUPABASE_KEY, {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const PROFILE_EMAILS = {
    Aaru: 'aaru.saru090901@gmail.com',
    Somo: 'sohamdivekar9867@gmail.com'
  };

  let currentUser = null;
  let myProfile = '';
  let selectedProfile = '';
  let photos = [];
  let viewerIndex = -1;

  const chooser = document.getElementById('profileChooser');
  const galleryView = document.getElementById('galleryView');
  const galleryBack = document.getElementById('galleryBack');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryCount = document.getElementById('galleryCount');
  const grid = document.getElementById('photoGrid');
  const input = document.getElementById('photoInput');
  const uploadLabel = document.getElementById('uploadLabel');
  const statusEl = document.getElementById('uploadStatus');
  const viewer = document.getElementById('photoViewer');
  const viewerClose = document.getElementById('viewerClose');
  const viewerImage = document.getElementById('viewerImage');
  const viewerCaption = document.getElementById('viewerCaption');
  const viewerPrev = document.getElementById('viewerPrev');
  const viewerNext = document.getElementById('viewerNext');
  const viewerDeleteWrap = document.getElementById('viewerDeleteWrap');
  const phoneTime = document.getElementById('phoneTime');

  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
    }[c]));
  }

  function setStatus(message = '') {
    statusEl.textContent = message;
  }

  function updatePhoneTime() {
    phoneTime.textContent = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'
    }).format(new Date());
  }

  setInterval(updatePhoneTime, 1000);
  updatePhoneTime();

  async function resolveMyProfile() {
    // Prefer the exact logged-in email. This avoids depending on a custom RPC
    // just to decide which profile the current user owns.
    const email = (currentUser?.email || '').trim().toLowerCase();
    if (email === PROFILE_EMAILS.Aaru.toLowerCase()) return 'Aaru';
    if (email === PROFILE_EMAILS.Somo.toLowerCase()) return 'Somo';

    try {
      const { data, error } = await phoneClient.rpc('current_couple_profile');
      if (!error && (data === 'Aaru' || data === 'Somo')) return data;
    } catch (error) {
      console.warn('current_couple_profile unavailable:', error);
    }

    const meta = currentUser?.user_metadata || {};
    const candidate = String(meta.profile_name || meta.profile || meta.name || '').toLowerCase();
    if (candidate === 'aaru') return 'Aaru';
    if (candidate === 'somo' || candidate === 'soham') return 'Somo';
    return '';
  }

  function showChooser() {
    galleryView.hidden = true;
    chooser.hidden = false;
    selectedProfile = '';
    setStatus('');
  }

  function showGallery() {
    chooser.hidden = true;
    galleryView.hidden = false;
  }

  async function chooseProfile(profile) {
    selectedProfile = profile;
    galleryTitle.textContent = `${profile}'s Memories`;
    uploadLabel.classList.toggle('is-disabled', profile !== myProfile);
    input.disabled = profile !== myProfile;
    setStatus(profile === myProfile
      ? 'Your collection · you can add photos here.'
      : `${profile}'s collection · view only.`);
    showGallery();
    await loadPhotos();
  }

  async function loadPhotos() {
    grid.innerHTML = '<div class="photo-empty">Opening memories…</div>';
    const { data, error } = await phoneClient
      .from('chat_photos')
      .select('id,profile_name,storage_path,original_name,mime_type,created_by,created_at')
      .eq('profile_name', selectedProfile)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      grid.innerHTML = '<div class="photo-empty">Could not open this gallery. ❤️<small>Check the Supabase phone-photo SQL.</small></div>';
      return;
    }

    photos = [];
    for (const row of data || []) {
      const { data: signed, error: signError } = await phoneClient
        .storage.from('chat-photos')
        .createSignedUrl(row.storage_path, 3600);
      if (!signError && signed?.signedUrl) photos.push({ ...row, url: signed.signedUrl });
    }

    galleryCount.textContent = `${photos.length} photo${photos.length === 1 ? '' : 's'}`;
    renderPhotos();
  }

  function renderPhotos() {
    if (!photos.length) {
      grid.innerHTML = `<div class="photo-empty">No screenshots here yet. ❤️<small>${
        selectedProfile === myProfile ? 'Tap ＋ to save your first memory.' : 'Nothing has been saved here yet.'
      }</small></div>`;
      return;
    }

    grid.innerHTML = photos.map((photo, index) => `
      <article class="photo-card" data-index="${index}" tabindex="0" role="button">
        <img src="${escapeHtml(photo.url)}" alt="${escapeHtml(photo.original_name || 'Chat memory')}" loading="lazy">
        ${photo.created_by === currentUser.id
          ? `<button class="photo-delete" type="button" data-delete-id="${escapeHtml(photo.id)}" aria-label="Delete photo">×</button>`
          : ''}
      </article>`).join('');
  }

  async function uploadPhotos(files) {
    if (!files.length) return;
    if (selectedProfile !== myProfile) {
      alert(`You are logged in as ${myProfile}. You can only add photos to your own collection.`);
      return;
    }

    setStatus(`Saving ${files.length} photo${files.length === 1 ? '' : 's'}…`);
    let uploaded = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const safeName = file.name.toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'photo';
      const path = `${myProfile}/${currentUser.id}/${crypto.randomUUID()}-${safeName}`;

      const { error: storageError } = await phoneClient.storage
        .from('chat-photos')
        .upload(path, file, {
          cacheControl: '31536000', upsert: false, contentType: file.type
        });

      if (storageError) {
        console.error(storageError);
        alert(`Could not upload ${file.name}: ${storageError.message}`);
        continue;
      }

      const { error: dbError } = await phoneClient.from('chat_photos').insert({
        profile_name: myProfile,
        storage_path: path,
        original_name: file.name,
        mime_type: file.type,
        created_by: currentUser.id
      });

      if (dbError) {
        await phoneClient.storage.from('chat-photos').remove([path]);
        console.error(dbError);
        alert(`Could not save ${file.name}: ${dbError.message}`);
        continue;
      }
      uploaded++;
    }

    input.value = '';
    setStatus(`${uploaded} photo${uploaded === 1 ? '' : 's'} saved. ❤️`);
    await loadPhotos();
  }

  async function deletePhoto(id) {
    const photo = photos.find(p => String(p.id) === String(id));
    if (!photo || photo.created_by !== currentUser.id) return;
    if (!confirm('Delete this screenshot?')) return;

    setStatus('Deleting…');
    const { error: storageError } = await phoneClient.storage.from('chat-photos').remove([photo.storage_path]);
    if (storageError) { alert(storageError.message); return; }

    const { error } = await phoneClient.from('chat_photos')
      .delete().eq('id', id).eq('created_by', currentUser.id);
    if (error) { alert(error.message); return; }

    closeViewer();
    await loadPhotos();
  }

  function openViewer(index) {
    if (!photos[index]) return;
    viewerIndex = index;
    const photo = photos[index];
    viewerImage.src = photo.url;
    viewerImage.alt = photo.original_name || 'Chat memory';
    viewerCaption.textContent = `${viewerIndex + 1} / ${photos.length}`;
    viewerDeleteWrap.innerHTML = photo.created_by === currentUser.id
      ? '<button class="viewer-delete" id="viewerDelete" type="button">Delete this photo</button>' : '';
    const del = document.getElementById('viewerDelete');
    if (del) del.addEventListener('click', () => deletePhoto(photo.id));
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
  }

  function closeViewer() {
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden', 'true');
    viewerImage.src = '';
    viewerDeleteWrap.innerHTML = '';
  }

  function stepViewer(direction) {
    if (!photos.length) return;
    viewerIndex = (viewerIndex + direction + photos.length) % photos.length;
    openViewer(viewerIndex);
  }

  // Attach all UI handlers after the DOM is present.
  document.querySelectorAll('.user-option').forEach(btn => {
    btn.addEventListener('click', () => chooseProfile(btn.dataset.profile));
  });
  galleryBack.addEventListener('click', showChooser);
  input.addEventListener('change', () => uploadPhotos(Array.from(input.files || [])));
  grid.addEventListener('click', event => {
    const del = event.target.closest('[data-delete-id]');
    if (del) { event.stopPropagation(); deletePhoto(del.dataset.deleteId); return; }
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
  viewerPrev.addEventListener('click', () => stepViewer(-1));
  viewerNext.addEventListener('click', () => stepViewer(1));
  document.addEventListener('keydown', event => {
    if (!viewer.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') stepViewer(-1);
    if (event.key === 'ArrowRight') stepViewer(1);
  });

  async function init() {
    const { data: { user }, error } = await phoneClient.auth.getUser();
    if (error || !user) {
      window.location.replace('login.html');
      return;
    }

    currentUser = user;
    myProfile = await resolveMyProfile();

    if (!myProfile) {
      alert('This gallery is only available to Aaru and Somo.');
      return;
    }

    showChooser();
  }

  init();
})();
