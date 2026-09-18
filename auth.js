const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

// Use sessionStorage instead of localStorage so the login is temporary.
// The session normally disappears when the browser tab/session is closed.
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: window.sessionStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) return null;
  return user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.replace("login.html");
}

// Add a small logout control to every protected page.
document.addEventListener("DOMContentLoaded", () => {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  if (currentFile === "login.html") return;
  if (document.getElementById("siteLogoutButton")) return;

  const button = document.createElement("button");
  button.id = "siteLogoutButton";
  button.type = "button";
  button.textContent = "Log out";
  button.setAttribute("aria-label", "Log out of our little world");
  button.style.cssText = `
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 9999;
    border: 1px solid rgba(255, 210, 220, .45);
    border-radius: 999px;
    padding: 9px 15px;
    background: rgba(35, 12, 27, .82);
    color: #f8dce5;
    font: 12px/1.2 'DM Mono', monospace;
    letter-spacing: .04em;
    cursor: pointer;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 18px rgba(0,0,0,.16);
  `;
  button.addEventListener("mouseenter", () => {
    button.style.background = "rgba(110, 42, 70, .92)";
  });
  button.addEventListener("mouseleave", () => {
    button.style.background = "rgba(35, 12, 27, .82)";
  });
  button.addEventListener("click", logout);
  document.body.appendChild(button);
});
