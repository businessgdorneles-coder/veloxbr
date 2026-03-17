import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContentTabProps {
  section: "prices" | "images" | "texts";
}

const defaultPrices = {
  kit_interno: 17393,
  kit_completo: 26353,
  kit_interno_original: 24790,
  kit_completo_original: 37647,
};

const defaultTexts = {
  hero_title: "Tapetes automotivos sob medida para seu veículo",
  hero_subtitle: "Proteção, conforto e estilo para o interior do seu carro",
  cta_text: "COMPRAR AGORA",
};

const ContentTab = ({ section }: ContentTabProps) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const { data: result } = await supabase.functions.invoke("admin-api", {
      body: { action: "get-content", key: section },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result?.data?.value) {
      setData(result.data.value);
    } else {
      setData(section === "prices" ? defaultPrices : section === "texts" ? defaultTexts : {});
    }
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, [section]);

  const handleSave = async () => {
    setSaving(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    await supabase.functions.invoke("admin-api", {
      body: { action: "upsert-content", key: section, value: data },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: "Salvo com sucesso!" });
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  if (section === "prices") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Preços</h2>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}</Button>
        </div>
        <div className="bg-background border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Kit Interno - Preço (centavos)</Label>
            <Input type="number" value={data.kit_interno || ""} onChange={(e) => setData({ ...data, kit_interno: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground mt-1">Atual: R$ {((data.kit_interno || 0) / 100).toFixed(2).replace(".", ",")}</p>
          </div>
          <div>
            <Label>Kit Completo - Preço (centavos)</Label>
            <Input type="number" value={data.kit_completo || ""} onChange={(e) => setData({ ...data, kit_completo: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground mt-1">Atual: R$ {((data.kit_completo || 0) / 100).toFixed(2).replace(".", ",")}</p>
          </div>
          <div>
            <Label>Kit Interno - Preço Original (centavos)</Label>
            <Input type="number" value={data.kit_interno_original || ""} onChange={(e) => setData({ ...data, kit_interno_original: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground mt-1">Riscado: R$ {((data.kit_interno_original || 0) / 100).toFixed(2).replace(".", ",")}</p>
          </div>
          <div>
            <Label>Kit Completo - Preço Original (centavos)</Label>
            <Input type="number" value={data.kit_completo_original || ""} onChange={(e) => setData({ ...data, kit_completo_original: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground mt-1">Riscado: R$ {((data.kit_completo_original || 0) / 100).toFixed(2).replace(".", ",")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (section === "images") {
    const imageKeys = Object.keys(data).length ? Object.keys(data) : ["hero_image", "banner_image", "product_image_1", "product_image_2"];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Imagens</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setData({ ...data, [`image_${Date.now()}`]: "" })}> + Nova Imagem</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-6 space-y-4">
          {imageKeys.map((key) => (
            <div key={key} className="flex items-end gap-4">
              <div className="flex-1">
                <Label>{key}</Label>
                <Input value={data[key] || ""} onChange={(e) => setData({ ...data, [key]: e.target.value })} placeholder="URL da imagem" />
              </div>
              {data[key] && <img src={data[key]} alt={key} className="w-16 h-16 object-cover rounded border" />}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Cole URLs de imagens ou use o bucket de storage para uploads.</p>
        </div>
      </div>
    );
  }

  // texts section
  const textKeys = Object.keys(data).length ? Object.keys(data) : Object.keys(defaultTexts);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Textos</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setData({ ...data, [`text_${Date.now()}`]: "" })}> + Novo Texto</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-1" /> Salvar</Button>
        </div>
      </div>
      <div className="bg-background border border-border rounded-xl p-6 space-y-4">
        {textKeys.map((key) => (
          <div key={key}>
            <Label>{key.replace(/_/g, " ")}</Label>
            <Textarea value={data[key] || ""} onChange={(e) => setData({ ...data, [key]: e.target.value })} rows={2} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentTab;
