import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Establishment, Service } from "../types";
import { money } from "../lib/utils";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";

export function ServicesPage({establishment}:{establishment:Establishment}) {
  const [items,setItems]=useState<Service[]>([]);const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Service|null>(null);
  const [form,setForm]=useState({name:"",description:"",price:"",duration:"30"});
  async function load(){const {data}=await supabase.from("services").select("*").eq("establishment_id",establishment.id).order("name");setItems(data||[]);}
  useEffect(()=>{load()},[establishment.id]);
  function start(s?:Service){setEditing(s||null);setForm({name:s?.name||"",description:s?.description||"",price:String(s?.price??""),duration:String(s?.duration_minutes??30)});setOpen(true)}
  async function save(e:FormEvent){e.preventDefault();const payload={establishment_id:establishment.id,name:form.name,description:form.description,price:Number(form.price),duration_minutes:Number(form.duration),active:true};if(editing)await supabase.from("services").update(payload).eq("id",editing.id);else await supabase.from("services").insert(payload);setOpen(false);load();}
  async function remove(id:string){if(confirm("Excluir este serviço?")){await supabase.from("services").delete().eq("id",id);load();}}
  return <div><div className="mb-6 flex items-end justify-between"><div><div className="text-sm text-ink-400">Cadastro</div><h1 className="text-3xl font-display font-medium">Serviços</h1></div><button className="btn-brass" onClick={()=>start()}><Plus size={17}/> Novo serviço</button></div>
  {items.length===0?<EmptyState title="Nenhum serviço cadastrado" text="Cadastre os serviços que seus clientes poderão escolher no agendamento." action={<button className="btn-brass" onClick={()=>start()}>Cadastrar serviço</button>}/>:<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(s=><div className="card p-5" key={s.id}><div className="flex items-start justify-between"><div><h3 className="font-bold">{s.name}</h3><p className="mt-1 text-sm text-ink-400">{s.description||"Sem descrição"}</p></div><span className="rounded-full bg-moss-50 px-2 py-1 text-xs font-semibold text-moss-600">Ativo</span></div><div className="mt-5 flex items-end justify-between"><div><div className="text-xl font-display font-medium">{money(s.price)}</div><div className="text-xs text-ink-400">{s.duration_minutes} minutos</div></div><div className="flex gap-1"><button className="btn-secondary px-2.5" onClick={()=>start(s)}><Pencil size={15}/></button><button className="btn-secondary px-2.5 text-clay-500" onClick={()=>remove(s.id)}><Trash2 size={15}/></button></div></div></div>)}</div>}
  {open&&<Modal title={editing?"Editar serviço":"Novo serviço"} onClose={()=>setOpen(false)}><form onSubmit={save} className="grid gap-4"><div><label className="label">Nome</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div><label className="label">Descrição</label><textarea className="input min-h-24" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="label">Preço</label><input className="input" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/></div><div><label className="label">Duração (min)</label><input className="input" type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} required/></div></div><button className="btn-brass">Salvar</button></form></Modal>}
  </div>;
}
