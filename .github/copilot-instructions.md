# SMART - Sistema de Planejamento Estratégico

## Visão Geral do Projeto

Sistema completo de **Planejamento Estratégico** em 4 níveis hierárquicos para gestão organizacional:

1. **Planejamento**: Plano macro com definição de períodos
2. **Visão Estratégica**: Missão, visão, valores e objetivos estratégicos
3. **Planos de Ação**: Ações vinculadas aos objetivos (metodologia SMART)
4. **Desdobramentos**: Subatividades com histórico e acompanhamento de progresso

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Build**: Vite/Turbopack (Next.js)

### Backend & Banco de Dados
- **BaaS**: Supabase
  - PostgreSQL (banco relacional)
  - Autenticação integrada
  - Row Level Security (RLS) para permissões
  - Real-time subscriptions (opcional)

## Estrutura do Projeto

```
/
├── app/                    # Next.js App Router (rotas e páginas)
│   ├── (auth)/            # Rotas de autenticação
│   ├── planejamento/      # Gestão de planejamentos
│   ├── visao-estrategica/ # Missão, visão, valores, objetivos
│   ├── planos-acao/       # Planos de ação SMART
│   └── desdobramentos/    # Subatividades e progresso
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Componentes compartilhados
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase e tipos
│   └── utils/            # Funções auxiliares
├── types/                # Definições TypeScript
├── public/               # Assets estáticos
└── supabase/             # Migrations e schemas SQL
    ├── migrations/
    └── seed.sql
```

## Arquitetura de Dados (4 Níveis Hierárquicos)

### Relacionamento entre Entidades
```
Planejamento (1)
    └── Visão Estratégica (N)
            ├── Missão, Visão, Valores
            └── Objetivos Estratégicos (N)
                    └── Planos de Ação (N) [SMART]
                            └── Desdobramentos (N)
                                    └── Histórico/Progresso (N)
```

### Níveis e Responsabilidades

**Nível 1: Planejamento**
- Período de vigência (data início/fim)
- Nome do plano macro
- Status geral do planejamento

**Nível 2: Visão Estratégica**
- Missão: Propósito da organização
- Visão: Onde queremos chegar
- Valores: Princípios norteadores
- Objetivos Estratégicos: Metas de longo prazo

**Nível 3: Planos de Ação (SMART)**
- **S**pecific: Descrição clara e específica
- **M**easurable: Indicadores e metas numéricas
- **A**chievable: Viabilidade e recursos necessários
- **R**elevant: Alinhamento com objetivos estratégicos
- **T**ime-bound: Prazo definido

**Nível 4: Desdobramentos**
- Subatividades/tarefas das ações
- Responsáveis por cada desdobramento
- Histórico de execução
- Progresso percentual e status

## Convenções de Desenvolvimento

### Nomenclatura
- **Entidades de negócio**: Português brasileiro (`Planejamento`, `ObjetivoEstrategico`, `PlanoAcao`)
- **Componentes React**: PascalCase (`PlanejamentoCard`, `ActionPlanForm`)
- **Hooks customizados**: camelCase com prefixo `use` (`usePlanejamento`, `useSupabase`)
- **Tipos TypeScript**: PascalCase com sufixo `Type` ou interface sem sufixo (`PlanejamentoType` ou `Planejamento`)

### Supabase Patterns

**Client-side queries:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Sempre usar RLS - queries filtram automaticamente por usuário
const { data, error } = await supabase
  .from('planejamentos')
  .select('*, visoes_estrategicas(*)')
  .eq('organizacao_id', orgId)
```

**Server-side (Server Components/Actions):**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Passar cookies para manter sessão
```

