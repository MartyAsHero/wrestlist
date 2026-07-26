"use client";

import { useState } from "react";
import DetailModal from "./DetailModal";
import { fmtDate, stateColorClass, promoBorderClass } from "../lib/entryHelpers";

export default function ScheduleClient({ items, initialTracking, user }) {
  const [tracking, setTracking] = useState(initialTracking);
  const [activeId, setActiveId] = useState(null);
  const active = activeId ? items.find((e) => e.id === activeId) : null;

  function handleChanged(next) {
    setTracking((prev) => {
      const copy = { ...prev };
      if (next) copy[activeId] = next;
      else delete copy[activeId];
      return copy;
    });
  }

  return (
    <div>
      <h2 className="font-marquee text-2xl text-gold mb-1">UPCOMING CARD</h2>
      <p className="text-muted text-sm mb-6">Everything left on the 2026 schedule, soonest first.</p>
      <div className="flex flex-col gap-2.5">
        {items.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveId(e.id)}
            onKeyDown={(ev) => { if (ev.key === "Enter") setActiveId(e.id); }}
            className="flex items-center gap-4 bg-surface border border-line rounded-lg px-4 py-3 cursor-pointer"
          >
            <div className="w-[90px] shrink-0 font-mono text-xs text-gold">{fmtDate(e.air_date)}</div>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${promoBorderClass(e.promotion)}`} />
            <div className="flex-1">
              <div className="font-semibold text-sm">{e.title}</div>
              <div className="text-xs text-muted">{e.venue || e.network}</div>
            </div>
            <span className={`font-mono text-[10px] ${stateColorClass(e.state)}`}>{e.state.toUpperCase()}</span>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted">Nothing left on the schedule yet.</div>}
      </div>

      {active && (
        <DetailModal
          entry={active}
          track={tracking[active.id]}
          user={user}
          onClose={() => setActiveId(null)}
          onChanged={handleChanged}
        />
      )}
    </div>
  );
}
