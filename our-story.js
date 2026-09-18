const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const STORY_EDIT_PIN = "RT2026";

let storyRows = [];
let readerPages = [];
let currentPage = 0;
let editingUnlocked = false;

const $ = id => document.getElementById(id);

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[char]));
}

function renderContent(content = "") {
  const parts = content.trim() ? content.trim().split(/\n\s*\n/) : ["Write your memories here."];
  return parts.map(part => `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br>")}</p>`).join("");
}

function textFromEditor(element) {
  return Array.from(element.querySelectorAll("p")).map(p => p.innerText.trim()).filter(Boolean).join("\n\n") || element.innerText.trim();
}

function normaliseAuthor(author, slug = "") {
  const value = `${author || ""} ${slug}`.toLowerCase();
  return value.includes("soham") ? "Soham" : "RT";
}

function groupStories(rows) {
  const groups = [];
  rows.forEach(row => {
    const title = row.title || "Untitled chapter";
    let group = groups.find(item => item.title.toLowerCase() === title.toLowerCase());
    if (!group) { group = { title, rows: [] }; groups.push(group); }
    group.rows.push(row);
  });
  return groups;
}

function createStoryPage(row, number) {
  const author = normaliseAuthor(row.author, row.slug);
  const page = document.createElement("section");
  page.className = "reader-page story-page";
  page.dataset.slug = row.slug;
  page.innerHTML = `<div class="page-inner"><div class="page-top"><span>${String(number).padStart(2,"0")} · ${author === "RT" ? "HER SIDE" : "HIS SIDE"}</span><span>${escapeHtml(row.title || "OUR STORY")}</span></div><div class="story-page-content"><p class="page-eyebrow">${escapeHtml(row.title || "Our story")}</p><h2>${escapeHtml(author)}'s<br><em>Perspective</em></h2><div class="page-rule"></div><div class="editable-content contenteditable-area" id="editor-${escapeHtml(row.slug)}" contenteditable="${editingUnlocked}" spellcheck="true">${renderContent(row.content || "")}</div><button class="story-save-button" data-slug="${escapeHtml(row.slug)}">Save this page</button><button class="story-delete-button" data-slug="${escapeHtml(row.slug)}" hidden>Delete page</button><div class="page-quote">“Some people enter your life quietly, but stay forever.” <span>♡</span></div></div><div class="page-bottom"><span>Written by ${escapeHtml(author)}</span><span>${String(number).padStart(2,"0")}</span></div></div>`;
  return page;
}

function buildPages() {
  const container = $("dynamicStoryPages");
  container.innerHTML = "";
  readerPages = [$("indexPage")];
  storyRows.forEach((row, i) => {
    const page = createStoryPage(row, i + 3);
    container.appendChild(page);
    readerPages.push(page);
  });
  bindPageButtons();
  buildIndex();
  showPage(Math.min(currentPage, readerPages.length - 1));
}

