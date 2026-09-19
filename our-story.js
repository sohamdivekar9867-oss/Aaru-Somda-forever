const STORY_SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const STORY_SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
const storyClient = window.supabase.createClient(STORY_SUPABASE_URL, STORY_SUPABASE_KEY, {
  auth: {
    storage: window.sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const AARU_EMAIL = "aaru.saru090901@gmail.com";
const SOMDA_EMAIL = "sohamdivekar9867@gmail.com";
const HIDDEN_TITLE = "how it began";

let storyRows = [];
let readerPages = [];
let currentPage = 0;
let currentUser = null;
let editingUnlocked = false;
let repaginateTimer = null;

const $ = id => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  }[char]));
}

function isAaru(row) {
  return String(row.author || "").toLowerCase().includes("aaru") ||
    String(row.slug || "").toLowerCase().includes("rt");
}

function rowOwner(row) {
  return isAaru(row) ? "Aaru" : "Somda";
}

function currentOwner() {
  const email = String(currentUser?.email || "").toLowerCase();
  if (email === AARU_EMAIL) return "Aaru";
  if (email === SOMDA_EMAIL) return "Somda";
  return null;
}

function canEditRow(row) {
  return editingUnlocked && currentOwner() === rowOwner(row);
}

function cleanText(value = "") {
  return String(value).replace(/\u00a0/g, " ").trim();
}

