-- ============================================================================
-- SCRIPT COMPLETO: MULTI-TENANT + SUPERADMIN
-- ============================================================================
-- Este script aplica todas as mudanças necessárias para converter o sistema
-- SMART em um modelo multi-tenant com suporte a SuperAdmin.
--
-- ORDEM DE EXECUÇÃO:
-- 1. Criar tabela companies
-- 2. Adicionar company_id às tabelas existentes
-- 3. Criar políticas RLS com suporte a superadmin
-- 4. Criar funções helper
-- 5. Migrar dados existentes (COMENTADO - ajustar conforme necessário)
--
-- IMPORTANTE: Revisar seção de migração de dados antes de executar!
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 1: ESTRUTURA DE EMPRESAS
-- ============================================================================

-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT, -- CNPJ ou equivalente
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- ============================================================================
-- PARTE 2: ADICIONAR COMPANY_ID ÀS TABELAS EXISTENTES
-- ============================================================================

-- Profiles (usuários)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- Strategic Plans (planejamentos estratégicos)
ALTER TABLE strategic_plans 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_strategic_plans_company ON strategic_plans(company_id);

-- Departments (departamentos)
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_departments_company ON departments(company_id);

-- Clients (clientes)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);

-- Objectives (objetivos estratégicos)
ALTER TABLE objectives 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_objectives_company ON objectives(company_id);

-- Action Plans (planos de ação)
ALTER TABLE action_plans 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_action_plans_company ON action_plans(company_id);

-- Action Breakdowns (desdobramentos)
ALTER TABLE action_breakdowns 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_action_breakdowns_company ON action_breakdowns(company_id);

-- ============================================================================
-- PARTE 3: FUNÇÕES HELPER
-- ============================================================================

-- Função: Obter company_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company UUID;
BEGIN
  SELECT company_id INTO user_company
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_company;
END;
$$;

-- Função: Verificar se usuário é superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'superadmin';
END;
$$;

-- Função: Verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin' OR user_role = 'superadmin';
END;
$$;

-- Função: Verificar se usuário é gestor
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role IN ('gestor', 'admin', 'superadmin');
END;
$$;

-- ============================================================================
-- PARTE 4: ROW LEVEL SECURITY (RLS) - COMPANIES
-- ============================================================================

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política: SuperAdmin pode ver todas as empresas
CREATE POLICY "superadmin_view_all_companies" 
ON companies FOR SELECT 
USING (is_superadmin());

-- Política: Usuários veem apenas a própria empresa
CREATE POLICY "users_view_own_company" 
ON companies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.company_id = companies.id
  )
);

-- Política: SuperAdmin pode inserir empresas
CREATE POLICY "superadmin_insert_companies" 
ON companies FOR INSERT 
WITH CHECK (is_superadmin());

-- Política: SuperAdmin pode atualizar empresas
CREATE POLICY "superadmin_update_companies" 
ON companies FOR UPDATE 
USING (is_superadmin());

-- Política: Admin pode atualizar a própria empresa
CREATE POLICY "admin_update_own_company" 
ON companies FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = companies.id
  )
);

-- ============================================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS) - PROFILES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "superadmin_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_view_own_company_profiles" ON profiles;
DROP POLICY IF EXISTS "superadmin_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_insert_own_company_profiles" ON profiles;
DROP POLICY IF EXISTS "superadmin_update_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_own_company_profiles" ON profiles;

-- Políticas com suporte a superadmin
CREATE POLICY "superadmin_view_all_profiles" 
ON profiles FOR SELECT 
USING (is_superadmin());

CREATE POLICY "users_view_own_company_profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.company_id = profiles.company_id
  )
);

CREATE POLICY "superadmin_insert_profiles" 
ON profiles FOR INSERT 
WITH CHECK (is_superadmin());

CREATE POLICY "admin_insert_own_company_profiles" 
ON profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = profiles.company_id
  )
);

CREATE POLICY "superadmin_update_profiles" 
ON profiles FOR UPDATE 
USING (is_superadmin());

CREATE POLICY "admin_update_own_company_profiles" 
ON profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = profiles.company_id
  )
);

-- ============================================================================
-- PARTE 6: ROW LEVEL SECURITY (RLS) - DEMAIS TABELAS
-- ============================================================================

-- STRATEGIC_PLANS
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_view_all_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "users_view_own_company_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "superadmin_insert_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "managers_insert_own_company_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "superadmin_update_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "admins_update_own_company_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "superadmin_delete_strategic_plans" ON strategic_plans;
DROP POLICY IF EXISTS "admins_delete_own_company_strategic_plans" ON strategic_plans;

CREATE POLICY "superadmin_view_all_strategic_plans" 
ON strategic_plans FOR SELECT USING (is_superadmin());

CREATE POLICY "users_view_own_company_strategic_plans" 
ON strategic_plans FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = strategic_plans.company_id
  )
);

CREATE POLICY "superadmin_insert_strategic_plans" 
ON strategic_plans FOR INSERT WITH CHECK (is_superadmin());

CREATE POLICY "managers_insert_own_company_strategic_plans" 
ON strategic_plans FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('gestor', 'admin')
    AND p.company_id = strategic_plans.company_id
  )
);

CREATE POLICY "superadmin_update_strategic_plans" 
ON strategic_plans FOR UPDATE USING (is_superadmin());

