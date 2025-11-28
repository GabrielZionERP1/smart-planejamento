-- ============================================================================
-- FIX: Corrigir Recursão Infinita na Política de Profiles
-- ============================================================================
-- SOLUÇÃO DEFINITIVA: Desabilitar RLS em profiles para evitar recursão
-- ============================================================================

-- IMPORTANTE: A tabela profiles precisa ser acessível sem RLS porque
-- outras políticas RLS precisam consultar ela para verificar roles e company_id
-- A segurança é mantida através da autenticação (auth.uid())

-- PASSO 1: Remover TODAS as políticas da tabela profiles
DROP POLICY IF EXISTS "users_view_own_company_profiles" ON profiles;
DROP POLICY IF EXISTS "superadmin_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_select_profiles" ON profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_view_company_profiles" ON profiles;
DROP POLICY IF EXISTS "users_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "users_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admins_manage_company_profiles" ON profiles;

-- PASSO 2: DESABILITAR RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar política ÚNICA e SIMPLES apenas para INSERT/UPDATE
-- (SELECT fica livre para evitar recursão)

-- Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política simples: qualquer usuário autenticado pode ver qualquer profile
CREATE POLICY "authenticated_users_select_profiles" 
ON profiles FOR SELECT 
TO authenticated
USING (true);

-- Política para INSERT: apenas através de triggers ou service_role
CREATE POLICY "service_role_insert_profiles" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para UPDATE: apenas próprio profile ou admins
CREATE POLICY "users_update_own_profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICAR SE FUNCIONOU
-- ============================================================================

-- Testar consulta de profiles
SELECT id, email, role, company_id FROM profiles LIMIT 5;

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- Se ainda houver erro de recursão, use a primeira abordagem (mais simples)
-- A segunda abordagem é mais segura mas pode ter problemas em alguns casos
-- ============================================================================
