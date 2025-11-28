-- ============================================
-- FASE 8: POLÍTICAS RLS MULTI-TENANT
-- ============================================
-- Este arquivo cria as políticas de Row Level Security para isolamento por empresa
-- Regra: Usuários só acessam dados da própria empresa (company_id)

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================
-- Companies
drop policy if exists "companies_select" on public.companies;
drop policy if exists "companies_insert" on public.companies;
drop policy if exists "companies_update" on public.companies;
drop policy if exists "companies_delete" on public.companies;

-- Profiles
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "profiles_delete" on public.profiles;

-- Strategic Plans
drop policy if exists "strategic_plans_select" on public.strategic_plans;
drop policy if exists "strategic_plans_insert" on public.strategic_plans;
drop policy if exists "strategic_plans_update" on public.strategic_plans;
drop policy if exists "strategic_plans_delete" on public.strategic_plans;

-- Departments
drop policy if exists "departments_select" on public.departments;
drop policy if exists "departments_insert" on public.departments;
drop policy if exists "departments_update" on public.departments;
drop policy if exists "departments_delete" on public.departments;

-- Objectives
drop policy if exists "objectives_select" on public.objectives;
drop policy if exists "objectives_insert" on public.objectives;
drop policy if exists "objectives_update" on public.objectives;
drop policy if exists "objectives_delete" on public.objectives;

-- Action Plans
drop policy if exists "action_plans_select" on public.action_plans;
drop policy if exists "action_plans_insert" on public.action_plans;
drop policy if exists "action_plans_update" on public.action_plans;
drop policy if exists "action_plans_delete" on public.action_plans;

-- Action Breakdowns
drop policy if exists "action_breakdowns_select" on public.action_breakdowns;
drop policy if exists "action_breakdowns_insert" on public.action_breakdowns;
drop policy if exists "action_breakdowns_update" on public.action_breakdowns;
drop policy if exists "action_breakdowns_delete" on public.action_breakdowns;

-- ============================================
-- COMPANIES - Políticas
-- ============================================
-- Usuários podem ver apenas a própria empresa
create policy "companies_select" on public.companies
  for select
  using (
    id = (select company_id from public.profiles where id = auth.uid())
  );

-- Apenas admins podem criar empresas (opcional - pode ser desabilitado)
create policy "companies_insert" on public.companies
  for insert
  with check (false); -- Desabilitado por padrão - criar via SQL direto

-- Apenas admins da empresa podem atualizar
create policy "companies_update" on public.companies
  for update
  using (
    id = (select company_id from public.profiles where id = auth.uid())
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Ninguém pode deletar empresas via app (apenas via SQL)
create policy "companies_delete" on public.companies
  for delete
  using (false);

-- ============================================
-- PROFILES - Políticas
-- ============================================
-- Usuários veem apenas perfis da própria empresa
create policy "profiles_select" on public.profiles
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
  );

-- Admins podem criar perfis na própria empresa
create policy "profiles_insert" on public.profiles
  for insert
  with check (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- Usuários podem atualizar o próprio perfil; admins podem atualizar perfis da empresa
create policy "profiles_update" on public.profiles
  for update
  using (
    id = auth.uid() -- próprio perfil
    or (
      company_id = (select company_id from public.profiles where id = auth.uid())
      and exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role = 'admin'
      )
    )
  );

-- Apenas admins podem deletar perfis da própria empresa
create policy "profiles_delete" on public.profiles
  for delete
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
    )
  );

-- ============================================
-- STRATEGIC_PLANS - Políticas
-- ============================================
create policy "strategic_plans_select" on public.strategic_plans
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "strategic_plans_insert" on public.strategic_plans
  for insert
  with check (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "strategic_plans_update" on public.strategic_plans
  for update
  using (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "strategic_plans_delete" on public.strategic_plans
  for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
      and company_id = strategic_plans.company_id
    )
  );

-- ============================================
-- DEPARTMENTS - Políticas
-- ============================================
create policy "departments_select" on public.departments
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "departments_insert" on public.departments
  for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
      and company_id = departments.company_id
    )
  );

