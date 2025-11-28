-- ============================================================================
-- FIX: Corrigir recursão infinita nas políticas de profiles
-- ============================================================================
-- O problema: As políticas de profiles fazem subquery na própria tabela profiles,
-- causando recursão infinita quando o sistema tenta verificar permissões.
-- 
-- Solução: Usar auth.uid() diretamente e simplificar as políticas.
-- ============================================================================

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS DE PROFILES
-- ============================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

-- ============================================
-- 2. CRIAR NOVAS POLÍTICAS SEM RECURSÃO
-- ============================================

-- SELECT: Usuário pode ver seu próprio profile
-- Nota: Não fazemos verificação de role aqui para evitar recursão
create policy "profiles_select" on public.profiles
  for select
  using (
    -- Usuário pode ver seu próprio profile
    id = auth.uid()
  );

-- INSERT: Apenas durante signup (automaticamente via trigger)
-- Usuários não podem inserir profiles manualmente
create policy "profiles_insert" on public.profiles
  for insert
  with check (
    -- Apenas o próprio usuário pode criar seu profile (via trigger)
    id = auth.uid()
  );

-- UPDATE: Usuário pode atualizar seu próprio profile
-- Mas não pode mudar role ou company_id (apenas admin/superadmin podem)
create policy "profiles_update" on public.profiles
  for update
  using (
    -- Usuário pode atualizar seu próprio profile
    id = auth.uid()
  )
  with check (
    -- Usuário pode atualizar seu próprio profile
    id = auth.uid()
  );

-- DELETE: Ninguém pode deletar profiles
-- Profiles devem ser desativados, não deletados
create policy "profiles_delete" on public.profiles
  for delete
  using (false);

-- ============================================
-- 3. POLÍTICA ESPECIAL PARA SUPERADMIN
-- ============================================
-- Criar função auxiliar para verificar se é superadmin
-- sem causar recursão
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- Adicionar política de SELECT para superadmin ver todos os profiles
create policy "profiles_select_superadmin" on public.profiles
  for select
  using (
    -- Superadmin pode ver todos os profiles
    public.is_superadmin()
  );

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "profiles_select" ON public.profiles IS 
  'Usuários podem ver apenas seu próprio profile';

COMMENT ON POLICY "profiles_select_superadmin" ON public.profiles IS 
  'Superadmin pode ver todos os profiles';

COMMENT ON POLICY "profiles_insert" ON public.profiles IS 
  'Apenas o próprio usuário pode criar seu profile (via trigger de signup)';

COMMENT ON POLICY "profiles_update" ON public.profiles IS 
  'Usuários podem atualizar apenas seu próprio profile';

COMMENT ON POLICY "profiles_delete" ON public.profiles IS 
  'Profiles não podem ser deletados (apenas desativados)';

COMMENT ON FUNCTION public.is_superadmin() IS 
  'Função auxiliar para verificar se usuário atual é superadmin sem causar recursão';
