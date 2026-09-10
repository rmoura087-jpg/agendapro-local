import { useState } from "react";
import { Check, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import { PLAN_LABELS } from "../types";
import type { Establishment } from "../types";

const plans = [
  {
    id: "free",
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    desc: "Para testar a agenda online com seus primeiros clientes.",
    items: ["1 profissional", "Até 30 agendamentos por mês", "Página pública de agendamento"],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: "R$ 49",
    period: "por mês",
    desc: "Para quem já vive de agenda cheia.",
    items: ["Profissionais ilimitados", "Agendamentos ilimitados", "Lembretes por WhatsApp", "Relatórios de receita"],
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "R$ 99",
    period: "por mês",
    desc: "Para redes e estúdios com mais de uma unidade.",
    items: ["Tudo do Profissional", "Múltiplas unidades", "Recuperação de clientes inativos", "Suporte prioritário"],
  },
];

export function PlansPage({ establishment }: { establishment: Establishment }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function upgrade(planId: string) {
    setError(""); setLoadingPlan(planId);
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { plan: planId },
    });
    setLoadingPlan(null);
    if (error || !data?.url) {
      setError(
        "Checkout de pagamento ainda não está configurado neste projeto. " +
        "Configure a função 'create-checkout-session' com suas chaves do Stripe para liberar upgrades reais."
      );
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-ink-400">Assinatura</div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Planos</h1>
        <p className="mt-1 text-ink-500">
          Seu plano atual: <span className="font-semibold text-ink-900">{PLAN_LABELS[establishment.plan] ?? establishment.plan}</span>
          {establishment.plan_renews_at && (
            <> · renova em {new Intl.DateTimeFormat("pt-BR").format(new Date(establishment.plan_renews_at))}</>
          )}
        </p>
      </div>

      {error && <div className="mb-6 rounded-sq bg-brass-50 p-4 text-sm text-brass-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = establishment.plan === p.id;
          return (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-7 ${p.highlight ? "border-ink-900 bg-ink-900 text-paper" : "border-ink-100 bg-white"}`}
            >
              <h3 className="font-display text-xl">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-ink-300" : "text-ink-400"}`}>/{p.period}</span>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${p.highlight ? "text-ink-200" : "text-ink-500"}`}>{p.desc}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={`mt-0.5 shrink-0 ${p.highlight ? "text-brass-300" : "text-brass-500"}`} />
                    <span className={p.highlight ? "text-ink-100" : "text-ink-700"}>{it}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className={`mt-7 rounded-sq border px-4 py-2.5 text-center text-sm font-semibold ${p.highlight ? "border-white/20 text-paper" : "border-ink-100 text-ink-500"}`}>
                  Plano atual
                </div>
              ) : p.id === "free" ? (
                <div className={`mt-7 rounded-sq border px-4 py-2.5 text-center text-sm text-ink-400 ${p.highlight ? "border-white/20" : "border-ink-100"}`}>
                  Fale com o suporte para voltar ao Grátis
                </div>
              ) : (
                <button
                  className={`mt-7 ${p.highlight ? "btn-brass" : "btn-secondary"}`}
                  onClick={() => upgrade(p.id)}
                  disabled={loadingPlan === p.id}
                >
                  {loadingPlan === p.id ? <><Loader2 size={16} className="animate-spin" /> Abrindo checkout...</> : `Assinar ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 card p-5 text-sm text-ink-500">
        <p className="flex items-center gap-2 font-semibold text-ink-700"><ExternalLink size={15} /> Sobre os pagamentos</p>
        <p className="mt-1.5">
          O checkout é processado pelo Stripe. Para ativar cobranças reais, configure a função de borda
          <code className="mx-1 rounded bg-ink-50 px-1.5 py-0.5 font-mono text-xs">create-checkout-session</code>
          com suas chaves do Stripe (veja o README).
        </p>
      </div>
    </div>
  );
}
