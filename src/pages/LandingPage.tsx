import { Link } from "react-router-dom";
import {
  CalendarDays, ArrowUpRight, Scissors, Users, Clock3, MessageCircle,
  BarChart3, ShieldCheck, Check,
} from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Você monta sua agenda",
    text: "Cadastre serviços, preços, profissionais e horário de funcionamento em poucos minutos.",
  },
  {
    n: "02",
    title: "Seu cliente agenda sozinho",
    text: "Você compartilha um link. O cliente escolhe serviço, profissional e horário livre — sem trocar mensagem.",
  },
  {
    n: "03",
    title: "Você recebe organizado",
    text: "O agendamento cai direto na sua agenda, com cliente e horário já confirmados.",
  },
];

const features = [
  [Scissors, "Serviços e preços", "Cadastre quantos serviços quiser, com duração e valor — a agenda calcula os horários certos sozinha."],
  [Users, "Equipe multi-profissional", "Cada profissional tem a própria agenda, especialidade e horários dentro do mesmo estabelecimento."],
  [Clock3, "Zero conflito de horário", "Bloqueios, intervalos e conflitos são verificados automaticamente antes de confirmar."],
  [MessageCircle, "Conectado ao WhatsApp", "Confirmação e lembretes chegam direto no WhatsApp do seu cliente."],
  [BarChart3, "Visão do negócio", "Receita agendada, clientes novos e ocupação do dia, em um painel só seu."],
  [ShieldCheck, "Dados isolados e seguros", "Cada estabelecimento enxerga apenas os próprios dados — sem exceção."],
];

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    tag: null,
    desc: "Para testar a agenda online e validar o fluxo com seus primeiros clientes.",
    items: ["1 profissional", "Até 30 agendamentos por mês", "Página pública de agendamento", "Painel de clientes e serviços"],
    cta: "Começar grátis",
    to: "/cadastro",
    highlight: false,
  },
  {
    name: "Profissional",
    price: "R$ 49",
    period: "por mês",
    tag: "Mais escolhido",
    desc: "Para quem já vive de agenda cheia e quer parar de perder horário por mensagem.",
    items: ["Profissionais ilimitados", "Agendamentos ilimitados", "Lembretes automáticos por WhatsApp", "Relatórios de receita e ocupação"],
    cta: "Assinar Profissional",
    to: "/cadastro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "R$ 99",
    period: "por mês",
    tag: null,
    desc: "Para redes e estúdios com mais de uma unidade ou operação mais exigente.",
    items: ["Tudo do Profissional", "Múltiplas unidades", "Recuperação de clientes inativos", "Suporte prioritário"],
    cta: "Assinar Studio",
    to: "/cadastro",
    highlight: false,
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="border-b border-ink-100/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-sq bg-ink-900 text-brass-300">
              <CalendarDays size={18} />
            </span>
            AgendaPro <span className="text-brass-500">Local</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="btn-ghost" to="/login">Entrar</Link>
            <Link className="btn-brass" to="/cadastro">Começar grátis</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pb-24 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-semibold text-brass-500">Agenda online para negócios locais</p>
            <h1 className="mt-4 max-w-xl font-display text-[2.6rem] font-medium leading-[1.08] tracking-tight md:text-6xl">
              Sua cadeira não pode ficar vazia por falta de agenda.
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-500">
              O AgendaPro Local coloca sua barbearia, salão ou estúdio online em minutos.
              Seus clientes agendam sozinhos, direto pelo celular — e você para de perder
              tempo confirmando horário por WhatsApp.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/cadastro" className="btn-brass px-6 py-3 text-base">
                Criar minha agenda <ArrowUpRight size={18} />
              </Link>
              <Link to="/login" className="text-sm font-semibold text-ink-600 hover:text-ink-900">
                Já tenho conta →
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink-400">Grátis para começar. Sem cartão de crédito.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brass-100/60 blur-2xl" />
            <div className="rounded-[1.5rem] border border-ink-100 bg-ink-900 p-5 shadow-lift">
              <div className="flex items-center justify-between text-paper">
                <div>
                  <p className="text-xs text-ink-300">Barbearia Vintage</p>
                  <p className="font-display text-lg">Hoje, quinta-feira</p>
                </div>
                <span className="rounded-full bg-moss-500/20 px-3 py-1 text-xs font-semibold text-moss-100">6 confirmados</span>
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  ["09:00", "Corte + barba", "Rafael M."],
                  ["10:30", "Corte social", "Diego A."],
                  ["11:15", "Barba desenhada", "Rafael M."],
                  ["14:00", "Corte + sobrancelha", "Ana C."],
                ].map(([time, service, pro]) => (
                  <div key={time} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3.5 py-3">
                    <span className="font-mono text-sm text-brass-300">{time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-paper">{service}</p>
                      <p className="truncate text-xs text-ink-300">{pro}</p>
                    </div>
                    <Check size={16} className="text-moss-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y border-ink-100/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="max-w-lg font-display text-3xl font-medium tracking-tight md:text-4xl">
            Do primeiro acesso ao horário confirmado, em três passos.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t-2 border-ink-900 pt-5">
                <span className="font-display text-sm text-brass-500">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 className="max-w-lg font-display text-3xl font-medium tracking-tight md:text-4xl">
          Feito para a rotina de quem atende, não para planilhas.
        </h2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, text]: any) => (
            <div key={title}>
              <Icon size={22} className="text-brass-500" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="border-y border-ink-100/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="max-w-lg">
            <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">Um plano para cada fase do seu negócio.</h2>
            <p className="mt-3 text-ink-500">Comece de graça. Mude de plano quando sua agenda apertar.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-2xl border p-7 ${p.highlight ? "border-ink-900 bg-ink-900 text-paper shadow-lift" : "border-ink-100 bg-paper"}`}
              >
                {p.tag && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-brass-400 px-3 py-1 text-xs font-semibold text-ink-900">
                    {p.tag}
                  </span>
                )}
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
                <Link to={p.to} className={`mt-7 ${p.highlight ? "btn-brass" : "btn-secondary"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink-900 p-9 text-paper md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="font-display text-2xl font-medium md:text-3xl">Pronto para parar de agendar por mensagem?</h2>
            <p className="mt-2 max-w-md text-ink-300">Crie sua página de agendamento agora e compartilhe o link ainda hoje.</p>
          </div>
          <Link to="/cadastro" className="btn-brass shrink-0 px-6 py-3 text-base">
            Criar minha agenda <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-100/70 px-5 py-8 text-center text-sm text-ink-400">
        AgendaPro Local — agenda online para negócios locais.
      </footer>
    </div>
  );
}
