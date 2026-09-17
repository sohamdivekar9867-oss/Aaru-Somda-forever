const experience = document.getElementById("experience");
const windowTrigger = document.getElementById("windowTrigger");
const nextScreen = document.getElementById("nextScreen");

windowTrigger.addEventListener("click", () => {
  experience.classList.add("opening");
  nextScreen.setAttribute("aria-hidden", "false");
});
