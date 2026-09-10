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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!isSupabaseConfigured) { setError("Configure o arquivo .env com as chaves do Supabase antes de usar o sistema."); return; }
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, establishment_name: establishment, phone, city, segment } }
      });
      setLoading(false);
      if (error) setError(error.message);
      else { setMessage("Conta criada. Se a confirmação de e-mail estiver ativa no Supabase, confirme seu e-mail e depois entre."); setMode("login"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message); else navigate("/app");
    }
  }

  return (
    <div className="grid min-h-screen bg-paper md:grid-cols-2">
      <div className="hidden bg-ink-900 p-12 text-paper md:flex md:flex-col md:justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-sq bg-paper text-ink-900"><CalendarDays size={18} /></span>
          AgendaPro Local
        </Link>
        <div>
          <p className="max-w-md font-display text-4xl font-medium leading-tight">
            Sua agenda. Seu negócio. Sempre organizado.
          </p>
          <p className="mt-5 max-w-md text-ink-300">
            Um painel simples para negócios locais controlarem horários e receberem agendamentos online, 24 horas por dia.
          </p>
        </div>
        <p className="text-sm text-ink-500">© AgendaPro Local</p>
      </div>

      <div className="flex items-center justify-center p-5 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <Link to="/" className="flex items-center gap-2 font-display text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-sq bg-ink-900 text-brass-300"><CalendarDays size={16} /></span>
              AgendaPro Local
            </Link>
          </div>
          <h1 className="font-display text-3xl font-medium tracking-tight">{mode === "signup" ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
          <p className="mt-2 text-sm text-ink-500">{mode === "signup" ? "Comece sua agenda online em poucos minutos." : "Entre para acessar seu painel."}</p>

          {mode === "signup" && (
            <div className="mt-6 grid gap-4">
              <div><label className="label">Seu nome</label><input className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><label className="label">Nome do estabelecimento</label><input className="input" value={establishment} onChange={e => setEstablishment(e.target.value)} required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">WhatsApp</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(51) 99999-9999" /></div>
                <div><label className="label">Cidade</label><input className="input" value={city} onChange={e => setCity(e.target.value)} placeholder="Porto Alegre" /></div>
              </div>
              <div>
                <label className="label">Segmento</label>
                <select className="input" value={segment} onChange={e => setSegment(e.target.value)}>
                  <option>Barbearia</option><option>Salão de beleza</option><option>Manicure</option><option>Estética</option><option>Tattoo</option><option>Outro</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-4">
            <div><label className="label">E-mail</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><label className="label">Senha</label><input className="input" type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></div>
          </div>

          {error && <div className="mt-4 rounded-sq bg-clay-50 p-3 text-sm text-clay-600">{error}</div>}
          {message && <div className="mt-4 rounded-sq bg-moss-50 p-3 text-sm text-moss-600">{message}</div>}

          <button className="btn-brass mt-5 w-full py-3" disabled={loading}>
            {loading ? "Um instante..." : mode === "signup" ? "Criar conta" : "Entrar"}
          </button>
          <button type="button" className="mt-4 w-full text-sm font-semibold text-ink-600 hover:text-ink-900" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setMessage(""); }}>
            {mode === "signup" ? "Já tenho uma conta" : "Ainda não tenho conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
