

## Plano: Exportar e apagar registros com +7 dias

O backend já tem a action `bulk-delete-old` implementada. Falta apenas adicionar os botões na UI.

### Alterações em `src/components/admin/RecordsTab.tsx`

Adicionar uma seção/barra com dois botões:

1. **"Exportar +7 dias"** — Exporta em Excel todos os registros com `created_at` anterior a 7 dias (usa `export-records` com `dateTo` = 7 dias atrás)
2. **"Apagar +7 dias"** — Chama `bulk-delete-old` com `olderThanDays: 7` e status selecionável (ou todos). Pede confirmação antes de executar, mostrando quantos registros serão afetados.

Opcionalmente, um dropdown para escolher o número de dias (7, 15, 30) e o status alvo (cart_started, todos, etc).

### Alterações em `supabase/functions/admin-api/index.ts`

- Adicionar action `count-old-records` que retorna a contagem de registros mais antigos que N dias (para mostrar na confirmação antes de apagar)
- Ajustar `bulk-delete-old` para aceitar `status: "all"` (apagar todos os status, não apenas um específico)
- Ajustar `export-records` para aceitar filtro `olderThanDays` direto

### UI

Na área de botões do RecordsTab, adicionar uma seção separada tipo "Limpeza" com:
- Select de dias (7, 15, 30)
- Select de status (cart_started, todos)
- Botão "Exportar antigos" (Excel)
- Botão "Apagar antigos" (vermelho, com confirmação mostrando contagem)

