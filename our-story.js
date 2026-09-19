const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const AARU_EMAIL = "aaru.saru090901@gmail.com";
const SOMDA_EMAIL = "sohamdivekar9867@gmail.com";
const ORIGINAL_SLUGS = new Set(["rt-perspective", "soham-perspective"]);

let currentUser = null;
let storyRows = [];
let readerPages = [];
let currentPage = 0;
let selectedPerspective = "Aaru";

const $ = id => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[char]));
}

function normaliseAuthor(author, slug = "") {
  const value = `${author || ""} ${slug}`.toLowerCase();
  return value.includes("soham") ? "Somda" : "Aaru";
}

function perspectiveForRow(row) {
  return normaliseAuthor(row.author, row.slug);
}

function canEditPerspective(perspective) {
  if (!currentUser?.email) return false;
  const email = currentUser.email.toLowerCase().trim();
  return (perspective === "Aaru" && email === AARU_EMAIL) ||
         (perspective === "Somda" && email === SOMDA_EMAIL);
}

function renderContent(content = "") {
  const text = String(content || "").trim();
  if (!text) return `<p class="placeholder-text">Write your memories here...</p>`;
  return text.split(/\n\s*\n/).map(part =>
    `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br>")}</p>`
  ).join("");
}

function textFromEditor(element) {
  const paragraphs = Array.from(element.querySelectorAll("p"))
    .map(p => p.innerText.trim())
    .filter(Boolean);
  return paragraphs.join("\n\n") || element.innerText.trim();
}

function groupStories(rows) {
  const groups = [];
  rows.forEach(row => {
    const title = (row.title || "Untitled chapter").trim();
    let group = groups.find(g => g.title.toLowerCase() === title.toLowerCase());
    if (!group) {
      group = { title, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  });
  return groups;
}

function getPerspectiveRow(group, perspective = selectedPerspective) {
  return group.rows.find(row => perspectiveForRow(row) === perspective) || group.rows[0];
}

function isDeletableGroup(group) {
  return group.rows.some(row => !ORIGINAL_SLUGS.has(row.slug));
}

function perspectiveDropdown(group, activePerspective) {
  return `
    <div class="perspective-picker-wrap">
      <label for="perspective-${escapeHtml(group.title)}">Perspective</label>
      <select class="perspective-picker" data-title="${escapeHtml(group.title)}" id="perspective-${escapeHtml(group.title)}">
        <option value="Aaru" ${activePerspective === "Aaru" ? "selected" : ""}>Aaru's Perspective</option>
        <option value="Somda" ${activePerspective === "Somda" ? "selected" : ""}>Somda's Perspective</option>
      </select>
    </div>`;
}

function createStoryPage(group, number) {
  const row = getPerspectiveRow(group, selectedPerspective);
  const author = perspectiveForRow(row);
  const editable = canEditPerspective(author);
  const page = document.createElement("section");
  page.className = "reader-page story-page";
  page.dataset.title = group.title;
  page.dataset.slug = row.slug;

  page.innerHTML = `
    <div class="page-inner">
      <div class="page-top">
        <span>${String(number).padStart(2, "0")} · OUR STORY</span>
        <span>${escapeHtml(group.title)}</span>
      </div>

      <div class="story-page-content">
        ${perspectiveDropdown(group, author)}
        <p class="page-eyebrow">${escapeHtml(group.title)}</p>
        <h2>${escapeHtml(group.title)}</h2>
        <div class="page-rule"></div>

        <div class="perspective-label">${author === "Aaru" ? "Aaru's Perspective" : "Somda's Perspective"}</div>

        <div class="editable-content contenteditable-area ${editable ? "editing-active" : ""}"
             id="editor-${escapeHtml(row.slug)}"
             contenteditable="${editable ? "true" : "false"}"
             spellcheck="true">${renderContent(row.content || "")}</div>

        <div class="story-edit-controls">
          ${editable ? `<button class="story-save-button" data-slug="${escapeHtml(row.slug)}">Save this page</button>` : `<span class="read-only-note">Read only · ${author}'s perspective</span>`}
        </div>

        <div class="page-quote">“Some people enter your life quietly, but stay forever.” <span>♡</span></div>
      </div>

      <div class="page-bottom">
        <span>Written by ${escapeHtml(author)}</span>
        <span>${String(number).padStart(2, "0")}</span>
      </div>
    </div>`;
  return page;
}

function buildPages() {
  const container = $("dynamicStoryPages");
  container.innerHTML = "";
  readerPages = [$("indexPage")];

  groupStories(storyRows).forEach((group, index) => {
    const page = createStoryPage(group, index + 3);
    container.appendChild(page);
    readerPages.push(page);
  });

  bindPageButtons();
  bindPerspectivePickers();
  buildIndex();
  applyResponsivePagination();
  showPage(Math.min(currentPage, readerPages.length - 1));
}

function buildIndex() {
  const groups = groupStories(storyRows);
  const makeEntry = (group, index, overlay = false) => {
    const first = group.rows[0];
    const target = `story-${encodeURIComponent(group.title)}`;
    const number = String(index + 1).padStart(2, "0");
    const pageNumber = String(index + 3).padStart(2, "0");
    const deletable = isDeletableGroup(group);
    const entryClass = overlay ? "overlay-entry" : "index-entry";
    const numberClass = overlay ? "overlay-entry-number" : "index-number";
    const textClass = overlay ? "overlay-entry-text" : "index-entry-text";
    const pageClass = overlay ? "overlay-entry-page" : "index-page-number";
    return `<div class="${entryClass}-wrapper">
      <button class="${entryClass}" data-target="${escapeHtml(target)}">
        <span class="${numberClass}">${number}</span>
        <span class="${textClass}"><strong>${escapeHtml(group.title)}</strong></span>
        <span class="${pageClass}">${pageNumber}</span>
      </button>
      ${deletable ? `<button class="entry-delete-button" data-title="${escapeHtml(group.title)}">Delete</button>` : ""}
    </div>`;
  };

  const empty = `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;
  $("indexList").innerHTML = groups.length ? groups.map((g,i)=>makeEntry(g,i)).join("") : empty;
  $("overlayIndexList").innerHTML = groups.length ? groups.map((g,i)=>makeEntry(g,i,true)).join("") : empty;

  document.querySelectorAll(".index-entry, .overlay-entry").forEach(btn => {
    btn.addEventListener("click", () => goToTitle(decodeURIComponent(btn.dataset.target.replace(/^story-/, ""))));
  });
  document.querySelectorAll(".entry-delete-button").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); deleteStoryEntry(btn.dataset.title); });
  });
}

