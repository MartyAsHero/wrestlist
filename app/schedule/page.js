import { createClient } from "../../lib/supabase/server";
import { withState } from "../../lib/entryHelpers";
import ScheduleClient from "../../components/ScheduleClient";

export default async function SchedulePage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: entriesRaw } = await supabase
    .from("entries")
    .select("*")
    .not("air_date", "is", null)
    .order("air_date", { ascending: true });

  const entries = withState(entriesRaw || []);
  const upcoming = entries.filter((e) => e.state === "Upcoming" || e.state === "Airing Today");

  let tracking = {};
  if (user) {
    const { data: rows } = await supabase.from("user_entries").select("*").eq("user_id", user.id);
    (rows || []).forEach((r) => { tracking[r.entry_id] = r; });
  }

  return <ScheduleClient items={upcoming} initialTracking={tracking} user={user} />;
}
