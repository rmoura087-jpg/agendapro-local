import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, MessageCircle, TrendingUp, ArrowRight } from "lucide-react";

export function LandingPage() {
  return <div className="min-h-screen bg-white">
    <header className="border-b border-gray-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white"><CalendarDays size={18}/></span>AgendaPro <span className="text-indigo-600">Local</span></Link>
        <div className="flex gap-2"><Link className="btn-secondary" to="/login">Entrar</Link><Link className="btn-primary" to="/cadastro">Começar grátis</Link></div>
      </div>
    </header>
    <section className="bg-gradient-to-b from-gray-50 to-white px-5 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"><TrendingUp size={16}/> Feito para negócios locais</div>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">Pare de perder clientes e horários vazios.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">Deixe seus clientes agendarem sozinhos, 24 horas por dia, enquanto você controla agenda, serviços, profissionais e clientes em um só lugar.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="btn-primary px-6 py-3" to="/cadastro">Criar minha agenda <ArrowRight size={17}/></Link><Link className="btn-secondary px-6 py-3" to="/login">Já tenho conta</Link></div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-3">
      {[
        [CalendarDays, "Agendamento online", "Seu cliente escolhe serviço, profissional, data e horário sem precisar falar com você."],
        [MessageCircle, "Pronto para WhatsApp", "A estrutura já está preparada para lembretes e automações de WhatsApp."],
        [CheckCircle2, "Simples de usar", "Painel direto ao ponto para a rotina de barbearias e outros negócios locais."]
      ].map(([Icon, title, text]) => <div className="card p-6" key={title as string}><Icon size={24}/><h3 className="mt-4 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-gray-500">{text as string}</p></div>)}
    </section>
    <footer className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">AgendaPro Local • MVP SaaS</footer>
  </div>;
}
