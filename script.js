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


function createKissParticles() {
  if (!bedHotspot) return;

  const layer = document.getElementById("kissParticleLayer");
  if (!layer) return;

  const rect = bedHotspot.getBoundingClientRect();

  // Start around the bed, then float visibly upward across the whole screen.
  const originX = rect.left + rect.width * 0.5;
  const originY = rect.top + rect.height * 0.55;

  const symbols = ["💋", "♡", "♥", "💗", "💋", "♡", "❤️"];

  for (let i = 0; i < 9; i++) {
    const particle = document.createElement("span");
    particle.className = "kiss-float-particle";
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const startX = originX + (Math.random() - 0.5) * Math.min(rect.width, 150);
    const startY = originY + (Math.random() - 0.5) * Math.min(rect.height, 60);

    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty("--kiss-drift", `${Math.round((Math.random() - 0.5) * 180)}px`);
    particle.style.setProperty("--kiss-rise", `${Math.round(220 + Math.random() * 260)}px`);
    particle.style.setProperty("--kiss-rotate", `${Math.round((Math.random() - 0.5) * 50)}deg`);
    particle.style.setProperty("--kiss-duration", `${(1.5 + Math.random() * 1.0).toFixed(2)}s`);
    particle.style.animationDelay = `${Math.round(Math.random() * 160)}ms`;

    layer.appendChild(particle);

    particle.addEventListener("animationend", () => {
      particle.remove();
    }, { once: true });
  }
}

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
    createKissParticles();
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


// =========================
// MIRROR — 30 RANDOM COMPLIMENTS
// =========================

const mirrorHotspot = document.querySelector(".mirror-hotspot");
const mirrorModal = document.getElementById("mirrorModal");
const mirrorClose = document.querySelector(".mirror-close");
const mirrorBackdrop = document.querySelector(".mirror-backdrop");
const mirrorNext = document.getElementById("mirrorNext");
const mirrorCompliment = document.getElementById("mirrorCompliment");

const mirrorCompliments = [
  "Yep. Still the most beautiful girl I know. ♡",
  "You have no idea how lucky Somda feels.",
  "Someone out there is completely, hopelessly in love with you.",
  "Your smile is still my favourite view.",
  "You make ordinary days feel like something worth remembering.",
  "If I could freeze one moment, it'd be the moment you smile.",
  "You look like someone's favourite person. Because you are.",
  "Somehow, you get prettier every time I see you.",
  "Awww. Look at you being adorable again.",
  "Mirror report: dangerously cute today.",
  "Yep. Certified sweetheart. ♡",
  "That face deserves approximately 47 kisses.",
  "You look very huggable today.",
  "The mirror would like to officially compliment you.",
  "Warning: excessive cuteness detected.",
  "Did you really need the mirror to tell you you're pretty?",
  "Okay, stop staring. You're making the mirror nervous.",
  "Someone clearly woke up determined to be gorgeous.",
  "Honestly? A little unfair to everyone else.",
  "Breaking news: Aaru is still ridiculously pretty.",
  "You came here for a compliment, didn't you? 😏",
  "Fine. You're pretty. Happy now?",
  "I would compliment you more, but your ego is already getting dangerous.",
  "Somda is going to have a very hard time behaving around you.",
  "That look? Yeah… absolutely not helping him behave.",
  "You know exactly what you're doing with that face, don't you?",
  "If Somda were here, that mirror probably wouldn't get much attention.",
  "Pretty face. Dangerous effect. 😏",
  "Honestly, Aaru… come closer. I think you deserve a kiss.",
  "You look way too good tonight. Come here and let me admire you properly. ❤️"
];

let mirrorDeck = [];
let mirrorSeen = 0;

function shuffleMirrorDeck() {
  mirrorDeck = [...mirrorCompliments];

  for (let i = mirrorDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mirrorDeck[i], mirrorDeck[j]] = [mirrorDeck[j], mirrorDeck[i]];
  }

  mirrorSeen = 0;
}

function nextMirrorCompliment() {
  if (!mirrorDeck.length || mirrorSeen >= mirrorDeck.length) {
    shuffleMirrorDeck();
  }

  const text = mirrorDeck[mirrorSeen];
  mirrorSeen += 1;

  mirrorCompliment.textContent = text;

  mirrorCompliment.animate(
    [
      { opacity: 0, transform: "translateY(5px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    { duration: 260, easing: "ease-out" }
  );

  mirrorNext.textContent =
    mirrorSeen === mirrorCompliments.length ? "More secrets ♡" : "Awww ♡";
}

function openMirrorModal() {
  if (!mirrorDeck.length || mirrorSeen >= mirrorDeck.length) {
    shuffleMirrorDeck();
  }

  mirrorModal.classList.add("open");
  mirrorModal.setAttribute("aria-hidden", "false");
  nextMirrorCompliment();
}

function closeMirrorModal() {
  mirrorModal.classList.remove("open");
  mirrorModal.setAttribute("aria-hidden", "true");
}

if (mirrorHotspot) {
  mirrorHotspot.addEventListener("click", () => {
    hotspots.forEach((item) => item.classList.remove("active"));
    openMirrorModal();
  });
}

if (mirrorNext) {
  mirrorNext.addEventListener("click", nextMirrorCompliment);
}

if (mirrorClose) mirrorClose.addEventListener("click", closeMirrorModal);
if (mirrorBackdrop) mirrorBackdrop.addEventListener("click", closeMirrorModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMirrorModal();
});
