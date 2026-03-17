import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import RecordsTab from "@/components/admin/RecordsTab";
import ContentTab from "@/components/admin/ContentTab";
import ReviewsTab from "@/components/admin/ReviewsTab";

type Tab = "dashboard" | "records" | "prices" | "images" | "reviews" | "texts";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!session) return <AdminLogin onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar active={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "records" && <RecordsTab />}
        {activeTab === "prices" && <ContentTab section="prices" />}
        {activeTab === "images" && <ContentTab section="images" />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "texts" && <ContentTab section="texts" />}
      </main>
    </div>
  );
};

export default Admin;
