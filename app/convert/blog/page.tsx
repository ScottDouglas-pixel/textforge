"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Copy,
  Download,
  Zap,
  Loader2,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import UserMenu from "@/components/UserMenu";

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "educational", label: "Educational" },
  { value: "entertaining", label: "Entertaining" },
  { value: "authoritative", label: "Authoritative" },
];

const LENGTHS = [
  { value: "short", label: "Short (400–600 words)" },
  { value: "medium", label: "Medium (800–1200 words)" },
  { value: "long", label: "Long (1500–2000 words)" },
];

export default function BlogConverter() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [keyword, setKeyword] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [plan, setPlan] = useState<Plan>("free");
  const [conversionsToday, setConversionsToday] = useState(0);

  const limits = PLAN_LIMITS[plan];
  const MAX_FREE_CHARS = limits.max_chars;
  const remaining = limits.conversions_per_day - conversionsToday;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, conversions_today, last_reset_date")
        .eq("id", user.id)
        .single();
      if (data) {
        setPlan((data.plan as Plan) ?? "free");
        const today = new Date().toISOString().split("T")[0];
        setConversionsToday(data.last_reset_date === today ? data.conversions_today : 0);
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter some text to convert.");
      return;
    }
    if (input.length < 50) {
      setError("Please provide at least 50 characters of input text.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/convert/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, tone, length, keyword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed. Please try again.");
      }

      setOutput(data.blog);
      setConversionsToday((prev) => prev + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blog-post.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Header */}
      <div className="border-b border-forge-border bg-forge-surface/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-forge-muted hover:text-forge-text transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={15} />
              Back
            </Link>
            <div className="w-px h-4 bg-forge-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-forge-gold/10 rounded-lg flex items-center justify-center border border-forge-gold/20">
                <FileText size={14} className="text-forge-gold" />
              </div>
              <span className="font-semibold text-sm">Blog Post Writer</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="tag text-xs capitalize">
              {plan} · {remaining}/{limits.conversions_per_day} left today
            </span>
            {plan === "free" && (
              <Link href="/pricing?plan=pro" className="btn-gold text-xs px-3 py-1.5">
                Upgrade
              </Link>
            )}
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Text → SEO Blog Post</h1>
          <p className="text-forge-muted">
            Paste your notes, ideas, or raw content. We'll generate a polished, SEO-ready blog post.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* INPUT PANEL */}
          <div className="space-y-4">
            <div className="card-glow bg-forge-card rounded-2xl p-6">
              <label className="block text-sm font-semibold mb-3 text-forge-text">
                Your Input Text
              </label>
              <textarea
                className="textarea-forge min-h-[260px]"
                placeholder="Paste your raw notes, bullet points, transcript, or topic description here...

Example:
- AI is changing healthcare
- Diagnostic accuracy improved 30% in trials
- FDA approved 3 AI tools in 2024
- Concerns about bias in training data"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCharCount(e.target.value.length);
                  setError("");
                }}
                maxLength={MAX_FREE_CHARS}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-forge-muted">
                  {charCount.toLocaleString()} / {MAX_FREE_CHARS.toLocaleString()} chars{" "}
                  {charCount >= MAX_FREE_CHARS && plan === "free" && (
                    <Link href="/pricing" className="text-forge-gold underline">
                      Upgrade for more
                    </Link>
                  )}
                </span>
                {charCount > 0 && (
                  <button
                    onClick={() => { setInput(""); setCharCount(0); }}
                    className="text-xs text-forge-muted hover:text-forge-text"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-sm">Options</h3>

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">Tone</label>
                <div className="relative">
                  <select
                    className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-forge-gold/50 cursor-pointer"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    {TONES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-forge-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">Target Length</label>
                <div className="relative">
                  <select
                    className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-forge-gold/50 cursor-pointer"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  >
                    {LENGTHS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-forge-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">
                  Target Keyword{" "}
                  <span className="text-forge-border">(optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 placeholder-forge-muted focus:outline-none focus:border-forge-gold/50"
                  placeholder="e.g. AI healthcare diagnostics"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full btn-gold py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating your blog post...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Generate Blog Post
                </>
              )}
            </button>
          </div>

          {/* OUTPUT PANEL */}
          <div className="card-glow bg-forge-card rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-forge-border">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    output ? "bg-green-400" : loading ? "bg-forge-gold animate-pulse" : "bg-forge-border"
                  }`}
                />
                <span className="text-sm font-semibold">
                  {output ? "Blog Post Ready" : loading ? "Generating..." : "Output"}
                </span>
              </div>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    {copied ? (
                      <><CheckCircle size={13} className="text-green-400" /> Copied!</>
                    ) : (
                      <><Copy size={13} /> Copy</>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Download size={13} /> .md
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
              {output ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-body text-sm text-forge-text leading-relaxed">
                    {output}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 bg-forge-surface rounded-2xl flex items-center justify-center mb-4 border border-forge-border">
                    <FileText size={28} className="text-forge-border" />
                  </div>
                  <p className="text-forge-muted text-sm">
                    {loading
                      ? "Claude is writing your blog post..."
                      : "Your generated blog post will appear here"}
                  </p>
                  {loading && (
                    <div className="mt-4 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-forge-gold rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { tip: "💡 Better input = better output", desc: "Include specific facts, stats, or data points for richer content." },
            { tip: "🎯 Use target keywords", desc: "Adding a keyword helps TextForge optimize H1/H2 tags and density." },
            { tip: "📋 Works with any format", desc: "Bullet points, transcripts, paragraphs — any input format works." },
          ].map((t) => (
            <div key={t.tip} className="bg-forge-surface/50 border border-forge-border rounded-xl p-4">
              <p className="font-semibold text-sm mb-1">{t.tip}</p>
              <p className="text-forge-muted text-xs">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
