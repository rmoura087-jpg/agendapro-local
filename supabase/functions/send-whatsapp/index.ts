// Supabase Edge Function: send-whatsapp
//
// Envia uma mensagem de confirmação de agendamento via WhatsApp Cloud API
// (Meta). Isso é OPCIONAL — o app funciona sem isso, usando o link
// "wa.me" para o cliente falar com o estabelecimento manualmente.
//
// Para automatizar de verdade, você precisa:
//   1. Criar uma conta no Meta for Developers e um app do WhatsApp Business.
//   2. Ter um número de telefone verificado na WhatsApp Cloud API.
//   3. Criar e aprovar um modelo (template) de mensagem de confirmação.
//   4. Configurar os secrets abaixo no projeto Supabase:
//      WHATSAPP_TOKEN       -> token de acesso permanente do app da Meta
//      WHATSAPP_PHONE_ID    -> ID do número de telefone na Cloud API
//      WHATSAPP_TEMPLATE    -> nome do template aprovado (ex: "confirmacao_agendamento")
//
// Deploy: supabase functions deploy send-whatsapp
// Chamada (a partir do front-end, opcional): POST com { to, customerName, serviceName, date, time }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
  const template = Deno.env.get("WHATSAPP_TEMPLATE") ?? "confirmacao_agendamento";

  if (!token || !phoneId) {
    // Não configurado ainda — retorna sucesso "silencioso" para não quebrar o fluxo de agendamento.
    return json({ sent: false, reason: "WhatsApp não configurado neste projeto." });
  }

  try {
    const { to, customerName, serviceName, date, time } = await req.json();

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: customerName },
                { type: "text", text: serviceName },
                { type: "text", text: date },
                { type: "text", text: time },
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) return json({ sent: false, error: data }, 502);
    return json({ sent: true, data });
  } catch (err) {
    console.error(err);
    return json({ sent: false, error: "Erro ao enviar mensagem." }, 500);
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
