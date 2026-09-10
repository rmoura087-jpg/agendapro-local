import { useEffect, useState } from "react";
import { CalendarDays, Users, DollarSign, Clock3, ExternalLink, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { money } from "../lib/utils";
import type { Appointment, Establishment } from "../types";

export function DashboardPage({establishment}:{establishment:Establishment}) {
  const [appointments,setAppointments]=useState<Appointment[]>([]);
  const [customers,setCustomers]=useState(0);
  const [services,setServices]=useState(0);
  const today=new Date().toISOString().slice(0,10);
  useEffect(()=>{(async()=>{
    const [{data:a},{count:c},{count:s}]=await Promise.all([
      supabase.from("appointments").select("*,customers(name,phone),professionals(name),services(name,duration_minutes)").eq("establishment_id",establishment.id).eq("appointment_date",today).order("start_time"),
      supabase.from("customers").select("*",{count:"exact",head:true}).eq("establishment_id",establishment.id),
      supabase.from("services").select("*",{count:"exact",head:true}).eq("establishment_id",establishment.id).eq("active",true)
    ]);setAppointments((a||[]) as Appointment[]);setCustomers(c||0);setServices(s||0);
  })()},[establishment.id,today]);
  const revenue=appointments.filter(a=>a.status!=="cancelled").reduce((x,a)=>x+Number(a.price||0),0);
  const link=`${window.location.origin}/#/agendar/${establishment.slug}`;
  return <div>
    <div className="mb-6"><div className="text-sm text-ink-400">Visão geral</div><h1 className="text-3xl font-display font-medium">Olá! 👋</h1><p className="mt-1 text-ink-400">Veja o que está acontecendo hoje em {establishment.name}.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[[CalendarDays,"Agendamentos hoje",appointments.length],[Users,"Clientes",customers],[Clock3,"Serviços ativos",services],[DollarSign,"Receita agendada",money(revenue)]].map(([Icon,label,value])=><div className="card p-5" key={label as string}><Icon size={20}/><div className="mt-4 text-sm text-ink-400">{label as string}</div><div className="mt-1 text-2xl font-display font-medium">{value as any}</div></div>)}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="card"><div className="border-b border-ink-100 p-5"><h2 className="font-bold">Agenda de hoje</h2></div>
        {appointments.length===0?<div className="p-8 text-center text-sm text-ink-400">Nenhum agendamento para hoje.</div>:<div className="divide-y">{appointments.map(a=><div className="flex items-center gap-4 p-4" key={a.id}><div className="font-bold">{a.start_time.slice(0,5)}</div><div className="min-w-0 flex-1"><div className="truncate font-semibold">{a.customers?.name}</div><div className="text-xs text-ink-400">{a.services?.name} • {a.professionals?.name}</div></div><div className="text-sm font-semibold">{money(a.price)}</div></div>)}</div>}
      </div>
      <div className="card p-5"><h2 className="font-bold">Seu link de agendamento</h2><p className="mt-2 break-all text-sm text-ink-400">{link}</p><div className="mt-4 flex gap-2"><button className="btn-brass" onClick={()=>navigator.clipboard?.writeText(link)}><Copy size={16}/> Copiar</button><a className="btn-secondary" href={link} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir</a></div><Link className="mt-5 block text-sm font-semibold text-brass-500" to="/app/configuracoes">Configurar estabelecimento →</Link></div>
    </div>
  </div>;
}