function bindPageButtons() {
  document.querySelectorAll(".story-save-button").forEach(button => {
    button.addEventListener("click", () => saveStory(button));
  });
}

function bindPerspectivePickers() {
  document.querySelectorAll(".perspective-picker").forEach(select => {
    select.addEventListener("change", () => {
      selectedPerspective = select.value;
      const activeTitle = select.dataset.title;
      const groups = groupStories(storyRows);
      const index = groups.findIndex(g => g.title.toLowerCase() === activeTitle.toLowerCase());
      if (index < 0) return;
      buildPages();
      showPage(index + 1);
    });
  });
}

async function loadCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error("Could not read current user", error);
    currentUser = null;
  } else {
    currentUser = data.user || null;
  }
}

async function loadStories() {
  const { data, error } = await supabaseClient
    .from("story_pages")
    .select("slug,title,author,content,subtitle,page_type,display_order,published")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(error);
    alert("Could not load the story pages.");
    return;
  }
  storyRows = data || [];
  // The old placeholder chapter is removed from the UI even if it still exists in the DB.
  storyRows = storyRows.filter(row => (row.title || "").trim().toLowerCase() !== "how it began");
  buildPages();
}

async function saveStory(button) {
  const row = storyRows.find(item => item.slug === button.dataset.slug);
  if (!row) return;
  const perspective = perspectiveForRow(row);
  if (!canEditPerspective(perspective)) {
    alert(`You can only edit ${currentUser?.email?.toLowerCase() === AARU_EMAIL ? "Aaru's" : "Somda's"} perspective.`);
    return;
  }

  const editor = document.getElementById(`editor-${row.slug}`);
  if (!editor) return;
  const content = textFromEditor(editor);
  button.disabled = true;
  button.textContent = "Saving...";

  const { error } = await supabaseClient
    .from("story_pages")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("slug", row.slug);

  if (error) {
    console.error(error);
    button.textContent = "Save failed";
    button.disabled = false;
    alert(`Could not save this page: ${error.message}`);
    return;
  }

  row.content = content;
  button.textContent = "Saved ✓";
  setTimeout(() => { button.textContent = "Save this page"; button.disabled = false; }, 1600);
}

