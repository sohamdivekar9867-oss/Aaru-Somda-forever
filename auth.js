const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error) {
    console.error("Unable to get current user:", error);
    return null;
  }

  return user;
}

async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    window.location.href =
      `login.html?redirect=${encodeURIComponent(currentPage)}`;

    return null;
  }

  return user;
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Unable to log out. Please try again.");
    console.error(error);
    return;
  }

  window.location.href = "login.html";
}
