import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { withState } from "../../lib/entryHelpers";
import MyListClient from "../../components/MyListClient";

export default async function MyListPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rows } = await supabase.from("user_entries").select("*").eq("user_id", user.id);
  const entryIds = (rows || []).map((r) => r.entry_id);

  let entriesById = {};
  if (entryIds.length) {
    const { data: entriesRaw } = await supabase.from("entries").select("*").in("id", entryIds);
    withState(entriesRaw || []).forEach((e) => { entriesById[e.id] = e; });
  }

  const items = (rows || [])
    .filter((r) => entriesById[r.entry_id])
    .map((r) => ({ entry: entriesById[r.entry_id], track: r }));

  return <MyListClient initialItems={items} user={user} />;
}