CREATE POLICY "admins_update_own_company_strategic_plans" 
ON strategic_plans FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = strategic_plans.company_id
  )
);

CREATE POLICY "superadmin_delete_strategic_plans" 
ON strategic_plans FOR DELETE USING (is_superadmin());

CREATE POLICY "admins_delete_own_company_strategic_plans" 
ON strategic_plans FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = strategic_plans.company_id
  )
);

-- DEPARTMENTS (similar para todas as outras tabelas)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_view_all_departments" ON departments;
DROP POLICY IF EXISTS "users_view_own_company_departments" ON departments;
DROP POLICY IF EXISTS "superadmin_manage_departments" ON departments;
DROP POLICY IF EXISTS "admins_manage_own_company_departments" ON departments;

CREATE POLICY "superadmin_view_all_departments" 
ON departments FOR SELECT USING (is_superadmin());

CREATE POLICY "users_view_own_company_departments" 
ON departments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = departments.company_id
  )
);

CREATE POLICY "superadmin_manage_departments" 
ON departments FOR ALL USING (is_superadmin());

CREATE POLICY "admins_manage_own_company_departments" 
ON departments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = departments.company_id
  )
);

-- CLIENTS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_view_all_clients" ON clients;
DROP POLICY IF EXISTS "users_view_own_company_clients" ON clients;
DROP POLICY IF EXISTS "superadmin_manage_clients" ON clients;
DROP POLICY IF EXISTS "admins_manage_own_company_clients" ON clients;

CREATE POLICY "superadmin_view_all_clients" 
ON clients FOR SELECT USING (is_superadmin());

CREATE POLICY "users_view_own_company_clients" 
ON clients FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = clients.company_id
  )
);

CREATE POLICY "superadmin_manage_clients" 
ON clients FOR ALL USING (is_superadmin());

CREATE POLICY "admins_manage_own_company_clients" 
ON clients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.company_id = clients.company_id
  )
);

-- OBJECTIVES
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_all_objectives" ON objectives;
DROP POLICY IF EXISTS "users_own_company_objectives" ON objectives;

CREATE POLICY "superadmin_all_objectives" 
ON objectives FOR ALL USING (is_superadmin());

CREATE POLICY "users_own_company_objectives" 
ON objectives FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = objectives.company_id
  )
);

-- ACTION_PLANS
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_all_action_plans" ON action_plans;
DROP POLICY IF EXISTS "users_own_company_action_plans" ON action_plans;

CREATE POLICY "superadmin_all_action_plans" 
ON action_plans FOR ALL USING (is_superadmin());

CREATE POLICY "users_own_company_action_plans" 
ON action_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = action_plans.company_id
  )
);

-- ACTION_BREAKDOWNS
ALTER TABLE action_breakdowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "superadmin_all_breakdowns" ON action_breakdowns;
DROP POLICY IF EXISTS "users_own_company_breakdowns" ON action_breakdowns;

CREATE POLICY "superadmin_all_breakdowns" 
ON action_breakdowns FOR ALL USING (is_superadmin());

CREATE POLICY "users_own_company_breakdowns" 
ON action_breakdowns FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.company_id = action_breakdowns.company_id
  )
);

-- ============================================================================
-- PARTE 7: MIGRAÇÃO DE DADOS EXISTENTES (COMENTADO)
-- ============================================================================
-- ATENÇÃO: Ajuste os UUIDs conforme seu ambiente antes de descomentar!
-- ============================================================================

/*
-- 1. Criar empresa padrão
INSERT INTO companies (id, name, document)
VALUES (
  'COLOQUE-UUID-AQUI',
  'Empresa Padrão',
  '00.000.000/0000-00'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Atualizar profiles existentes
UPDATE profiles 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 3. Atualizar strategic_plans existentes
UPDATE strategic_plans 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 4. Atualizar departments existentes
UPDATE departments 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 5. Atualizar clients existentes
UPDATE clients 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 6. Atualizar objectives existentes
UPDATE objectives 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 7. Atualizar action_plans existentes
UPDATE action_plans 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 8. Atualizar action_breakdowns existentes
UPDATE action_breakdowns 
SET company_id = 'COLOQUE-UUID-AQUI'
WHERE company_id IS NULL;

-- 9. Criar usuário superadmin (AJUSTAR EMAIL!)
UPDATE profiles 
SET role = 'superadmin', company_id = NULL
WHERE email = 'admin@exemplo.com';
*/

-- ============================================================================
-- PARTE 8: VALIDAÇÕES FINAIS
-- ============================================================================

-- Verificar se todas as tabelas têm RLS habilitado
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'companies') THEN
    RAISE EXCEPTION 'RLS não habilitado em companies';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    RAISE EXCEPTION 'RLS não habilitado em profiles';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'strategic_plans') THEN
    RAISE EXCEPTION 'RLS não habilitado em strategic_plans';
  END IF;
  -- Adicionar verificações para outras tabelas conforme necessário
  
  RAISE NOTICE 'Validações RLS: OK';
END $$;

COMMIT;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
-- Próximos passos:
-- 1. Ajustar seção de migração de dados (PARTE 7)
-- 2. Executar script no Supabase SQL Editor
-- 3. Verificar logs para erros
-- 4. Testar login como usuário normal e superadmin
-- ============================================================================
