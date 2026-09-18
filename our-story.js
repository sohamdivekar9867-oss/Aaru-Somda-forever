const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const STORY_EDIT_PIN = "RT2026";
const AARATI_DISPLAY_NAME = "Aaru";

// These are the two original perspective pages. They are protected from deletion.
const ORIGINAL_SLUGS = new Set(["rt-perspective", "soham-perspective"]);

let storyRows = [];
let readerPages = [];
let currentPage = 0;
let editingUnlocked = false;

const $ = id => document.getElementById(id);

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[char]));
}

function renderContent(content = "") {
  const parts = content.trim() ? content.trim().split(/\n\s*\n/) : ["Write your memories here."];
  return parts
    .map(part => `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function textFromEditor(element) {
  return Array.from(element.querySelectorAll("p"))
    .map(p => p.innerText.trim())
    .filter(Boolean)
    .join("\n\n") || element.innerText.trim();
}

function normaliseAuthor(author, slug = "") {
  const value = `${author || ""} ${slug}`.toLowerCase();
  return value.includes("soham") ? "Somda" : AARATI_DISPLAY_NAME;
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
  // A group is deletable if it contains at least one dynamically created page.
  // The original RT and Somda pages remain protected.
  return group.rows.some(row => !ORIGINAL_SLUGS.has(row.slug));
}

function createStoryPage(row, number) {
  const author = normaliseAuthor(row.author, row.slug);
  const slug = row.slug;
  const page = document.createElement("section");

  page.className = "reader-page story-page";
  page.dataset.slug = slug;

  page.innerHTML = `
    <div class="page-inner">
      <div class="page-top">
        <span>${String(number).padStart(2, "0")} · ${author === AARATI_DISPLAY_NAME ? "HER SIDE" : "HIS SIDE"}</span>
        <span>${escapeHtml(row.title || "OUR STORY")}</span>
      </div>

      <div class="story-page-content">
        <p class="page-eyebrow">${escapeHtml(row.title || "Our story")}</p>
        <h2>${escapeHtml(author)}'s<br><em>Perspective</em></h2>
        <div class="page-rule"></div>

        <div
          class="editable-content contenteditable-area"
          id="editor-${escapeHtml(slug)}"
          contenteditable="${editingUnlocked}"
          spellcheck="true"
        >${renderContent(row.content || "")}</div>

        <button class="story-save-button" data-slug="${escapeHtml(slug)}" ${editingUnlocked ? "" : "hidden"}>Save this page</button>

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

  storyRows.forEach((row, index) => {
    const page = createStoryPage(row, index + 3);
    container.appendChild(page);
    readerPages.push(page);
  });

  bindPageButtons();
  buildIndex();
  showPage(Math.min(currentPage, readerPages.length - 1));
}

function buildIndex() {
  const groups = groupStories(storyRows);

  const makeEntry = (group, index, overlay = false) => {
    const first = group.rows[0];
    const target = `story-${first.slug}`;
    const number = String(index + 1).padStart(2, "0");
    const pageNumber = String(storyRows.indexOf(first) + 3).padStart(2, "0");
    const deletable = editingUnlocked && isDeletableGroup(group);
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
        ${deletable ? `<button class="entry-delete-button" data-title="${escapeHtml(group.title)}" title="Delete this entire story entry">Delete</button>` : ""}
      </div>`;
  };

  const mainHtml = groups.length
    ? groups.map((group, index) => makeEntry(group, index, false)).join("")
    : `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;

  const overlayHtml = groups.length
    ? groups.map((group, index) => makeEntry(group, index, true)).join("")
    : `<div class="index-coming-soon"><span>♡</span> Your first chapter is waiting to be written.</div>`;

  $("indexList").innerHTML = mainHtml;
  $("overlayIndexList").innerHTML = overlayHtml;

  document.querySelectorAll(".index-entry, .overlay-entry").forEach(button => {
    button.addEventListener("click", () => {
      goToSlug(button.dataset.target.replace(/^story-/, ""));
    });
  });

  document.querySelectorAll(".entry-delete-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      deleteStoryEntry(button.dataset.title);
    });
  });
}

function bindPageButtons() {
  document.querySelectorAll(".story-save-button").forEach(button => {
    button.addEventListener("click", () => saveStory(button));
  });
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
  buildPages();
}

async function saveStory(button) {
  if (!editingUnlocked) {
    alert("Unlock editing first ♡");
    return;
  }

  const row = storyRows.find(item => item.slug === button.dataset.slug);
  const editor = document.getElementById(`editor-${button.dataset.slug}`);

  if (!row || !editor) return;

  const content = textFromEditor(editor);
  button.disabled = true;
  button.textContent = "Saving...";

  const { error } = await supabaseClient
    .from("story_pages")
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq("slug", row.slug);

  if (error) {
    console.error(error);
    button.textContent = "Save failed";
    button.disabled = false;
    alert("Could not save this page. Check the Supabase UPDATE policy.");
    return;
  }

  // Update only this row locally. RT and Somda remain independent.
  row.content = content;
  button.textContent = "Saved ✓";

  setTimeout(() => {
    button.textContent = "Save this page";
    button.disabled = false;
  }, 1800);
}