### Validação SMART
Todo Plano de Ação deve ter validação dos 5 critérios:
```typescript
interface PlanoAcaoSMART {
  especifico: string        // Descrição clara
  mensuravel: {            // Métricas
    indicador: string
    metaNumerica: number
    unidadeMedida: string
  }
  alcancavel: boolean      // Avaliação de viabilidade
  relevante: string        // Justificativa de alinhamento
  temporal: {              // Prazos
    dataInicio: Date
    dataFim: Date
    marcos: Marco[]
  }
}
```

## Comandos Importantes

### Desenvolvimento
```powershell
# Instalação
npm install

# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Lint e formatação
npm run lint
npm run format
```

### Supabase
```powershell
# Login no Supabase CLI
npx supabase login

# Iniciar Supabase local
npx supabase start

# Criar migration
npx supabase migration new nome_da_migration

# Aplicar migrations
npx supabase db push

# Gerar tipos TypeScript do schema
npx supabase gen types typescript --local > types/supabase.ts
```

## Módulos e Fluxos Principais

### 1. Gestão de Planejamento
**Fluxo**: Criar novo planejamento → Definir período → Adicionar visão estratégica

**Componentes chave:**
- `app/planejamento/page.tsx`: Listagem de planejamentos
- `app/planejamento/[id]/page.tsx`: Detalhes e edição
- `components/planejamento/PlanejamentoForm.tsx`: Formulário de criação/edição

### 2. Visão Estratégica
**Fluxo**: Dentro de um planejamento → Definir missão/visão/valores → Criar objetivos estratégicos

**Componentes chave:**
- `app/visao-estrategica/[planejamentoId]/page.tsx`: Editor de visão estratégica
- `components/visao-estrategica/ObjetivosList.tsx`: Lista de objetivos
- `components/visao-estrategica/MissaoValoesForm.tsx`: Formulário de missão/visão/valores

### 3. Planos de Ação (SMART)
**Fluxo**: Selecionar objetivo estratégico → Criar plano de ação → Validar critérios SMART → Adicionar desdobramentos

**Componentes chave:**
- `app/planos-acao/[objetivoId]/page.tsx`: Listagem de planos
- `components/planos-acao/PlanoAcaoForm.tsx`: Formulário com validação SMART
- `components/planos-acao/SMARTValidator.tsx`: Componente de validação

**Validações importantes:**
- Todos os 5 critérios SMART devem ser preenchidos
- Data fim deve ser posterior à data início
- Indicadores devem ter metas numéricas

### 4. Desdobramentos e Progresso
**Fluxo**: Dentro de um plano de ação → Criar desdobramento → Atualizar progresso → Registrar histórico

**Componentes chave:**
- `app/desdobramentos/[planoAcaoId]/page.tsx`: Lista de desdobramentos
- `components/desdobramentos/DesdobramentoCard.tsx`: Card com progresso
- `components/desdobramentos/HistoricoTimeline.tsx`: Linha do tempo de atualizações

**Features:**
- Progresso percentual calculado automaticamente
- Histórico de mudanças de status
- Notificações de prazos próximos do vencimento

## Padrões de UI/UX

### shadcn/ui Components Utilizados
```typescript
// Importações típicas
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
```

### Feedback Visual
- **Status de planos**: Usar `Badge` com cores semânticas (verde=concluído, amarelo=em andamento, vermelho=atrasado)
- **Progresso**: Componente `Progress` para desdobramentos
- **Hierarquia**: Breadcrumbs para navegar entre níveis
- **Validação**: Mensagens inline com ícones de sucesso/erro

## Segurança e Permissões (RLS)

### Row Level Security Patterns

**Políticas básicas:**
```sql
-- Usuários só veem planejamentos da sua organização
CREATE POLICY "usuarios_veem_propria_org" ON planejamentos
  FOR SELECT USING (organizacao_id = auth.uid_organizacao());

-- Apenas gestores podem criar planejamentos
CREATE POLICY "gestores_criam_planejamentos" ON planejamentos
  FOR INSERT WITH CHECK (
    auth.tem_permissao('gestor', organizacao_id)
  );
```

