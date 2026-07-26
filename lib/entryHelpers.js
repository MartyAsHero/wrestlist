export const LIST_STATUSES = ["Plan to Watch", "Watching", "Completed", "On Hold", "Dropped"];
export const CATS = ["All", "Weekly Show", "Premium Live Event", "Special", "Documentary", "Movie"];
export const PROMOS = ["All", "WWE", "AEW"];
export const STATES = ["All", "Ongoing", "Upcoming", "Airing Today", "Completed"];

export function computeState(entry, today = new Date()) {
  if (entry.state_override) return entry.state_override;
  if (!entry.air_date) return "Completed";
  const d = new Date(entry.air_date);
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays === 0) return "Airing Today";
  if (diffDays > 0) return "Upcoming";
  return "Completed";
}

export function withState(entries, today = new Date()) {
  return entries.map((e) => ({ ...e, state: computeState(e, today) }));
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function stateColorClass(state) {
  switch (state) {
    case "Ongoing": return "text-good";
    case "Upcoming": return "text-gold";
    case "Airing Today": return "text-wwe";
    case "Completed": return "text-muted";
    default: return "text-muted";
  }
}

export function promoColorClass(promo) {
  return promo === "WWE" ? "text-wwe" : "text-aew";
}

export function promoBorderClass(promo) {
  return promo === "WWE" ? "bg-wwe" : "bg-aew";
}
