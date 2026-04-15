import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ShoppingCart, CreditCard, DollarSign, RefreshCw, AlertCircle, LucideIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

const KPICard = ({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string; color: string }) => (
  <div className="bg-background border border-border rounded-xl p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const DashboardTab = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error: fnError } = await supabase.functions.invoke("admin-api", {
        body: { action: "dashboard-stats" },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (fnError || !data) throw new Error(fnError?.message || "Sem dados");
      setStats(data);
    } catch (err) {
      setError(true);
      toast({ title: "Erro ao carregar métricas", description: "Tente atualizar a página.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-background border border-border rounded-xl p-5 animate-pulse">
            <div className="w-9 h-9 bg-muted rounded-lg mb-3" />
            <div className="h-7 bg-muted rounded w-24 mb-2" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );

  if (error || !stats) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="w-10 h-10 text-destructive" />
      <p className="text-muted-foreground">Não foi possível carregar as métricas.</p>
      <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
        <RefreshCw className="w-4 h-4" /> Tentar novamente
      </button>
    </div>
  );

  const maxCount = Math.max(...Object.values(stats.statusCounts), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={ShoppingCart} label="Total de Registros" value={stats.total.toLocaleString("pt-BR")} color="text-blue-600 bg-blue-50" />
        <KPICard icon={CreditCard} label="Vendas Aprovadas" value={stats.paid.toLocaleString("pt-BR")} color="text-green-600 bg-green-50" />
        <KPICard icon={DollarSign} label="Receita Total" value={`R$ ${(stats.revenue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color="text-emerald-600 bg-emerald-50" />
        <KPICard icon={TrendingUp} label="Taxa de Conversão" value={`${stats.conversionRate}%`} color="text-purple-600 bg-purple-50" />
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Funil de Conversão</h3>
        {Object.keys(stats.statusCounts).length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Nenhum dado disponível ainda.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
