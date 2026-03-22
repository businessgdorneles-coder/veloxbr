import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import RealTimeTab from "@/components/admin/RealTimeTab";
import RecordsTab from "@/components/admin/RecordsTab";
import ContentTab from "@/components/admin/ContentTab";
import ReviewsTab from "@/components/admin/ReviewsTab";
import IntegrationsTab from "@/components/admin/IntegrationsTab";
import { Bell } from "lucide-react";

type Tab = "dashboard" | "realtime" | "records" | "prices" | "images" | "reviews" | "texts" | "integrations";

const VALID_TABS: Tab[] = ["dashboard", "realtime", "records", "prices", "images", "reviews", "texts", "integrations"];

const TAB_LABELS: Record<Tab, string> = {
  dashboard:    "Dashboard",
  realtime:     "Tempo Real",
  records:      "Registros",
  prices:       "Preços",
  images:       "Imagens",
  reviews:      "Depoimentos",
  texts:        "Textos",
  integrations: "Integrações",
};

const getTabFromHash = (): Tab => {
  const hash = window.location.hash.replace("#", "") as Tab;
  return VALID_TABS.includes(hash) ? hash : "dashboard";
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);
  const [now, setNow] = useState(new Date());

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  useEffect(() => {
    const onHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (!session) return (
    <AdminLogin onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />
  );

  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar
        active={activeTab}
        onTabChange={handleTabChange}
        userEmail={session.user.email}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="font-semibold text-slate-800 text-sm">{TAB_LABELS[activeTab]}</h1>
            <p className="text-[11px] text-slate-400 capitalize">{dateStr} · {timeStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="text-right">
              <p className="text-xs font-medium text-slate-700 truncate max-w-[160px]">{session.user.email}</p>
              <p className="text-[10px] text-slate-400">Administrador</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard"    && <DashboardTab />}
          {activeTab === "realtime"     && <RealTimeTab />}
          {activeTab === "records"      && <RecordsTab />}
          {activeTab === "prices"       && <ContentTab section="prices" />}
          {activeTab === "images"       && <ContentTab section="images" />}
          {activeTab === "reviews"      && <ReviewsTab />}
          {activeTab === "texts"        && <ContentTab section="texts" />}
          {activeTab === "integrations" && <IntegrationsTab />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
