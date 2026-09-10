import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { CalendarDays } from "lucide-react";

export function AuthPage({ signup = false }: { signup?: boolean }) {
  const [mode, setMode] = useState(signup ? "signup" : "login");
  const [name, setName] = useState("");
  const [establishment, setEstablishment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [segment, setSegment] = useState("Barbearia");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!isSupabaseConfigured) { setError("Configure o arquivo .env com as chaves do Supabase antes de usar o sistema."); return; }
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, establishment_name: establishment, phone, city, segment } }
      });
      if (error) setError(error.message);
      else { setMessage("Conta criada. Se a confirmação de e-mail estiver ativa no Supabase, confirme seu e-mail e depois entre."); setMode("login"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message); else navigate("/app");
    }
  }

  return <div className="grid min-h-screen bg-gray-50 md:grid-cols-2">
    <div className="hidden bg-gray-900 p-12 text-white md:flex md:flex-col md:justify-between">
      <Link to="/" className="flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-gray-900"><CalendarDays size={18}/></span>AgendaPro Local</Link>
      <div><div className="mb-4 text-4xl font-black">Sua agenda.<br/>Seu negócio.<br/>Mais organizado.</div><p className="max-w-md text-gray-400">Um SaaS simples para negócios locais controlarem horários e receberem agendamentos online.</p></div>
      <div className="text-sm text-gray-500">© AgendaPro Local</div>
    </div>
    <div className="flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md">
        <div className="mb-7 md:hidden"><Link to="/" className="font-black">AgendaPro Local</Link></div>
        <h1 className="text-3xl font-black">{mode === "signup" ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
        <p className="mt-2 text-sm text-gray-500">{mode === "signup" ? "Comece sua agenda online." : "Entre para acessar seu painel."}</p>
        {mode === "signup" && <div className="mt-6 grid gap-4">
          <div><label className="label">Seu nome</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required /></div>
          <div><label className="label">Nome do estabelecimento</label><input className="input" value={establishment} onChange={e=>setEstablishment(e.target.value)} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">WhatsApp</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(51) 99999-9999"/></div>
            <div><label className="label">Cidade</label><input className="input" value={city} onChange={e=>setCity(e.target.value)} placeholder="Porto Alegre"/></div>
          </div>
          <div><label className="label">Segmento</label><select className="input" value={segment} onChange={e=>setSegment(e.target.value)}><option>Barbearia</option><option>Salão de beleza</option><option>Manicure</option><option>Estética</option><option>Tattoo</option><option>Outro</option></select></div>
        </div>}
        <div className="mt-4 grid gap-4">
          <div><label className="label">E-mail</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div><label className="label">Senha</label><input className="input" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        </div>
        {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        <button className="btn-primary mt-5 w-full py-3">{mode === "signup" ? "Criar conta" : "Entrar"}</button>
        <button type="button" className="mt-4 w-full text-sm font-semibold text-indigo-600" onClick={()=>{setMode(mode==="signup"?"login":"signup");setError("");setMessage("")}}>
          {mode === "signup" ? "Já tenho uma conta" : "Ainda não tenho conta"}
        </button>
      </form>
    </div>
  </div>;
}
