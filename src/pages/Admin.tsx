import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Filter, RefreshCw, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface CartRecord {
  id: string;
  session_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  brand: string | null;
  model: string | null;
  year: string | null;
  vehicle_type: string | null;
  selected_color: string | null;
  selected_kit: string | null;
  selected_texture: string | null;
  product_title: string | null;
  amount_cents: number | null;
  payment_method: string | null;
  payment_status: string;
  ip_address: string | null;
  user_agent: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  cart_started: { label: "Carrinho iniciado", color: "bg-yellow-100 text-yellow-800" },
  identity_filled: { label: "Identidade preenchida", color: "bg-blue-100 text-blue-800" },
  address_filled: { label: "Endereço preenchido", color: "bg-indigo-100 text-indigo-800" },
  payment_started: { label: "Pagamento iniciado", color: "bg-orange-100 text-orange-800" },
  pix_generated: { label: "PIX gerado", color: "bg-purple-100 text-purple-800" },
  waiting_payment: { label: "Aguardando pagamento", color: "bg-amber-100 text-amber-800" },
  paid: { label: "Aprovado", color: "bg-green-100 text-green-800" },
  refused: { label: "Recusado", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
};

const PAGE_SIZE = 25;

const Admin = () => {
  const [records, setRecords] = useState<CartRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const ADMIN_PASS = "velox2025admin";

  const handleLogin = () => {
    if (adminKey === ADMIN_PASS) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("track-cart", {
        body: {
          action: "list",
          statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          pageSize: PAGE_SIZE,
        },
      });
      setRecords(data?.data || []);
      setTotalCount(data?.count || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated, fetchData]);

  const exportCSV = () => {
    if (!records.length) return;
    const headers = [
      "Data", "Nome", "Email", "Telefone", "CPF", "Marca", "Modelo", "Ano",
      "Kit", "Cor", "Valor", "Pagamento", "Status", "Cidade", "Estado", "CEP", "IP",
    ];
    const rows = records.map((r) => [
      new Date(r.created_at).toLocaleString("pt-BR"),
      r.name || "",
      r.email || "",
      r.phone || "",
      r.cpf || "",
      r.brand || "",
      r.model || "",
      r.year || "",
      r.selected_kit || "",
      r.selected_color || "",
      r.amount_cents ? (r.amount_cents / 100).toFixed(2) : "",
      r.payment_method || "",
      statusLabels[r.payment_status]?.label || r.payment_status,
      r.city || "",
      r.state || "",
      r.cep || "",
      r.ip_address || "",
    ]);

    const csvContent = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carrinhos-abandonados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-xl p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4 text-center">Painel Administrativo</h1>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Senha de acesso"
            className="w-full border border-border rounded-lg px-4 py-3 text-sm mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Carrinhos & Tentativas de Pagamento</h1>
            <p className="text-sm text-muted-foreground">{totalCount} registros encontrados</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-sm bg-background hover:bg-muted transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
            </button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-2 text-sm bg-background hover:bg-muted transition-all">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background border border-border rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-semibold block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background min-w-[180px]"
            >
              <option value="all">Todos</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
          <button
            onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
            className="text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Nome</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">WhatsApp</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">E-mail</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Veículo</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Kit</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Pagamento</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}{" "}
                      <span className="text-xs">{new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{r.name || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.phone ? (
                        <a href={`https://wa.me/55${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                          {r.phone}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.email || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.brand ? `${r.brand} ${r.model || ""} ${r.year || ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.selected_kit === "completo" ? "Completo" : r.selected_kit === "interno" ? "Interno" : r.selected_kit || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {r.amount_cents ? `R$ ${(r.amount_cents / 100).toFixed(2).replace(".", ",")}` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{r.payment_method === "credit_card" ? "Cartão" : r.payment_method || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusLabels[r.payment_status]?.color || "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[r.payment_status]?.label || r.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.city ? `${r.city}/${r.state}` : "—"}</td>
                  </tr>
                ))}
                {!records.length && !loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                      Carregando...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-muted transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
