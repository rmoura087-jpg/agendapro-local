import { FormEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Establishment, Professional } from "../types";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";

export function ProfessionalsPage({establishment}:{establishment:Establishment}) {
  const [items,setItems]=useState<Professional[]>([]);const [open,setOpen]=useState(false);const [editing,setEditing]=useState<Professional|null>(null);const [form,setForm]=useState({name:"",specialty:"",phone:""});
  async function load(){const {data}=await supabase.from("professionals").select("*").eq("establishment_id",establishment.id).order("name");setItems(data||[])}
  useEffect(()=>{load()},[establishment.id]);
  function start(p?:Professional){setEditing(p||null);setForm({name:p?.name||"",specialty:p?.specialty||"",phone:p?.phone||""});setOpen(true)}
  async function save(e:FormEvent){e.preventDefault();const payload={establishment_id:establishment.id,name:form.name,specialty:form.specialty,phone:form.phone,active:true};if(editing)await supabase.from("professionals").update(payload).eq("id",editing.id);else await supabase.from("professionals").insert(payload);setOpen(false);load()}
  async function remove(id:string){if(confirm("Excluir este profissional?")){await supabase.from("professionals").delete().eq("id",id);load()}}
  return <div><div className="mb-6 flex items-end justify-between"><div><div className="text-sm text-ink-400">Equipe</div><h1 className="text-3xl font-display font-medium">Profissionais</h1></div><button className="btn-brass" onClick={()=>start()}><Plus size={17}/> Novo profissional</button></div>
  {items.length===0?<EmptyState title="Nenhum profissional cadastrado" text="Cadastre quem realiza os serviços para liberar a agenda pública." action={<button className="btn-brass" onClick={()=>start()}>Cadastrar profissional</button>}/>:<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(p=><div className="card p-5" key={p.id}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 font-bold">{p.name.slice(0,1).toUpperCase()}</div><h3 className="mt-4 font-bold">{p.name}</h3><p className="text-sm text-ink-400">{p.specialty||"Profissional"}</p><p className="mt-1 text-xs text-ink-300">{p.phone}</p><div className="mt-5 flex gap-2"><button className="btn-secondary flex-1" onClick={()=>start(p)}><Pencil size={15}/> Editar</button><button className="btn-secondary px-3 text-clay-500" onClick={()=>remove(p.id)}><Trash2 size={15}/></button></div></div>)}</div>}
  {open&&<Modal title={editing?"Editar profissional":"Novo profissional"} onClose={()=>setOpen(false)}><form onSubmit={save} className="grid gap-4"><div><label className="label">Nome</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div><div><label className="label">Especialidade</label><input className="input" value={form.specialty} onChange={e=>setForm({...form,specialty:e.target.value})} placeholder="Barbeiro, cabeleireiro..."/></div><div><label className="label">Telefone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><button className="btn-brass">Salvar</button></form></Modal>}
  </div>
}
