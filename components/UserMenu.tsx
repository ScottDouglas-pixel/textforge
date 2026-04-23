"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ChevronDown, User, Settings } from "lucide-react";
import Link from "next/link";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!email) return null;

  const initial = email[0].toUpperCase();

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[#E8B84B] flex items-center justify-center text-black text-xs font-bold">
          {initial}
        </div>
        <span className="text-sm text-white hidden sm:block max-w-[140px] truncate">
          {email}
        </span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-[#111113] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-0.5">
              <User size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Signed in as</span>
            </div>
            <p className="text-sm text-white font-medium truncate">{email}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
          >
            <Settings size={14} className="text-gray-400" />
            Settings & Billing
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
