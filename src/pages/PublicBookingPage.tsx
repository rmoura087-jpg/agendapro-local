import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Establishment, Professional, Service } from "../types";
import { money, dateLongBR } from "../lib/utils";
import { CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle, ClipboardList } from "lucide-react";

export function PublicBookingPage() {
  const { slug } = useParams();
  const [est, setEst] = useState<Establishment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: e } = await supabase
        .from("establishments")
        .select("id,name,slug,description,phone,whatsapp,address,city,instagram,logo_url,cover_url,segment,plan")
        .eq("slug", slug)
        .maybeSingle();

      if (!e) { setNotFound(true); return; }
      setEst(e);

      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("services").select("*").eq("establishment_id", e.id).eq("active", true).order("name"),
        supabase.from("professionals").select("*").eq("establishment_id", e.id).eq("active", true).order("name"),
      ]);
      setServices(s || []);
      setProfessionals(p || []);
    })();
  }, [slug]);

  const selected = useMemo(() => services.find((s) => s.id === service), [services, service]);

  useEffect(() => {
    setSlot("");
    if (!est || !service || !professional || !date) { setSlots([]); return; }
    supabase
      .rpc("get_available_slots", { p_establishment_id: est.id, p_service_id: service, p_professional_id: professional, p_date: date })
      .then(({ data, error }) => {
        if (error) { setSlots([]); return; }
        setSlots((data || []).map((x: any) => x.slot));
      });
  }, [est, service, professional, date]);

  async function book() {
    setError("");
    if (!est || !selected || !slot) { setError("Escolha serviço, profissional, data e horário."); return; }
    if (!name.trim() || !phone.trim()) { setError("Preencha seu nome e WhatsApp."); return; }

    setSubmitting(true);
    const { data, error } = await supabase.rpc("create_public_appointment", {
      p_establishment_id: est.id,
      p_service_id: selected.id,
      p_professional_id: professional,
      p_date: date,
      p_start_time: slot,
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email || null,
    });
    setSubmitting(false);

    if (error) { setError(error.message); return; }
    if (data?.success === false) { setError(data.message || "Esse horário não está mais disponível."); return; }
    setDone(true);
  }

  if (notFound) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6 text-center">
        <div>
          <p className="font-display text-2xl">Página não encontrada</p>
          <p className="mt-2 text-sm text-ink-500">Confira o link com o estabelecimento.</p>
        </div>
      </div>
    );
  }

  if (!est) {
    return <div className="grid min-h-screen place-items-center bg-paper text-sm text-ink-400">Carregando...</div>;
  }

  if (done) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-5">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss-50 text-moss-500">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-medium">Agendamento confirmado!</h1>
          <p className="mt-2 text-sm text-ink-500">
            {dateLongBR(date)} às {slot.slice(0, 5)}
            <br />
            {selected?.name} com {professionals.find((p) => p.id === professional)?.name}
          </p>
          {est.whatsapp && (
            <a className="btn-brass mt-6 w-full" target="_blank" rel="noreferrer" href={`https://wa.me/${est.whatsapp.replace(/\D/g, "")}`}>
              <MessageCircle size={17} /> Falar no WhatsApp
            </a>
          )}
          <Link className="mt-4 block text-sm font-semibold text-ink-500 hover:text-ink-900" to={`/agendar/${slug}/meus-agendamentos`}>
            Ver meus agendamentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-xl p-4 sm:p-8">
        <div className="card overflow-hidden">
          <div className="bg-ink-900 p-7 text-paper">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-sq bg-brass-400 text-ink-900">
                <CalendarDays />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl">{est.name}</h1>
                <p className="text-sm text-ink-300">{est.segment || "Negócio local"}{est.city ? ` · ${est.city}` : ""}</p>
              </div>
            </div>
            {est.description && <p className="mt-5 text-sm text-ink-300">{est.description}</p>}
          </div>

          <div className="p-5 sm:p-7">
            <div className="space-y-6">
              <div>
                <label className="label">1. Escolha o serviço</label>
                {services.length === 0 ? (
                  <p className="rounded-sq bg-ink-50 p-4 text-sm text-ink-400">Nenhum serviço disponível no momento.</p>
                ) : (
                  <div className="grid gap-2">
                    {services.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setService(s.id)}
                        className={`flex items-center justify-between rounded-sq border p-4 text-left transition ${service === s.id ? "border-ink-900 bg-ink-50" : "border-ink-100 hover:border-ink-200"}`}
                      >
                        <span>
                          <b>{s.name}</b>
                          <span className="ml-2 text-xs text-ink-400">{s.duration_minutes} min</span>
                        </span>
                        <b>{money(s.price)}</b>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label">2. Escolha o profissional</label>
                <select className="input" value={professional} onChange={(e) => setProfessional(e.target.value)}>
                  <option value="">Selecione</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.specialty ? ` — ${p.specialty}` : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">3. Escolha a data</label>
                <input className="input" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              {service && professional && (
                <div>
                  <label className="label">4. Horários disponíveis</label>
                  {slots.length ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setSlot(s)}
                          className={`rounded-sq border px-3 py-2.5 text-sm font-semibold transition ${slot === s ? "border-ink-900 bg-ink-900 text-paper" : "border-ink-100 bg-white hover:border-ink-200"}`}
                        >
                          <Clock3 className="mr-1 inline" size={14} />{s.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-sq bg-ink-50 p-4 text-sm text-ink-400">Nenhum horário disponível para essa combinação.</div>
                  )}
                </div>
              )}

              {slot && (
                <div className="border-t border-ink-100 pt-6">
                  <label className="label">5. Seus dados</label>
                  <div className="grid gap-3">
                    <input className="input" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input className="input" placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    <input className="input" type="email" placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <button type="button" className="btn-brass mt-4 w-full py-3" onClick={book} disabled={submitting}>
                    {submitting ? "Confirmando..." : "Confirmar agendamento"}
                  </button>
                </div>
              )}

              {error && <div className="rounded-sq bg-clay-50 p-3 text-sm text-clay-600">{error}</div>}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-ink-400">
          {est.address && <span><MapPin className="mr-1 inline" size={13} />{est.address}</span>}
          <Link to={`/agendar/${slug}/meus-agendamentos`} className="flex items-center gap-1 font-semibold text-ink-500 hover:text-ink-900">
            <ClipboardList size={13} /> Já tenho agendamento
          </Link>
          <span>AgendaPro Local</span>
        </div>
      </div>
    </div>
  );
}
