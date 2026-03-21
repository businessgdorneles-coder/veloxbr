import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContentTabProps {
  section: "prices" | "images" | "texts";
}

type ContentData = Record<string, string | number>;

const defaultPrices: ContentData = {
  kit_interno: 13990,
  kit_completo: 22990,
  kit_interno_original: 49900,
  kit_completo_original: 59990,
};

const defaultTexts: ContentData = {
  hero_title: "Tapetes automotivos sob medida para seu veículo",
  hero_subtitle: "Proteção, conforto e estilo para o interior do seu carro",
  cta_text: "COMPRAR AGORA",
};

const ContentTab = ({ section }: ContentTabProps) => {
  const [data, setData] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token;

  const fetchContent = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = await getToken();
      const { data: result, error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "get-content", key: section },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      if (result?.data?.value) {
        setData(result.data.value as ContentData);
      } else {
        setData(section === "prices" ? defaultPrices : section === "texts" ? defaultTexts : {});
      }
    } catch {
      setError(true);
      toast({ title: "Erro ao carregar conteúdo", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, [section]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const { error: fnErr } = await supabase.functions.invoke("admin-api", {
        body: { action: "upsert-content", key: section, value: data },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fnErr) throw fnErr;
      toast({ title: "Salvo com sucesso!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const removeKey = (key: string) => {
    const next = { ...data };
    delete next[key];
    setData(next);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="w-10 h-10 text-destructive" />
      <p className="text-muted-foreground">Erro ao carregar conteúdo.</p>
      <Button variant="outline" onClick={fetchContent}>Tentar novamente</Button>
    </div>
  );

  if (section === "prices") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Preços</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Valores em centavos (R$ 1,00 = 100)</p>
          </div>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}</Button>
        </div>
        <div className="bg-background border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: "kit_interno", label: "Kit Interno — Preço com desconto" },
            { key: "kit_completo", label: "Kit Completo — Preço com desconto" },
            { key: "kit_interno_original", label: "Kit Interno — Preço original (riscado)" },
            { key: "kit_completo_original", label: "Kit Completo — Preço original (riscado)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                type="number"
                min={0}
                value={data[key] || ""}
                onChange={(e) => setData({ ...data, [key]: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                = R$ {(((data[key] as number) || 0) / 100).toFixed(2).replace(".", ",")}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "images") {
    const imageKeys = Object.keys(data);
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Imagens</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Cole URLs de imagens hospedadas externamente</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setData({ ...data, [`imagem_${Date.now()}`]: "" })}>+ Nova</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-6 space-y-4">
          {imageKeys.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma imagem cadastrada. Clique em "+ Nova" para adicionar.</p>}
          {imageKeys.map((key) => (
            <div key={key} className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{key}</Label>
                <Input
                  value={(data[key] as string) || ""}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {data[key] && (
                <img src={data[key] as string} alt={key} className="w-12 h-12 object-cover rounded border shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
              <button onClick={() => removeKey(key)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mb-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // texts
  const textKeys = Object.keys(data);
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Textos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Textos editáveis da página</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setData({ ...data, [`texto_${Date.now()}`]: "" })}>+ Novo</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
        </div>
      </div>
      <div className="bg-background border border-border rounded-xl p-6 space-y-4">
        {textKeys.length === 0 && <p className="text-sm text-muted-foreground">Nenhum texto cadastrado. Clique em "+ Novo" para adicionar.</p>}
        {textKeys.map((key) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">{key.replace(/_/g, " ")}</Label>
              <button onClick={() => removeKey(key)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Textarea
              value={(data[key] as string) || ""}
              onChange={(e) => setData({ ...data, [key]: e.target.value })}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentTab;
