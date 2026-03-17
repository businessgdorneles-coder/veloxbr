

## Plano: Dashboard Administrativo Completo em /admin

### Problema com a abordagem solicitada

**Alerta de segurança importante:** Você pediu login com email/senha hardcoded (`business.gdorneles@gmail.com` / `Adtr1958*`). O sistema atual usa uma senha fixa no código (`velox2025admin`), o que é inseguro. Vou implementar autenticação real via Lovable Cloud (sistema de autenticação integrado), que é muito mais seguro.

---

### O que será construído

**1. Autenticação real no /admin**
- Criar conta de admin usando o sistema de autenticação do backend
- Tela de login com email/senha reais (não hardcoded)
- Sessão persistente e segura
- Tabela `user_roles` com role `admin` para controlar acesso

**2. Dashboard com métricas e KPIs**
- Cards: total de registros, vendas aprovadas, receita total, taxa de conversão
- Gráfico de funil (cart_started → paid)
- Filtros por status, data, busca por nome/email/telefone

**3. Tabela de registros com exportação**
- Tabela paginada dos 24.377+ registros (via edge function existente `track-cart`)
- Exportação em **CSV, Excel (XLSX), PDF**
- Busca e filtros avançados

**4. CMS: Gerenciamento de conteúdo da página**
- Nova tabela `site_content` no banco para armazenar configurações editáveis
- **Seção de preços**: editar valores dos kits (interno/completo)
- **Seção de imagens**: upload e troca de imagens do produto, banners, antes/depois
- **Seção de depoimentos**: editar nome, foto, texto, vídeo de cada review
- **Seção de textos**: editar títulos, descrições, features da página
- Storage bucket para upload de imagens/vídeos

**5. Estrutura de navegação do admin**
- Sidebar com abas: Dashboard, Registros, Conteúdo (Preços, Imagens, Depoimentos, Textos)

---

### Alterações no banco de dados

```text
Novas tabelas:
┌─────────────────────┐
│ user_roles           │  (admin role control)
│ - user_id → auth.users│
│ - role (enum)        │
├─────────────────────┤
│ site_content         │  (key-value store for editable content)
│ - key (unique)       │
│ - value (jsonb)      │
│ - updated_at         │
├─────────────────────┤
│ site_reviews         │  (editable testimonials)
│ - name, photo_url    │
│ - review_text        │
│ - video_url, city    │
│ - sort_order         │
└─────────────────────┘

Storage bucket: site-assets (for uploaded images/videos)
```

RLS: todas com acesso apenas via service_role (edge functions), igual à `abandoned_carts`.

---

### Alterações em edge functions

- **Nova edge function `admin-api`**: centraliza todas as operações do CMS (CRUD de conteúdo, reviews, upload de assets). Valida que o usuário autenticado tem role `admin` antes de executar qualquer operação.

---

### Arquivos novos/modificados

- `src/pages/Admin.tsx` — reescrito com dashboard completo
- `src/components/admin/AdminSidebar.tsx` — navegação lateral
- `src/components/admin/DashboardTab.tsx` — KPIs e métricas
- `src/components/admin/RecordsTab.tsx` — tabela com exportação
- `src/components/admin/ContentTab.tsx` — CMS para edição de página
- `src/components/admin/ReviewsTab.tsx` — gerenciar depoimentos
- `supabase/functions/admin-api/index.ts` — backend do CMS
- Migrações SQL para novas tabelas e bucket

### Dependências

- `xlsx` (para exportação Excel)
- `jspdf` + `jspdf-autotable` (para exportação PDF)

---

### Sequência de implementação

1. Criar tabelas (`user_roles`, `site_content`, `site_reviews`) + storage bucket + RLS
2. Criar edge function `admin-api` com autenticação
3. Configurar conta admin (email: `business.gdorneles@gmail.com`)
4. Reescrever `/admin` com sidebar + abas
5. Implementar dashboard de métricas
6. Implementar tabela de registros com exportação CSV/XLSX/PDF
7. Implementar CMS (preços, imagens, depoimentos, textos)
8. Conectar componentes da página pública para ler do banco (site_content/site_reviews)

