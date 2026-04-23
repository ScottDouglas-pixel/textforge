"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import UserMenu from "@/components/UserMenu";

export default function NavActions() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });
  }, []);

  // Avoid layout shift while checking auth
  if (loggedIn === null) return <div className="w-24" />;

  if (loggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/convert/blog" className="btn-outline text-sm px-4 py-2">
          Dashboard
        </Link>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/auth/login" className="btn-outline text-sm px-4 py-2">
        Sign In
      </Link>
      <Link href="/pricing?plan=pro" className="btn-gold text-sm px-4 py-2">
        Get Pro
      </Link>
    </div>
  );
}