**No código TypeScript:**
- Sempre usar `supabase.auth.getUser()` para validar sessão
- Filtrar queries por `organizacao_id` quando apropriado
- Não confiar em dados do cliente - RLS garante segurança

## Boas Práticas para AI Agents

### ⚠️ REGRA CRÍTICA: NUNCA RECRIAR ARQUIVOS EXISTENTES
- **SEMPRE** verificar se um arquivo já existe antes de tentar criá-lo
- **SEMPRE** usar ferramentas de edição (`replace_string_in_file`, `multi_replace_string_in_file`) para modificar arquivos existentes
- **NUNCA** usar `create_file` em arquivos que já existem no projeto
- Se um arquivo precisa ser atualizado: ler, analisar e modificar incrementalmente
- Preservar todo o código existente e adicionar/ajustar apenas o necessário

### Ao Criar Funcionalidades
1. Sempre considerar a metodologia SMART na implementação
2. Incluir validações de dados relacionados a objetivos e métricas
3. Priorizar usabilidade e clareza na interface
4. Documentar decisões arquiteturais importantes
5. Verificar arquivos existentes antes de criar novos

### Ao Sugerir Melhorias
- Focar em facilitar o processo de planejamento estratégico
- Considerar escalabilidade para múltiplos projetos/departamentos
- Propor visualizações que ajudem na tomada de decisão
- Trabalhar incrementalmente em arquivos existentes

### Contexto de Negócio
- Este é um sistema voltado para **gestão empresarial**
- Usuários típicos: Gestores, coordenadores, equipes de planejamento
- Foco em **simplicidade** e **efetividade**

## Workflows de Desenvolvimento

### Criando Nova Funcionalidade

1. **Schema primeiro**: Criar migration no Supabase
   ```powershell
   npx supabase migration new adiciona_tabela_x
   ```

2. **Gerar tipos**: Atualizar tipos TypeScript do schema
   ```powershell
   npx supabase gen types typescript --local > types/supabase.ts
   ```

3. **Criar componente**: Seguir estrutura de pastas
   - Server Component para data fetching
   - Client Component para interatividade
   - Separar lógica em hooks customizados

4. **Testar RLS**: Validar políticas de segurança
   ```sql
   -- Em migrations, sempre adicionar políticas
   CREATE POLICY nome_da_politica ON tabela ...
   ```

### Debugging

**Supabase Logs:**
- Erros de RLS aparecem no console do navegador
- Usar `supabase logs` para ver erros do servidor
- Habilitar logs detalhados: `supabase start --debug`

**Next.js:**
- Server Components: Logs aparecem no terminal
- Client Components: Logs no browser DevTools
- Usar `console.log` liberalmente durante desenvolvimento

## Integrações e Dependências

### Principais Bibliotecas
```json
{
  "@supabase/ssr": "^latest",           // Cliente Supabase para Next.js
  "@supabase/supabase-js": "^latest",   // Cliente JavaScript
  "react-hook-form": "^7.x",            // Formulários
  "zod": "^3.x",                        // Validação de schemas
  "@radix-ui/react-*": "^1.x",          // Componentes do shadcn/ui
  "date-fns": "^2.x",                   // Manipulação de datas
  "lucide-react": "^latest"             // Ícones
}
```

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Próximos Passos

1. ✅ Stack tecnológico definido (Next.js + Supabase)
2. 🔄 Criar estrutura base do projeto (`npx create-next-app@latest`)
3. 🔄 Configurar Supabase e criar schema inicial
4. 🔄 Implementar módulo de gestão de planejamentos
5. 🔄 Desenvolver módulo de visão estratégica
6. 🔄 Criar sistema de planos de ação SMART
7. 🔄 Implementar desdobramentos e histórico

---

**Nota**: Este arquivo será atualizado conforme o projeto evolui. Adicione descobertas arquiteturais, padrões específicos e convenções à medida que o código é desenvolvido.
