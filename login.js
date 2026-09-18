document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");
  const submitButton = form.querySelector("button[type='submit']");
  const togglePassword = document.getElementById("togglePassword");

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    const redirect =
      new URLSearchParams(window.location.search).get("redirect") ||
      "index.html";

    window.location.href = redirect;
    return;
  }

  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "○" : "◉";
    togglePassword.setAttribute(
      "aria-label",
      isPassword ? "Hide password" : "Show password"
    );
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Entering...";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent =
        "That email or password doesn't seem right. Please try again.";
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enter Our World <span>♡</span>';
      return;
    }

    const redirect =
      new URLSearchParams(window.location.search).get("redirect") ||
      "index.html";

    window.location.href = redirect;
  });
});