async function addNewPage() {
  if (!editingUnlocked) return;

  const title = prompt("Enter the heading for this new chapter:");
  if (!title || !title.trim()) return;

  const cleanTitle = title.trim();
  const base = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `chapter-${Date.now()}`;

  if (storyRows.some(row => (row.title || "").trim().toLowerCase() === cleanTitle.toLowerCase())) {
    alert("A chapter with this heading already exists.");
    return;
  }

  const maxOrder = storyRows.reduce(
    (max, row) => Math.max(max, Number(row.display_order) || 0),
    0
  );

  // Both rows share the same title, so they appear as one entry in the index.
  // Their slugs and content remain separate, allowing independent saving.
  const rows = [
    {
      slug: `${base}-rt`,
      title: cleanTitle,
      author: "RT",
      content: "",
      page_type: "perspective",
      display_order: maxOrder + 1,
      published: true
    },
    {
      slug: `${base}-soham`,
      title: cleanTitle,
      author: "Somda",
      content: "",
      page_type: "perspective",
      display_order: maxOrder + 2,
      published: true
    }
  ];

  const { data, error } = await supabaseClient
    .from("story_pages")
    .insert(rows)
    .select();

  if (error) {
    console.error(error);
    alert("Could not create the new pages. Check that INSERT permission is enabled in Supabase.");
    return;
  }

  storyRows.push(...(data || rows));
  buildPages();
  alert(`“${cleanTitle}” has been added with Aaru's and Somda's pages ♡`);
}

async function deleteStoryEntry(title) {
  if (!editingUnlocked) return;

  const matchingRows = storyRows.filter(
    row => (row.title || "").trim().toLowerCase() === String(title).trim().toLowerCase()
  );

  const deletableRows = matchingRows.filter(row => !ORIGINAL_SLUGS.has(row.slug));
  if (!deletableRows.length) {
    alert("The original story pages cannot be deleted ♡");
    return;
  }

  const confirmed = confirm(
    `Delete “${title}” completely?\n\nThis will delete both Aaru's and Somda's perspectives. This cannot be undone.`
  );

  if (!confirmed) return;

  // Delete every row belonging to this story title in one operation.
  // This removes both perspectives together for dynamically created entries.
  const slugsToDelete = deletableRows.map(row => row.slug);

  const { data: deletedRows, error } = await supabaseClient
    .from("story_pages")
    .delete()
    .in("slug", slugsToDelete)
    .select("slug");

  if (error) {
    console.error(error);
    alert("Could not delete this story entry. The Supabase DELETE policy may need to be enabled.");
    return;
  }

  const deletedSlugs = (deletedRows || []).map(row => row.slug);
  const allDeleted = slugsToDelete.every(slug => deletedSlugs.includes(slug));

  if (!allDeleted) {
    console.error("Delete did not remove all expected rows.", { slugsToDelete, deletedRows });
    alert("The delete request did not remove both database rows. Please check the Supabase DELETE policy.");
    return;
  }

  storyRows = storyRows.filter(row => !slugsToDelete.includes(row.slug));
  currentPage = 0;
  buildPages();
  closeOverlay();
  alert(`“${title}” and both perspectives were deleted.`);
}

function unlockEditing() {
  if (editingUnlocked) {
    lockEditing();
    return;
  }

  const pin = prompt("Enter the private PIN:");
  if (pin !== STORY_EDIT_PIN) {
    alert("Incorrect PIN ♡");
    return;
  }

  editingUnlocked = true;
  $("addPageBtn").hidden = false;
  $("editStoryBtn").textContent = "Lock editing 🔒";

  document.querySelectorAll(".contenteditable-area").forEach(el => {
    el.contentEditable = "true";
  });

  document.querySelectorAll(".story-save-button").forEach(button => {
    button.hidden = false;
  });

  // Rebuild the index so Delete buttons appear only after unlocking.
  buildIndex();
}

function lockEditing() {
  editingUnlocked = false;
  $("addPageBtn").hidden = true;
  $("editStoryBtn").textContent = "Edit Story";

  document.querySelectorAll(".contenteditable-area").forEach(el => {
    el.contentEditable = "false";
  });

  document.querySelectorAll(".story-save-button").forEach(button => {
    button.hidden = true;
  });

  // Rebuild the index so Delete buttons disappear when locked.
  buildIndex();
}

function showPage(index) {
  if (!readerPages.length) return;

  currentPage = Math.max(0, Math.min(index, readerPages.length - 1));
  readerPages.forEach((page, i) => {
    page.classList.toggle("active-page", i === currentPage);
  });

  $("pageCounter").textContent = `Page ${currentPage + 2} of ${readerPages.length + 1}`;
  // Previous from the index returns to the cover page.
  $("prevBtn").disabled = false;
  $("nextBtn").disabled = currentPage === readerPages.length - 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function returnToCover() {
  $("reader").style.display = "none";
  $("coverPage").style.display = "flex";
  $("coverPage").classList.remove("cover-opening");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToSlug(slug) {
  const page = readerPages.find(page => page.dataset.slug === slug);
  if (page) showPage(readerPages.indexOf(page));
  closeOverlay();
}

function openOverlay() {
  $("indexOverlay").classList.add("open");
}

function closeOverlay() {
  $("indexOverlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
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
      returnToCover();
    } else {
      showPage(currentPage - 1);
    }
  });
  $("nextBtn").addEventListener("click", () => showPage(currentPage + 1));
  $("bottomIndexBtn").addEventListener("click", () => showPage(0));
  $("indexToggle").addEventListener("click", openOverlay);
  $("closeIndexBtn").addEventListener("click", closeOverlay);
  $("editStoryBtn").addEventListener("click", unlockEditing);
  $("addPageBtn").addEventListener("click", addNewPage);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeOverlay();
  });

  loadStories();
});
