import { useEffect, useState } from "react";
import { Search, Phone, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Customer, Establishment } from "../types";
import { EmptyState } from "../components/EmptyState";

export function ClientsPage({establishment}:{establishment:Establishment}) {
  const [items,setItems]=useState<Customer[]>([]);const [q,setQ]=useState("");
  useEffect(()=>{supabase.from("customers").select("*").eq("establishment_id",establishment.id).order("created_at",{ascending:false}).then(({data})=>setItems(data||[]))},[establishment.id]);
  const filtered=items.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.phone.includes(q));
  return <div><div className="mb-6"><div className="text-sm text-ink-400">Relacionamento</div><h1 className="text-3xl font-display font-medium">Clientes</h1></div>
  <div className="mb-4 max-w-md"><div className="relative"><Search className="absolute left-3 top-3 text-ink-300" size={17}/><input className="input pl-10" placeholder="Buscar nome ou telefone..." value={q} onChange={e=>setQ(e.target.value)}/></div></div>
  {filtered.length===0?<EmptyState title="Nenhum cliente encontrado" text="Os clientes que fizerem agendamentos aparecerão aqui."/>:<div className="card divide-y">{filtered.map(c=><div className="flex items-center gap-4 p-4" key={c.id}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass-50 text-brass-600"><Users size={18}/></div><div className="min-w-0 flex-1"><div className="font-semibold">{c.name}</div><div className="text-sm text-ink-400">{c.email||"Sem e-mail"}</div></div><a href={`tel:${c.phone}`} className="btn-secondary"><Phone size={15}/>{c.phone}</a></div>)}</div>}
  </div>
}
