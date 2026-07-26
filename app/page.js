import { createClient } from "../lib/supabase/server";
import { withState } from "../lib/entryHelpers";
import BrowseClient from "../components/BrowseClient";

export default async function BrowsePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: entriesRaw } = await supabase.from("entries").select("*");
  const entries = withState(entriesRaw || []);

  let tracking = {};
  if (user) {
    const { data: rows } = await supabase.from("user_entries").select("*").eq("user_id", user.id);
    (rows || []).forEach((r) => { tracking[r.entry_id] = r; });
  }

  return <BrowseClient entries={entries} initialTracking={tracking} user={user} heading="Browse" />;
}
