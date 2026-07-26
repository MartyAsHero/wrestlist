"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Check your email to confirm your account." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleOAuth(provider) {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="font-marquee text-3xl text-gold mb-1">
        {mode === "signup" ? "JOIN UP" : "SIGN IN"}
      </h1>
      <p className="text-muted text-sm mb-6">
        {mode === "signup" ? "Create an account to start tracking." : "Welcome back."}
      </p>

      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={() => handleOAuth("google")}
          className="border border-line rounded-md py-2.5 text-sm font-semibold hover:bg-surface2"
        >
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("discord")}
          className="border border-line rounded-md py-2.5 text-sm font-semibold hover:bg-surface2"
        >
          Continue with Discord
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-line flex-1" />
        <span className="font-mono text-[11px] text-muted">OR EMAIL</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-surface border border-line rounded-md px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-surface border border-line rounded-md px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-bg font-bold rounded-md py-2.5 text-sm disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      {message && (
        <p className={`text-sm mt-4 ${message.type === "error" ? "text-wwe" : "text-good"}`}>
          {message.text}
        </p>
      )}

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="text-sm text-muted mt-6 underline"
      >
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
