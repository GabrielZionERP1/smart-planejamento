-- ============================================
-- FASE 8: MULTI-TENANT (MULTI-EMPRESA)
-- ============================================
-- Este arquivo implementa o modelo multi-tenant baseado em empresas
-- Cada empresa é isolada e usuários só acessam dados da própria empresa

-- ============================================
-- 1. CRIAR TABELA DE EMPRESAS (COMPANIES)
-- ============================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text, -- CNPJ ou outro identificador
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.companies enable row level security;

-- Comentários
comment on table public.companies is 'Tabela de empresas para modelo multi-tenant';
comment on column public.companies.name is 'Nome da empresa';
comment on column public.companies.document is 'CNPJ ou outro documento identificador';

-- ============================================
-- 2. ADICIONAR company_id EM PROFILES
-- ============================================
-- Adicionar coluna se não existir
alter table public.profiles 
  add column if not exists company_id uuid references public.companies(id);

-- Comentário
comment on column public.profiles.company_id is 'ID da empresa à qual o usuário pertence';

-- ============================================
-- 3. ADICIONAR company_id NAS TABELAS DE NEGÓCIO
-- ============================================

-- Strategic Plans
alter table public.strategic_plans 
  add column if not exists company_id uuid references public.companies(id);

comment on column public.strategic_plans.company_id is 'ID da empresa dona deste planejamento';

-- Departments
alter table public.departments 
  add column if not exists company_id uuid references public.companies(id);

comment on column public.departments.company_id is 'ID da empresa dona deste departamento';

-- Clients (se a tabela existir)
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'clients') then
    alter table public.clients 
      add column if not exists company_id uuid references public.companies(id);
    
    comment on column public.clients.company_id is 'ID da empresa dona deste cliente';
  end if;
end $$;

-- Client Groups (se a tabela existir)
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'client_groups') then
    alter table public.client_groups 
      add column if not exists company_id uuid references public.companies(id);
    
    comment on column public.client_groups.company_id is 'ID da empresa dona deste grupo de clientes';
  end if;
end $$;

-- Objectives
alter table public.objectives 
  add column if not exists company_id uuid references public.companies(id);

comment on column public.objectives.company_id is 'ID da empresa dona deste objetivo';

-- Action Plans
alter table public.action_plans 
  add column if not exists company_id uuid references public.companies(id);

comment on column public.action_plans.company_id is 'ID da empresa dona deste plano de ação';

-- Action Breakdowns
alter table public.action_breakdowns 
  add column if not exists company_id uuid references public.companies(id);

comment on column public.action_breakdowns.company_id is 'ID da empresa dona deste desdobramento';

-- ============================================
-- 4. CRIAR FUNÇÃO HELPER PARA OBTER company_id DO USUÁRIO
-- ============================================
create or replace function public.get_user_company_id()
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

comment on function public.get_user_company_id is 'Retorna o company_id do usuário autenticado';

-- ============================================
-- 5. CRIAR FUNÇÃO HELPER PARA VERIFICAR SE É ADMIN
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select role = 'admin' from public.profiles where id = auth.uid();
$$;

comment on function public.is_admin is 'Verifica se o usuário autenticado é admin';

-- ============================================
-- 6. CRIAR FUNÇÃO HELPER PARA VERIFICAR SE É GESTOR
-- ============================================
create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
as $$
  select role in ('admin', 'gestor') from public.profiles where id = auth.uid();
$$;

comment on function public.is_manager is 'Verifica se o usuário autenticado é admin ou gestor';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
-- As policies RLS serão criadas no próximo arquivo de migration
