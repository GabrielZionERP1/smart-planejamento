-- ============================================
-- SCRIPT DE SETUP INICIAL - MULTI-TENANT
-- ============================================
-- Execute este script após rodar as migrations principais
-- para configurar as primeiras empresas e usuários

-- ============================================
-- 1. CRIAR EMPRESAS DE EXEMPLO
-- ============================================

-- Empresa 1: Zion ERP
INSERT INTO public.companies (id, name, document)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Zion ERP', '12.345.678/0001-99')
ON CONFLICT (id) DO NOTHING;

-- Empresa 2: Acme Corporation (para testes de isolamento)
INSERT INTO public.companies (id, name, document)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Acme Corporation', '98.765.432/0001-11')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ASSOCIAR USUÁRIOS EXISTENTES À EMPRESA
-- ============================================

-- Encontre os IDs dos usuários na tabela auth.users ou profiles
-- Exemplo: UPDATE profiles SET company_id = '...' WHERE email = 'seu@email.com';

-- Associar admin@zion.com à Zion ERP
UPDATE public.profiles 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'admin@zion.com';

-- Se não existe, criar perfil de admin para Zion ERP
-- NOTA: Antes, criar o usuário no Supabase Auth ou via signup
-- Exemplo (se o usuário auth já existe):
-- INSERT INTO public.profiles (id, email, nome, role, company_id)
-- VALUES 
--   ('id-do-auth-user', 'admin@zion.com', 'Admin Zion', 'admin', '11111111-1111-1111-1111-111111111111')
-- ON CONFLICT (id) DO UPDATE
-- SET company_id = '11111111-1111-1111-1111-111111111111';

-- ============================================
-- 3. MIGRAR DADOS EXISTENTES (OPCIONAL)
-- ============================================
-- Se você já tem dados no sistema sem company_id,
-- execute os comandos abaixo para associá-los a uma empresa

-- Atribuir todos os planejamentos existentes à Zion ERP
UPDATE public.strategic_plans 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- Atribuir todos os departamentos existentes à Zion ERP
UPDATE public.departments 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- Atribuir todos os clientes existentes à Zion ERP (se a tabela existir)
UPDATE public.clients 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL
  AND EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'clients' 
              AND column_name = 'company_id');

-- Atribuir todos os objetivos existentes à Zion ERP
UPDATE public.objectives 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- Atribuir todos os planos de ação existentes à Zion ERP
UPDATE public.action_plans 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- Atribuir todos os desdobramentos existentes à Zion ERP
UPDATE public.action_breakdowns 
SET company_id = '11111111-1111-1111-1111-111111111111'
WHERE company_id IS NULL;

-- ============================================
-- 4. VERIFICAR SETUP
-- ============================================

-- Verificar empresas criadas
SELECT 
  id, 
  name, 
  document,
  created_at
FROM public.companies
ORDER BY name;

-- Verificar usuários com company_id
SELECT 
  id,
  email,
  nome,
  role,
  company_id,
  (SELECT name FROM public.companies WHERE id = profiles.company_id) as company_name
FROM public.profiles
WHERE company_id IS NOT NULL
ORDER BY email;

-- Verificar contagem de dados por empresa
SELECT 
  c.name as empresa,
  COUNT(DISTINCT sp.id) as planejamentos,
  COUNT(DISTINCT d.id) as departamentos,
  COUNT(DISTINCT o.id) as objetivos,
  COUNT(DISTINCT ap.id) as planos_acao,
  COUNT(DISTINCT ab.id) as desdobramentos
FROM public.companies c
LEFT JOIN public.strategic_plans sp ON sp.company_id = c.id
LEFT JOIN public.departments d ON d.company_id = c.id
LEFT JOIN public.objectives o ON o.company_id = c.id
LEFT JOIN public.action_plans ap ON ap.company_id = c.id
LEFT JOIN public.action_breakdowns ab ON ab.company_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- ============================================
-- 5. TESTAR ISOLAMENTO (OPCIONAL)
-- ============================================

-- Criar dados de teste para Empresa 2 (Acme)
-- Primeiro, criar um usuário teste para Acme
-- (via Supabase Auth UI ou signup)

-- Exemplo de dados de teste para Acme:
-- INSERT INTO public.strategic_plans (name, company_id, description)
-- VALUES ('Planejamento 2025 - Acme', '22222222-2222-2222-2222-222222222222', 'Planejamento da Acme Corporation');

-- INSERT INTO public.departments (name, company_id)
-- VALUES ('TI - Acme', '22222222-2222-2222-2222-222222222222');

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================

/*

PASSO A PASSO PARA CONFIGURAR NOVA EMPRESA:

1. Criar empresa:
   INSERT INTO public.companies (name, document)
   VALUES ('Nome da Empresa', 'CNPJ')
   RETURNING id;

2. Criar usuário no Supabase Auth (via dashboard ou signup no app)

3. Associar usuário à empresa:
   UPDATE public.profiles 
   SET company_id = 'id-da-empresa', role = 'admin'
   WHERE email = 'email@empresa.com';

4. Fazer login com esse usuário
   - Todos os dados criados serão automaticamente associados à empresa
   - Usuário só verá dados da própria empresa

TESTE DE ISOLAMENTO:

1. Criar 2 empresas com 1 usuário cada
2. Login como Usuário A, criar um planejamento
3. Login como Usuário B, verificar que planejamento de A não aparece
4. Tentar buscar por ID do planejamento de A → deve retornar null/erro

*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================
