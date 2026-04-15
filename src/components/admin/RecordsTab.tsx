import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, RefreshCw, ChevronLeft, ChevronRight, Search, FileSpreadsheet, FileText, Trash2, X, Eye, Clock, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  vehicle_type: string | null;
  selected_kit: string | null;
  selected_color: string | null;
  selected_texture: string | null;
  product_title: string | null;
  amount_cents: number | null;
  payment_method: string | null;
  payment_status: string;
  installments: number | null;
  card_last4: string | null;
  card_brand: string | null;
  transaction_id: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  src: string | null;
  sck: string | null;
  utmify_order_id: string | null;
  ip_address: string | null;
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

const allExportHeaders = [
  "Data Criação", "Atualizado em", "Nome", "Email", "Telefone", "CPF",
  "Marca", "Modelo", "Ano", "Tipo Veículo", "Kit", "Cor", "Textura", "Título Produto",
  "Valor (R$)", "Método Pgto", "Status", "Parcelas", "Bandeira Cartão", "Últimos 4", "ID Transação",
  "CEP", "Cidade", "Estado", "Endereço", "Rua", "Número", "Complemento", "Bairro",
  "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content", "UTM Term", "src", "sck",
  "Utmify Order ID", "IP", "Session ID",
];

const formatFullRow = (r: CartRecord): string[] => [
  new Date(r.created_at).toLocaleString("pt-BR"),
  new Date(r.updated_at).toLocaleString("pt-BR"),
  r.name || "", r.email || "", r.phone || "", r.cpf || "",
  r.brand || "", r.model || "", r.year || "", r.vehicle_type || "",
  r.selected_kit || "", r.selected_color || "", r.selected_texture || "", r.product_title || "",
  r.amount_cents ? (r.amount_cents / 100).toFixed(2) : "",
  r.payment_method || "", statusLabels[r.payment_status]?.label || r.payment_status,
  r.installments?.toString() || "", r.card_brand || "", r.card_last4 || "", r.transaction_id || "",
  r.cep || "", r.city || "", r.state || "", r.address || "",
  r.address_street || "", r.address_number || "", r.address_complement || "", r.neighborhood || "",
  r.utm_source || "", r.utm_medium || "", r.utm_campaign || "", r.utm_content || "", r.utm_term || "",
  r.src || "", r.sck || "", r.utmify_order_id || "",
  r.ip_address || "", r.session_id || "",
];

