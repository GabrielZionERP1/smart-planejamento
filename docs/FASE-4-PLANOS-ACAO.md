# Fase 4: Módulo de Planos de Ação

## 📋 Visão Geral

A Fase 4 implementa o **módulo completo de Planos de Ação**, integrado ao Supabase, permitindo criar e gerenciar planos de ação vinculados aos objetivos estratégicos definidos na Fase 3.

## 🗄️ Estrutura do Banco de Dados

### Tabela `action_plans`

```sql
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido', 'cancelado', 'atrasado')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único do plano de ação
- `plan_id`: Referência ao planejamento estratégico
- `objective_id`: Referência ao objetivo estratégico (opcional)
- `title`: Título do plano de ação
- `description`: Descrição detalhada
- `department_id`: Departamento responsável (opcional)
- `owner_id`: Responsável pelo plano (opcional)
- `start_date`: Data de início planejada
- `end_date`: Data de término planejada
- `status`: Status atual (`nao_iniciado`, `em_andamento`, `concluido`, `cancelado`, `atrasado`)
- `progress`: Progresso em porcentagem (0-100)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

### Tabela `action_plan_participants`

```sql
CREATE TABLE action_plan_participants (
  action_plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (action_plan_id, profile_id)
);
```

**Campos:**
- `action_plan_id`: Referência ao plano de ação
- `profile_id`: Referência ao perfil do participante

### Índices

```sql
CREATE INDEX idx_action_plans_plan ON action_plans(plan_id);
CREATE INDEX idx_action_plans_objective ON action_plans(objective_id);
CREATE INDEX idx_action_plans_status ON action_plans(status);
CREATE INDEX idx_action_plan_participants_plan ON action_plan_participants(action_plan_id);
```

### Row Level Security (RLS)

Todas as políticas permitem acesso completo para usuários autenticados:

- **action_plans**: SELECT, INSERT, UPDATE, DELETE
- **action_plan_participants**: SELECT, INSERT, UPDATE, DELETE

### Triggers

```sql
-- Atualiza updated_at automaticamente
CREATE TRIGGER update_action_plan_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 📁 Arquivos Criados/Modificados

### Migração
- `supabase/migrations/20250126000003_action_plans_module.sql`

### Serviços
- `src/lib/actionPlanService.ts` - CRUD completo de planos de ação

### Tipos
- `src/lib/types/index.ts` - Adicionadas interfaces `ActionPlan` e `ActionPlanParticipant`

### Schemas
- `src/lib/schemas.ts` - Adicionado `actionPlanSchema` com validação Zod

### Componentes
- `src/components/action-plan/ActionPlanForm.tsx` - Formulário com react-hook-form
- `src/components/action-plan/ActionPlanList.tsx` - Lista com edição e exclusão

### Páginas
- `src/app/plans/[id]/actions/page.tsx` - Listagem de planos de ação
- `src/app/plans/[id]/actions/[actionId]/page.tsx` - Detalhes do plano de ação
- `src/app/plans/[id]/page.tsx` - Atualizada navegação

## 🔧 Serviços (actionPlanService.ts)

### Funções Disponíveis

#### `getActionPlans(planId: string): Promise<ActionPlan[]>`
Retorna todos os planos de ação de um planejamento estratégico.

```typescript
const actions = await getActionPlans(planId)
```

#### `getActionPlanById(actionId: string): Promise<ActionPlan>`
Retorna um plano de ação específico por ID.

```typescript
const action = await getActionPlanById(actionId)
```

#### `createActionPlan(data: Partial<ActionPlan>): Promise<ActionPlan>`
Cria um novo plano de ação.

```typescript
const newAction = await createActionPlan({
  plan_id: planId,
  objective_id: objectiveId,
  title: 'Melhorar atendimento ao cliente',
  description: 'Implementar novo sistema de CRM',
  start_date: '2025-01-01',
  end_date: '2025-06-30',
})
```

#### `updateActionPlan(actionId: string, data: Partial<ActionPlan>): Promise<ActionPlan>`
Atualiza um plano de ação existente.

```typescript
const updated = await updateActionPlan(actionId, {
  status: 'em_andamento',
  progress: 50,
})
```

#### `deleteActionPlan(actionId: string): Promise<void>`
Exclui um plano de ação.

```typescript
await deleteActionPlan(actionId)
```

#### `getActionPlanParticipants(actionId: string): Promise<ActionPlanParticipant[]>`
Retorna todos os participantes de um plano de ação.

```typescript
const participants = await getActionPlanParticipants(actionId)
```

#### `setActionPlanParticipants(actionId: string, profileIds: string[]): Promise<void>`
Define os participantes de um plano de ação (substitui participantes existentes).

```typescript
await setActionPlanParticipants(actionId, [profileId1, profileId2])
```

## 🎨 Componentes

### ActionPlanForm

