-- ============================================================================
-- SCRIPT: Converter Usuário Existente para SuperAdmin
-- ============================================================================
-- IMPORTANTE: Este script altera o único usuário da base para superadmin
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- 0. ATUALIZAR CONSTRAINT DA TABELA PROFILES (ADICIONAR 'superadmin')
-- ============================================================================
-- Remover constraint antiga
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Criar nova constraint com 'superadmin'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'gestor', 'usuario', 'colaborador', 'superadmin'));

-- ============================================================================

-- 1. Verificar usuários existentes
SELECT 
  id,
  email,
  name,
  role,
  company_id,
  created_at
FROM profiles
ORDER BY created_at ASC;

-- ============================================================================
-- 2. CONVERTER PARA SUPERADMIN
-- ============================================================================

-- Opção A: Se você souber o email do usuário
UPDATE profiles 
SET 
  role = 'superadmin',
  company_id = NULL,  -- SuperAdmin não tem empresa específica
  updated_at = now()
WHERE email = 'seu-email@exemplo.com';  -- ⚠️ SUBSTITUIR pelo seu email

-- Opção B: Se for o único usuário (converter automaticamente o primeiro)
UPDATE profiles 
SET 
  role = 'superadmin',
  company_id = NULL,
  updated_at = now()
WHERE id = (
  SELECT id 
  FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- ============================================================================
-- 3. Verificar alteração
-- ============================================================================

SELECT 
  id,
  email,
  name,
  role,
  company_id,
  updated_at
FROM profiles
WHERE role = 'superadmin';

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. SuperAdmin tem company_id = NULL (não vinculado a empresa específica)
-- 2. SuperAdmin pode ver e gerenciar todas as empresas
-- 3. Após login, o CompanySwitcher aparecerá no header
-- 4. Acesso à página /admin/companies será liberado
-- ============================================================================

-- ============================================================================
-- ROLLBACK (se precisar desfazer)
-- ============================================================================
-- Caso precise reverter para admin de uma empresa específica:
/*
UPDATE profiles 
SET 
  role = 'admin',
  company_id = 'uuid-da-empresa-aqui',
  updated_at = now()
WHERE email = 'seu-email@exemplo.com';
*/
