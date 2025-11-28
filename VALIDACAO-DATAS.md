# Validação de Datas - Hierarquia do Sistema

## Visão Geral

Implementamos validações de data para garantir que todas as datas informadas no sistema respeitem a hierarquia de planejamento:

```
Planejamento Estratégico (data início/fim)
    └── Plano de Ação (validado contra Planejamento)
            └── Desdobramento (validado contra Plano de Ação)
```

## Regras de Validação

### 1. Plano de Ação
**Validado contra**: Planejamento Estratégico

- ✅ Data de início do Plano de Ação **não pode ser anterior** à data de início do Planejamento
- ✅ Data de término do Plano de Ação **não pode ser posterior** à data de término do Planejamento
- ✅ Data de término deve ser posterior à data de início (validação própria)

**Mensagens de erro:**
- `"A data de início não pode ser anterior à data de início do planejamento estratégico"`
- `"A data de término não pode ser posterior à data de término do planejamento estratégico"`

### 2. Desdobramento
**Validado contra**: Plano de Ação

- ✅ Data de início do Desdobramento **não pode ser anterior** à data de início do Plano de Ação
- ✅ Data de término do Desdobramento **não pode ser posterior** à data de término do Plano de Ação
- ✅ Data de término deve ser posterior à data de início (validação própria)

**Mensagens de erro:**
- `"A data de início não pode ser anterior à data de início do plano de ação"`
- `"A data de término não pode ser posterior à data de término do plano de ação"`

## Implementação Técnica

### Schemas Dinâmicos (lib/schemas.ts)

```typescript
// Schema base
export const actionPlanSchema = z.object({ ... })

// Schema com validação dinâmica
export function createActionPlanSchemaWithDateValidation(
  planStartDate?: string | null,
  planEndDate?: string | null
) {
  return actionPlanSchema
    .refine((data) => {
      // Validação de data início
    })
    .refine((data) => {
      // Validação de data término
    })
}
```

### Formulários

**ActionPlanForm.tsx**
- Recebe `planStartDate` e `planEndDate` como props
- Usa schema com validação dinâmica quando datas estão disponíveis

**BreakdownForm.tsx**
- Recebe `actionStartDate` e `actionEndDate` como props
- Usa schema com validação dinâmica quando datas estão disponíveis

### Páginas Atualizadas

**1. `/plans/[id]/actions/page.tsx`**
- Busca dados do planejamento estratégico
- Passa `plan.start_date` e `plan.end_date` para ActionPlanForm

**2. `/plans/[id]/actions/[actionId]/page.tsx`**
- Busca dados do planejamento estratégico
- Passa datas do planejamento para ActionPlanForm (edição)

**3. `BreakdownList.tsx`**
- Busca dados do plano de ação
- Passa `actionPlan.start_date` e `actionPlan.end_date` para BreakdownForm

**4. `/plans/[id]/actions/[actionId]/breakdowns/[breakdownId]/page.tsx`**
- Busca dados do plano de ação
- Passa datas do plano para BreakdownForm (edição)

## Experiência do Usuário

### Comportamento
1. Usuário preenche formulário com datas inválidas
2. Ao tentar submeter, o Zod valida e retorna erro específico
3. Erro é exibido abaixo do campo correspondente
4. Formulário não é submetido até correção

### Exemplo de Fluxo

**Cenário:** Plano Estratégico de 01/01/2025 a 31/12/2025

**✅ Válido:**
- Plano de Ação: 01/02/2025 a 30/11/2025
- Desdobramento: 15/02/2025 a 15/03/2025

**❌ Inválido:**
- Plano de Ação: 01/12/2024 a 30/11/2025 ⚠️ (início antes do planejamento)
- Plano de Ação: 01/02/2025 a 31/01/2026 ⚠️ (fim depois do planejamento)
- Desdobramento: 01/01/2025 a 15/03/2025 ⚠️ (início antes do plano de ação)

## Validações Client-Side

- ✅ Validação em tempo real com React Hook Form + Zod
- ✅ Mensagens de erro em português
- ✅ Feedback visual imediato no campo com erro
- ✅ Previne submissão de dados inválidos

## Próximas Melhorias Sugeridas

1. **Validação Server-Side**: Adicionar validação no backend (Supabase Functions ou Edge Functions)
2. **Helpers Visuais**: Exibir datas limite diretamente nos campos
3. **Validação em Cascata**: Ao alterar datas do planejamento, validar planos existentes
4. **Notificações**: Alertar usuários sobre planos com datas conflitantes

## Arquivos Modificados

### Core
- ✅ `src/lib/schemas.ts` - Schemas com validação dinâmica

### Componentes
- ✅ `src/components/action-plan/ActionPlanForm.tsx`
- ✅ `src/components/breakdown/BreakdownForm.tsx`
- ✅ `src/components/breakdown/BreakdownList.tsx`

### Páginas
- ✅ `src/app/(dashboard)/plans/[id]/actions/page.tsx`
- ✅ `src/app/(dashboard)/plans/[id]/actions/[actionId]/page.tsx`
- ✅ `src/app/(dashboard)/plans/[id]/actions/[actionId]/breakdowns/[breakdownId]/page.tsx`

---

**Status**: ✅ Implementado e Funcional
**Data**: 28/11/2025
