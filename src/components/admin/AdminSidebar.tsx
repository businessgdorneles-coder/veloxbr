import { BarChart3, Table2, FileText, Star, LogOut, Settings, Image, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tab = "dashboard" | "records" | "prices" | "images" | "reviews" | "texts";

interface AdminSidebarProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
  { id: "records" as Tab, label: "Registros", icon: Table2 },
  { id: "prices" as Tab, label: "Preços", icon: DollarSign },
  { id: "images" as Tab, label: "Imagens", icon: Image },
  { id: "reviews" as Tab, label: "Depoimentos", icon: Star },
  { id: "texts" as Tab, label: "Textos", icon: FileText },
];

const AdminSidebar = ({ active, onTabChange }: AdminSidebarProps) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <aside className="w-56 bg-background border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg">VeloxBR</h2>
        <p className="text-xs text-muted-foreground">Painel Admin</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
              active === tab.id
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