function paragraphsFromText(content = "") {
  const value = cleanText(content);
  if (!value) return [];
  return value.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

function renderParagraphs(parts) {
  return parts.map(part => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`).join("");
}

function textFromEditor(element) {
  return Array.from(element.querySelectorAll("p"))
    .map(p => p.innerText.replace(/\u00a0/g, " ").trim())
    .filter(Boolean)
    .join("\n\n") || element.innerText.replace(/\u00a0/g, " ").trim();
}

function groupStories(rows) {
  const groups = [];
  rows.forEach(row => {
    const title = (row.title || "Untitled chapter").trim();
    let group = groups.find(item => item.title.toLowerCase() === title.toLowerCase());
    if (!group) {
      group = { title, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  });
  return groups;
}

function isDeletableGroup(group) {
  return group.rows.some(row => !["rt-perspective", "soham-perspective"].includes(row.slug));
}

function buildIndex() {
  const groups = groupStories(storyRows);
  const makeEntry = (group, index, overlay = false) => {
    const first = group.rows[0];
    const target = `story-${first.slug}`;
    const number = String(index + 1).padStart(2, "0");
    const pageNumber = String(storyRows.indexOf(first) + 3).padStart(2, "0");
    const entryClass = overlay ? "overlay-entry" : "index-entry";
    const numberClass = overlay ? "overlay-entry-number" : "index-number";
    const textClass = overlay ? "overlay-entry-text" : "index-entry-text";
    const pageClass = overlay ? "overlay-entry-page" : "index-page-number";
    return `
      <div class="${entryClass}-wrapper">
        <button class="${entryClass}" data-target="${escapeHtml(target)}">
          <span class="${numberClass}">${number}</span>
          <span class="${textClass}"><strong>${escapeHtml(group.title)}</strong></span>
          <span class="${pageClass}">${pageNumber}</span>
        </button>
      </div>`;
  };

  const mainHtml = groups.length
    ? groups.map((g, i) => makeEntry(g, i)).join("")
    : `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;
  const overlayHtml = groups.length
    ? groups.map((g, i) => makeEntry(g, i, true)).join("")
    : `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;

  $("indexList").innerHTML = mainHtml;
  $("overlayIndexList").innerHTML = overlayHtml;

  document.querySelectorAll(".index-entry, .overlay-entry").forEach(button => {
    button.addEventListener("click", () => goToSlug(button.dataset.target.replace(/^story-/, "")));
  });
}

function pageContentHeight() {
  return window.innerWidth <= 700 ? 310 : 395;
}

function splitParagraphsToPages(parts) {
  // Browser-measured pagination: the hidden measurer uses the same serif font,
  // width and line-height as the visible story editor.
  if (!parts.length) return [[]];

  const measurer = document.createElement("div");
  measurer.className = "pagination-measurer";
  measurer.style.width = window.innerWidth <= 700 ? "calc(100vw - 86px)" : "510px";
  document.body.appendChild(measurer);

  const pages = [];
  let pageParts = [];
  const limit = pageContentHeight();

  const fits = candidate => {
    measurer.innerHTML = renderParagraphs(candidate);
    return measurer.scrollHeight <= limit;
  };

  for (const paragraph of parts) {
    let candidate = [...pageParts, paragraph];
    if (fits(candidate)) {
      pageParts = candidate;
      continue;
    }

    if (pageParts.length) {
      pages.push(pageParts);
      pageParts = [];
    }

    // A single long paragraph may itself exceed the page. Split it at word boundaries.
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (fits([test])) {
        current = test;
      } else {
        if (current) {
          pageParts.push(current);
          if (!fits(pageParts)) {
            pages.push(pageParts.slice(0, -1));
            pageParts = [current];
          }
        }
        current = word;
      }
    }
    if (current) pageParts.push(current);

    if (!fits(pageParts)) {
      while (pageParts.length > 1 && !fits(pageParts)) {
        pages.push(pageParts.shift());
      }
    }
  }

  if (pageParts.length) pages.push(pageParts);
  document.body.removeChild(measurer);
  return pages.length ? pages : [[]];
}

function createStoryPage(row, physicalIndex, partIndex, totalParts, parts) {
  const owner = rowOwner(row);
  const editable = canEditRow(row);
  const page = document.createElement("section");
  page.className = "reader-page story-page";
  page.dataset.slug = row.slug;
  page.dataset.part = String(partIndex);

  const titleEditable = editable && partIndex === 0;
  const heading = titleEditable
    ? `<input class="story-title-input" value="${escapeHtml(row.title || "Our Story")}" aria-label="Chapter heading">`
    : `<h2 class="story-title">${escapeHtml(row.title || "Our Story")}</h2>`;

  const editorId = `editor-${row.slug}-${partIndex}`;
  page.innerHTML = `
    <div class="page-inner">
      <div class="page-top">
        <span>${String(physicalIndex).padStart(2, "0")} · ${owner === "Aaru" ? "AARU'S SIDE" : "SOMDA'S SIDE"}</span>
        <span class="perspective-corner">${owner}'s perspective</span>
      </div>

      <div class="story-page-content">
        <p class="page-eyebrow">Our story</p>
        ${heading}
        <div class="page-rule"></div>

        <div class="story-editor editable-content contenteditable-area ${editable ? "editing-active" : ""}"
          id="${editorId}"
          contenteditable="${editable ? "true" : "false"}"
          spellcheck="true"
          data-slug="${escapeHtml(row.slug)}"
          data-part="${partIndex}"
        >${renderParagraphs(parts)}</div>

        ${editable ? `<div class="story-edit-actions">
          <button class="story-save-button" data-slug="${escapeHtml(row.slug)}">Save changes</button>
          <span class="editor-hint">Your changes are saved to your perspective only.</span>
        </div>` : ""}

        <div class="page-quote">“Some people enter your life quietly, but stay forever.” <span>♡</span></div>
      </div>

      <div class="page-bottom">
        <span>Written by ${owner}</span>
        <span>${String(physicalIndex).padStart(2, "0")}</span>
      </div>
    </div>`;

  if (editable) {
    page.querySelector(".story-save-button").addEventListener("click", () => saveStory(row.slug));
    const titleInput = page.querySelector(".story-title-input");
    titleInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        titleInput.blur();
      }
    });
    page.querySelector(".story-editor").addEventListener("input", () => {
      clearTimeout(repaginateTimer);
      repaginateTimer = setTimeout(() => repaginateIfNeeded(row.slug), 250);
    });
  }

  return page;
}

function collectSlugText(slug) {
  return Array.from(document.querySelectorAll(`.story-editor[data-slug="${CSS.escape(slug)}"]`))
    .sort((a, b) => Number(a.dataset.part) - Number(b.dataset.part))
    .map(textFromEditor)
    .filter(Boolean)
    .join("\n\n");
}

function collectSlugTitle(slug) {
  const input = document.querySelector(`.story-page[data-slug="${CSS.escape(slug)}"] .story-title-input`);
  if (input) return input.value.trim();
  const row = storyRows.find(r => r.slug === slug);
  return row?.title || "Our Story";
}

function renderAllStoryPages() {
  const container = $("dynamicStoryPages");
  container.innerHTML = "";
  readerPages = [$("indexPage")];

  let physical = 3;
  storyRows.forEach(row => {
    const parts = splitParagraphsToPages(paragraphsFromText(row.content));
    parts.forEach((part, partIndex) => {
      const page = createStoryPage(row, physical++, partIndex, parts.length, part);
      container.appendChild(page);
      readerPages.push(page);
    });
  });

  bindPageNavigation();
  buildIndex();
  showPage(Math.min(currentPage, readerPages.length - 1));
}

function bindPageNavigation() {
  // Buttons are static, so only state is updated here.
}

async function loadStories() {
  const { data, error } = await storyClient
    .from("story_pages")
    .select("slug,title,author,content,subtitle,page_type,display_order,published")
    .eq("published", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error(error);
    alert("Could not load the story pages.");
    return;
  }

  // Remove the old placeholder chapter from the UI even before the cleanup SQL is run.
  storyRows = (data || []).filter(row => String(row.title || "").trim().toLowerCase() !== HIDDEN_TITLE);
  renderAllStoryPages();
}

async function saveStory(slug) {
  const row = storyRows.find(item => item.slug === slug);
  if (!row || !canEditRow(row)) {
    alert("You can only edit your own perspective ♡");
    return;
  }

  const content = collectSlugText(slug);
  const title = collectSlugTitle(slug);
  if (!title) {
    alert("Please enter a chapter heading.");
    return;
  }

  const buttons = document.querySelectorAll(`.story-save-button[data-slug="${CSS.escape(slug)}"]`);
  buttons.forEach(button => {
    button.disabled = true;
    button.textContent = "Saving...";
  });

  const { error } = await storyClient
    .from("story_pages")
    .update({
      title,
      content,
      updated_at: new Date().toISOString()
    })
    .eq("slug", row.slug);

  if (error) {
    console.error(error);
    buttons.forEach(button => {
      button.disabled = false;
      button.textContent = "Save failed";
    });
    alert("Could not save this page. Make sure the STORY_SETUP.sql policies have been run.");
    return;
  }

  row.title = title;
  row.content = content;
  buttons.forEach(button => {
    button.disabled = false;
    button.textContent = "Saved ✓";
  });

  setTimeout(() => {
    renderAllStoryPages();
  }, 900);
}

async function addNewPage() {
  if (!editingUnlocked) return;

  const title = prompt("Enter the heading for this new chapter:");
  if (!title || !title.trim()) return;
  const cleanTitle = title.trim();

  if (storyRows.some(row => (row.title || "").trim().toLowerCase() === cleanTitle.toLowerCase())) {
    alert("A chapter with this heading already exists.");
    return;
  }

  const base = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `chapter-${Date.now()}`;
  const maxOrder = storyRows.reduce((max, row) => Math.max(max, Number(row.display_order) || 0), 0);

  const rows = [
    { slug: `${base}-aaru`, title: cleanTitle, author: "Aaru", content: "", page_type: "perspective", display_order: maxOrder + 1, published: true },
    { slug: `${base}-somda`, title: cleanTitle, author: "Somda", content: "", page_type: "perspective", display_order: maxOrder + 2, published: true }
  ];

  const { data, error } = await storyClient.from("story_pages").insert(rows).select();
  if (error) {
    console.error(error);
    alert("Could not create the new chapter. Check the story INSERT policy.");
    return;
  }

  storyRows.push(...(data || rows));
  renderAllStoryPages();
  alert(`“${cleanTitle}” has been added with Aaru's and Somda's pages ♡`);
}

async function deleteStoryEntry(title) {
  if (!editingUnlocked) return;

  const matchingRows = storyRows.filter(row =>
    (row.title || "").trim().toLowerCase() === String(title).trim().toLowerCase()
  );
  const deletableRows = matchingRows.filter(row => !["rt-perspective", "soham-perspective"].includes(row.slug));

  if (!deletableRows.length) {
    alert("The original story pages cannot be deleted ♡");
    return;
  }

  if (!confirm(`Delete “${title}” completely?\n\nThis will delete both perspectives. This cannot be undone.`)) return;

  const { error } = await storyClient.from("story_pages").delete().in("slug", deletableRows.map(row => row.slug));
  if (error) {
    console.error(error);
    alert("Could not delete this story entry. Check the story DELETE policy.");
    return;
  }

  storyRows = storyRows.filter(row => !deletableRows.some(d => d.slug === row.slug));
  currentPage = 0;
  renderAllStoryPages();
  closeOverlay();
}

function applyEditingState() {
  document.querySelectorAll(".story-editor").forEach(editor => {
    const row = storyRows.find(item => item.slug === editor.dataset.slug);
    const allowed = row && canEditRow(row);
    editor.contentEditable = allowed ? "true" : "false";
    editor.classList.toggle("editing-active", allowed);
  });

  document.querySelectorAll(".story-save-button").forEach(button => {
    const row = storyRows.find(item => item.slug === button.dataset.slug);
    button.hidden = !row || !canEditRow(row);
  });

  document.querySelectorAll(".story-title-input").forEach(input => {
    const row = storyRows.find(item => item.slug === input.closest(".story-page")?.dataset.slug);
    input.disabled = !row || !canEditRow(row);
  });

  $("addPageBtn").hidden = !editingUnlocked;
  $("editStoryBtn").textContent = editingUnlocked ? "Lock editing 🔒" : "Edit Story";
}

async function unlockEditing() {
  if (editingUnlocked) {
    editingUnlocked = false;
    renderAllStoryPages();
    return;
  }

  const email = String(currentUser?.email || "").toLowerCase();
  if (![AARU_EMAIL, SOMDA_EMAIL].includes(email)) {
    alert("This account is not authorised to edit the story.");
    return;
  }

  editingUnlocked = true;
  renderAllStoryPages();
}

function showPage(index) {
  if (!readerPages.length) return;
  currentPage = Math.max(0, Math.min(index, readerPages.length - 1));

  readerPages.forEach((page, i) => page.classList.toggle("active-page", i === currentPage));

  $("pageCounter").textContent = `Page ${currentPage + 2} of ${readerPages.length + 1}`;
  $("prevBtn").disabled = false;
  $("nextBtn").disabled = currentPage === readerPages.length - 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToSlug(slug) {
  const page = readerPages.find(page => page.dataset.slug === slug);
  if (page) showPage(readerPages.indexOf(page));
  closeOverlay();
}

function openOverlay() { $("indexOverlay").classList.add("open"); }
function closeOverlay() { $("indexOverlay").classList.remove("open"); }

function repaginateIfNeeded(slug) {
  const editors = Array.from(document.querySelectorAll(`.story-editor[data-slug="${CSS.escape(slug)}"]`));
  if (!editors.length) return;
  const overflowing = editors.some(editor => editor.scrollHeight > editor.clientHeight + 2);
  if (!overflowing) return;

  const row = storyRows.find(r => r.slug === slug);
  if (!row || !canEditRow(row)) return;

  row.content = collectSlugText(slug);
  const currentSlug = slug;
  const currentPart = Number(editors[editors.length - 1]?.dataset.part || 0);
  renderAllStoryPages();

  const newEditors = Array.from(document.querySelectorAll(`.story-editor[data-slug="${CSS.escape(currentSlug)}"]`));
  const target = newEditors[Math.min(currentPart, newEditors.length - 1)];
  if (target) {
    target.focus();
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  $("startBookBtn").addEventListener("click", () => {
    $("coverPage").classList.add("cover-opening");
    setTimeout(() => {
      $("coverPage").style.display = "none";
      $("reader").style.display = "block";
      showPage(0);
    }, 450);
  });

  $("prevBtn").addEventListener("click", () => {
    if (currentPage === 0) {
      window.location.href = "index.html";
      return;
    }
    showPage(currentPage - 1);
  });

  $("nextBtn").addEventListener("click", () => showPage(currentPage + 1));
  $("bottomIndexBtn").addEventListener("click", () => showPage(0));
  $("indexToggle").addEventListener("click", openOverlay);
  $("closeIndexBtn").addEventListener("click", closeOverlay);
  $("editStoryBtn").addEventListener("click", unlockEditing);
  $("addPageBtn").addEventListener("click", addNewPage);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeOverlay(); });

  const { data: { user }, error } = await storyClient.auth.getUser();
  if (error) console.error(error);
  currentUser = user || null;

  loadStories();
});
