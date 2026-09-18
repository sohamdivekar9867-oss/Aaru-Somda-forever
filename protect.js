const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

const protectedSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

(async function protectPage() {
  const {
    data: { session },
    error
  } = await protectedSupabase.auth.getSession();

  if (error || !session) {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    window.location.replace(
      `login.html?redirect=${encodeURIComponent(currentPage)}`
    );
  }
})();
