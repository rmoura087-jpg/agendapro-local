import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, ExternalLink, Save, Sparkles, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { BusinessHour, Establishment } from "../types";
import { PLAN_LABELS } from "../types";

const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export function SettingsPage({ establishment }: { establishment: Establishment }) {
  const [form, setForm] = useState({ ...establishment });
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    supabase.from("business_hours").select("*").eq("establishment_id", establishment.id).order("day_of_week")
      .then(({ data }) => setHours(data || []));
  }, [establishment.id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    await supabase.from("establishments").update({
      name: form.name, slug: form.slug, description: form.description, phone: form.phone,
      whatsapp: form.whatsapp, address: form.address, city: form.city, instagram: form.instagram,
      segment: form.segment, whatsapp_notify: form.whatsapp_notify,
    }).eq("id", establishment.id);
    for (const h of hours) {
      await supabase.from("business_hours").update({
        is_open: h.is_open, open_time: h.open_time, close_time: h.close_time,
        break_start: h.break_start, break_end: h.break_end,
      }).eq("id", h.id);
    }
    setSaved("Salvo com sucesso");
    setTimeout(() => setSaved(""), 2500);
  }

  const link = `${window.location.origin}/#/agendar/${form.slug}`;

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-ink-400">Configuração</div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Configurações</h1>
      </div>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold">Estabelecimento</h2>
          <div className="mt-5 grid gap-4">
            <div><label className="label">Nome</label><input className="input" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Slug do link</label><input className="input" value={form.slug || ""} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
            <div><label className="label">Descrição</label><textarea className="input min-h-24" value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Telefone</label><input className="input" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">WhatsApp</label><input className="input" value={form.whatsapp || ""} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
            </div>
            <div><label className="label">Endereço</label><input className="input" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div><label className="label">Cidade</label><input className="input" value={form.city || ""} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div><label className="label">Instagram</label><input className="input" value={form.instagram || ""} onChange={e => setForm({ ...form, instagram: e.target.value })} /></div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold">Horário de funcionamento</h2>
          <div className="mt-5 space-y-3">
            {hours.map(h => (
              <div className="rounded-sq border border-ink-100 p-3" key={h.id}>
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={h.is_open} onChange={e => setHours(hours.map(x => x.id === h.id ? { ...x, is_open: e.target.checked } : x))} />
                    {days[h.day_of_week]}
                  </label>
                  {h.is_open && (
                    <div className="flex gap-2">
                      <input className="input w-28" type="time" value={h.open_time.slice(0, 5)} onChange={e => setHours(hours.map(x => x.id === h.id ? { ...x, open_time: e.target.value } : x))} />
                      <input className="input w-28" type="time" value={h.close_time.slice(0, 5)} onChange={e => setHours(hours.map(x => x.id === h.id ? { ...x, close_time: e.target.value } : x))} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Página pública</h2>
          <p className="mt-2 break-all text-sm text-ink-400">{link}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => navigator.clipboard?.writeText(link)}><Copy size={15} /> Copiar link</button>
            <a className="btn-secondary" href={link} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Abrir página</a>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-moss-500" />
            <h2 className="font-semibold">Notificações por WhatsApp</h2>
          </div>
          <p className="mt-2 text-sm text-ink-400">
            Quando ativado, o sistema tenta enviar uma confirmação automática por WhatsApp ao cliente após o agendamento
            (requer configurar a função <code className="rounded bg-ink-50 px-1.5 py-0.5 font-mono text-xs">send-whatsapp</code> com uma conta WhatsApp Business API — veja o README).
          </p>
          <label className="mt-4 flex w-fit items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={form.whatsapp_notify ?? true} onChange={e => setForm({ ...form, whatsapp_notify: e.target.checked })} />
            Ativar notificações automáticas
          </label>
        </div>

        <div className="card flex flex-wrap items-center justify-between gap-4 p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brass-500" />
            <p className="text-sm">
              Plano atual: <span className="font-semibold">{PLAN_LABELS[establishment.plan] ?? establishment.plan}</span>
            </p>
          </div>
          <Link to="/app/planos" className="btn-secondary">Gerenciar plano</Link>
        </div>

        <div className="lg:col-span-2">
          <button className="btn-brass">{<Save size={16} />} {saved || "Salvar configurações"}</button>
        </div>
      </form>
    </div>
  );
}
