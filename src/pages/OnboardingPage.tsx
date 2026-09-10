import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { BusinessHour } from "../types";
import { slugify } from "../lib/utils";

const days = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export function OnboardingPage({ onDone }: { onDone: ()=>void }) {
  const [name,setName]=useState(""); const [slug,setSlug]=useState(""); const [phone,setPhone]=useState(""); const [city,setCity]=useState(""); const [segment,setSegment]=useState("Barbearia");
  const [saving,setSaving]=useState(false); const [error,setError]=useState(""); const nav=useNavigate();

  useEffect(()=>{ supabase.auth.getUser().then(({data})=>{
    const m=data.user?.user_metadata; if(m){setName(m.establishment_name||"");setPhone(m.phone||"");setCity(m.city||"");setSegment(m.segment||"Barbearia");}
  })},[]);
  useEffect(()=>{ if(name && !slug) setSlug(slugify(name)); },[name]);

  async function submit(e:FormEvent){
    e.preventDefault();setSaving(true);setError("");
    const {data:{user}}=await supabase.auth.getUser(); if(!user){nav("/login");return;}
    const {error}=await supabase.from("establishments").upsert({owner_id:user.id,name,slug,phone,city,segment},{onConflict:"owner_id"});
    if(error){setError(error.message);setSaving(false);return;}
    const hours=days.map((_,i)=>({establishment_id:"",day_of_week:i,is_open:i>0&&i<6,open_time:"09:00",close_time:"19:00",break_start:"12:00",break_end:"13:00"}));
    const {data:est}=await supabase.from("establishments").select("id").eq("owner_id",user.id).single();
    if(est){
      await supabase.from("business_hours").delete().eq("establishment_id",est.id);
      await supabase.from("business_hours").insert(hours.map(h=>({...h,establishment_id:est.id})));
    }
    onDone();nav("/app");
  }
  return <div className="min-h-screen bg-ink-50 p-5"><div className="mx-auto max-w-xl pt-10">
    <div className="mb-6"><div className="text-sm font-bold text-brass-500">CONFIGURAÇÃO INICIAL</div><h1 className="mt-2 text-3xl font-display font-medium">Configure seu estabelecimento</h1><p className="mt-2 text-sm text-ink-400">Você poderá alterar tudo depois.</p></div>
    <form className="card p-6" onSubmit={submit}><div className="grid gap-4">
      <div><label className="label">Nome</label><input className="input" value={name} onChange={e=>{setName(e.target.value);setSlug(slugify(e.target.value))}} required/></div>
      <div><label className="label">Link público</label><div className="flex"><span className="rounded-l-xl border border-r-0 border-ink-100 bg-ink-50 px-3 py-2.5 text-sm text-ink-400">/agendar/</span><input className="input rounded-l-none" value={slug} onChange={e=>setSlug(slugify(e.target.value))} required/></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">WhatsApp</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)}/></div><div><label className="label">Cidade</label><input className="input" value={city} onChange={e=>setCity(e.target.value)}/></div></div>
      <div><label className="label">Segmento</label><select className="input" value={segment} onChange={e=>setSegment(e.target.value)}><option>Barbearia</option><option>Salão de beleza</option><option>Manicure</option><option>Estética</option><option>Tattoo</option><option>Outro</option></select></div>
    </div>
    {error&&<div className="mt-4 rounded-sq bg-clay-50 p-3 text-sm text-clay-600">{error}</div>}
    <button className="btn-primary mt-6 w-full" disabled={saving}>{saving?"Salvando...":"Concluir configuração"}</button>
    </form>
  </div></div>
}
