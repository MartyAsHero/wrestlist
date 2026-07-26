"use client";

import { fmtDate, stateColorClass, promoBorderClass } from "../lib/entryHelpers";
import PosterArt from "./PosterArt";

const STATUS_RIBBON = {
  "Watching": "bg-good",
  "Completed": "bg-gold",
  "Plan to Watch": "bg-aew",
  "On Hold": "bg-muted",
  "Dropped": "bg-wwe",
};

export default function EntryCard({ entry, track, onOpen }) {
  const stateText = stateColorClass(entry.state);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      className="group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-lg"
    >
      <div className="relative rounded-lg overflow-hidden border border-line transition-transform duration-150 group-hover:-translate-y-1 group-hover:border-gold/60">
        <div className={`absolute top-0 left-0 right-0 h-[3px] z-10 ${promoBorderClass(entry.promotion)}`} />
        {entry.cover_image_url ? (
          <img
            src={entry.cover_image_url}
            alt=""
            className="w-full aspect-[2/3] object-cover bg-surface2"
          />
        ) : (
          <PosterArt entry={entry} className="w-full aspect-[2/3] bg-surface2" />
        )}

        {track && (
          <span
            className={`absolute top-2 right-2 text-[9px] font-mono font-semibold text-bg px-1.5 py-0.5 rounded ${STATUS_RIBBON[track.status] || "bg-muted"}`}
          >
            {track.status.toUpperCase()}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg/95 to-transparent px-2 pt-5 pb-1.5">
          <span className={`font-mono text-[9px] ${stateText}`}>{entry.state.toUpperCase()}</span>
        </div>
      </div>

      <div className="pt-2 px-0.5">
        <div className="font-semibold text-[13px] leading-snug line-clamp-2">{entry.title}</div>
        <div className="text-[11px] text-muted font-mono mt-0.5">
          {entry.category === "Weekly Show" ? entry.note : fmtDate(entry.air_date)}
        </div>
      </div>
    </div>
  );
}
