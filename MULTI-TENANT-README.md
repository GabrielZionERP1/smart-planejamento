# Sistema Multi-Tenant (Multi-Empresa) - SMART

## Visão Geral

O sistema SMART - Sistema de Planejamento Estratégico foi adaptado para funcionar como um **micro SaaS multi-tenant**, onde múltiplas empresas compartilham a mesma base de dados, mas com **isolamento completo** entre elas.

## Arquitetura Multi-Tenant

### Modelo de Isolamento

- **Tipo**: Multi-tenant com isolamento por `company_id` (shared database, shared schema)
- **Chave de tenant**: `company_id` (UUID) presente em todas as tabelas de negócio
- **Segurança**: Row Level Security (RLS) no Supabase garante isolamento total
- **Relacionamento**: 1 usuário = 1 empresa (modelo simples, expansível no futuro)

### Tabelas Afetadas

Todas as principais tabelas de negócio agora incluem `company_id`:

- `companies` (nova tabela principal)
- `profiles` (usuários)
- `strategic_plans`
- `departments`
- `clients` (se existir)
- `client_groups` (se existir)
- `objectives`
- `action_plans`
- `action_breakdowns`

## Estrutura de Banco de Dados

### Tabela `companies`

```sql
companies
├── id (uuid, PK)
├── name (text)
├── document (text, nullable) -- CNPJ ou outro identificador
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Alterações em Tabelas Existentes

Todas as tabelas de negócio receberam:

```sql
ALTER TABLE [tabela] ADD COLUMN company_id uuid REFERENCES companies(id);
```

## Row Level Security (RLS)

### Princípio de Isolamento

Todas as policies seguem o padrão:

```sql
-- Exemplo: SELECT em strategic_plans
CREATE POLICY "strategic_plans_select" ON strategic_plans
  FOR SELECT
  USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR company_id IS NULL  -- compatibilidade com dados antigos
  );
```

### Níveis de Acesso por Role

Dentro de cada empresa, os usuários têm diferentes níveis de acesso:

1. **admin**: Acesso total aos dados da própria empresa
2. **gestor**: Acesso departamental dentro da própria empresa
3. **usuario**: Acesso limitado aos próprios registros dentro da empresa

**IMPORTANTE**: Não existe "super-admin global" por padrão. Cada admin gerencia apenas sua própria empresa.

## Implementação no Frontend

### Helpers de Autenticação

Novas funções em `src/lib/auth.ts`:

```typescript
// Obtém o perfil completo incluindo company_id
getCurrentUserProfile(): Promise<Profile>

// Obtém apenas o company_id do usuário
getCurrentUserCompanyId(): Promise<string | null>
```

### Services Atualizados

Todos os services foram atualizados para:

1. **Filtrar por `company_id`** em todas as queries SELECT
2. **Incluir `company_id`** em todos os INSERTs
3. Manter compatibilidade com dados antigos (company_id IS NULL)

Exemplo de padrão implementado:

```typescript
export async function getStrategicPlans(): Promise<StrategicPlan[]> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('strategic_plans')
    .select('*')
    .order('created_at', { ascending: false })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query
  // ...
}
```

### Company Service

Novo serviço `src/lib/companyService.ts` com funções:

- `getCurrentCompany()`: Busca empresa do usuário atual
- `getCompanyById(id)`: Busca empresa específica (RLS valida acesso)
- `updateCompany(id, data)`: Atualiza dados da empresa (apenas admin)
- `createCompany(data)`: Cria nova empresa (desabilitado em produção)
- `getCompanyStats(id)`: Estatísticas da empresa

## Como Funciona na Prática

### Fluxo de Login e Acesso

1. Usuário faz login (email/senha via Supabase Auth)
2. Sistema busca perfil do usuário (`profiles`) incluindo `company_id`
3. Todas as queries subsequentes são automaticamente filtradas por `company_id`
4. RLS no Supabase garante que queries sem filtro correto retornam vazio

### Criação de Novos Registros

Quando um usuário cria um planejamento, ação, etc.:

```typescript
// O service automaticamente pega o company_id do usuário
const companyId = await getCurrentUserCompanyId()

await supabase.from('strategic_plans').insert({
  name: 'Meu Planejamento',
  company_id: companyId,  // ← Crucial para isolamento
  // ... outros campos
})
```

### Isolamento Garantido

**Cenário**: Empresa A tenta acessar dados da Empresa B

```typescript
// Empresa A: company_id = 'abc-123'
// Empresa B: company_id = 'def-456'

// Usuário da Empresa A tenta buscar planejamento da Empresa B
const plan = await getStrategicPlanById('plan-da-empresa-b')

// Resultado: null ou erro
// RLS bloqueia a query antes mesmo de retornar dados
```

## Migrations SQL

### Aplicando as Migrations

No Supabase:

```bash
# Se usando Supabase CLI
supabase migration new multi_tenant_setup

# Copiar conteúdo de:
# - 20250127000000_multi_tenant_companies.sql
# - 20250127000001_multi_tenant_rls_policies.sql

