const openBookBtn = document.getElementById("openBookBtn");
const bookCover = document.getElementById("bookCover");
const bookContent = document.getElementById("bookContent");
const continueBtn = document.getElementById("continueBtn");
const diarySection = document.getElementById("diarySection");
const addMemoryBtn = document.getElementById("addMemoryBtn");

openBookBtn.addEventListener("click", () => {
bookCover.classList.add("cover-opening");

setTimeout(() => {
bookCover.style.display = "none";
bookContent.classList.add("visible");

```
window.scrollTo({
  top: 0,
  behavior: "smooth"
});
```

}, 450);
});

continueBtn.addEventListener("click", () => {
diarySection.scrollIntoView({
behavior: "smooth",
block: "start"
});
});

addMemoryBtn.addEventListener("click", () => {
alert("The shared diary editor is coming next. ♡");
});
