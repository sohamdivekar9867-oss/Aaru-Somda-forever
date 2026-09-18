// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";

// Paste the PUBLISHABLE key you copied from Supabase here
const SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // ELEMENTS
  // =========================

  const startBookBtn = document.getElementById("startBookBtn");
  const coverPage = document.getElementById("coverPage");
  const reader = document.getElementById("reader");

  const indexToggle = document.getElementById("indexToggle");
  const indexOverlay = document.getElementById("indexOverlay");
  const closeIndexBtn = document.getElementById("closeIndexBtn");
  const bottomIndexBtn = document.getElementById("bottomIndexBtn");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageCounter = document.getElementById("pageCounter");

  const indexEntries = document.querySelectorAll(".index-entry");
  const overlayIndexList = document.getElementById("overlayIndexList");

  // All actual reader pages
  const pages = Array.from(
    document.querySelectorAll(".reader-page")
  );

  let currentPage = 0;


  // =========================
  // INITIAL STATE
  // =========================

  // Cover is visible first.
  // Reader remains hidden until the book is opened.
  if (reader) {
    reader.style.display = "none";
  }


  // =========================
  // OPEN THE BOOK
  // =========================

  if (startBookBtn) {
    startBookBtn.addEventListener("click", () => {

      if (coverPage) {
        coverPage.classList.add("cover-opening");
      }

      setTimeout(() => {

        if (coverPage) {
          coverPage.style.display = "none";
        }

        if (reader) {
          reader.style.display = "block";
          reader.classList.add("visible");
        }

        showPage(0);

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }, 450);

    });
  }


  // =========================
  // SHOW A READER PAGE
  // =========================

  function showPage(index) {

    if (!pages.length) return;

    // Keep index within valid range
    currentPage = Math.max(0, Math.min(index, pages.length - 1));

    pages.forEach((page, i) => {
      page.classList.toggle("active-page", i === currentPage);
    });

    // Update page counter
    if (pageCounter) {
      pageCounter.textContent =
        `Page ${currentPage + 2} of ${pages.length + 1}`;
    }

    // Update navigation buttons
    if (prevBtn) {
      prevBtn.disabled = currentPage === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage === pages.length - 1;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  // =========================
  // NEXT / PREVIOUS
  // =========================

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < pages.length - 1) {
        showPage(currentPage + 1);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 0) {
        showPage(currentPage - 1);
      }
    });
  }


  // =========================
  // INDEX NAVIGATION
  // =========================

  function goToPage(targetId) {

    const targetPage = document.getElementById(targetId);

    if (!targetPage) return;

    const index = pages.indexOf(targetPage);

    if (index !== -1) {
      showPage(index);
    }

    closeOverlay();
  }


  // Main index entries
  indexEntries.forEach(entry => {

    entry.addEventListener("click", () => {
      const targetId = entry.dataset.target;
      goToPage(targetId);
    });

  });


  // =========================
  // BUILD OVERLAY INDEX
  // =========================

  if (overlayIndexList) {

    indexEntries.forEach(entry => {

      const clone = entry.cloneNode(true);

      clone.addEventListener("click", () => {
        goToPage(entry.dataset.target);
      });

      overlayIndexList.appendChild(clone);

    });

  }


  // =========================
  // INDEX OVERLAY
  // =========================

  function openOverlay() {
    if (indexOverlay) {
      indexOverlay.classList.add("open");
    }
  }

  function closeOverlay() {
    if (indexOverlay) {
      indexOverlay.classList.remove("open");
    }
  }

  if (indexToggle) {
    indexToggle.addEventListener("click", openOverlay);
  }

  if (closeIndexBtn) {
    closeIndexBtn.addEventListener("click", closeOverlay);
  }

  if (bottomIndexBtn) {
    bottomIndexBtn.addEventListener("click", () => {
      showPage(0);
    });
  }


  // =========================
  // ESCAPE TO CLOSE OVERLAY
  // =========================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOverlay();
    }
  });

});
