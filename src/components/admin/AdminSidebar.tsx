import { BarChart3, Table2, FileText, Star, LogOut, Plug, Image, DollarSign, Radio, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Tab = "dashboard" | "realtime" | "records" | "prices" | "images" | "reviews" | "texts" | "integrations";

interface AdminSidebarProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  userEmail?: string;
}

const tabs: { id: Tab; label: string; icon: React.ElementType; dot: string }[] = [
  { id: "dashboard",    label: "Dashboard",    icon: BarChart3,  dot: "bg-blue-400" },
  { id: "realtime",     label: "Tempo Real",   icon: Radio,      dot: "bg-green-400" },
  { id: "records",      label: "Registros",    icon: Table2,     dot: "bg-purple-400" },
  { id: "prices",       label: "Preços",       icon: DollarSign, dot: "bg-amber-400" },
  { id: "images",       label: "Imagens",      icon: Image,      dot: "bg-pink-400" },
  { id: "reviews",      label: "Depoimentos",  icon: Star,       dot: "bg-yellow-400" },
  { id: "texts",        label: "Textos",        icon: FileText,   dot: "bg-cyan-400" },
  { id: "integrations", label: "Integrações",  icon: Plug,       dot: "bg-orange-400" },
];

const AdminSidebar = ({ active, onTabChange, userEmail }: AdminSidebarProps) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD";

  return (
    <aside className="w-60 bg-slate-900 min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-wide">VeloxBR</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-2">Menu</p>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? tab.dot : "bg-transparent"}`} />
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        {userEmail && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{userEmail}</p>
              <p className="text-[10px] text-slate-600">Administrador</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
