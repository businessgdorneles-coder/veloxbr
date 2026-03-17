import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, RefreshCw, ChevronLeft, ChevronRight, Search, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  selected_kit: string | null;
  selected_color: string | null;
  amount_cents: number | null;
  payment_method: string | null;
  payment_status: string;
  utm_source: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  ip_address: string | null;
  created_at: string;
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

const RecordsTab = () => {
  const [records, setRecords] = useState<CartRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const { data } = await supabase.functions.invoke("admin-api", {
      body: { action: "list-records", statusFilter, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, search: search || undefined, page, pageSize: PAGE_SIZE },
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecords(data?.data || []);
    setTotalCount(data?.count || 0);
    setSelected(new Set());
    setLoading(false);
  }, [statusFilter, dateFrom, dateTo, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getExportData = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const { data } = await supabase.functions.invoke("admin-api", {
      body: { action: "export-records", statusFilter, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, search: search || undefined },
      headers: { Authorization: `Bearer ${token}` },
    });
    return data?.data || records;
  };

  const formatRow = (r: CartRecord) => ([
    new Date(r.created_at).toLocaleString("pt-BR"),
    r.name || "", r.email || "", r.phone || "", r.cpf || "",
    r.brand || "", r.model || "", r.year || "",
    r.selected_kit || "", r.selected_color || "",
    r.amount_cents ? (r.amount_cents / 100).toFixed(2) : "",
    r.payment_method || "",
    statusLabels[r.payment_status]?.label || r.payment_status,
    r.utm_source || "", r.city || "", r.state || "", r.cep || "",
  ]);

  const headers = ["Data", "Nome", "Email", "Telefone", "CPF", "Marca", "Modelo", "Ano", "Kit", "Cor", "Valor", "Pagamento", "Status", "Origem", "Cidade", "Estado", "CEP"];

  const exportCSV = async () => {
    const all = await getExportData();
    const rows = all.map(formatRow);
    const csv = [headers.join(";"), ...rows.map((r: string[]) => r.map((c) => `"${c}"`).join(";"))].join("\n");
    downloadFile("\uFEFF" + csv, "registros.csv", "text/csv;charset=utf-8;");
  };

  const exportXLSX = async () => {
    const all = await getExportData();
    const rows = all.map(formatRow);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `registros-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = async () => {
    const all = await getExportData();
    const rows = all.map(formatRow);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Registros - VeloxBR", 14, 15);
    autoTable(doc, { head: [headers], body: rows, startY: 22, styles: { fontSize: 6 } });
    doc.save(`registros-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSelected = async () => {
    if (!selected.size || !confirm(`Excluir ${selected.size} registros?`)) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    await supabase.functions.invoke("admin-api", {
      body: { action: "delete-records", ids: Array.from(selected) },
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === records.length) setSelected(new Set());
    else setSelected(new Set(records.map((r) => r.id)));
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Registros</h2>
          <p className="text-sm text-muted-foreground">{totalCount.toLocaleString("pt-BR")} registros</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportXLSX}><FileSpreadsheet className="w-4 h-4 mr-1" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="w-4 h-4 mr-1" /> PDF</Button>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4 mr-1" /> Excluir ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold block mb-1">Buscar</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Nome, email ou telefone"
              className="pl-8 w-52"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background min-w-[180px]">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">De</label>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Até</label>
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <button onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setSearch(""); setPage(1); }}
          className="text-sm text-primary hover:underline">Limpar filtros</button>
      </div>

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-3"><input type="checkbox" checked={selected.size === records.length && records.length > 0} onChange={toggleAll} /></th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Data</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Nome</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">WhatsApp</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">E-mail</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Veículo</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Kit</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Valor</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Pagamento</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Origem</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Cidade</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}{" "}
                    <span className="text-xs">{new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">{r.name || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.phone ? <a href={`https://wa.me/55${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{r.phone}</a> : "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.email || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.brand ? `${r.brand} ${r.model || ""} ${r.year || ""}` : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.selected_kit === "completo" ? "Completo" : r.selected_kit === "interno" ? "Interno" : r.selected_kit || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">{r.amount_cents ? `R$ ${(r.amount_cents / 100).toFixed(2).replace(".", ",")}` : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap capitalize">{r.payment_method === "credit_card" ? "Cartão" : r.payment_method || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusLabels[r.payment_status]?.color || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[r.payment_status]?.label || r.payment_status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.utm_source ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground capitalize">{r.utm_source}</span> : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.city ? `${r.city}/${r.state}` : "—"}</td>
                </tr>
              ))}
              {!records.length && !loading && <tr><td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>}
              {loading && <tr><td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">Carregando...</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsTab;
