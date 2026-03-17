import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ShoppingCart, CreditCard, DollarSign, RefreshCw } from "lucide-react";

interface Stats {
  total: number;
  paid: number;
  revenue: number;
  conversionRate: string;
  statusCounts: Record<string, number>;
}

const statusLabels: Record<string, string> = {
  cart_started: "Carrinho iniciado",
  identity_filled: "Identidade preenchida",
  address_filled: "Endereço preenchido",
  payment_started: "Pagamento iniciado",
  pix_generated: "PIX gerado",
  waiting_payment: "Aguardando pagamento",
  paid: "Aprovado",
  refused: "Recusado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  cart_started: "bg-yellow-500",
  identity_filled: "bg-blue-500",
  address_filled: "bg-indigo-500",
  payment_started: "bg-orange-500",
  pix_generated: "bg-purple-500",
  waiting_payment: "bg-amber-500",
  paid: "bg-green-500",
  refused: "bg-red-500",
  cancelled: "bg-gray-400",
};

const DashboardTab = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const { data } = await supabase.functions.invoke("admin-api", {
      body: { action: "dashboard-stats" },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data) setStats(data);
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading || !stats) return <div className="p-8 text-center text-muted-foreground">Carregando métricas...</div>;

  const maxCount = Math.max(...Object.values(stats.statusCounts), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={ShoppingCart} label="Total de Registros" value={stats.total.toLocaleString("pt-BR")} color="text-blue-600 bg-blue-50" />
        <KPICard icon={CreditCard} label="Vendas Aprovadas" value={stats.paid.toLocaleString("pt-BR")} color="text-green-600 bg-green-50" />
        <KPICard icon={DollarSign} label="Receita Total" value={`R$ ${(stats.revenue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color="text-emerald-600 bg-emerald-50" />
        <KPICard icon={TrendingUp} label="Taxa de Conversão" value={`${stats.conversionRate}%`} color="text-purple-600 bg-purple-50" />
      </div>

      {/* Funnel */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Funil de Conversão</h3>
        <div className="space-y-3">
          {Object.entries(stats.statusCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm w-44 text-muted-foreground truncate">{statusLabels[status] || status}</span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${statusColors[status] || "bg-gray-400"} transition-all`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-16 text-right">{count.toLocaleString("pt-BR")}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="bg-background border border-border rounded-xl p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default DashboardTab;
