"use client";

import { useMemo, useState } from "react";
import EntryCard from "./EntryCard";
import DetailModal from "./DetailModal";
import { CATS, PROMOS, STATES } from "../lib/entryHelpers";

export default function BrowseClient({ entries, initialTracking, user, lockedPromotion, heading }) {
  const [tracking, setTracking] = useState(initialTracking);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [promoFilter, setPromoFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [activeId, setActiveId] = useState(null);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (catFilter !== "All" && e.category !== catFilter) return false;
      if (!lockedPromotion && promoFilter !== "All" && e.promotion !== promoFilter) return false;
      if (stateFilter !== "All" && e.state !== stateFilter) return false;
      if (query.trim() && !e.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      const da = a.air_date ? new Date(a.air_date).getTime() : 0;
      const db = b.air_date ? new Date(b.air_date).getTime() : 0;
      return db - da;
    });
  }, [entries, catFilter, promoFilter, stateFilter, query]);

  const active = activeId ? entries.find((e) => e.id === activeId) : null;

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
      {heading && (
        <h1 className="font-marquee text-2xl text-gold mb-5">{heading}</h1>
      )}

      <div className="flex gap-2.5 flex-wrap mb-5 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles…"
          className="bg-surface border border-line rounded-md px-3 py-2.5 text-sm flex-1 min-w-[200px]"
        />
        {!lockedPromotion && <Select value={promoFilter} onChange={setPromoFilter} options={PROMOS} />}
        <Select value={catFilter} onChange={setCatFilter} options={CATS} />
        <Select value={stateFilter} onChange={setStateFilter} options={STATES} />
      </div>

      <div className="font-mono text-[11px] text-muted mb-3.5">
        {filtered.length} {filtered.length === 1 ? "ENTRY" : "ENTRIES"}
      </div>

      <div className="grid gap-x-4 gap-y-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
        {filtered.map((e) => (
          <EntryCard key={e.id} entry={e} track={tracking[e.id]} onOpen={() => setActiveId(e.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-14 text-muted">Nothing matches those filters. Try clearing one.</div>
      )}

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

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface border border-line rounded-md px-2.5 py-2.5 text-[13px]"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
