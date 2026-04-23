"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  email: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  conversions_today: number;
  last_reset_date: string;
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active:   { label: "Active",    color: "text-green-400 bg-green-400/10 border-green-400/20" },
  trialing: { label: "Trial",     color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  past_due: { label: "Past Due",  color: "text-red-400 bg-red-400/10 border-red-400/20" },
  canceled: { label: "Canceled",  color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  inactive: { label: "Free",      color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, subscription_status, trial_ends_at, conversions_today, last_reset_date")
        .eq("id", user.id)
        .single();
      if (data) setProfile({ ...data, email: user.email ?? "" });
      setLoading(false);
    });
  }, []);

  async function openBillingPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isPaid = profile?.plan !== "free";

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forge-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="border-b border-forge-border bg-forge-surface/50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/convert/blog" className="text-forge-muted hover:text-forge-text transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft size={15} /> Back
          </Link>
          <div className="w-px h-4 bg-forge-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forge-gold/10 rounded-lg flex items-center justify-center border border-forge-gold/20">
              <Zap size={14} className="text-forge-gold" />
            </div>
            <span className="font-semibold text-sm">Account Settings</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Account */}
        <div className="card-glow bg-forge-card rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forge-gold flex items-center justify-center text-black font-bold">
              {profile?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.email}</p>
              <p className="text-xs text-forge-muted capitalize">{profile?.plan} plan</p>
            </div>
          </div>
        </div>

        {/* Subscription status */}
        <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Subscription</h2>

          <div className="flex items-center justify-between">
            <span className="text-sm text-forge-muted">Status</span>
            {profile?.subscription_status && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[profile.subscription_status]?.color}`}>
                {STATUS_BADGE[profile.subscription_status]?.label}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-forge-muted">Plan</span>
            <span className="text-sm font-medium capitalize">{profile?.plan}</span>
          </div>

          {profile?.subscription_status === "trialing" && trialDaysLeft !== null && (
            <div className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3">
              <Clock size={15} className="text-blue-400" />
              <p className="text-sm text-blue-400">
                Your trial ends in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</strong>. You will be charged after the trial.
              </p>
            </div>
          )}

          {profile?.subscription_status === "past_due" && (
            <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertTriangle size={15} className="text-red-400" />
              <p className="text-sm text-red-400">
                Payment failed. Update your card to restore access.
              </p>
            </div>
          )}

          {profile?.subscription_status === "active" && (
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
              <CheckCircle size={15} className="text-green-400" />
              <p className="text-sm text-green-400">Your subscription is active.</p>
            </div>
          )}

          {!isPaid && (
            <Link href="/pricing" className="block w-full text-center btn-gold py-2.5 text-sm rounded-xl">
              Upgrade to Pro
            </Link>
          )}
        </div>

        {/* Billing portal — only for paid users */}
        {isPaid && (
          <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Billing</h2>
            <p className="text-sm text-forge-muted">
              View invoices, update your payment method, or cancel your subscription.
            </p>
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="flex items-center gap-2 btn-outline text-sm px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              <CreditCard size={15} />
              {portalLoading ? "Opening..." : "Manage Billing & Cancel"}
            </button>
          </div>
        )}

        {/* Usage */}
        <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold">Today's Usage</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-forge-muted">Conversions used today</span>
            <span>{profile?.last_reset_date === new Date().toISOString().split("T")[0]
              ? profile.conversions_today
              : 0} used</span>
          </div>
        </div>

      </div>
    </div>
  );
}