function buildIndex() {
  const groups = groupStories(storyRows);
  const html = groups.map((group, i) => {
    const first = group.rows[0];
    const target = `story-${first.slug}`;
    return `<button class="index-entry" data-target="${escapeHtml(target)}"><span class="index-number">${String(i+1).padStart(2,"0")}</span><span class="index-entry-text"><strong>${escapeHtml(group.title)}</strong></span><span class="index-page-number">${String(i+3).padStart(2,"0")}</span></button>`;
  }).join("");
  $("indexList").innerHTML = html || `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;
  $("overlayIndexList").innerHTML = html;
  document.querySelectorAll(".index-entry").forEach(button => button.addEventListener("click", () => goToSlug(button.dataset.target.replace(/^story-/, ""))));
}

function bindPageButtons() {
  document.querySelectorAll(".story-save-button").forEach(button => button.addEventListener("click", () => saveStory(button)));
  document.querySelectorAll(".story-delete-button").forEach(button => button.addEventListener("click", () => deleteStory(button.dataset.slug)));
}

async function loadStories() {
  const { data, error } = await supabaseClient.from("story_pages").select("slug,title,author,content,subtitle,page_type,display_order,published").eq("published", true).order("display_order", { ascending: true });
  if (error) { console.error(error); alert("Could not load the story pages."); return; }
  storyRows = data || [];
  buildPages();
}

async function saveStory(button) {
  if (!editingUnlocked) return alert("Unlock editing first ♡");
  const row = storyRows.find(item => item.slug === button.dataset.slug);
  const editor = document.getElementById(`editor-${button.dataset.slug}`);
  if (!row || !editor) return;
  const content = textFromEditor(editor);
  button.disabled = true; button.textContent = "Saving...";
  const { error } = await supabaseClient.from("story_pages").update({ content, updated_at: new Date().toISOString() }).eq("slug", row.slug);
  if (error) { console.error(error); button.textContent = "Save failed"; alert("Could not save this page. Check the Supabase policy."); }
  else { row.content = content; button.textContent = "Saved ✓"; setTimeout(() => { button.textContent = "Save this page"; button.disabled = false; }, 1800); }
}

async function addNewPage() {
  if (!editingUnlocked) return;
  const title = prompt("Enter the heading for this new chapter:");
  if (!title || !title.trim()) return;
  const cleanTitle = title.trim();
  const base = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `chapter-${Date.now()}`;
  if (storyRows.some(row => (row.title || "").toLowerCase() === cleanTitle.toLowerCase())) return alert("A chapter with this heading already exists.");
  const maxOrder = storyRows.reduce((max, row) => Math.max(max, Number(row.display_order) || 0), 0);
  const rows = [{ slug: `${base}-rt`, title: cleanTitle, author: "RT", content: "", page_type: "perspective", display_order: maxOrder + 1, published: true }, { slug: `${base}-soham`, title: cleanTitle, author: "Soham", content: "", page_type: "perspective", display_order: maxOrder + 2, published: true }];
  const { data, error } = await supabaseClient.from("story_pages").insert(rows).select();
  if (error) { console.error(error); alert("Could not create the new pages. Check that INSERT permission is enabled in Supabase."); return; }
  storyRows.push(...(data || rows));
  buildPages();
  alert(`“${cleanTitle}” has been added with RT's and Soham's pages ♡`);
}

async function deleteStory(slug) {
  if (!editingUnlocked || !confirm("Delete this perspective page? This cannot be undone.")) return;
  const { error } = await supabaseClient.from("story_pages").delete().eq("slug", slug);
  if (error) return alert("Could not delete this page.");
  storyRows = storyRows.filter(row => row.slug !== slug); buildPages();
}

function unlockEditing() {
  const pin = prompt("Enter the private PIN:");
  if (pin !== STORY_EDIT_PIN) return alert("Incorrect PIN ♡");
  editingUnlocked = true;
  $("addPageBtn").hidden = false;
  document.querySelectorAll(".contenteditable-area").forEach(el => el.contentEditable = "true");
  document.querySelectorAll(".story-delete-button").forEach(button => button.hidden = false);
  $("editStoryBtn").textContent = "Editing unlocked ✓";
}

function showPage(index) {
  if (!readerPages.length) return;
  currentPage = Math.max(0, Math.min(index, readerPages.length - 1));
  readerPages.forEach((page, i) => page.classList.toggle("active-page", i === currentPage));
  $("pageCounter").textContent = `Page ${currentPage + 2} of ${readerPages.length + 1}`;
  $("prevBtn").disabled = currentPage === 0; $("nextBtn").disabled = currentPage === readerPages.length - 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function goToSlug(slug) { const page = readerPages.find(p => p.dataset.slug === slug); if (page) showPage(readerPages.indexOf(page)); closeOverlay(); }
function openOverlay() { $("indexOverlay").classList.add("open"); }
function closeOverlay() { $("indexOverlay").classList.remove("open"); }

document.addEventListener("DOMContentLoaded", () => {
  $("startBookBtn").addEventListener("click", () => { $("coverPage").classList.add("cover-opening"); setTimeout(() => { $("coverPage").style.display = "none"; $("reader").style.display = "block"; showPage(0); }, 450); });
  $("prevBtn").addEventListener("click", () => showPage(currentPage - 1)); $("nextBtn").addEventListener("click", () => showPage(currentPage + 1)); $("bottomIndexBtn").addEventListener("click", () => showPage(0)); $("indexToggle").addEventListener("click", openOverlay); $("closeIndexBtn").addEventListener("click", closeOverlay); $("editStoryBtn").addEventListener("click", unlockEditing); $("addPageBtn").addEventListener("click", addNewPage); document.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlay(); });
  loadStories();
});