async function addNewPage() {
  if (!canEditPerspective("Aaru") && !canEditPerspective("Somda")) {
    alert("Please log in with Aaru's or Somda's account to add a chapter.");
    return;
  }
  const title = prompt("Enter the heading for this new chapter:");
  if (!title?.trim()) return;
  const cleanTitle = title.trim();
  if (storyRows.some(row => (row.title || "").trim().toLowerCase() === cleanTitle.toLowerCase())) {
    alert("A chapter with this heading already exists."); return;
  }
  const base = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || `chapter-${Date.now()}`;
  const maxOrder = storyRows.reduce((m,r)=>Math.max(m, Number(r.display_order)||0),0);
  const rows = [
    { slug:`${base}-rt`, title:cleanTitle, author:"Aaru", content:"", page_type:"perspective", display_order:maxOrder+1, published:true },
    { slug:`${base}-soham`, title:cleanTitle, author:"Somda", content:"", page_type:"perspective", display_order:maxOrder+2, published:true }
  ];
  const { data, error } = await supabaseClient.from("story_pages").insert(rows).select();
  if (error) { console.error(error); alert(`Could not create the chapter: ${error.message}`); return; }
  storyRows.push(...(data || rows));
  buildPages();
}

async function deleteStoryEntry(title) {
  const group = groupStories(storyRows).find(g => g.title.toLowerCase() === String(title).toLowerCase());
  if (!group || !isDeletableGroup(group)) return;
  const myPerspective = canEditPerspective("Aaru") ? "Aaru" : canEditPerspective("Somda") ? "Somda" : null;
  if (!myPerspective) { alert("You are not allowed to manage story entries."); return; }
  if (!confirm(`Delete “${title}” completely?\n\nThis will delete both perspectives.`)) return;
  const slugs = group.rows.filter(r => !ORIGINAL_SLUGS.has(r.slug)).map(r=>r.slug);
  const { error } = await supabaseClient.from("story_pages").delete().in("slug", slugs);
  if (error) { alert(`Could not delete this story entry: ${error.message}`); return; }
  storyRows = storyRows.filter(r => !slugs.includes(r.slug));
  currentPage = 0;
  buildPages();
  closeOverlay();
}

function applyResponsivePagination() {
  // CSS provides the Word-like page surface. Content itself remains editable as one continuous document.
  document.querySelectorAll(".editable-content").forEach(el => {
    el.style.textAlign = "justify";
  });
}

function showPage(index) {
  if (!readerPages.length) return;
  currentPage = Math.max(0, Math.min(index, readerPages.length - 1));
  readerPages.forEach((page,i)=>page.classList.toggle("active-page", i===currentPage));
  $("pageCounter").textContent = `Page ${currentPage + 2} of ${readerPages.length + 1}`;
  $("prevBtn").disabled = false;
  $("nextBtn").disabled = currentPage === readerPages.length - 1;
  window.scrollTo({top:0, behavior:"smooth"});
}

function goToTitle(title) {
  const groups = groupStories(storyRows);
  const index = groups.findIndex(g => g.title.toLowerCase() === title.toLowerCase());
  if (index >= 0) showPage(index + 1);
  closeOverlay();
}

function openOverlay(){ $("indexOverlay").classList.add("open"); }
function closeOverlay(){ $("indexOverlay").classList.remove("open"); }

document.addEventListener("DOMContentLoaded", async () => {
  $("startBookBtn").addEventListener("click", () => {
    $("coverPage").classList.add("cover-opening");
    setTimeout(()=>{ $("coverPage").style.display="none"; $("reader").style.display="block"; showPage(0); },450);
  });
  $("prevBtn").addEventListener("click", ()=> currentPage===0 ? window.location.href="index.html" : showPage(currentPage-1));
  $("nextBtn").addEventListener("click", ()=>showPage(currentPage+1));
  $("bottomIndexBtn").addEventListener("click", ()=>showPage(0));
  $("indexToggle").addEventListener("click", openOverlay);
  $("closeIndexBtn").addEventListener("click", closeOverlay);
  $("addPageBtn").addEventListener("click", addNewPage);
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeOverlay(); });

  await loadCurrentUser();
  await loadStories();

  // Show the add button only to authenticated owners.
  $("addPageBtn").hidden = !(canEditPerspective("Aaru") || canEditPerspective("Somda"));
});
