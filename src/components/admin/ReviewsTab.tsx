import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Save, Trash2, Star, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Review {
  id?: string;
  name: string;
  city: string;
  photo_url: string;
  review_text: string;
  video_url: string;
  rating: number;
  sort_order: number;
  visible: boolean;
}

const emptyReview: Review = { name: "", city: "", photo_url: "", review_text: "", video_url: "", rating: 5, sort_order: 0, visible: true };

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token;

  const fetchReviews = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = await getToken();
      const { data, error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "list-reviews" },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      setReviews(data?.data || []);
    } catch {
      setError(true);
      toast({ title: "Erro ao carregar depoimentos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const validate = (r: Review) => {
    if (!r.name.trim()) return "Nome é obrigatório.";
    if (!r.review_text.trim()) return "Texto do depoimento é obrigatório.";
    if (r.rating < 1 || r.rating > 5) return "Nota deve ser entre 1 e 5.";
    return "";
  };

  const handleSave = async () => {
    if (!editing) return;
    const err = validate(editing);
    if (err) { setValidationError(err); return; }
    setValidationError("");
    setSaving(true);
    try {
      const token = await getToken();
      const { error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "upsert-review", review: editing },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      toast({ title: editing.id ? "Depoimento atualizado!" : "Depoimento criado!" });
      setEditing(null);
      fetchReviews();
    } catch {
      toast({ title: "Erro ao salvar depoimento", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      const { error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "delete-review", id: deleteTarget },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      toast({ title: "Depoimento excluído" });
      setDeleteTarget(null);
      fetchReviews();
    } catch {
      toast({ title: "Erro ao excluir depoimento", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando depoimentos...</div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="w-10 h-10 text-destructive" />
      <p className="text-muted-foreground">Erro ao carregar depoimentos.</p>
      <Button variant="outline" onClick={fetchReviews}>Tentar novamente</Button>
    </div>
  );

  if (editing) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editing.id ? "Editar" : "Novo"} Depoimento</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(null); setValidationError(""); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {validationError}
          </div>
        )}

        <div className="bg-background border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ex: João Silva" />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} placeholder="Ex: São Paulo, SP" />
          </div>
          <div>
            <Label>URL da Foto</Label>
            <Input value={editing.photo_url} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} placeholder="https://..." />
            {editing.photo_url && (
              <img src={editing.photo_url} alt="Preview" className="mt-2 w-14 h-14 rounded-full object-cover border" onError={(e) => (e.currentTarget.style.display = "none")} />
            )}
          </div>
          <div>
            <Label>URL do Vídeo</Label>
            <Input value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Nota (1–5) <span className="text-destructive">*</span></Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setEditing({ ...editing, rating: n })}>
                  <Star className={`w-6 h-6 transition-colors ${n <= editing.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground self-center">{editing.rating}/5</span>
            </div>
          </div>
          <div>
            <Label>Ordem de exibição</Label>
            <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between">
              <Label>Texto do Depoimento <span className="text-destructive">*</span></Label>
              <span className="text-xs text-muted-foreground">{editing.review_text.length} caracteres</span>
            </div>
            <Textarea value={editing.review_text} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} rows={4} placeholder="Escreva o depoimento do cliente..." />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="visible-check"
              type="checkbox"
              checked={editing.visible}
              onChange={(e) => setEditing({ ...editing, visible: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="visible-check">Visível na página</Label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Depoimentos</h2>
        <Button onClick={() => { setEditing({ ...emptyReview, sort_order: reviews.length }); setValidationError(""); }}>
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {r.photo_url
                  ? <img src={r.photo_url} alt={r.name} className="w-10 h-10 rounded-full object-cover border" onError={(e) => (e.currentTarget.style.display = "none")} />
                  : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">{r.name[0]?.toUpperCase()}</div>
                }
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {r.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{r.review_text}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(r); setValidationError(""); }} className="flex-1">Editar</Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(r.id!)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="text-muted-foreground col-span-full text-center py-8">Nenhum depoimento cadastrado.</p>}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir depoimento?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsTab;
