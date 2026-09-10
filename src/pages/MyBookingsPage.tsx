import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { CustomerAppointment, Establishment } from "../types";
import { money, dateBR } from "../lib/utils";
import { ArrowLeft, CalendarDays, Search } from "lucide-react";

const statusLabel: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

const statusStyle: Record<string, string> = {
  scheduled: "bg-brass-50 text-brass-700",
  confirmed: "bg-moss-50 text-moss-600",
  completed: "bg-ink-100 text-ink-500",
  cancelled: "bg-clay-50 text-clay-600",
  no_show: "bg-clay-50 text-clay-600",
};

export function MyBookingsPage() {
  const { slug } = useParams();
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CustomerAppointment[]>([]);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [error, setError] = useState("");

  async function search(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true); setSearched(true);

    const { data: est } = await supabase.from("establishments").select("id,name,slug").eq("slug", slug).maybeSingle();
    if (!est) { setError("Estabelecimento não encontrado."); setLoading(false); return; }
    setEstablishment(est as Establishment);

    const { data, error } = await supabase.rpc("get_customer_appointments", {
      p_establishment_id: est.id,
      p_phone: phone.trim(),
    });
    setLoading(false);
    if (error) { setError("Não foi possível buscar seus agendamentos agora."); return; }
    setItems(data || []);
  }

  async function cancel(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    const { data, error } = await supabase.rpc("cancel_customer_appointment", { p_appointment_id: id, p_phone: phone.trim() });
    if (error || data?.success === false) {
      alert(data?.message || "Não foi possível cancelar. Tente novamente.");
      return;
    }
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-xl p-4 sm:p-8">
        <Link to={`/agendar/${slug}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900">
          <ArrowLeft size={15} /> Voltar para agendamento
        </Link>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 bg-ink-900 p-6 text-paper">
            <div className="grid h-11 w-11 place-items-center rounded-sq bg-brass-400 text-ink-900"><CalendarDays size={19} /></div>
            <div>
              <h1 className="font-display text-lg">Meus agendamentos</h1>
              <p className="text-sm text-ink-300">{establishment?.name || "Consulte pelo seu WhatsApp"}</p>
            </div>
          </div>

          <form onSubmit={search} className="flex gap-2 p-5 sm:p-7">
            <input className="input" placeholder="Seu WhatsApp (com DDD)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <button className="btn-brass shrink-0" disabled={loading}><Search size={16} />{loading ? "Buscando" : "Buscar"}</button>
          </form>

          {error && <div className="mx-5 mb-5 rounded-sq bg-clay-50 p-3 text-sm text-clay-600 sm:mx-7">{error}</div>}

          {searched && !loading && !error && (
            items.length === 0 ? (
              <p className="px-5 pb-7 text-sm text-ink-400 sm:px-7">Nenhum agendamento encontrado para esse número.</p>
            ) : (
              <div className="divide-y divide-ink-100 border-t border-ink-100">
                {items.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 p-5 sm:px-7">
                    <div className="w-16 shrink-0 font-mono text-sm font-semibold">{a.start_time.slice(0, 5)}</div>
                    <div className="min-w-[160px] flex-1">
                      <p className="font-semibold">{a.service_name}</p>
                      <p className="text-xs text-ink-400">{dateBR(a.appointment_date)} · {a.professional_name}</p>
                    </div>
                    <p className="text-sm font-semibold">{money(a.price)}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[a.status] || "bg-ink-100 text-ink-500"}`}>
                      {statusLabel[a.status] || a.status}
                    </span>
                    {(a.status === "scheduled" || a.status === "confirmed") && (
                      <button className="text-sm font-semibold text-clay-500 hover:text-clay-600" onClick={() => cancel(a.id)}>
                        Cancelar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
