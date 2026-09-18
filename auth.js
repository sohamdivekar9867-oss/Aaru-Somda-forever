const SUPABASE_URL = "https://swqaakxywwajesuajflz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LfHzOfkinZEd_D8AZpNqCw_075eKf-G";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) return null;
  return user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}
