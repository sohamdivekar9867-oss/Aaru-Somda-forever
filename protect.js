/* Shared login guard for every private page.
   Wrapped in an IIFE so its variables cannot conflict with page scripts. */
(function () {
  const AUTH_SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
  const AUTH_SUPABASE_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";

  if (!window.supabase) {
    console.error("Supabase library did not load.");
    return;
  }

  const authClient = window.supabase.createClient(
    AUTH_SUPABASE_URL,
    AUTH_SUPABASE_KEY
  );

  authClient.auth.getSession().then(({ data, error }) => {
    if (error || !data.session) {
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

      window.location.replace(
        `login.html?redirect=${encodeURIComponent(currentPage)}`
      );
    }
  });
})();
