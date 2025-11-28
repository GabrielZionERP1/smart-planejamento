# Sistema Multi-Tenant com SuperAdmin - Guia de Uso

## 📋 Visão Geral

O sistema SMART agora suporta **múltiplas empresas** em uma única base de dados, com isolamento completo de dados entre elas. Além disso, existe o papel especial de **SuperAdmin**, que pode gerenciar empresas e alternar entre elas.

## 🏢 Estrutura Multi-Tenant

### Tabelas com `company_id`
Todas as tabelas de negócio foram atualizadas com a coluna `company_id`:
- `profiles` - Usuários vinculados a empresas
- `strategic_plans` - Planejamentos estratégicos
- `departments` - Departamentos
- `clients` - Clientes
- `objectives` - Objetivos estratégicos
- `action_plans` - Planos de ação
- `action_breakdowns` - Desdobramentos

### Isolamento de Dados (RLS)
- **Row Level Security (RLS)** garante que usuários só vejam dados da própria empresa
- Políticas do Supabase filtram automaticamente por `company_id`
- Usuários normais **não conseguem** acessar dados de outras empresas

## 👥 Papéis de Usuário

### Usuários Normais
| Papel | Descrição | Acesso |
|-------|-----------|--------|
| `admin` | Administrador da empresa | Dados da própria empresa + gerenciar usuários |
| `gestor` | Gerente/Coordenador | Dados da própria empresa + criar planos |
| `usuario` | Usuário comum/Colaborador | Apenas visualizar e editar próprios desdobramentos |

### SuperAdmin (Global)
- **Não vinculado** a uma empresa específica (`company_id` pode ser `NULL`)
- **Acessa dados de todas as empresas**
- **Pode trocar a empresa ativa** através do seletor no header
- **Gerencia empresas**: criar, editar, visualizar estatísticas
- **Página exclusiva**: `/admin/companies`

## 🔄 Seletor de Empresa (Company Switcher)

### Localização
O seletor de empresa aparece no **header superior**, ao lado do menu de usuário.

### Funcionalidade
- **Visível apenas para SuperAdmin**
- Mostra lista de todas as empresas cadastradas
- Empresa selecionada é persistida no `localStorage`
- Ao trocar de empresa, todos os dados exibidos são filtrados pela nova empresa

### Componentes
```tsx
<CompanySwitcher />          // Versão padrão para header
<CompanySwitcherCompact />   // Versão compacta para mobile
<CompanyInfo />              // Apenas exibe empresa atual (sem seletor)
```

## 🔧 Arquitetura Técnica

### 1. CompanyContext
**Arquivo**: `src/lib/companyContext.tsx`

Gerencia o estado da empresa ativa:
```tsx
const {
  currentCompanyId,        // ID da empresa selecionada
  setCurrentCompanyId,     // Função para trocar empresa
  currentCompany,          // Objeto completo da empresa
  isSuperAdmin,            // Boolean se usuário é superadmin
  availableCompanies,      // Lista de empresas (para superadmin)
  isLoading,               // Estado de carregamento
  refreshCompanies,        // Recarregar lista de empresas
} = useCompany()
```

### 2. Helper Functions
**Arquivo**: `src/lib/currentCompany.ts`

```tsx
// Para Server Actions e API Routes
const companyId = await getCurrentCompanyIdForUser(activeCompanyId)

// Lança erro se company_id for null
const companyId = await requireCompanyId(activeCompanyId)
```

### 3. Hook para Client Components
**Arquivo**: `src/lib/companyContext.tsx`

```tsx
// Dentro de componentes client
const companyId = useCurrentCompanyId()
```

## 📝 Uso nos Services

### Antes (Sem Multi-Tenant)
```typescript
export async function getPlans() {
  const { data } = await supabase
    .from('strategic_plans')
    .select('*')
  return data
}
```

### Depois (Com Multi-Tenant)

#### Para Usuários Normais
```typescript
export async function getPlans() {
  const companyId = await getCurrentUserCompanyId()
  
  const { data } = await supabase
    .from('strategic_plans')
    .select('*')
    .eq('company_id', companyId)  // 👈 Filtro por empresa
  
  return data
}
```

#### Para SuperAdmin (com Contexto)
Em Server Actions que precisam considerar o superadmin:

```typescript
'use server'

export async function getPlansAction(activeCompanyId?: string) {
  const companyId = await getCurrentCompanyIdForUser(activeCompanyId)
  
  const { data } = await supabase
    .from('strategic_plans')
    .select('*')
    .eq('company_id', companyId)
  
  return data
}
```

No componente client:
```tsx
'use client'

export function PlansList() {
  const { currentCompanyId } = useCompany()
  const [plans, setPlans] = useState([])

  useEffect(() => {
    async function loadPlans() {
      const data = await getPlansAction(currentCompanyId)
      setPlans(data)
    }
    loadPlans()
  }, [currentCompanyId])

  return (...)
}
```

## 🚀 Fluxo de Trabalho

### Para SuperAdmin

1. **Login**
   - Sistema detecta `role = 'superadmin'`
   - Carrega todas as empresas disponíveis
   - Seleciona empresa do localStorage ou primeira da lista

2. **Trocar Empresa**
   - Clicar no seletor no header
   - Escolher empresa desejada
   - Sistema atualiza contexto e recarrega dados

