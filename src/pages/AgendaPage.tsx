import { FormEvent, useEffect, useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { money, dateLongBR } from "../lib/utils";
import type { Appointment, Establishment, Professional, Service } from "../types";
import { Modal } from "../components/Modal";

export function AgendaPage({establishment}:{establishment:Establishment}) {
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [items,setItems]=useState<Appointment[]>([]);
  const [services,setServices]=useState<Service[]>([]);
  const [professionals,setProfessionals]=useState<Professional[]>([]);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({customer:"",phone:"",service:"",professional:"",time:"09:00",notes:""});
  async function load(){const [{data:a},{data:s},{data:p}]=await Promise.all([
    supabase.from("appointments").select("*,customers(name,phone),professionals(name),services(name,duration_minutes)").eq("establishment_id",establishment.id).eq("appointment_date",date).order("start_time"),
    supabase.from("services").select("*").eq("establishment_id",establishment.id).eq("active",true).order("name"),
    supabase.from("professionals").select("*").eq("establishment_id",establishment.id).eq("active",true).order("name")
  ]);setItems((a||[]) as Appointment[]);setServices(s||[]);setProfessionals(p||[]);}
  useEffect(()=>{load()},[date,establishment.id]);
  async function create(e:FormEvent){e.preventDefault();const s=services.find(x=>x.id===form.service);if(!s)return;const [h,m]=form.time.split(":").map(Number);const end=new Date(2000,0,1,h,m+s.duration_minutes);const endTime=`${String(end.getHours()).padStart(2,"0")}:${String(end.getMinutes()).padStart(2,"0")}:00`;
    let {data:c}=await supabase.from("customers").select("id").eq("establishment_id",establishment.id).eq("phone",form.phone).maybeSingle();
    if(!c){const r=await supabase.from("customers").insert({establishment_id:establishment.id,name:form.customer,phone:form.phone}).select("id").single();c=r.data;}
    if(!c)return;
    const {error}=await supabase.from("appointments").insert({establishment_id:establishment.id,customer_id:c.id,professional_id:form.professional,service_id:s.id,appointment_date:date,start_time:form.time,end_time:endTime,price:s.price,status:"scheduled",notes:form.notes});
    if(error){alert(error.message);return;}setOpen(false);setForm({customer:"",phone:"",service:"",professional:"",time:"09:00",notes:""});load();
  }
  async function cancel(id:string){if(!confirm("Cancelar este agendamento?"))return;await supabase.from("appointments").update({status:"cancelled"}).eq("id",id);load();}
  return <div><div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="text-sm text-gray-500">Agenda</div><h1 className="text-3xl font-black">{dateLongBR(date)}</h1></div><button className="btn-primary" onClick={()=>setOpen(true)}><Plus size={17}/> Novo agendamento</button></div>
    <div className="mb-4 flex items-center gap-2"><button className="btn-secondary px-3" onClick={()=>setDate(d=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()-1);return x.toISOString().slice(0,10)})}><ChevronLeft/></button><input type="date" className="input max-w-xs" value={date} onChange={e=>setDate(e.target.value)}/><button className="btn-secondary px-3" onClick={()=>setDate(d=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+1);return x.toISOString().slice(0,10)})}><ChevronRight/></button></div>
    <div className="card divide-y">{items.length===0?<div className="p-10 text-center text-sm text-gray-500">Nenhum horário agendado para este dia.</div>:items.map(a=><div className="flex flex-wrap items-center gap-4 p-4" key={a.id}><div className="w-16 font-black">{a.start_time.slice(0,5)}</div><div className="min-w-[180px] flex-1"><div className="font-bold">{a.customers?.name}</div><div className="text-sm text-gray-500">{a.services?.name} • {a.professionals?.name}</div></div><div className="font-semibold">{money(a.price)}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.status==="cancelled"?"bg-red-50 text-red-700":"bg-green-50 text-green-700"}`}>{a.status==="cancelled"?"Cancelado":"Agendado"}</span>{a.status!=="cancelled"&&<button className="text-sm font-semibold text-red-600" onClick={()=>cancel(a.id)}>Cancelar</button>}</div>)}</div>
    {open&&<Modal title="Novo agendamento" onClose={()=>setOpen(false)}><form onSubmit={create} className="grid gap-4">
      <div><label className="label">Nome do cliente</label><input className="input" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} required/></div>
      <div><label className="label">WhatsApp</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
      <div><label className="label">Serviço</label><select className="input" value={form.service} onChange={e=>setForm({...form,service:e.target.value})} required><option value="">Selecione</option>{services.map(s=><option key={s.id} value={s.id}>{s.name} — {money(s.price)}</option>)}</select></div>
      <div><label className="label">Profissional</label><select className="input" value={form.professional} onChange={e=>setForm({...form,professional:e.target.value})} required><option value="">Selecione</option>{professionals.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div><label className="label">Horário</label><input className="input" type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div>
      <button className="btn-primary">Salvar agendamento</button>
    </form></Modal>}
  </div>;
}
