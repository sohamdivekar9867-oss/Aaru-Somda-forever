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
