"use client";

import Link from "next/link";
import {
  FileText,
  Mic,
  Zap,
  Search,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
} from "lucide-react";
import NavActions from "@/components/NavActions";

const FEATURES = [
  {
    icon: Search,
    title: "SEO-Optimized Blog Posts",
    desc: "Generate full blog articles with proper H1/H2 structure, meta descriptions, keyword density, and internal link suggestions.",
  },
  {
    icon: Mic,
    title: "Podcast Scripts",
    desc: "Turn bullet points or transcripts into engaging two-host podcast scripts complete with intros, segments, and CTAs.",
  },
  {
    icon: Zap,
    title: "10-Second Generation",
    desc: "Powered by Claude AI. Paste your text, click convert — get publish-ready content in seconds, not hours.",
  },
  {
    icon: TrendingUp,
    title: "Multiple Tones & Styles",
    desc: "Formal, casual, educational, entertaining — pick your tone and the AI matches your brand voice perfectly.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    desc: "Generate content in 30+ languages. Reach global audiences without hiring translators.",
  },
  {
    icon: FileText,
    title: "Export Anywhere",
    desc: "Download as Markdown, plain text, or copy directly. Works with WordPress, Substack, Notion, and more.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Content Marketing Manager",
    text: "We went from publishing 2 posts/week to 14. TextForge is the only tool that actually gets our tone right.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    role: "Solo Podcaster",
    text: "I used to spend 3 hours writing each episode script. Now it's 10 minutes. The quality is genuinely impressive.",
    stars: 5,
  },
  {
    name: "Diana L.",
    role: "Agency Owner",
    text: "Running 20+ client blogs with 2 people. TextForge is the third team member we never have to pay benefits.",
    stars: 5,
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Try it out — no credit card needed",
    features: ["5 blog conversions / day", "5 podcast scripts / day", "Standard quality", "TXT export"],
    cta: "Start Free",
    href: "/convert/blog",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For creators and solo operators",
    features: [
      "Unlimited conversions",
      "SEO meta tags included",
      "5 tone styles",
      "Markdown + DOCX export",
      "Priority generation speed",
    ],
    cta: "Get Pro",
    href: "/pricing?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    desc: "For agencies and content teams",
    features: [
      "Everything in Pro",
      "API access",
      "10 team seats",
      "White-label exports",
      "Custom brand voice fine-tuning",
      "Dedicated support",
    ],
    cta: "Get Business",
    href: "/pricing?plan=business",
    highlight: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-forge-bg noise-bg overflow-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-forge-border/50 bg-forge-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-forge-gold rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-forge-bg" />
            </div>
            <span className="font-display text-xl font-bold text-forge-text">TextForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-forge-muted">
            <Link href="#features" className="hover:text-forge-text transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-forge-text transition-colors">Pricing</Link>
            <Link href="/convert/blog" className="hover:text-forge-text transition-colors">Blog Writer</Link>
            <Link href="/convert/podcast" className="hover:text-forge-text transition-colors">Podcast Script</Link>
          </div>
          <NavActions />
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 relative">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-forge-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[200px] h-[200px] bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="tag stagger-1 inline-flex mb-6">
            <Zap size={12} />
            Powered by Claude AI · 10 seconds · No fluff
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 stagger-2">
            Turn{" "}
            <span className="gold-shimmer">Any Text</span>
            <br />
            Into Blogs &amp;
            <br />
            Podcasts
          </h1>

          <p className="text-forge-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 stagger-3">
            Paste your notes, ideas, or raw transcript. TextForge transforms them into{" "}
            <strong className="text-forge-text">publish-ready SEO blog posts</strong> and{" "}
            <strong className="text-forge-text">engaging podcast scripts</strong> — in under 10 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center stagger-4">
            <Link href="/convert/blog" className="btn-gold text-base px-8 py-4 inline-flex items-center gap-2">
              <FileText size={18} />
              Write a Blog Post
            </Link>
            <Link href="/convert/podcast" className="btn-outline text-base px-8 py-4 inline-flex items-center gap-2">
              <Mic size={18} />
              Write a Podcast Script
            </Link>
          </div>

          <p className="text-forge-muted text-sm mt-5 stagger-5">
            Free · No credit card · 5 conversions/day
          </p>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-3 gap-px bg-forge-border rounded-2xl overflow-hidden stagger-6">
            {[
              { val: "50,000+", label: "pieces generated" },
              { val: "3 min", label: "avg time saved per post" },
              { val: "4.9 ★", label: "average rating" },
            ].map((s) => (
              <div key={s.label} className="bg-forge-surface px-6 py-5 text-center">
                <div className="font-display text-2xl font-bold text-forge-gold">{s.val}</div>
                <div className="text-forge-muted text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="tag inline-flex mb-4">How it works</div>
            <h2 className="font-display text-4xl font-bold">Three steps to great content</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Paste Your Text",
                desc: "Drop in your raw notes, a topic idea, bullet points, or any source material.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Choose Your Format",
                desc: "Select Blog Post or Podcast Script. Pick your tone — casual, professional, educational.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Publish or Export",
                desc: "Copy the output, download as Markdown, or paste straight into WordPress or your podcast tool.",
                icon: ArrowRight,
              },
            ].map((item) => (
              <div key={item.step} className="card-glow bg-forge-card rounded-2xl p-6 relative group">
                <div className="font-mono text-5xl font-bold text-forge-border group-hover:text-forge-gold/20 transition-colors duration-300 mb-4 absolute top-5 right-6">
                  {item.step}
                </div>
                <div className="w-10 h-10 bg-forge-gold/10 rounded-xl flex items-center justify-center mb-4 border border-forge-gold/20">
                  <item.icon size={20} className="text-forge-gold" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-forge-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="tag inline-flex mb-4">Features</div>
            <h2 className="font-display text-4xl font-bold">
              Everything content creators need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-glow bg-forge-card rounded-2xl p-6 group">
                <div className="w-10 h-10 bg-forge-gold/10 rounded-xl flex items-center justify-center mb-4 border border-forge-gold/20 group-hover:bg-forge-gold/15 transition-colors">
                  <f.icon size={20} className="text-forge-gold" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-forge-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-forge-surface/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="tag inline-flex mb-4">Testimonials</div>
            <h2 className="font-display text-4xl font-bold">Creators love TextForge</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-glow bg-forge-card rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-forge-gold fill-forge-gold" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-forge-text mb-5">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-forge-muted text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="tag inline-flex mb-4">Pricing</div>
            <h2 className="font-display text-4xl font-bold mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-forge-muted">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 relative ${
                  plan.highlight
                    ? "bg-forge-gold/5 border-2 border-forge-gold/40"
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

                <div className="mb-5">
                  <h3 className="font-semibold text-sm text-forge-muted mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    <span className="text-forge-muted text-sm">{plan.period}</span>
                  </div>
                  <p className="text-forge-muted text-xs">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={15} className="text-forge-gold mt-0.5 flex-shrink-0" />
                      <span className="text-forge-text">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "btn-gold"
                      : "btn-outline"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Start creating in{" "}
            <span className="gold-shimmer">10 seconds</span>
          </h2>
          <p className="text-forge-muted mb-8">
            Join 12,000+ creators publishing more content with less effort.
          </p>
          <Link href="/convert/blog" className="btn-gold text-base px-10 py-4 inline-flex items-center gap-2">
            <Zap size={18} />
            Try Free Now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-forge-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forge-gold rounded-md flex items-center justify-center">
              <Zap size={13} className="text-forge-bg" />
            </div>
            <span className="font-display font-bold">TextForge</span>
          </div>
          <div className="flex gap-6 text-sm text-forge-muted">
            <Link href="/convert/blog" className="hover:text-forge-gold transition-colors">Blog Writer</Link>
            <Link href="/convert/podcast" className="hover:text-forge-gold transition-colors">Podcast Script</Link>
            <Link href="/pricing" className="hover:text-forge-gold transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-forge-gold transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-forge-gold transition-colors">Terms</Link>
          </div>
          <p className="text-forge-muted text-xs">© 2024 TextForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