create policy "departments_update" on public.departments
  for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
  );

create policy "departments_delete" on public.departments
  for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'admin'
      and company_id = departments.company_id
    )
  );

-- ============================================
-- OBJECTIVES - Políticas
-- ============================================
create policy "objectives_select" on public.objectives
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "objectives_insert" on public.objectives
  for insert
  with check (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "objectives_update" on public.objectives
  for update
  using (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "objectives_delete" on public.objectives
  for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'gestor')
      and company_id = objectives.company_id
    )
  );

-- ============================================
-- ACTION_PLANS - Políticas
-- ============================================
create policy "action_plans_select" on public.action_plans
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "action_plans_insert" on public.action_plans
  for insert
  with check (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "action_plans_update" on public.action_plans
  for update
  using (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and (
          role in ('admin', 'gestor')
          or id = action_plans.owner_id
        )
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "action_plans_delete" on public.action_plans
  for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'gestor')
      and company_id = action_plans.company_id
    )
  );

-- ============================================
-- ACTION_BREAKDOWNS - Políticas
-- ============================================
create policy "action_breakdowns_select" on public.action_breakdowns
  for select
  using (
    company_id = (select company_id from public.profiles where id = auth.uid())
    or company_id is null -- compatibilidade com dados antigos
  );

create policy "action_breakdowns_insert" on public.action_breakdowns
  for insert
  with check (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and role in ('admin', 'gestor')
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "action_breakdowns_update" on public.action_breakdowns
  for update
  using (
    (
      exists (
        select 1 from public.profiles 
        where id = auth.uid() 
        and (
          role in ('admin', 'gestor')
          or id = action_breakdowns.executor_id
        )
      )
      and company_id = (select company_id from public.profiles where id = auth.uid())
    )
    or company_id is null -- compatibilidade temporária
  );

create policy "action_breakdowns_delete" on public.action_breakdowns
  for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'gestor')
      and company_id = action_breakdowns.company_id
    )
  );

-- ============================================
-- CLIENTS - Políticas (se a tabela existir)
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
        company_id = (select company_id from public.profiles where id = auth.uid())
        or company_id is null
      )';
    
    execute 'create policy "clients_insert" on public.clients
      for insert
      with check (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in (''admin'', ''gestor'')
          and company_id = clients.company_id
        )
      )';
    
    execute 'create policy "clients_update" on public.clients
      for update
      using (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in (''admin'', ''gestor'')
          and company_id = clients.company_id
        )
      )';
    
    execute 'create policy "clients_delete" on public.clients
      for delete
      using (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role = ''admin''
          and company_id = clients.company_id
        )
      )';
  end if;
end $$;

-- ============================================
-- CLIENT_GROUPS - Políticas (se a tabela existir)
-- ============================================
do $$ 
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'client_groups') then
    
    drop policy if exists "client_groups_select" on public.client_groups;
    drop policy if exists "client_groups_insert" on public.client_groups;
    drop policy if exists "client_groups_update" on public.client_groups;
    drop policy if exists "client_groups_delete" on public.client_groups;
    
    execute 'create policy "client_groups_select" on public.client_groups
      for select
      using (
        company_id = (select company_id from public.profiles where id = auth.uid())
        or company_id is null
      )';
    
    execute 'create policy "client_groups_insert" on public.client_groups
      for insert
      with check (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in (''admin'', ''gestor'')
          and company_id = client_groups.company_id
        )
      )';
    
    execute 'create policy "client_groups_update" on public.client_groups
      for update
      using (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role in (''admin'', ''gestor'')
          and company_id = client_groups.company_id
        )
      )';
    
    execute 'create policy "client_groups_delete" on public.client_groups
      for delete
      using (
        exists (
          select 1 from public.profiles 
          where id = auth.uid() 
          and role = ''admin''
          and company_id = client_groups.company_id
        )
      )';
  end if;
end $$;

-- ============================================
-- FIM DA MIGRATION
-- ============================================