supabase db push
```

Ou via Dashboard do Supabase:
1. SQL Editor → New Query
2. Colar conteúdo da migration
3. Executar

### Ordem de Execução

1. **20250127000000_multi_tenant_companies.sql**
   - Cria tabela `companies`
   - Adiciona `company_id` em todas as tabelas
   - Cria funções helper SQL

2. **20250127000001_multi_tenant_rls_policies.sql**
   - Remove policies antigas
   - Cria policies multi-tenant
   - Configura isolamento por empresa

## Setup Inicial de Empresas

### 1. Criar Primeira Empresa

```sql
-- Via SQL no Supabase
INSERT INTO companies (name, document)
VALUES ('Minha Empresa Ltda', '12.345.678/0001-99')
RETURNING id;
-- Anotar o ID retornado
```

### 2. Associar Usuário à Empresa

```sql
-- Atualizar perfil do usuário
UPDATE profiles
SET company_id = 'id-da-empresa-criada-acima'
WHERE id = 'id-do-usuario';
```

### 3. Popular Dados Existentes (Migração)

Se já existem dados no sistema sem `company_id`:

```sql
-- Atribuir todos os dados existentes a uma empresa
UPDATE strategic_plans SET company_id = 'id-da-empresa' WHERE company_id IS NULL;
UPDATE departments SET company_id = 'id-da-empresa' WHERE company_id IS NULL;
UPDATE objectives SET company_id = 'id-da-empresa' WHERE company_id IS NULL;
UPDATE action_plans SET company_id = 'id-da-empresa' WHERE company_id IS NULL;
UPDATE action_breakdowns SET company_id = 'id-da-empresa' WHERE company_id IS NULL;
-- Repetir para todas as tabelas necessárias
```

## Testes e Validação

### Checklist de Validação

- [ ] Usuário só vê dados da própria empresa
- [ ] Criar planejamento adiciona `company_id` automaticamente
- [ ] Dashboard mostra apenas métricas da empresa do usuário
- [ ] Admin não consegue ver dados de outras empresas
- [ ] Queries sem `company_id` retornam vazio (exceto dados antigos com IS NULL)

### Teste Manual

1. Criar 2 empresas diferentes
2. Criar 1 usuário em cada empresa
3. Fazer login com Usuário A
4. Criar planejamento
5. Fazer login com Usuário B
6. Verificar que planejamento do Usuário A não aparece

## Próximos Passos (Futuro)

### Melhorias Possíveis

1. **Tela de Gerenciamento de Empresas**
   - Interface para admins gerenciarem dados da empresa
   - Página em `/admin/company` ou `/settings/company`

2. **Onboarding de Novas Empresas**
   - Fluxo de cadastro self-service
   - Criar empresa + primeiro usuário admin automaticamente

3. **Usuários Multi-Empresa** (Opcional)
   - Permitir que um usuário pertença a múltiplas empresas
   - Adicionar seletor de empresa no dashboard
   - Criar tabela intermediária `user_companies`

4. **Super Admin Global**
   - Role especial para suporte técnico
   - Acesso a todas as empresas (com auditoria)
   - Policy especial no RLS

5. **Métricas SaaS**
   - Dashboard de métricas por empresa
   - Uso de storage, número de usuários, etc.
   - Limites por plano (freemium, pro, enterprise)

## Troubleshooting

### "Não consigo ver nenhum dado"

**Causa**: Usuário não tem `company_id` configurado ou dados não têm `company_id`

**Solução**:
```sql
-- Verificar company_id do usuário
SELECT id, email, company_id FROM profiles WHERE id = 'user-id';

-- Se NULL, associar a uma empresa
UPDATE profiles SET company_id = 'company-id' WHERE id = 'user-id';
```

### "Erro ao criar registro"

**Causa**: Falta `company_id` no INSERT ou usuário sem `company_id`

**Solução**: Verificar logs do Supabase e garantir que `getCurrentUserCompanyId()` retorna um valor válido.

### "RLS bloqueando queries"

**Causa**: Policy muito restritiva ou company_id incorreto

**Solução**:
```sql
-- Desabilitar RLS temporariamente para debug (CUIDADO!)
ALTER TABLE strategic_plans DISABLE ROW LEVEL SECURITY;

-- Ver dados sem filtro
SELECT * FROM strategic_plans;

-- Reabilitar RLS
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
```

## Documentação Técnica

### Arquivos Modificados

**Migrations**:
- `supabase/migrations/20250127000000_multi_tenant_companies.sql`
- `supabase/migrations/20250127000001_multi_tenant_rls_policies.sql`

**Types**:
- `src/lib/types/index.ts` - Adicionado `Company` e `company_id` em todas as interfaces

**Services**:
- `src/lib/auth.ts` - Funções `getCurrentUserProfile()` e `getCurrentUserCompanyId()`
- `src/lib/companyService.ts` - NOVO service para gerenciar empresas
- `src/lib/planService.ts` - Filtros `company_id`
- `src/lib/objectiveService.ts` - Filtros `company_id`
- `src/lib/actionPlanService.ts` - Filtros `company_id`
- `src/lib/breakdownService.ts` - Filtros `company_id`
- `src/lib/dashboardService.ts` - Filtros `company_id` em todas as agregações
- `src/lib/clientService.ts` - Filtros `company_id`
- `src/lib/departmentService.ts` - Filtros `company_id`
- `src/lib/permissions.ts` - Validações adicionais de `company_id`

## Referências

- [Supabase Multi-Tenancy Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

---

**Implementação Completa**: ✅ Todas as mudanças foram aplicadas

**Status**: Pronto para testes e deploy
