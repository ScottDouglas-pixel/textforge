"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mic,
  Copy,
  Download,
  Zap,
  Loader2,
  CheckCircle,
  ChevronDown,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import UserMenu from "@/components/UserMenu";

const FORMATS = [
  { value: "interview", label: "Interview Style (Host + Guest)" },
  { value: "co-host", label: "Two Co-Hosts" },
  { value: "solo", label: "Solo Monologue" },
  { value: "story", label: "Narrative Story" },
  { value: "educational", label: "Educational Explainer" },
];

const LENGTHS = [
  { value: "short", label: "Short (~5 min episode)" },
  { value: "medium", label: "Medium (~15 min episode)" },
  { value: "long", label: "Long (~30 min episode)" },
];

export default function PodcastConverter() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("co-host");
  const [length, setLength] = useState("medium");
  const [host1, setHost1] = useState("Alex");
  const [host2, setHost2] = useState("Jamie");
  const [showName, setShowName] = useState("");
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
      const res = await fetch("/api/convert/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          format,
          length,
          host1,
          host2,
          showName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed. Please try again.");
      }

      setOutput(data.script);
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
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "podcast-script.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const showHosts = format !== "solo";

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
                <Mic size={14} className="text-forge-gold" />
              </div>
              <span className="font-semibold text-sm">Podcast Script Writer</span>
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
          <h1 className="font-display text-3xl font-bold mb-2">Text → Podcast Script</h1>
          <p className="text-forge-muted">
            Turn notes, articles, or raw ideas into a ready-to-record podcast episode script.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* INPUT PANEL */}
          <div className="space-y-4">
            <div className="card-glow bg-forge-card rounded-2xl p-6">
              <label className="block text-sm font-semibold mb-3 text-forge-text">
                Your Source Content
              </label>
              <textarea
                className="textarea-forge min-h-[220px]"
                placeholder="Paste your research, article, notes, or topic summary here...

Example:
- The history of sourdough bread
- Origins in ancient Egypt 5000 BC
- Fermentation science: wild yeast + lactobacilli
- Modern sourdough revival during COVID
- Health benefits vs. commercial bread"
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
              </div>
            </div>

            {/* Options */}
            <div className="card-glow bg-forge-card rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-sm">Episode Settings</h3>

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">Podcast Format</label>
                <div className="relative">
                  <select
                    className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-forge-gold/50 cursor-pointer"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3 text-forge-muted pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">Episode Length</label>
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

              {showHosts && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs text-forge-muted mb-1.5">
                      <Users size={11} />
                      Host 1 Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 placeholder-forge-muted focus:outline-none focus:border-forge-gold/50"
                      value={host1}
                      onChange={(e) => setHost1(e.target.value)}
                    />
                  </div>
                  {format !== "solo" && format !== "interview" && (
                    <div>
                      <label className="block text-xs text-forge-muted mb-1.5">Host 2 Name</label>
                      <input
                        type="text"
                        className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 placeholder-forge-muted focus:outline-none focus:border-forge-gold/50"
                        value={host2}
                        onChange={(e) => setHost2(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs text-forge-muted mb-1.5">
                  Show Name{" "}
                  <span className="text-forge-border">(optional)</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-forge-surface border border-forge-border text-forge-text text-sm rounded-lg px-3 py-2.5 placeholder-forge-muted focus:outline-none focus:border-forge-gold/50"
                  placeholder="e.g. The Daily Bake Podcast"
                  value={showName}
                  onChange={(e) => setShowName(e.target.value)}
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
                  Writing your script...
                </>
              ) : (
                <>
                  <Mic size={18} />
                  Generate Podcast Script
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
                  {output ? "Script Ready" : loading ? "Writing..." : "Script Output"}
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
                    <Download size={13} /> .txt
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
              {output ? (
                <pre className="whitespace-pre-wrap font-body text-sm text-forge-text leading-relaxed">
                  {output}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 bg-forge-surface rounded-2xl flex items-center justify-center mb-4 border border-forge-border">
                    <Mic size={28} className="text-forge-border" />
                  </div>
                  <p className="text-forge-muted text-sm">
                    {loading
                      ? "Claude is writing your episode script..."
                      : "Your podcast script will appear here"}
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
            { tip: "🎙️ Give context", desc: "More detail in your input = more natural-sounding dialogue." },
            { tip: "⏱️ Timing estimates", desc: "Scripts include [SEGMENT] markers for approximate runtime." },
            { tip: "✏️ Easy to edit", desc: "Use the script as a base — tweak lines to match your voice." },
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