Formulário para criar/editar planos de ação com validação completa.

**Props:**
- `objectives: Objective[]` - Lista de objetivos disponíveis
- `initialData?: Partial<ActionPlanSchema>` - Dados iniciais para edição
- `onSubmit: (data: ActionPlanSchema) => Promise<void>` - Callback de submissão
- `onCancel: () => void` - Callback de cancelamento
- `isSubmitting?: boolean` - Estado de envio

**Características:**
- React Hook Form com Zod validation
- Select para escolha de objetivo
- Validação de datas (fim deve ser maior que início)
- Campos opcionais para departamento e responsável
- Feedback visual de erros

### ActionPlanList

Lista de planos de ação com ações de edição e exclusão.

**Props:**
- `actions: ActionPlan[]` - Lista de planos de ação
- `objectives: Objective[]` - Lista de objetivos para exibição
- `onEdit: (action: ActionPlan) => void` - Callback de edição
- `onDelete: (actionId: string) => void` - Callback de exclusão

**Características:**
- Cards com informações resumidas
- Barra de progresso visual
- Badges de status coloridos
- Botões de edição e exclusão
- Link para página de detalhes
- Exibição do objetivo vinculado

## 📄 Páginas

### `/plans/[id]/actions`

Página de listagem de planos de ação.

**Funcionalidades:**
- Lista todos os planos de ação do planejamento
- Botão para criar novo plano de ação
- Sheet lateral com formulário
- Edição inline via Sheet
- Exclusão com confirmação
- Loading skeletons
- Toast notifications
- Tratamento de erros

### `/plans/[id]/actions/[actionId]`

Página de detalhes do plano de ação.

**Funcionalidades:**
- Exibição completa das informações
- Barra de progresso
- Badge de status
- Informações do objetivo vinculado
- Edição inline via Sheet
- Exclusão com AlertDialog
- Loading skeletons
- Toast notifications
- Botão voltar para lista

### Navegação Atualizada

Tab "Planos de Ação" habilitado em `/plans/[id]` com link para `/plans/[id]/actions`.

## 🎯 Status Disponíveis

| Status | Label | Cor |
|--------|-------|-----|
| `nao_iniciado` | Não Iniciado | cinza |
| `em_andamento` | Em Andamento | azul |
| `concluido` | Concluído | verde |
| `cancelado` | Cancelado | vermelho |
| `atrasado` | Atrasado | amarelo |

## 🔄 Fluxo de Uso

1. **Criar Plano de Ação**
   - Acessar `/plans/[id]/actions`
   - Clicar em "Novo Plano de Ação"
   - Preencher formulário
   - Submeter

2. **Visualizar Detalhes**
   - Clicar no card do plano de ação
   - Visualizar todas as informações

3. **Editar Plano de Ação**
   - Na lista ou nos detalhes, clicar em "Editar"
   - Modificar informações no Sheet
   - Salvar alterações

4. **Excluir Plano de Ação**
   - Na lista ou nos detalhes, clicar no ícone de lixeira
   - Confirmar exclusão
   - Plano de ação removido

## 🔗 Integrações

### Com Fase 3 (Visão Estratégica)
- Planos de ação podem ser vinculados a objetivos estratégicos
- Exibição do título do objetivo na lista e detalhes

### Preparação para Fase 5
- Estrutura pronta para adicionar desdobramentos (breakdowns)
- Interface de detalhes com espaço para lista de desdobramentos

## 📊 Validações

### Schema Zod (actionPlanSchema)

```typescript
{
  title: string (obrigatório, mín. 3 caracteres),
  objective_id: string (opcional),
  description: string (opcional),
  department_id: string (opcional),
  owner_id: string (opcional),
  start_date: string | '' (opcional),
  end_date: string | '' (opcional, deve ser maior que start_date)
}
```

**Regra de refinamento:**
- Se `end_date` for fornecida, deve ser posterior a `start_date`

## 🎉 Melhorias Implementadas

1. **Integração Completa com Supabase**
   - Sem mocks, dados reais do banco
   - RLS policies configuradas
   - Triggers automáticos

2. **UX Aprimorada**
   - Loading skeletons durante carregamento
   - Toast notifications para feedback
   - Tratamento de erros robusto
   - Confirmações antes de exclusões

3. **Formulário Robusto**
   - React Hook Form para performance
   - Validação em tempo real
   - Feedback visual de erros
   - Suporte a edição

4. **Navegação Intuitiva**
   - Breadcrumbs claros
   - Tabs organizadas
   - Links contextuais
   - Botões de ação visíveis

## 🚀 Próximos Passos

A Fase 5 implementará os **Desdobramentos** (breakdowns), permitindo dividir planos de ação em tarefas menores e acompanhar progresso detalhado.

---

**Documentação criada em:** 26 de janeiro de 2025
**Última atualização:** 26 de janeiro de 2025
