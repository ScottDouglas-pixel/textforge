import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const email = session.customer_email;
      const plan = session.metadata?.plan as "pro" | "business" | undefined;
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;

      if (email && plan) {
        // Find user by email and grant plan access
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profile) {
          await admin.from("profiles").update({
            plan,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
          }).eq("id", profile.id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;

      // Downgrade user to free plan
      await admin.from("profiles").update({
        plan: "free",
        stripe_subscription_id: null,
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;

      // Downgrade to free on payment failure
      await admin.from("profiles").update({
        plan: "free",
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
