

## Plano: Exibir todos os campos e corrigir exportação

### Problemas atuais

1. **Colunas faltando na tabela e exportação**: A tabela `abandoned_carts` tem 38 colunas, mas o painel mostra apenas 12. Faltam: `vehicle_type`, `selected_texture`, `product_title`, `address_street`, `address_number`, `address_complement`, `neighborhood`, `card_last4`, `card_brand`, `installments`, `transaction_id`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `src`, `sck`, `utmify_order_id`, `user_agent`, `session_id`, `address`, `updated_at`.

2. **Bug na exportação**: O `export-records` no `admin-api` constrói filtros numa query mas faz o fetch em outra query separada sem aplicar os filtros — exporta tudo sempre.

### Alterações

**1. `supabase/functions/admin-api/index.ts`**
- Corrigir `export-records` para aplicar filtros na query real de paginação (usar a mesma query com filtros aplicados)

**2. `src/components/admin/RecordsTab.tsx`**
- Expandir a interface `CartRecord` com todos os 38 campos
- Na tabela visível: adicionar colunas para CPF, Endereço completo, Bairro, Parcelas, Cartão (últimos 4), Transação ID, UTMs completas (medium, campaign, content, term), src, sck
- Implementar um painel de detalhes expandível ao clicar numa linha (drawer/modal) que mostra TODOS os campos do registro, incluindo session_id, user_agent, IP, etc.
- Na exportação (CSV/XLSX/PDF): incluir TODOS os campos — headers e formatRow atualizados com as 38 colunas
- Adicionar botão "Exportar Tudo" que ignora filtros e exporta os 24k+ registros completos

A tabela principal terá scroll horizontal com as colunas mais importantes visíveis, e o modal de detalhe mostrará todos os dados organizados em seções.

