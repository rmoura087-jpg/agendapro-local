// Supabase Edge Function: stripe-webhook
//
// Recebe eventos do Stripe e atualiza o plano do estabelecimento.
// Configure no painel do Stripe um webhook apontando para:
//   https://SEU-PROJETO.functions.supabase.co/stripe-webhook
// Eventos a assinar: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted
//
// Secrets necessários (Project Settings > Edge Functions):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? "",
      Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "",
    );
  } catch (err) {
    console.error("Assinatura inválida:", err);
    return new Response("Assinatura inválida", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const establishmentId = session.metadata?.establishment_id;
        const plan = session.metadata?.plan;
        if (establishmentId && plan) {
          await supabase.from("establishments").update({
            plan,
            plan_status: "active",
            stripe_subscription_id: session.subscription as string,
          }).eq("id", establishmentId);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from("establishments").update({
          plan_status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled",
          plan_renews_at: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("stripe_subscription_id", sub.id);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from("establishments").update({
          plan: "free",
          plan_status: "canceled",
        }).eq("stripe_subscription_id", sub.id);
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao processar evento", { status: 500 });
  }
});
