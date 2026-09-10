import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";
import {
  CalendarDays, Users, Scissors, Settings, LayoutDashboard, LogOut,
  Menu, X, ExternalLink, ChevronRight, Sparkles,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import type { Establishment } from "./types";
import { PLAN_LABELS } from "./types";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AgendaPage } from "./pages/AgendaPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProfessionalsPage } from "./pages/ProfessionalsPage";
import { ClientsPage } from "./pages/ClientsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PlansPage } from "./pages/PlansPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { LandingPage } from "./pages/LandingPage";

const navItems = [
  ["/app", "Visão geral", LayoutDashboard],
  ["/app/agenda", "Agenda", CalendarDays],
  ["/app/servicos", "Serviços", Scissors],
  ["/app/profissionais", "Profissionais", Users],
  ["/app/clientes", "Clientes", Users],
  ["/app/planos", "Planos", Sparkles],
  ["/app/configuracoes", "Configurações", Settings],
] as const;

function AppShell({ establishment, onLogout }: { establishment: Establishment; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const bookingUrl = `${window.location.origin}/#/agendar/${establishment.slug}`;

  return (
    <div className="min-h-screen bg-ink-50/40">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="btn-secondary px-2.5 md:hidden" onClick={() => setOpen(!open)}>
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
            <Link to="/app" className="flex items-center gap-2 font-display text-lg">
              <span className="grid h-9 w-9 place-items-center rounded-sq bg-ink-900 text-brass-300"><CalendarDays size={19} /></span>
              <span className="hidden sm:inline">AgendaPro <span className="text-brass-500">Local</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <a className="btn-secondary hidden sm:inline-flex" href={bookingUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Página de agendamento
            </a>
            <button className="btn-secondary px-3" onClick={onLogout}><LogOut size={16} /><span className="hidden sm:inline">Sair</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className={`fixed inset-y-16 left-0 z-20 w-64 overflow-y-auto border-r border-ink-100 bg-white p-4 md:static md:block ${open ? "block" : "hidden"}`}>
          <div className="mb-5 rounded-2xl bg-ink-900 p-4 text-paper">
            <div className="mb-1 text-xs text-ink-400">Seu estabelecimento</div>
            <div className="truncate font-display text-base">{establishment.name}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-ink-400">
              <span>{establishment.city || "Brasil"}</span>
              <span className="rounded-full bg-brass-400/20 px-2 py-0.5 font-semibold text-brass-300">
                {PLAN_LABELS[establishment.plan] ?? establishment.plan}
              </span>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map(([to, label, Icon]) => {
              const active = location.pathname === to || (to !== "/app" && location.pathname.startsWith(to));
              return (
                <Link key={to} to={to} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-sq px-3 py-2.5 text-sm font-medium ${active ? "bg-ink-900 text-paper" : "text-ink-500 hover:bg-ink-50"}`}>
                  <Icon size={18} />{label}<ChevronRight size={15} className="ml-auto opacity-40" />
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Routes>
            <Route index element={<DashboardPage establishment={establishment} />} />
            <Route path="agenda" element={<AgendaPage establishment={establishment} />} />
            <Route path="servicos" element={<ServicesPage establishment={establishment} />} />
            <Route path="profissionais" element={<ProfessionalsPage establishment={establishment} />} />
            <Route path="clientes" element={<ClientsPage establishment={establishment} />} />
            <Route path="planos" element={<PlansPage establishment={establishment} />} />
            <Route path="configuracoes" element={<SettingsPage establishment={establishment} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadEstablishment(userId: string) {
    const { data } = await supabase.from("establishments").select("*").eq("owner_id", userId).maybeSingle();
    setEstablishment(data);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadEstablishment(data.session.user.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) loadEstablishment(next.user.id);
      else setEstablishment(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="grid min-h-screen place-items-center bg-paper"><div className="text-sm text-ink-400">Carregando...</div></div>;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/agendar/:slug" element={<PublicBookingPage />} />
      <Route path="/agendar/:slug/meus-agendamentos" element={<MyBookingsPage />} />
      <Route path="/login" element={session ? <Navigate to="/app" replace /> : <AuthPage />} />
      <Route path="/cadastro" element={session ? <Navigate to="/app" replace /> : <AuthPage signup />} />
      <Route path="/onboarding" element={session ? <OnboardingPage onDone={() => loadEstablishment(session.user.id)} /> : <Navigate to="/login" replace />} />
      <Route path="/app/*" element={
        session ? (
          establishment ? <AppShell establishment={establishment} onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/onboarding" replace />
        ) : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6 text-center">
      <div>
        <div className="mb-3 font-display text-5xl">404</div>
        <p className="mb-5 text-ink-500">Página não encontrada.</p>
        <Link className="btn-brass" to="/">Voltar ao início</Link>
      </div>
    </div>
  );
}
