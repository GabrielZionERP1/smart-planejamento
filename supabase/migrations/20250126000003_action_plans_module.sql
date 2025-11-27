-- =============================================
-- FASE 4: MÓDULO DE PLANOS DE AÇÃO
-- =============================================

-- Tabela de planos de ação
create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.strategic_plans(id) on delete cascade,
  objective_id uuid references public.objectives(id) on delete set null,
  title text not null,
  description text,
  department_id uuid references public.departments(id) on delete set null,
  owner_id uuid,
  start_date date,
  end_date date,
  status text not null default 'nao_iniciado',
  progress numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- Tabela de participantes dos planos de ação
create table if not exists public.action_plan_participants (
  action_plan_id uuid not null references public.action_plans(id) on delete cascade,
  profile_id uuid not null,
  primary key (action_plan_id, profile_id)
);

-- Índices para performance
create index if not exists idx_action_plans_plan_id on public.action_plans(plan_id);
create index if not exists idx_action_plans_objective_id on public.action_plans(objective_id);
create index if not exists idx_action_plans_status on public.action_plans(status);
create index if not exists idx_action_plan_participants_profile_id on public.action_plan_participants(profile_id);

-- Trigger para atualizar updated_at
create or replace function update_action_plan_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger action_plans_updated_at
  before update on public.action_plans
  for each row
  execute function update_action_plan_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

alter table public.action_plans enable row level security;
alter table public.action_plan_participants enable row level security;

-- Policies para action_plans
create policy "Usuários podem visualizar planos de ação"
  on public.action_plans for select
  using (true);

create policy "Usuários podem criar planos de ação"
  on public.action_plans for insert
  with check (true);

create policy "Usuários podem atualizar planos de ação"
  on public.action_plans for update
  using (true);

create policy "Usuários podem excluir planos de ação"
  on public.action_plans for delete
  using (true);

-- Policies para action_plan_participants
create policy "Usuários podem visualizar participantes"
  on public.action_plan_participants for select
  using (true);

create policy "Usuários podem adicionar participantes"
  on public.action_plan_participants for insert
  with check (true);

create policy "Usuários podem remover participantes"
  on public.action_plan_participants for delete
  using (true);

-- Comentários para documentação
comment on table public.action_plans is 'Planos de ação vinculados aos objetivos estratégicos';
comment on table public.action_plan_participants is 'Participantes (colaboradores) dos planos de ação';
comment on column public.action_plans.status is 'Status: nao_iniciado, em_andamento, concluido, cancelado';
comment on column public.action_plans.progress is 'Progresso em porcentagem (0 a 100)';
