"use client";

import { useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { LIST_STATUSES, promoBorderClass } from "../lib/entryHelpers";
import DetailModal from "./DetailModal";
import PosterArt from "./PosterArt";

export default function MyListClient({ initialItems, user }) {
  const supabase = createClient();
  const [items, setItems] = useState(initialItems); // [{entry, track}]
  const [activeId, setActiveId] = useState(null);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((x) => x.track.status === "Completed").length;
    const rated = items.filter((x) => x.track.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((a, x) => a + x.track.rating, 0) / rated.length).toFixed(1)
      : "—";
    const wwe = items.filter((x) => x.entry.promotion === "WWE").length;
    const aew = items.filter((x) => x.entry.promotion === "AEW").length;
    return { total, completed, avgRating, wwe, aew };
  }, [items]);

  async function updateStatus(entryId, status) {
    const { error } = await supabase
      .from("user_entries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("entry_id", entryId);
    if (!error) {
      setItems((prev) => prev.map((x) => x.entry.id === entryId ? { ...x, track: { ...x.track, status } } : x));
    }
  }

  async function remove(entryId) {
    await supabase.from("user_entries").delete().eq("user_id", user.id).eq("entry_id", entryId);
    setItems((prev) => prev.filter((x) => x.entry.id !== entryId));
  }

  function handleChanged(next) {
    setItems((prev) => {
      if (!next) return prev.filter((x) => x.entry.id !== activeId);
      return prev.map((x) => x.entry.id === activeId ? { ...x, track: next } : x);
    });
  }

  const groups = LIST_STATUSES.map((s) => ({ status: s, items: items.filter((x) => x.track.status === s) }));
  const active = activeId ? items.find((x) => x.entry.id === activeId)?.entry : null;
  const activeTrack = activeId ? items.find((x) => x.entry.id === activeId)?.track : null;

  return (
    <div>
      <div className="grid gap-2.5 mb-7" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
        <StatBox label="TRACKED" value={stats.total} />
        <StatBox label="COMPLETED" value={stats.completed} />
        <StatBox label="AVG RATING" value={stats.avgRating} />
        <StatBox label="WWE" value={stats.wwe} accent="text-wwe" />
        <StatBox label="AEW" value={stats.aew} accent="text-aew" />
      </div>

      {items.length === 0 && (
        <div className="text-muted py-8">Your list is empty. Head to Browse and add something you're watching.</div>
      )}

      {groups.filter((g) => g.items.length > 0).map((g) => (
        <div key={g.status} className="mb-6">
          <div className="font-mono text-xs text-muted mb-2.5">{g.status.toUpperCase()} · {g.items.length}</div>
          <div className="flex flex-col gap-2">
            {g.items.map(({ entry, track }) => (
              <div key={entry.id} className="flex items-center gap-3.5 bg-surface border border-line rounded-lg px-3.5 py-2.5">
                {entry.cover_image_url ? (
                  <img src={entry.cover_image_url} alt="" className="w-8 aspect-[2/3] object-cover rounded shrink-0" />
                ) : (
                  <PosterArt entry={entry} className="w-8 aspect-[2/3] rounded shrink-0" />
                )}
                <div className="flex-1 cursor-pointer" onClick={() => setActiveId(entry.id)}>
                  <div className="font-semibold text-sm">{entry.title}</div>
                  <div className="text-xs text-muted">{entry.category}</div>
                </div>
                <select
                  value={track.status}
                  onChange={(e) => updateStatus(entry.id, e.target.value)}
                  className="bg-surface2 border border-line rounded-md text-xs px-2 py-1.5"
                >
                  {LIST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="font-mono text-xs text-gold w-9 text-right">
                  {track.rating > 0 ? track.rating : "—"}
                </div>
                <button
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.title}`}
                  className="border border-line rounded-md text-muted text-xs px-2.5 py-1.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {active && (
        <DetailModal
          entry={active}
          track={activeTrack}
          user={user}
          onClose={() => setActiveId(null)}
          onChanged={handleChanged}
        />
      )}
    </div>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="bg-surface border border-line rounded-lg px-3.5 py-3">
      <div className="font-mono text-[10px] text-muted mb-1">{label}</div>
      <div className={`font-marquee text-xl ${accent || "text-ink"}`}>{value}</div>
    </div>
  );
}
