import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, Star, Eye, EyeOff } from "lucide-react";
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
  const [editing, setEditing] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

  const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token;

  const fetchReviews = async () => {
    setLoading(true);
    const token = await getToken();
    const { data } = await supabase.functions.invoke("admin-api", {
      body: { action: "list-reviews" },
      headers: { Authorization: `Bearer ${token}` },
    });
    setReviews(data?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const token = await getToken();
    await supabase.functions.invoke("admin-api", {
      body: { action: "upsert-review", review: editing },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: editing.id ? "Depoimento atualizado!" : "Depoimento criado!" });
    setEditing(null);
    setSaving(false);
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este depoimento?")) return;
    const token = await getToken();
    await supabase.functions.invoke("admin-api", {
      body: { action: "delete-review", id },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: "Depoimento excluído" });
    fetchReviews();
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando depoimentos...</div>;

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editing.id ? "Editar" : "Novo"} Depoimento</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
          <div><Label>Cidade</Label><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></div>
          <div><Label>URL da Foto</Label><Input value={editing.photo_url} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} /></div>
          <div><Label>URL do Vídeo</Label><Input value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} /></div>
          <div><Label>Nota (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
          <div><Label>Ordem</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
          <div className="md:col-span-2"><Label>Texto do Depoimento</Label><Textarea value={editing.review_text} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} rows={4} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
            <Label>Visível na página</Label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Depoimentos</h2>
        <Button onClick={() => setEditing({ ...emptyReview, sort_order: reviews.length })}><Plus className="w-4 h-4 mr-1" /> Novo</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-background border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {r.photo_url && <img src={r.photo_url} alt={r.name} className="w-10 h-10 rounded-full object-cover" />}
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
              <Button variant="outline" size="sm" onClick={() => setEditing(r)} className="flex-1">Editar</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id!)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="text-muted-foreground col-span-full text-center py-8">Nenhum depoimento cadastrado.</p>}
      </div>
    </div>
  );
};

export default ReviewsTab;
