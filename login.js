document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const message = document.getElementById("loginMessage");
  const submitButton = form.querySelector("button[type='submit']");
  const togglePassword = document.getElementById("togglePassword");

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = new URLSearchParams(location.search).get("redirect") || "index.html";
    return;
  }

  togglePassword.addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    togglePassword.textContent = show ? "○" : "◉";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Entering...";
    const { error } = await supabaseClient.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
    if (error) {
      message.textContent = "That email or password doesn't seem right. Please try again.";
      submitButton.disabled = false;
      submitButton.innerHTML = 'Enter Our World <span>♡</span>';
      return;
    }
    window.location.href = new URLSearchParams(location.search).get("redirect") || "index.html";
  });
});
