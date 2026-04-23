"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Free forever",
    desc: "Perfect for trying TextForge",
    features: [
      "5 blog conversions / day",
      "5 podcast scripts / day",
      "Standard output quality",
      "Copy & TXT export",
    ],
    cta: "Start Free",
    href: "/convert/blog",
    highlight: false,
    stripe: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "/month",
    desc: "For creators & solo operators",
    features: [
      "Unlimited blog & podcast conversions",
      "SEO meta tags & keyword optimization",
      "5 tone styles",
      "Markdown + DOCX export",
      "Priority generation speed",
    ],
    cta: "Upgrade to Pro",
    href: null,
    highlight: true,
    stripe: true,
  },
  {
    id: "business",
    name: "Business",
    price: 79,
    period: "/month",
    desc: "For agencies & content teams",
    features: [
      "Everything in Pro",
      "REST API access",
      "10 team seats",
      "White-label PDF/DOCX exports",
      "Custom brand voice training",
      "Dedicated Slack support",
    ],
    cta: "Upgrade to Business",
    href: null,
    highlight: false,
    stripe: true,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        setIsLoggedIn(true);
      }
    });
  }, []);

  const handleCheckout = async (planId: string) => {
    if (!isLoggedIn) {
      window.location.href = `/auth/login?redirect=/pricing`;
      return;
    }

    setLoading(planId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="border-b border-forge-border bg-forge-surface/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="text-forge-muted hover:text-forge-text transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
          <div className="w-px h-4 bg-forge-border" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forge-gold rounded-md flex items-center justify-center">
              <Zap size={13} className="text-forge-bg" />
            </div>
            <span className="font-display font-bold">TextForge Pricing</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="tag inline-flex mb-4">Pricing</div>
          <h1 className="font-display text-5xl font-bold mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-forge-muted text-lg">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        {/* Auth status */}
        <div className="max-w-md mx-auto mb-10 text-center">
          {isLoggedIn ? (
            <p className="text-sm text-forge-muted">
              Signed in as <span className="text-forge-gold">{email}</span>
            </p>
          ) : (
            <p className="text-sm text-forge-muted">
              <Link href="/auth/login?redirect=/pricing" className="text-forge-gold hover:underline font-medium">
                Sign in or create a free account
              </Link>{" "}
              to upgrade
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 relative ${
                plan.highlight
                  ? "bg-forge-gold/5 border-2 border-forge-gold/50"
                  : "card-glow bg-forge-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-forge-gold text-forge-bg text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-forge-muted text-sm font-semibold mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  {plan.price === 0 ? (
                    <span className="font-display text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold">${plan.price}</span>
                      <span className="text-forge-muted">{plan.period}</span>
                    </>
                  )}
                </div>
                <p className="text-forge-muted text-xs">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={15} className="text-forge-gold mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.stripe ? (
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.highlight
                      ? "btn-gold"
                      : "btn-outline"
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? (
                    <><Loader2 size={15} className="animate-spin" /> Redirecting...</>
                  ) : (
                    plan.cta
                  )}
                </button>
              ) : (
                <Link
                  href={plan.href!}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm ${
                    plan.highlight ? "btn-gold" : "btn-outline"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from your account settings at any time. Your access continues until the end of the billing period.",
              },
              {
                q: "What counts as a 'conversion'?",
                a: "Each time you click 'Generate' counts as one conversion, whether it's a blog post or podcast script.",
              },
              {
                q: "Can I try before paying?",
                a: "Yes — the free plan gives you 5 conversions per day forever, no credit card needed. Upgrade only when you need more.",
              },
              {
                q: "What AI model powers TextForge?",
                a: "TextForge uses Claude by Anthropic — one of the most capable language models for long-form content generation.",
              },
              {
                q: "Can I use the generated content commercially?",
                a: "Yes. Content you generate is yours to use, publish, and monetize however you like.",
              },
            ].map((item) => (
              <div key={item.q} className="card-glow bg-forge-card rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                <p className="text-forge-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
