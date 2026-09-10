// Supabase Edge Function: create-checkout-session
//
// Cria uma sessão de checkout do Stripe para o estabelecimento assinar
// o plano "Profissional" ou "Studio". Requer que você configure, nos
// Secrets do projeto Supabase (Project Settings > Edge Functions):
//
//   STRIPE_SECRET_KEY            -> chave secreta da sua conta Stripe
//   STRIPE_PRICE_PROFISSIONAL    -> ID do Price do plano Profissional
//   STRIPE_PRICE_STUDIO          -> ID do Price do plano Studio
//   APP_URL                      -> URL pública do seu app (ex: https://seusite.vercel.app)
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY -> já vêm prontos no ambiente
//
// Deploy: supabase functions deploy create-checkout-session

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  profissional: Deno.env.get("STRIPE_PRICE_PROFISSIONAL"),
  studio: Deno.env.get("STRIPE_PRICE_STUDIO"),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    ).auth.getUser();

    if (userError || !userData.user) {
      return json({ error: "Não autenticado." }, 401);
    }

    const { plan } = await req.json();
    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId) {
      return json({ error: "Plano inválido ou não configurado no servidor." }, 400);
    }

    const { data: establishment } = await supabase
      .from("establishments")
      .select("id, name, stripe_customer_id")
      .eq("owner_id", userData.user.id)
      .maybeSingle();

    if (!establishment) {
      return json({ error: "Estabelecimento não encontrado." }, 404);
    }

    let customerId = establishment.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.user.email ?? undefined,
        name: establishment.name,
        metadata: { establishment_id: establishment.id },
      });
      customerId = customer.id;
      await supabase.from("establishments").update({ stripe_customer_id: customerId }).eq("id", establishment.id);
    }

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/#/app/planos?status=sucesso`,
      cancel_url: `${appUrl}/#/app/planos?status=cancelado`,
      metadata: { establishment_id: establishment.id, plan },
    });

    return json({ url: session.url });
  } catch (err) {
    console.error(err);
    return json({ error: "Erro ao criar sessão de checkout." }, 500);
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
