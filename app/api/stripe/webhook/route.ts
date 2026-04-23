import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
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
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      const plan = session.metadata?.plan as "pro" | "business" | undefined;
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;

      if (email && plan) {
        // Fetch subscription to get status + trial info
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const isTrialing = subscription.status === "trialing";
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

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
            subscription_status: isTrialing ? "trialing" : "active",
            trial_ends_at: trialEnd,
          }).eq("id", profile.id);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      const isTrialing = subscription.status === "trialing";
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;

      await admin.from("profiles").update({
        subscription_status: isTrialing ? "trialing" : subscription.status,
        trial_ends_at: trialEnd,
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;

      await admin.from("profiles").update({
        plan: "free",
        subscription_status: "canceled",
        stripe_subscription_id: null,
        trial_ends_at: null,
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;

      // Trial converted to paid — mark as active
      await admin.from("profiles").update({
        subscription_status: "active",
        trial_ends_at: null,
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;

      await admin.from("profiles").update({
        plan: "free",
        subscription_status: "past_due",
      }).eq("stripe_customer_id", stripeCustomerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
