
## Adicionar "ou 3x de..." na seção produto

### Alteração

Inserir uma linha de texto abaixo do preço principal em `src/components/ProductSection.tsx`, entre o preço (`R$ 173,93` / `R$ 263,53`) e a linha de "apenas R$ X,XX por dia".

### Valores calculados (3x sem juros)

- Kit interno: R$ 173,93 ÷ 3 = **R$ 57,98**
- Kit completo: R$ 263,53 ÷ 3 = **R$ 87,84**

### Trecho a adicionar (linha 162, após o preço)

```tsx
<p className="text-muted-foreground text-sm mb-1">
  ou 3x de R$ {selectedKit === "interno" ? "57,98" : "87,84"} sem juros
</p>
```

### Arquivo afetado

- `src/components/ProductSection.tsx` — inserção de 1 linha após o preço principal