const RecordsTab = () => {
  const [records, setRecords] = useState<CartRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailRecord, setDetailRecord] = useState<CartRecord | null>(null);
  const [cleanupDays, setCleanupDays] = useState(7);
  const [cleanupStatus, setCleanupStatus] = useState("all");
  const [cleanupCount, setCleanupCount] = useState<number | null>(null);
  const [countingOld, setCountingOld] = useState(false);
  const [deletingOld, setDeletingOld] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data, error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "list-records", statusFilter, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, search: search || undefined, page, pageSize: PAGE_SIZE },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      setRecords(data?.data || []);
      setTotalCount(data?.count || 0);
      setSelected(new Set());
    } catch {
      toast({ title: "Erro ao carregar registros", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo, search, page]);

  // Debounce search — only fires fetchData 400ms after user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { fetchData(); }, [statusFilter, dateFrom, dateTo, debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getExportData = async (exportAll = false) => {
    setExporting(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data } = await supabase.functions.invoke("admin-api", {
        body: { action: "export-records", exportAll, statusFilter, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, search: search || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.data || [];
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = async (exportAll = false) => {
    const all = await getExportData(exportAll);
    const rows = all.map(formatFullRow);
    const csv = [allExportHeaders.join(";"), ...rows.map((r: string[]) => r.map(c => `"${c}"`).join(";"))].join("\n");
    downloadFile("\uFEFF" + csv, `registros${exportAll ? "-completo" : ""}.csv`, "text/csv;charset=utf-8;");
  };

  const exportXLSX = async (exportAll = false) => {
    const all = await getExportData(exportAll);
    const rows = all.map(formatFullRow);
    const ws = XLSX.utils.aoa_to_sheet([allExportHeaders, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `registros${exportAll ? "-completo" : ""}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = async (exportAll = false) => {
    const all = await getExportData(exportAll);
    const rows = all.map(formatFullRow);
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Registros - PrimeTAP", 14, 15);
    autoTable(doc, { head: [allExportHeaders], body: rows, startY: 22, styles: { fontSize: 4, cellPadding: 1 } });
    doc.save(`registros${exportAll ? "-completo" : ""}-${new Date().toISOString().slice(0, 10)}.pdf`);
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
    else setSelected(new Set(records.map(r => r.id)));
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchOldCount = async () => {
    setCountingOld(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data } = await supabase.functions.invoke("admin-api", {
        body: { action: "count-old-records", olderThanDays: cleanupDays, status: cleanupStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCleanupCount(data?.count ?? 0);
    } finally {
      setCountingOld(false);
    }
  };

  const exportOldRecords = async () => {
    setExporting(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const { data } = await supabase.functions.invoke("admin-api", {
        body: { action: "export-records", exportAll: true, olderThanDays: cleanupDays, statusFilter: cleanupStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = data?.data || [];
      const rows = all.map(formatFullRow);
      const ws = XLSX.utils.aoa_to_sheet([allExportHeaders, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registros");
      XLSX.writeFile(wb, `registros-antigos-${cleanupDays}dias-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const deleteOldRecords = async () => {
    if (cleanupCount === null) {
      await fetchOldCount();
      setShowDeleteConfirm(true);
      return;
    }
    setShowDeleteConfirm(false);
    setDeletingOld(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      await supabase.functions.invoke("admin-api", {
        body: { action: "bulk-delete-old", olderThanDays: cleanupDays, status: cleanupStatus },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCleanupCount(null);
      fetchData();
    } finally {
      setDeletingOld(false);
    }
  };

  const handleDeleteOldClick = async () => {
    if (cleanupCount === null) {
      await fetchOldCount();
    }
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOld = async () => {
    await deleteOldRecords();
  };

  const DetailField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="py-1.5 px-2">
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-medium break-all">{value || "—"}</span>
    </div>
  );

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
          <div className="relative" ref={exportMenuRef}>
            <Button variant="default" size="sm" onClick={() => setShowExportMenu(!showExportMenu)} disabled={exporting} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-1" /> Exportar Tudo <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
                <button onClick={() => { exportXLSX(true); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
                </button>
                <button onClick={() => { exportCSV(true); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <Download className="w-4 h-4" /> CSV (.csv)
                </button>
                <button onClick={() => { exportPDF(true); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2">
                  <FileText className="w-4 h-4" /> PDF (.pdf)
                </button>
              </div>
            )}
          </div>
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
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nome, email ou telefone" className="pl-8 w-52" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Status</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background min-w-[180px]">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">De</label>
          <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Até</label>
          <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <button onClick={() => { setStatusFilter("all"); setDateFrom(""); setDateTo(""); setSearch(""); setPage(1); }}
          className="text-sm text-primary hover:underline">Limpar filtros</button>
      </div>

      {/* Cleanup section */}
      <div className="bg-background border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-2 mr-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Limpeza</span>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Mais antigos que</label>
          <select value={cleanupDays} onChange={e => { setCleanupDays(Number(e.target.value)); setCleanupCount(null); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background">
            <option value={7}>7 dias</option>
            <option value={15}>15 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Status</label>
          <select value={cleanupStatus} onChange={e => { setCleanupStatus(e.target.value); setCleanupCount(null); }}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background min-w-[160px]">
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOldCount} disabled={countingOld}>
          {countingOld ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
          {cleanupCount !== null ? `${cleanupCount.toLocaleString("pt-BR")} encontrados` : "Contar"}
        </Button>
        <Button variant="outline" size="sm" onClick={exportOldRecords} disabled={exporting}>
          <FileSpreadsheet className="w-4 h-4 mr-1" /> Exportar antigos
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeleteOldClick} disabled={deletingOld}>
          {deletingOld ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
          Apagar antigos
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Essa ação é irreversível. Os registros apagados não poderão ser recuperados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm">
              Você está prestes a apagar{" "}
              <strong>{cleanupCount !== null ? cleanupCount.toLocaleString("pt-BR") : "..."}</strong>{" "}
              registros com mais de <strong>{cleanupDays} dias</strong>
              {cleanupStatus !== "all" && (
                <> com status <strong>{statusLabels[cleanupStatus]?.label || cleanupStatus}</strong></>
              )}.
            </p>
            {countingOld && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" /> Contando registros...
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteOld} disabled={deletingOld || countingOld || cleanupCount === null || cleanupCount === 0}>
              {deletingOld ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
              Apagar {cleanupCount !== null ? cleanupCount.toLocaleString("pt-BR") : ""} registros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {exporting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Exportando registros, aguarde...
        </div>
      )}

      {/* Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-3"><input type="checkbox" checked={selected.size === records.length && records.length > 0} onChange={toggleAll} /></th>
                <th className="px-2 py-3"></th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Data</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Nome</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">WhatsApp</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">E-mail</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">CPF</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Veículo</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Kit</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Cor</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Valor</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Parcelas</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Pgto</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Status</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">Cidade/UF</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">UTM Source</th>
                <th className="text-left px-3 py-3 font-semibold whitespace-nowrap">UTM Medium</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} /></td>
                  <td className="px-2 py-3">
                    <button onClick={() => setDetailRecord(r)} className="text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}{" "}
                    <span className="text-xs">{new Date(r.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">{r.name || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.phone ? <a href={`https://wa.me/55${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{r.phone}</a> : "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.email || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.cpf || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.brand ? `${r.brand} ${r.model || ""} ${r.year || ""}`.trim() : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.selected_kit === "completo" ? "Completo" : r.selected_kit === "interno" ? "Interno" : r.selected_kit || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.selected_color || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium">{r.amount_cents ? `R$ ${(r.amount_cents / 100).toFixed(2).replace(".", ",")}` : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.installments ? `${r.installments}x` : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap capitalize">{r.payment_method === "credit_card" ? "Cartão" : r.payment_method || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusLabels[r.payment_status]?.color || "bg-gray-100 text-gray-700"}`}>
                      {statusLabels[r.payment_status]?.label || r.payment_status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.city ? `${r.city}/${r.state}` : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.utm_source || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{r.utm_medium || "—"}</td>
                </tr>
              ))}
              {!records.length && !loading && <tr><td colSpan={17} className="px-4 py-12 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>}
              {loading && <tr><td colSpan={17} className="px-4 py-12 text-center text-muted-foreground">Carregando...</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailRecord} onOpenChange={() => setDetailRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Registro</DialogTitle>
          </DialogHeader>
          {detailRecord && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Cliente</h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailField label="Nome" value={detailRecord.name} />
                  <DetailField label="Email" value={detailRecord.email} />
                  <DetailField label="Telefone" value={detailRecord.phone} />
                  <DetailField label="CPF" value={detailRecord.cpf} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Veículo & Produto</h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailField label="Marca" value={detailRecord.brand} />
                  <DetailField label="Modelo" value={detailRecord.model} />
                  <DetailField label="Ano" value={detailRecord.year} />
                  <DetailField label="Tipo" value={detailRecord.vehicle_type} />
                  <DetailField label="Kit" value={detailRecord.selected_kit} />
                  <DetailField label="Cor" value={detailRecord.selected_color} />
                  <DetailField label="Textura" value={detailRecord.selected_texture} />
                  <DetailField label="Título Produto" value={detailRecord.product_title} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Pagamento</h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailField label="Valor" value={detailRecord.amount_cents ? `R$ ${(detailRecord.amount_cents / 100).toFixed(2).replace(".", ",")}` : null} />
                  <DetailField label="Método" value={detailRecord.payment_method} />
                  <DetailField label="Status" value={statusLabels[detailRecord.payment_status]?.label || detailRecord.payment_status} />
                  <DetailField label="Parcelas" value={detailRecord.installments?.toString()} />
                  <DetailField label="Bandeira" value={detailRecord.card_brand} />
                  <DetailField label="Últimos 4" value={detailRecord.card_last4} />
                  <DetailField label="ID Transação" value={detailRecord.transaction_id} />
                  <DetailField label="Utmify Order" value={detailRecord.utmify_order_id} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Endereço</h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailField label="CEP" value={detailRecord.cep} />
                  <DetailField label="Rua" value={detailRecord.address_street} />
                  <DetailField label="Número" value={detailRecord.address_number} />
                  <DetailField label="Complemento" value={detailRecord.address_complement} />
                  <DetailField label="Bairro" value={detailRecord.neighborhood} />
                  <DetailField label="Cidade" value={detailRecord.city} />
                  <DetailField label="Estado" value={detailRecord.state} />
                  <DetailField label="Endereço (legacy)" value={detailRecord.address} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Rastreamento (UTMs)</h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DetailField label="UTM Source" value={detailRecord.utm_source} />
                  <DetailField label="UTM Medium" value={detailRecord.utm_medium} />
                  <DetailField label="UTM Campaign" value={detailRecord.utm_campaign} />
                  <DetailField label="UTM Content" value={detailRecord.utm_content} />
                  <DetailField label="UTM Term" value={detailRecord.utm_term} />
                  <DetailField label="src" value={detailRecord.src} />
                  <DetailField label="sck" value={detailRecord.sck} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-muted-foreground mb-1 border-b pb-1">Técnico</h4>
                <div className="grid grid-cols-1 gap-x-4">
                  <DetailField label="Session ID" value={detailRecord.session_id} />
                  <DetailField label="IP" value={detailRecord.ip_address} />
                  
                  <DetailField label="Criado em" value={new Date(detailRecord.created_at).toLocaleString("pt-BR")} />
                  <DetailField label="Atualizado em" value={new Date(detailRecord.updated_at).toLocaleString("pt-BR")} />
                  <DetailField label="ID" value={detailRecord.id} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordsTab;
