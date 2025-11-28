-- ============================================================================
-- SCRIPT: DEBUG COMPLETO - Investigar problema do profile
-- ============================================================================

-- 1. Verificar TODOS os usuários na tabela auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar qual é o ID REAL do usuário gabriel@zion.tec.br
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'gabriel@zion.tec.br';

-- 2. Verificar se existe profile para este usuário
SELECT 
  id,
  email,
  nome,
  role,
  company_id,
  created_at,
  updated_at
FROM profiles
WHERE email = 'gabriel@zion.tec.br'
   OR id = '40756abd-740a-48f7-aff2-e2c9889b9c2b';

-- 3. Se o profile não existir, criar um novo
-- IMPORTANTE: Execute este INSERT apenas se a query acima não retornar nenhum resultado
INSERT INTO profiles (id, email, nome, role, company_id, created_at, updated_at)
VALUES (
  '40756abd-740a-48f7-aff2-e2c9889b9c2b',
  'gabriel@zion.tec.br',
  'Gabriel SuperAdmin',
  'superadmin',
  NULL,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  nome = EXCLUDED.nome,
  role = 'superadmin',
  company_id = NULL,
  updated_at = now();

-- 4. Verificar se o profile foi criado/atualizado com sucesso
SELECT 
  id,
  email,
  nome,
  role,
  company_id,
  created_at,
  updated_at
FROM profiles
WHERE id = '40756abd-740a-48f7-aff2-e2c9889b9c2b';

-- ============================================================================
-- INSTRUÇÕES DE USO:
-- ============================================================================
-- 1. Execute as queries de SELECT primeiro para ver o estado atual
-- 2. Se o profile não existir, execute o INSERT
-- 3. Execute a última query SELECT para confirmar que o profile foi criado
-- ============================================================================
