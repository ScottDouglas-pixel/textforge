import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const WORD_COUNTS: Record<string, string> = {
  short: "400-600",
  medium: "800-1200",
  long: "1500-2000",
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile with plan + quota
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("plan, conversions_today, last_reset_date")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const plan = (profile.plan as Plan) ?? "free";
    const limits = PLAN_LIMITS[plan];

    // Reset daily count if it's a new day
    const today = new Date().toISOString().split("T")[0];
    const conversionsToday =
      profile.last_reset_date === today ? profile.conversions_today : 0;

    if (conversionsToday >= limits.conversions_per_day) {
      return NextResponse.json(
        { error: `Daily limit of ${limits.conversions_per_day} conversions reached. Upgrade your plan for more.` },
        { status: 429 }
      );
    }

    const { text, tone, length, keyword } = await req.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters of input text." },
        { status: 400 }
      );
    }

    if (text.length > limits.max_chars) {
      return NextResponse.json(
        { error: `Text exceeds ${limits.max_chars.toLocaleString()} character limit for your plan.` },
        { status: 400 }
      );
    }

    const wordCount = WORD_COUNTS[length] || "800-1200";
    const keywordInstruction = keyword
      ? `Target SEO keyword: "${keyword}". Use it naturally in the H1 title, first paragraph, at least two H2 subheadings, and conclusion.`
      : "Identify 1-2 natural keywords from the content and optimize for them.";

    const systemPrompt = `You are an expert SEO content writer and blog strategist. You write high-quality, engaging, search-engine-optimized blog posts that rank well and retain readers. Your writing is clear, authoritative, and human — never robotic or generic.`;

    const userPrompt = `Write a complete SEO blog post based on the following source content.

SOURCE CONTENT:
${text}

REQUIREMENTS:
- Tone: ${tone}
- Word count: ${wordCount} words
- ${keywordInstruction}
- Structure: H1 title, engaging intro (hook + thesis), 3-5 H2 sections with H3 subsections where appropriate, a conclusion with a clear CTA
- Include: A meta description (150-160 chars) at the top labeled "META DESCRIPTION:"
- Include: An author note at the bottom with 2 internal link suggestions (use placeholder URLs like /related-post-topic)
- Use Markdown formatting throughout
- Make the intro hook readers in the first 2 sentences
- End with a strong call-to-action

Write the full blog post now:`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const blog = message.content[0].type === "text" ? message.content[0].text : "";

    // Increment conversion count
    await admin.from("profiles").update({
      conversions_today: conversionsToday + 1,
      last_reset_date: today,
    }).eq("id", user.id);

    await admin.from("conversions").insert({ user_id: user.id, type: "blog" });

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error("Blog generation error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
