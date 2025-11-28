-- ============================================
-- FASE 8B: SUPERADMIN GLOBAL
-- ============================================
-- Este arquivo adiciona suporte a superadmin que pode:
-- - Gerenciar empresas
-- - Trocar entre empresas através de seletor
-- - Ter acesso completo a todas as empresas

-- ============================================
-- 1. ATUALIZAR COMENTÁRIO DO ROLE EM PROFILES
-- ============================================
comment on column public.profiles.role is 'Role do usuário: superadmin (acesso global) | admin (acesso total na empresa) | gestor (acesso departamental) | colaborador (acesso limitado)';

-- Permitir company_id NULL para superadmin
ALTER TABLE public.profiles ALTER COLUMN company_id DROP NOT NULL;

-- ============================================
-- 2. ATUALIZAR POLICIES - COMPANIES
-- ============================================
drop policy if exists "companies_select" on public.companies;
drop policy if exists "companies_insert" on public.companies;
drop policy if exists "companies_update" on public.companies;
drop policy if exists "companies_delete" on public.companies;

-- SELECT: superadmin vê todas, demais veem apenas a própria
create policy "companies_select" on public.companies
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = companies.id
      )
    )
  );

-- INSERT: apenas superadmin pode criar empresas
create policy "companies_insert" on public.companies
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'superadmin'
    )
  );

-- UPDATE: superadmin pode editar todas, admin pode editar apenas a própria
create policy "companies_update" on public.companies
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = companies.id)
      )
    )
  );

-- DELETE: apenas superadmin pode deletar empresas
create policy "companies_delete" on public.companies
  for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'superadmin'
    )
  );

-- ============================================
-- 3. ATUALIZAR POLICIES - PROFILES
-- ============================================
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "profiles_delete" on public.profiles;

-- SELECT: superadmin vê todos, demais veem apenas da própria empresa
create policy "profiles_select" on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = profiles.company_id
      )
    )
  );

-- INSERT: superadmin pode criar em qualquer empresa, admin apenas na própria
create policy "profiles_insert" on public.profiles
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = profiles.company_id)
      )
    )
  );

-- UPDATE: pode atualizar próprio perfil ou se for admin/superadmin da empresa
create policy "profiles_update" on public.profiles
  for update
  using (
    id = auth.uid() -- próprio perfil
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = profiles.company_id)
      )
    )
  );

-- DELETE: superadmin pode deletar qualquer perfil, admin apenas da própria empresa
create policy "profiles_delete" on public.profiles
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = profiles.company_id)
      )
    )
  );

-- ============================================
-- 4. ATUALIZAR POLICIES - STRATEGIC_PLANS
-- ============================================
drop policy if exists "strategic_plans_select" on public.strategic_plans;
drop policy if exists "strategic_plans_insert" on public.strategic_plans;
drop policy if exists "strategic_plans_update" on public.strategic_plans;
drop policy if exists "strategic_plans_delete" on public.strategic_plans;

create policy "strategic_plans_select" on public.strategic_plans
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = strategic_plans.company_id
      )
    )
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "strategic_plans_insert" on public.strategic_plans
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = strategic_plans.company_id)
      )
    )
    or company_id is null
  );

create policy "strategic_plans_update" on public.strategic_plans
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = strategic_plans.company_id)
      )
    )
    or company_id is null
  );

create policy "strategic_plans_delete" on public.strategic_plans
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = strategic_plans.company_id)
      )
    )
  );

-- ============================================
-- 5. ATUALIZAR POLICIES - DEPARTMENTS
-- ============================================
drop policy if exists "departments_select" on public.departments;
drop policy if exists "departments_insert" on public.departments;
drop policy if exists "departments_update" on public.departments;
drop policy if exists "departments_delete" on public.departments;

create policy "departments_select" on public.departments
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = departments.company_id
      )
    )
    or company_id is null
  );

create policy "departments_insert" on public.departments
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = departments.company_id)
      )
    )
  );

create policy "departments_update" on public.departments
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = departments.company_id)
      )
    )
  );

create policy "departments_delete" on public.departments
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role = 'admin' and p.company_id = departments.company_id)
      )
    )
  );

