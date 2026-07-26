"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { fmtDate, stateColorClass, promoColorClass, LIST_STATUSES } from "../lib/entryHelpers";
import PosterArt from "./PosterArt";

export default function DetailModal({ entry, track, user, onClose, onChanged }) {
  const supabase = createClient();
  const router = useRouter();
  const promoText = promoColorClass(entry.promotion);
  const stateText = stateColorClass(entry.state);

  async function requireAuth() {
    if (!user) {
      router.push("/login");
      return false;
    }
    return true;
  }

  async function upsert(patch) {
    if (!(await requireAuth())) return;
    const next = {
      user_id: user.id,
      entry_id: entry.id,
      status: track?.status || "Plan to Watch",
      rating: track?.rating ?? 0,
      progress: track?.progress ?? 0,
      ...patch,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_entries").upsert(next, { onConflict: "user_id,entry_id" });
    if (!error) onChanged(next);
  }

  async function remove() {
    if (!(await requireAuth())) return;
    await supabase.from("user_entries").delete().eq("user_id", user.id).eq("entry_id", entry.id);
    onChanged(null);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-line rounded-xl max-w-md w-full max-h-[88vh] overflow-y-auto"
      >
        <div className="px-5 pt-5 pb-4 bg-surface2 ticket-dashed flex gap-4">
          {entry.cover_image_url ? (
            <img src={entry.cover_image_url} alt="" className="w-16 aspect-[2/3] object-cover rounded shrink-0" />
          ) : (
            <PosterArt entry={entry} className="w-16 aspect-[2/3] rounded shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <span className={`font-mono text-[11px] font-semibold ${promoText}`}>
                {entry.promotion} · {entry.category}
              </span>
              <button onClick={onClose} aria-label="Close" className="text-muted text-lg">✕</button>
            </div>
            <div className="font-marquee text-2xl mt-2 leading-tight">{entry.title}</div>
            <div className="text-[12px] text-muted font-mono mt-2">
              {entry.category === "Weekly Show" ? entry.note : fmtDate(entry.air_date)}
              {entry.venue ? ` · ${entry.venue}` : entry.network ? ` · ${entry.network}` : ""}
            </div>
            <span className={`font-mono text-[10px] ${stateText}`}>{entry.state.toUpperCase()}</span>
          </div>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed mb-5">{entry.synopsis}</p>

          <div className="mb-4">
            <label className="font-mono text-[11px] text-muted block mb-1.5">STATUS</label>
            <select
              value={track?.status || "none"}
              onChange={(e) => upsert({ status: e.target.value })}
              className="w-full bg-surface2 border border-line rounded-md px-2.5 py-2 text-sm"
            >
              <option value="none" disabled>Add to list…</option>
              {LIST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {track && (
            <>
              <div className="mb-4">
                <label className="font-mono text-[11px] text-muted flex justify-between mb-1.5">
                  <span>RATING</span><span className="text-gold">{track.rating > 0 ? track.rating : "—"} / 10</span>
                </label>
                <input
                  type="range" min="0" max="10" step="1" value={track.rating || 0}
                  onChange={(e) => upsert({ rating: Number(e.target.value) })}
                  className="w-full accent-gold"
                />
              </div>

              {entry.category === "Weekly Show" && (
                <div className="mb-4">
                  <label className="font-mono text-[11px] text-muted block mb-1.5">
                    EPISODES WATCHED {entry.episodes ? `(of ~${entry.episodes} so far)` : ""}
                  </label>
                  <input
                    type="number" min="0" max={entry.episodes || 999} value={track.progress || 0}
                    onChange={(e) => upsert({ progress: Number(e.target.value) })}
                    className="w-full bg-surface2 border border-line rounded-md px-2.5 py-2 text-sm"
                  />
                </div>
              )}

              <button
                onClick={remove}
                className="mt-1 border border-line text-muted rounded-md px-3.5 py-2 text-sm"
              >
                Remove from list
              </button>
            </>
          )}

          {!user && (
            <p className="text-xs text-muted mt-3">
              You'll need to sign in to add this to a list.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
