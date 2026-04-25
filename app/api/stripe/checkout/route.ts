import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const PLANS: Record<string, { name: string; amount: number; description: string }> = {
  pro:      { name: "TranscriptToPost Pro",      amount: 1900, description: "100 conversions/day, 15,000 char limit" },
  business: { name: "TranscriptToPost Business", amount: 7900, description: "500 conversions/day, 50,000 char limit" },
};

export async function POST(req: NextRequest) {
  try {
    // Require auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    const planConfig = PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Check if user already has a Stripe customer — reuse it to avoid duplicates
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .single();

    // If they have an active subscription, cancel it first before creating new one
    if (profile?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: planConfig.amount,
            recurring: { interval: "month" },
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: { plan },
    };

    // Reuse existing Stripe customer if available, otherwise use email
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email ?? undefined;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