-- ============================================
-- 6. ATUALIZAR POLICIES - OBJECTIVES
-- ============================================
drop policy if exists "objectives_select" on public.objectives;
drop policy if exists "objectives_insert" on public.objectives;
drop policy if exists "objectives_update" on public.objectives;
drop policy if exists "objectives_delete" on public.objectives;

create policy "objectives_select" on public.objectives
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = objectives.company_id
      )
    )
    or company_id is null
  );

create policy "objectives_insert" on public.objectives
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = objectives.company_id)
      )
    )
    or company_id is null
  );

create policy "objectives_update" on public.objectives
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = objectives.company_id)
      )
    )
    or company_id is null
  );

create policy "objectives_delete" on public.objectives
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = objectives.company_id)
      )
    )
  );

-- ============================================
-- 7. ATUALIZAR POLICIES - ACTION_PLANS
-- ============================================
drop policy if exists "action_plans_select" on public.action_plans;
drop policy if exists "action_plans_insert" on public.action_plans;
drop policy if exists "action_plans_update" on public.action_plans;
drop policy if exists "action_plans_delete" on public.action_plans;

create policy "action_plans_select" on public.action_plans
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = action_plans.company_id
      )
    )
    or company_id is null
  );

create policy "action_plans_insert" on public.action_plans
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_plans.company_id)
      )
    )
    or company_id is null
  );

create policy "action_plans_update" on public.action_plans
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_plans.company_id)
        or p.id = action_plans.owner_id
      )
    )
    or company_id is null
  );

create policy "action_plans_delete" on public.action_plans
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_plans.company_id)
      )
    )
  );

-- ============================================
-- 8. ATUALIZAR POLICIES - ACTION_BREAKDOWNS
-- ============================================
drop policy if exists "action_breakdowns_select" on public.action_breakdowns;
drop policy if exists "action_breakdowns_insert" on public.action_breakdowns;
drop policy if exists "action_breakdowns_update" on public.action_breakdowns;
drop policy if exists "action_breakdowns_delete" on public.action_breakdowns;

create policy "action_breakdowns_select" on public.action_breakdowns
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or p.company_id = action_breakdowns.company_id
      )
    )
    or company_id is null
  );

create policy "action_breakdowns_insert" on public.action_breakdowns
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_breakdowns.company_id)
      )
    )
    or company_id is null
  );

create policy "action_breakdowns_update" on public.action_breakdowns
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_breakdowns.company_id)
        or p.id = action_breakdowns.executor_id
      )
    )
    or company_id is null
  );

create policy "action_breakdowns_delete" on public.action_breakdowns
  for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and (
        p.role = 'superadmin'
        or (p.role in ('admin', 'gestor') and p.company_id = action_breakdowns.company_id)
      )
    )
  );

-- ============================================
-- 9. ATUALIZAR POLICIES - CLIENTS (se existir)
-- ============================================
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'clients') then
    
    drop policy if exists "clients_select" on public.clients;
    drop policy if exists "clients_insert" on public.clients;
    drop policy if exists "clients_update" on public.clients;
    drop policy if exists "clients_delete" on public.clients;
    
    execute 'create policy "clients_select" on public.clients
      for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
          and (
            p.role = ''superadmin''
            or p.company_id = clients.company_id
          )
        )
        or company_id is null
      )';
    
    execute 'create policy "clients_insert" on public.clients
      for insert
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
          and (
            p.role = ''superadmin''
            or (p.role in (''admin'', ''gestor'') and p.company_id = clients.company_id)
          )
        )
      )';
    
    execute 'create policy "clients_update" on public.clients
      for update
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
          and (
            p.role = ''superadmin''
            or (p.role in (''admin'', ''gestor'') and p.company_id = clients.company_id)
          )
        )
      )';
    
    execute 'create policy "clients_delete" on public.clients
      for delete
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
          and (
            p.role = ''superadmin''
            or (p.role = ''admin'' and p.company_id = clients.company_id)
          )
        )
      )';
  end if;
end $$;

-- ============================================
-- 10. CRIAR FUNÇÃO HELPER PARA VERIFICAR SUPERADMIN
-- ============================================
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
stable
as $$
  select role = 'superadmin' from public.profiles where id = auth.uid();
$$;

comment on function public.is_superadmin is 'Verifica se o usuário autenticado é superadmin';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
