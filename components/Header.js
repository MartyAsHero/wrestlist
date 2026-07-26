"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const tabs = [
    { href: "/", label: "Browse" },
    { href: "/wwe", label: "WWE" },
    { href: "/aew", label: "AEW" },
    { href: "/schedule", label: "Schedule" },
    { href: "/mylist", label: "My List" },
  ];

  return (
    <header className="border-b border-line sticky top-0 z-20 bg-bg/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-7 flex-wrap">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-marquee text-2xl text-gold leading-none">WRESTLIST</span>
          <span className="font-mono text-[11px] text-muted">2026 SEASON</span>
        </Link>
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold border ${
                pathname === t.href
                  ? "bg-surface2 text-ink border-line"
                  : "text-muted border-transparent hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          {checked && (user ? (
            <button
              onClick={signOut}
              className="font-mono text-xs border border-line rounded-md px-3 py-2 text-muted hover:text-ink"
            >
              SIGN OUT
            </button>
          ) : (
            <Link
              href="/login"
              className="font-mono text-xs border border-line rounded-md px-3 py-2 text-gold"
            >
              SIGN IN
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
