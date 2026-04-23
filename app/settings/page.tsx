"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Zap, CheckCircle, Clock, AlertTriangle,
  Download, XCircle, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  email: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  conversions_today: number;
  last_reset_date: string;
};

type Invoice = {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string | null;
  pdf: string | null;
  description: string;
};

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  active:   { label: "Active",   color: "text-green-400 bg-green-400/10 border-green-400/20" },
  trialing: { label: "Trial",    color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  past_due: { label: "Past Due", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  canceled: { label: "Canceled", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  inactive: { label: "Free",     color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, subscription_status, trial_ends_at, conversions_today, last_reset_date")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile({ ...data, email: user.email ?? "" });
        if (data.plan !== "free") fetchInvoices();
      }
      setLoading(false);
    });
  }, []);

  async function fetchInvoices() {
    setInvoicesLoading(true);
    const res = await fetch("/api/stripe/invoices");
    const data = await res.json();
    setInvoices(data.invoices ?? []);
    setInvoicesLoading(false);
  }

  async function handleCancel() {
    setCanceling(true);
    const res = await fetch("/api/stripe/cancel", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setCanceled(true);
      setProfile((p) => p ? { ...p, subscription_status: "canceled" } : p);
    } else {
      alert(data.error || "Failed to cancel. Please try again.");
    }
    setCanceling(false);
    setShowConfirm(false);
  }

  const isPaid = profile?.plan !== "free";
  const today = new Date().toISOString().split("T")[0];
  const usedToday = profile?.last_reset_date === today ? profile.conversions_today : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-forge-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forge-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
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
            <span className="font-semibold text-sm">Account & Billing</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Account */}
        <div className="card-glow bg-forge-card rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forge-gold flex items-center justify-center text-black font-bold text-sm">
              {profile?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.email}</p>
              <p className="text-xs text-forge-muted capitalize">{profile?.plan} plan · {usedToday} conversions today</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Subscription</h2>
            {profile?.subscription_status && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_BADGE[profile.subscription_status]?.color}`}>
                {STATUS_BADGE[profile.subscription_status]?.label}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-forge-muted">Plan</span>
            <span className="font-medium capitalize">{profile?.plan} {isPaid ? "— $" + (profile?.plan === "pro" ? "19" : "79") + "/mo" : "— Free"}</span>
          </div>

          {profile?.subscription_status === "active" && (
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
              <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">Your subscription is active and renewing monthly.</p>
            </div>
          )}

          {profile?.subscription_status === "trialing" && (
            <div className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3">
              <Clock size={14} className="text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-400">You are on a free trial.</p>
            </div>
          )}

          {profile?.subscription_status === "past_due" && (
            <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">Payment failed. Please update your payment method.</p>
            </div>
          )}

          {canceled && (
            <div className="flex items-center gap-2 bg-orange-400/10 border border-orange-400/20 rounded-xl px-4 py-3">
              <XCircle size={14} className="text-orange-400 flex-shrink-0" />
              <p className="text-sm text-orange-400">Subscription canceled. You keep access until the end of your billing period.</p>
            </div>
          )}

          {!isPaid && (
            <Link href="/pricing" className="block w-full text-center btn-gold py-2.5 text-sm rounded-xl">
              Upgrade to Pro — $19/mo
            </Link>
          )}
        </div>

        {/* Invoice History */}
        {isPaid && (
          <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Invoice History</h2>
            {invoicesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="animate-spin text-forge-muted" />
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-forge-muted">No invoices yet.</p>
            ) : (
              <div className="divide-y divide-forge-border">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">
                        ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                      </p>
                      <p className="text-xs text-forge-muted">
                        {new Date(inv.date * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${inv.status === "paid" ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {inv.status}
                      </span>
                      {inv.pdf && (
                        <a href={inv.pdf} target="_blank" rel="noopener noreferrer" className="text-forge-muted hover:text-forge-gold transition-colors">
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cancel Subscription */}
        {isPaid && profile?.subscription_status !== "canceled" && !canceled && (
          <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold">Cancel Subscription</h2>
            <p className="text-sm text-forge-muted">
              You'll keep access until the end of your current billing period. No refunds are issued for partial months.
            </p>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
              >
                Cancel my subscription
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-400 font-medium">Are you sure? You will lose Pro access at the end of your billing period.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={canceling}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {canceling && <Loader2 size={13} className="animate-spin" />}
                    Yes, cancel
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-sm text-forge-muted hover:text-forge-text px-4 py-2 rounded-lg border border-forge-border transition-colors"
                  >
                    Keep my plan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
