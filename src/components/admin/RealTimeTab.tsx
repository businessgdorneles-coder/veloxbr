import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingCart, CreditCard, CheckCircle, Wifi, WifiOff } from "lucide-react";

interface Stats {
  visitorsHome: number;
  visitorsCheckout: number;
  openCarts: number;
  buyingNow: number;
  paidToday: number;
  revenueTodayCents: number;
}

interface PresenceState {
  page: "home" | "checkout" | "admin";
  step?: number | null;
  ts: number;
}

const ADMIN_SESSION = "admin-realtime-observer";

const fmt = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Metric = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  pulse,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  pulse?: boolean;
}) => (
  <div className="bg-background border border-border rounded-xl p-5 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold">{value}</p>
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

const RealTimeTab = () => {
  const [stats, setStats] = useState<Stats>({
    visitorsHome: 0,
    visitorsCheckout: 0,
    openCarts: 0,
    buyingNow: 0,
    paidToday: 0,
    revenueTodayCents: 0,
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchCartStats = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("abandoned_carts")
      .select("payment_status, amount_cents, updated_at")
      .gte("created_at", todayStart.toISOString());

    if (!data) return;

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    let openCarts = 0;
    let buyingNow = 0;
    let paidToday = 0;
    let revenueTodayCents = 0;

    for (const cart of data) {
      const status = cart.payment_status;
      if (status === "paid") {
        paidToday++;
        revenueTodayCents += cart.amount_cents || 0;
      } else if (
        ["identity_filled", "address_filled", "pix_pending", "payment_initiated", "pending"].includes(status ?? "")
      ) {
        openCarts++;
        if (cart.updated_at >= fifteenMinsAgo) buyingNow++;
      }
    }

    setStats((prev) => ({ ...prev, openCarts, buyingNow, paidToday, revenueTodayCents }));
    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchCartStats();

    // Realtime subscription on abandoned_carts
    const cartsChannel = supabase
      .channel("admin-carts-watch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "abandoned_carts" },
        () => fetchCartStats()
      )
      .subscribe();

    // Presence channel — join as admin observer
    const presenceChannel = supabase.channel("visitor-presence", {
      config: { presence: { key: ADMIN_SESSION } },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState<PresenceState>();
        let home = 0;
        let checkout = 0;
        for (const [key, presences] of Object.entries(state)) {
          if (key === ADMIN_SESSION) continue;
          const latest = (presences as PresenceState[]).at(-1);
          if (!latest) continue;
          if (latest.page === "home") home++;
          else if (latest.page === "checkout") checkout++;
        }
        setStats((prev) => ({ ...prev, visitorsHome: home, visitorsCheckout: checkout }));
        setLastUpdate(new Date());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
          await presenceChannel.track({ page: "admin", ts: Date.now() });
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnected(false);
        }
      });

    presenceChannelRef.current = presenceChannel;

    // Refresh cart stats every 30s as fallback
    const interval = setInterval(fetchCartStats, 30_000);

    return () => {
      supabase.removeChannel(cartsChannel);
      supabase.removeChannel(presenceChannel);
      clearInterval(interval);
    };
  }, []);

  const totalVisitors = stats.visitorsHome + stats.visitorsCheckout;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tempo Real</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Atualizado automaticamente</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {connected ? (
            <span className="flex items-center gap-1.5 text-green-600 font-medium">
              <Wifi className="w-3.5 h-3.5" /> Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <WifiOff className="w-3.5 h-3.5" /> Reconectando...
            </span>
          )}
          {lastUpdate && (
            <span className="text-muted-foreground">
              · {lastUpdate.toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric
          icon={Users}
          label="Visitantes na página agora"
          value={totalVisitors}
          sub={`${stats.visitorsHome} na home · ${stats.visitorsCheckout} no checkout`}
          color="bg-blue-500/10 text-blue-600"
          pulse={totalVisitors > 0}
        />
        <Metric
          icon={ShoppingCart}
          label="Carrinhos abertos hoje"
          value={stats.openCarts}
          sub="Iniciaram mas não pagaram"
          color="bg-amber-500/10 text-amber-600"
        />
        <Metric
          icon={CreditCard}
          label="Comprando agora"
          value={stats.buyingNow}
          sub="Ativos nos últimos 15 min"
          color="bg-purple-500/10 text-purple-600"
          pulse={stats.buyingNow > 0}
        />
        <Metric
          icon={CheckCircle}
          label="Pedidos pagos hoje"
          value={stats.paidToday}
          sub={stats.revenueTodayCents > 0 ? fmt(stats.revenueTodayCents) + " em vendas" : "Nenhum ainda"}
          color="bg-green-500/10 text-green-600"
        />
      </div>

      {/* Checkout funnel breakdown */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Visitantes no checkout agora</h3>
        {stats.visitorsCheckout === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum visitante no checkout no momento.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-32 text-sm text-muted-foreground">No checkout</div>
              <div className="flex-1 bg-muted rounded-full h-2.5">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="w-8 text-sm font-semibold text-right">{stats.visitorsCheckout}</div>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground">
        * Visitantes são rastreados via presença em tempo real (Supabase Realtime). Carrinhos e pedidos são atualizados automaticamente ao surgir novos registros.
      </p>
    </div>
  );
};

export default RealTimeTab;
