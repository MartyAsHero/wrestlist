"use client";

// Original, generated cover art — no real photos, logos, or wrestler likenesses.
// Deterministic per entry so the same show always gets the same look.

function getInitials(title) {
  const skip = new Set(["the", "wwe", "aew", "night", "2026", "of", "in", "roh"]);
  const words = title
    .replace(/[:'.]/g, "")
    .split(" ")
    .filter((w) => w && !skip.has(w.toLowerCase()) && !/^\d+$/.test(w));
  const chars = words.slice(0, 2).map((w) => w[0].toUpperCase());
  return chars.join("") || title[0].toUpperCase();
}

function hashHue(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export default function PosterArt({ entry, className }) {
  const promoHex = entry.promotion === "WWE" ? "#C8203A" : "#4C7FC9";
  const hue = hashHue(entry.id);
  const initials = getInitials(entry.title);
  const catTag = entry.category
    .replace("Premium Live Event", "PLE")
    .replace("Weekly Show", "SHOW")
    .replace("Documentary", "DOC")
    .replace("Movie", "FILM")
    .replace("Special", "EVENT");

  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      role="img"
      aria-label={`${entry.title} cover art`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bg-${entry.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue}, 35%, 16%)`} />
          <stop offset="100%" stopColor="#100D0B" />
        </linearGradient>
        <linearGradient id={`accent-${entry.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={promoHex} stopOpacity="0.55" />
          <stop offset="100%" stopColor={promoHex} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="200" height="300" fill={`url(#bg-${entry.id})`} />
      <rect width="200" height="140" fill={`url(#accent-${entry.id})`} />

      {/* ring-rope motif */}
      <line x1="0" y1="235" x2="200" y2="235" stroke={promoHex} strokeOpacity="0.35" strokeWidth="2" />
      <line x1="0" y1="248" x2="200" y2="248" stroke={promoHex} strokeOpacity="0.25" strokeWidth="2" />
      <line x1="0" y1="261" x2="200" y2="261" stroke={promoHex} strokeOpacity="0.18" strokeWidth="2" />

      {/* monogram */}
      <text
        x="100" y="150" textAnchor="middle" dominantBaseline="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize={initials.length > 1 ? "64" : "84"}
        fill="#F3ECE2" fillOpacity="0.92"
      >
        {initials}
      </text>

      {/* category tag */}
      <rect x="10" y="10" width={catTag.length * 7.5 + 16} height="20" rx="3" fill="#100D0B" fillOpacity="0.55" />
      <text x="18" y="24" fontFamily="'IBM Plex Mono', monospace" fontSize="11" fill={promoHex} fontWeight="600">
        {catTag}
      </text>
    </svg>
  );
}
