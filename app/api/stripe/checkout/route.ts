import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const PLANS: Record<string, { name: string; amount: number; description: string }> = {
  pro:      { name: "TextForge Pro",      amount: 1900, description: "100 conversions/day, 15,000 char limit" },
  business: { name: "TextForge Business", amount: 7900, description: "500 conversions/day, 50,000 char limit" },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json();

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
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
      customer_email: email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: { plan },
      subscription_data: { trial_period_days: 7 },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
