const hotspots = document.querySelectorAll(".hotspot");

const modal = document.getElementById("memoryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".modal-backdrop");


// =========================
// OBJECT INTERACTIONS
// =========================

hotspots.forEach((hotspot) => {

  hotspot.addEventListener("click", () => {

    // If the object has a link, open that page instead of the popup
    const link = hotspot.dataset.link;

    if (link) {
      window.location.href = link;
      return;
    }

    // Otherwise, open the normal memory popup
    const title = hotspot.dataset.title;
    const content = hotspot.dataset.content;

    modalTitle.textContent = title;
    modalContent.textContent = content;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    // Remove active state from other objects
    hotspots.forEach((item) => item.classList.remove("active"));

    // Keep the selected label visible briefly
    hotspot.classList.add("active");
  });

});


// =========================
// CLOSE MODAL
// =========================

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  hotspots.forEach((item) => item.classList.remove("active"));
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);


// Close with Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});



// =========================
// BED — KISS INTERACTION
// =========================

const bedHotspot = document.querySelector(".bed-hotspot");
const kissModal = document.getElementById("kissModal");
const kissClose = document.querySelector(".kiss-close");
const kissBackdrop = document.querySelector(".kiss-backdrop");
const kissAction = document.getElementById("kissAction");
const kissMessage = document.getElementById("kissMessage");
const kissCount = document.getElementById("kissCount");

let kissStep = 0;

const kissLines = [
  {
    message: "I think you owe me a kiss. 💋",
    button: "💋 Kiss Somda",
    count: ""
  },
  {
    message: "Mwah. ❤️ That was supposed to be just one kiss.",
    button: "💋 One more",
    count: ""
  },
  {
    message: "Okay… now you're making it difficult for me to behave. 😏",
    button: "💋 Come closer",
    count: ""
  },
  {
    message: "Aaru… you're really not helping me behave. 🙈❤️",
    button: "💋 One last kiss",
    count: ""
  },
  {
    message: "Fine. Come here. I'm keeping you. 🫶",
    button: "❤️ Stay here",
    count: ""
  },
  {
    message: "No more teasing. Just come here and let me hold you. ❤️",
    button: "💋 Mwah",
    count: "Private corner — Aaru + Somda only 🤫"
  }
];

function openKissModal() {
  kissStep = 0;
  kissMessage.textContent = kissLines[0].message;
  kissAction.textContent = kissLines[0].button;
  kissCount.textContent = "";
  kissModal.classList.add("open");
  kissModal.setAttribute("aria-hidden", "false");
}

function closeKissModal() {
  kissModal.classList.remove("open");
  kissModal.setAttribute("aria-hidden", "true");
}

if (bedHotspot) {
  bedHotspot.addEventListener("click", () => {
    hotspots.forEach((item) => item.classList.remove("active"));
    openKissModal();
  });
}

if (kissAction) {
  kissAction.addEventListener("click", () => {
    kissStep = Math.min(kissStep + 1, kissLines.length - 1);

    const line = kissLines[kissStep];
    kissMessage.textContent = line.message;
    kissAction.textContent = line.button;
    kissCount.textContent = line.count;

    kissAction.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.07)" },
        { transform: "scale(1)" }
      ],
      { duration: 280, easing: "ease-out" }
    );
  });
}

if (kissClose) kissClose.addEventListener("click", closeKissModal);
if (kissBackdrop) kissBackdrop.addEventListener("click", closeKissModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeKissModal();
});
