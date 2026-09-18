// ==========================================
// SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";

// Publishable key — safe to use in browser code
const SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==========================================
// STORY EDITOR SETTINGS
// ==========================================

// Change this PIN whenever you want.
const STORY_EDIT_PIN = "RT2026";


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
  // HELPER:
  // RENDER TEXT INTO STORY AREA
  // =========================

  function renderStoryContent(elementId, content) {

    const element = document.getElementById(elementId);

    if (!element || !content) return;

    // Clear existing content
    element.innerHTML = "";

    // Split into paragraphs using blank lines
    const paragraphs = content
      .trim()
      .split(/\n\s*\n/);

    paragraphs.forEach(text => {

      const paragraph = document.createElement("p");

      paragraph.textContent = text.trim();

      element.appendChild(paragraph);

    });

  }


  // =========================
  // LOAD STORIES FROM SUPABASE
  // =========================

  async function loadStoryContent() {

    try {

      const { data, error } = await supabaseClient
        .from("story_pages")
        .select(`
          slug,
          title,
          author,
          content,
          subtitle,
          page_type,
          display_order,
          published
        `)
        .eq("published", true)
        .order("display_order", { ascending: true });


      if (error) {
        console.error("Error loading story pages:", error);
        return;
      }


      if (!data || data.length === 0) {
        console.log("No published story pages found.");
        return;
      }


      console.log("Story pages loaded:", data);


      // Find individual stories

      const rtStory = data.find(
        page => page.slug === "rt-perspective"
      );

      const sohamStory = data.find(
        page => page.slug === "soham-perspective"
      );


      // Insert database content

      if (rtStory && rtStory.content) {

        renderStoryContent(
          "rtStoryContent",
          rtStory.content
        );

      }


      if (sohamStory && sohamStory.content) {

        renderStoryContent(
          "sohamStoryContent",
          sohamStory.content
        );

      }


    } catch (error) {

      console.error("Unexpected error loading stories:", error);

    }

  }


  // =========================
  // GET EDITABLE CONTENT
  // =========================

  function getStoryText(contentElement) {

    if (!contentElement) return "";

    // Read paragraphs
    const paragraphs = Array.from(
      contentElement.querySelectorAll("p")
    )
      .map(paragraph => paragraph.innerText.trim())
      .filter(text => text.length > 0);


    let content = paragraphs.join("\n\n");


    // Fallback for text entered without paragraph tags
    if (!content) {
      content = contentElement.innerText.trim();
    }


    return content;

  }


  // =========================
  // SAVE STORY TO SUPABASE
  // =========================

  async function saveStory(button) {

    const slug = button.dataset.storySlug;
    const contentId = button.dataset.contentId;

    const contentElement = document.getElementById(contentId);


    if (!slug || !contentElement) {

      console.error("Missing story slug or content element.");

      return;

    }


    // Ask for PIN

    const enteredPin = window.prompt(
      "Enter the private PIN to save this story:"
    );


    if (enteredPin === null) {
      return;
    }


    if (enteredPin !== STORY_EDIT_PIN) {

      window.alert("Incorrect PIN ♡");

      return;

    }


    // Get typed content

    const content = getStoryText(contentElement);


    if (!content) {

      window.alert("Please write something before saving ♡");

      return;

    }


    // Save button loading state

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Saving...";


    try {

      const { error } = await supabaseClient
        .from("story_pages")
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq("slug", slug);


      if (error) {
        throw error;
      }


      console.log(`Story saved successfully: ${slug}`);


      button.textContent = "Saved ✓";


      setTimeout(() => {

        button.textContent = originalText;
        button.disabled = false;

      }, 2000);


    } catch (error) {

      console.error("Error saving story:", error);

      button.textContent = "Save failed";

      window.alert(
        "Couldn't save the story. Please try again."
      );


      setTimeout(() => {

        button.textContent = originalText;
        button.disabled = false;

      }, 2000);

    }

  }


  // =========================
  // ATTACH SAVE BUTTONS
  // =========================

  const saveButtons = document.querySelectorAll(
    ".story-save-button"
  );


  saveButtons.forEach(button => {

    button.addEventListener("click", () => {

      saveStory(button);

    });

  });


  // Load stories immediately

  loadStoryContent();



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

    currentPage = Math.max(
      0,
      Math.min(index, pages.length - 1)
    );


    pages.forEach((page, i) => {

      page.classList.toggle(
        "active-page",
        i === currentPage
      );

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

      nextBtn.disabled =
        currentPage === pages.length - 1;

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
