import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Save, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface IntegrationConfig {
  meta_pixel_id: string;
  meta_capi_token: string;
  tiktok_token: string;
  utmify_token: string;
  meta_pixel_id_set: boolean;
  meta_capi_token_set: boolean;
  tiktok_token_set: boolean;
  utmify_token_set: boolean;
}

const StatusBadge = ({ set }: { set: boolean }) =>
  set ? (
    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Configurado
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <XCircle className="w-3.5 h-3.5" /> Não configurado
    </span>
  );

const SecretInput = ({
  label,
  description,
  value,
  onChange,
  placeholder,
  isSet,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isSet: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <StatusBadge set={isSet} />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSet ? "••••••••  (deixe em branco para manter)" : placeholder}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm pr-10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const IntegrationsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig>({
    meta_pixel_id: "",
    meta_capi_token: "",
    tiktok_token: "",
    utmify_token: "",
    meta_pixel_id_set: false,
    meta_capi_token_set: false,
    tiktok_token_set: false,
    utmify_token_set: false,
  });
  const [form, setForm] = useState({
    meta_pixel_id: "",
    meta_capi_token: "",
    tiktok_token: "",
    utmify_token: "",
  });

  const callAdmin = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("admin-api", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await callAdmin({ action: "get-integrations" });
      setConfig(data);
      setForm({
        meta_pixel_id: data.meta_pixel_id || "",
        meta_capi_token: "",
        tiktok_token: "",
        utmify_token: "",
      });
    } catch {
      toast({ title: "Erro ao carregar integrações", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await callAdmin({
        action: "save-integrations",
        meta_pixel_id: form.meta_pixel_id,
        meta_capi_token: form.meta_capi_token || undefined,
        tiktok_token: form.tiktok_token || undefined,
        utmify_token: form.utmify_token || undefined,
      });
      toast({ title: "Integrações salvas com sucesso!" });
      await load();
    } catch {
      toast({ title: "Erro ao salvar integrações", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Integrações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure as chaves de rastreamento de conversão. Os dados são armazenados de forma segura e nunca expostos no frontend.
        </p>
      </div>

      {/* Meta */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Meta (Facebook)</h3>
            <p className="text-xs text-muted-foreground">Pixel + Conversions API</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pixel ID</label>
              <StatusBadge set={config.meta_pixel_id_set} />
            </div>
            <p className="text-xs text-muted-foreground">
              Encontre em: Meta Business → Events Manager → seu Pixel → Configurações
            </p>
            <input
              type="text"
              value={form.meta_pixel_id}
              onChange={(e) => setForm((f) => ({ ...f, meta_pixel_id: e.target.value }))}
              placeholder="Ex: 1234567890123456"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <SecretInput
            label="CAPI Token"
            description="Encontre em: Events Manager → seu Pixel → Configurações → Conversions API → Gerar token"
            value={form.meta_capi_token}
            onChange={(v) => setForm((f) => ({ ...f, meta_capi_token: v }))}
            placeholder="EAAxxxxxxx..."
            isSet={config.meta_capi_token_set}
          />
        </div>
      </div>

      {/* TikTok */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">TikTok</h3>
            <p className="text-xs text-muted-foreground">Events API</p>
          </div>
        </div>
        <SecretInput
          label="Access Token"
          description="Encontre em: TikTok Ads Manager → Assets → Events → Web Events → Manage → seu Pixel → Settings → Generate Access Token"
          value={form.tiktok_token}
          onChange={(v) => setForm((f) => ({ ...f, tiktok_token: v }))}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
          isSet={config.tiktok_token_set}
        />
      </div>

      {/* UTMify */}
      <div className="bg-background border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">UTMify</h3>
            <p className="text-xs text-muted-foreground">Rastreamento de atribuição</p>
          </div>
        </div>
        <SecretInput
          label="API Token"
          description="Encontre em: utmify.com.br → Configurações → Integrações → API Token"
          value={form.utmify_token}
          onChange={(v) => setForm((f) => ({ ...f, utmify_token: v }))}
          placeholder="utm_xxxxxxxxxxxxxxxx"
          isSet={config.utmify_token_set}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Salvando..." : "Salvar Integrações"}
      </button>
    </div>
  );
};

export default IntegrationsTab;
