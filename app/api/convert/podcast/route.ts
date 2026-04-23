import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DURATION_GUIDE: Record<string, string> = {
  short: "approximately 5 minutes when spoken at natural pace (~700 words of dialogue)",
  medium: "approximately 15 minutes when spoken at natural pace (~2000 words of dialogue)",
  long: "approximately 30 minutes when spoken at natural pace (~4000 words of dialogue)",
};

const FORMAT_GUIDE: Record<string, string> = {
  "co-host": "two co-hosts having an engaging back-and-forth conversation",
  interview: "an interview where the host asks questions and a guest expert answers",
  solo: "a solo host delivering a monologue directly to the audience",
  story: "a narrative storytelling style with vivid descriptions and story beats",
  educational: "an educational explainer breaking down concepts clearly for beginners",
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

    const { text, format, length, host1, host2, showName } = await req.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Please provide at least 50 characters of source content." },
        { status: 400 }
      );
    }

    if (text.length > limits.max_chars) {
      return NextResponse.json(
        { error: `Text exceeds ${limits.max_chars.toLocaleString()} character limit for your plan.` },
        { status: 400 }
      );
    }

    const duration = DURATION_GUIDE[length] || DURATION_GUIDE.medium;
    const formatDesc = FORMAT_GUIDE[format] || FORMAT_GUIDE["co-host"];
    const showTitle = showName ? `The podcast is called "${showName}".` : "";

    const hostNames =
      format === "solo"
        ? `Host: ${host1 || "Alex"}`
        : format === "interview"
        ? `Host: ${host1 || "Alex"}, Guest: ${host2 || "Jamie"}`
        : `Host 1: ${host1 || "Alex"}, Host 2: ${host2 || "Jamie"}`;

    const systemPrompt = `You are a professional podcast scriptwriter who has written for top-50 podcasts. You create scripts that sound completely natural when spoken aloud — conversational, engaging, with appropriate pacing, humor, and authenticity. Your scripts have clear structure but feel organic, not rehearsed.`;

    const userPrompt = `Write a complete podcast episode script based on the following source material.

SOURCE MATERIAL:
${text}

SCRIPT REQUIREMENTS:
- Format: ${formatDesc}
- Target runtime: ${duration}
- ${hostNames}
- ${showTitle}
- Include a cold open / teaser (30 seconds of compelling hook before intro)
- Include a proper [INTRO MUSIC CUE] marker
- Divide content into clearly labeled segments: [SEGMENT 1: Title], [SEGMENT 2: Title], etc.
- Include natural ad break markers: [AD BREAK] (2 per medium episode, 3 for long)
- Include [OUTRO MUSIC CUE] and closing call-to-action (subscribe, leave a review, follow on social)
- Write dialogue that sounds natural — include laughter cues (laughs), thinking pauses (pause), and emphasis (!)
- Format: SPEAKER NAME: dialogue text
- End with [END OF SCRIPT]

Write the complete script now — include every line of dialogue, all stage directions, and all music/sound cues:`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const script = message.content[0].type === "text" ? message.content[0].text : "";

    // Increment conversion count
    await admin.from("profiles").update({
      conversions_today: conversionsToday + 1,
      last_reset_date: today,
    }).eq("id", user.id);

    await admin.from("conversions").insert({ user_id: user.id, type: "podcast" });

    return NextResponse.json({ script });
  } catch (error: unknown) {
    console.error("Podcast generation error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