3. **Gerenciar Empresas**
   - Acessar `/admin/companies`
   - Criar, editar empresas
   - Visualizar estatísticas (usuários, planos, etc.)

### Para Usuários Normais

1. **Login**
   - Sistema identifica `company_id` do usuário
   - Carrega apenas dados da própria empresa
   - **Não vê** seletor de empresa (bloqueado)

2. **Trabalho Diário**
   - Todos os dados são automaticamente filtrados
   - Não há acesso a outras empresas
   - RLS garante segurança no banco

## 🛡️ Segurança

### Row Level Security (RLS)

Todas as políticas seguem este padrão:

```sql
-- Exemplo: Visualizar strategic_plans
CREATE POLICY "users_view_own_company_plans" 
ON strategic_plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND (
      p.role = 'superadmin'           -- SuperAdmin vê tudo
      OR p.company_id = company_id    -- Outros veem só da empresa
    )
  )
);
```

### Validações de Permissão

**Arquivo**: `src/lib/permissions.ts`

```typescript
// Superadmin bypass todas as verificações
export function canEditPlan(user: Profile, plan: StrategicPlan): boolean {
  if (user.role === 'superadmin') return true
  if (user.role === 'admin' && user.company_id === plan.company_id) return true
  return false
}
```

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── companyContext.tsx           # Context com estado da empresa
│   ├── currentCompany.ts            # Helpers para obter company_id
│   ├── companyService.ts            # CRUD de empresas
│   └── permissions.ts               # Validações com superadmin
├── components/
│   └── layout/
│       └── CompanySwitcher.tsx      # Seletor de empresa
└── app/
    └── (dashboard)/
        ├── layout.tsx                # Wrapper com CompanyProvider
        └── admin/
            └── companies/
                └── page.tsx          # Página de gerenciamento

supabase/
└── migrations/
    ├── 20250127000000_multi_tenant_companies.sql        # Estrutura base
    ├── 20250127000001_multi_tenant_rls_policies.sql     # Políticas RLS
    └── 20250127000002_superadmin_global.sql             # Superadmin
```

## 🔄 Migração de Dados Existentes

### 1. Criar Primeira Empresa
```sql
INSERT INTO companies (name, document)
VALUES ('Minha Empresa Ltda', '00.000.000/0000-00')
RETURNING id;
```

### 2. Atualizar Usuários Existentes
```sql
-- Substituir 'company-uuid-aqui' pelo ID da empresa criada
UPDATE profiles 
SET company_id = 'company-uuid-aqui'
WHERE company_id IS NULL;
```

### 3. Atualizar Dados de Negócio
```sql
-- Planejamentos
UPDATE strategic_plans 
SET company_id = 'company-uuid-aqui'
WHERE company_id IS NULL;

-- Departamentos
UPDATE departments 
SET company_id = 'company-uuid-aqui'
WHERE company_id IS NULL;

-- (Repetir para clients, objectives, action_plans, action_breakdowns)
```

### 4. Criar SuperAdmin
```sql
-- Atualizar usuário existente para superadmin
UPDATE profiles 
SET role = 'superadmin', company_id = NULL
WHERE email = 'admin@exemplo.com';
```

## 🎯 Casos de Uso

### 1. Consultoria com Múltiplos Clientes
- **SuperAdmin**: Consultor principal
- **Cada empresa cliente**: Instância isolada
- **Troca rápida** entre clientes para suporte

### 2. Holding com Múltiplas Filiais
- **SuperAdmin**: Diretoria da holding
- **Cada filial**: Empresa separada
- **Visão consolidada** possível para superadmin

### 3. SaaS com Múltiplos Tenants
- **SuperAdmin**: Equipe de desenvolvimento/suporte
- **Cada tenant**: Cliente pagante
- **Isolamento total** entre clientes

## ⚠️ Considerações Importantes

### Desempenho
- Índices criados em `company_id` para performance
- RLS otimizado com `EXISTS` subqueries
- Considerar particionamento para muitas empresas (futuro)

### Auditoria
- `created_at` e `updated_at` em todas as tabelas
- Considerar adicionar `created_by` e `updated_by` (futuro)
- Logs de troca de empresa pelo superadmin (futuro)

### Backup
- Cada empresa pode ter backup individual
- SuperAdmin pode exportar dados por empresa
- Considerar soft-delete com flag `deleted_at` (futuro)

## 🐛 Troubleshooting

### SuperAdmin não vê empresas
```typescript
// Verificar no console do navegador
const profile = await getCurrentUserProfile()
console.log('Role:', profile.role)
console.log('Is SuperAdmin:', profile.role === 'superadmin')
```

### Usuário normal vê dados errados
```sql
-- Verificar company_id no banco
SELECT id, email, role, company_id FROM profiles WHERE email = 'usuario@exemplo.com';
```

### RLS bloqueando acesso
```sql
-- Desabilitar temporariamente RLS (APENAS PARA DEBUG!)
ALTER TABLE strategic_plans DISABLE ROW LEVEL SECURITY;

-- Sempre reabilitar depois
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
```

## 📚 Próximos Passos

- [ ] Implementar logs de auditoria
- [ ] Adicionar exportação de dados por empresa
- [ ] Dashboard consolidado para superadmin
- [ ] Soft-delete com recuperação
- [ ] Migração assistida de dados

---

**Documentação atualizada em**: Janeiro 2025  
**Versão**: 1.0
