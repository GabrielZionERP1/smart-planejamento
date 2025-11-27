-- Migration para tabelas departments e strategic_plans
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela de departamentos
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Criar tabela de planejamentos estratégicos
create table if not exists public.strategic_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  planning_date date,
  execution_start date,
  execution_end date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS nas tabelas
alter table public.departments enable row level security;
alter table public.strategic_plans enable row level security;

-- Políticas RLS para departments
create policy "Usuários autenticados podem ver departamentos"
  on public.departments for select
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem criar departamentos"
  on public.departments for insert
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar departamentos"
  on public.departments for update
  using (auth.role() = 'authenticated');

-- Políticas RLS para strategic_plans
create policy "Usuários autenticados podem ver planejamentos"
  on public.strategic_plans for select
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem criar planejamentos"
  on public.strategic_plans for insert
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados podem atualizar planejamentos"
  on public.strategic_plans for update
  using (auth.role() = 'authenticated');

create policy "Usuários autenticados podem deletar planejamentos"
  on public.strategic_plans for delete
  using (auth.role() = 'authenticated');

-- Índices para performance
create index if not exists idx_strategic_plans_created_at 
  on public.strategic_plans(created_at desc);

create index if not exists idx_strategic_plans_created_by 
  on public.strategic_plans(created_by);

-- Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_departments
  before update on public.departments
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_strategic_plans
  before update on public.strategic_plans
  for each row
  execute function public.handle_updated_at();
