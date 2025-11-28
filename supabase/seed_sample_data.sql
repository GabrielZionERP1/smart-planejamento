-- ============================================================================
-- MIGRATION: Popular banco com dados de exemplo
-- ============================================================================
-- Cria empresas de exemplo e popula dados para demonstração
-- Usuário SuperAdmin: gabriel@zion.tec.br (40756abd-740a-48f7-aff2-e2c9889b9c2b)
-- ============================================================================

-- ============================================================================
-- 1. CRIAR EMPRESAS DE EXEMPLO
-- ============================================================================

INSERT INTO companies (id, name, document, created_at, updated_at)
VALUES 
  ('10000000-0000-4000-a000-000000000001', 'Zion Tecnologia Ltda', '12.345.678/0001-90', now(), now()),
  ('20000000-0000-4000-a000-000000000002', 'Acme Corporation', '98.765.432/0001-10', now(), now()),
  ('30000000-0000-4000-a000-000000000003', 'TechStart Inovação', '11.222.333/0001-44', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. CRIAR USUÁRIOS DE EXEMPLO PARA CADA EMPRESA
-- ============================================================================
-- NOTA: Não podemos criar profiles sem criar usuários na autenticação primeiro
-- Os profiles serão criados automaticamente via trigger quando novos usuários
-- fizerem signup. Por ora, vamos usar apenas o usuário superadmin existente.

-- ============================================================================
-- 3. CRIAR DEPARTAMENTOS PARA CADA EMPRESA
-- ============================================================================

-- Departamentos Zion
INSERT INTO departments (id, name, company_id, created_at, updated_at)
VALUES 
  ('d1000000-0000-4000-a000-000000000011', 'Tecnologia', '10000000-0000-4000-a000-000000000001', now(), now()),
  ('d1000000-0000-4000-a000-000000000012', 'Comercial', '10000000-0000-4000-a000-000000000001', now(), now()),
  ('d1000000-0000-4000-a000-000000000013', 'Administrativo', '10000000-0000-4000-a000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Departamentos Acme
INSERT INTO departments (id, name, company_id, created_at, updated_at)
VALUES 
  ('d2000000-0000-4000-a000-000000000021', 'Marketing', '20000000-0000-4000-a000-000000000002', now(), now()),
  ('d2000000-0000-4000-a000-000000000022', 'Vendas', '20000000-0000-4000-a000-000000000002', now(), now()),
  ('d2000000-0000-4000-a000-000000000023', 'Suporte', '20000000-0000-4000-a000-000000000002', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Departamentos TechStart
INSERT INTO departments (id, name, company_id, created_at, updated_at)
VALUES 
  ('d3000000-0000-4000-a000-000000000031', 'Desenvolvimento', '30000000-0000-4000-a000-000000000003', now(), now()),
  ('d3000000-0000-4000-a000-000000000032', 'Produto', '30000000-0000-4000-a000-000000000003', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. CRIAR CLIENTES PARA CADA EMPRESA
-- ============================================================================

-- Clientes Zion
INSERT INTO clients (id, nome, company_id, created_at, updated_at)
VALUES 
  ('c1000000-0000-4000-a000-000000000011', 'Cliente VIP', '10000000-0000-4000-a000-000000000001', now(), now()),
  ('c1000000-0000-4000-a000-000000000012', 'Cliente Estratégico', '10000000-0000-4000-a000-000000000001', now(), now()),
  ('c1000000-0000-4000-a000-000000000013', 'Cliente Premium', '10000000-0000-4000-a000-000000000001', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Clientes Acme
INSERT INTO clients (id, nome, company_id, created_at, updated_at)
VALUES 
  ('c2000000-0000-4000-a000-000000000021', 'Enterprise Inc', '20000000-0000-4000-a000-000000000002', now(), now()),
  ('c2000000-0000-4000-a000-000000000022', 'Global Solutions', '20000000-0000-4000-a000-000000000002', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Clientes TechStart
INSERT INTO clients (id, nome, company_id, created_at, updated_at)
VALUES 
  ('c3000000-0000-4000-a000-000000000031', 'Startup XYZ', '30000000-0000-4000-a000-000000000003', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. CRIAR PLANEJAMENTOS ESTRATÉGICOS
-- ============================================================================

-- Planejamento Zion 2025
INSERT INTO strategic_plans (id, name, execution_start, execution_end, company_id, created_by, created_at, updated_at)
VALUES 
  ('11100000-0000-4000-a000-000000000001', 
   'Planejamento Estratégico 2025', 
   '2025-01-01', 
   '2025-12-31', 
   '10000000-0000-4000-a000-000000000001',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   now(), 
   now())
ON CONFLICT (id) DO NOTHING;

-- Planejamento Acme 2025
INSERT INTO strategic_plans (id, name, execution_start, execution_end, company_id, created_by, created_at, updated_at)
VALUES 
  ('22200000-0000-4000-a000-000000000002', 
   'Strategic Plan 2025', 
   '2025-01-01', 
   '2025-12-31', 
   '20000000-0000-4000-a000-000000000002',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   now(), 
   now())
ON CONFLICT (id) DO NOTHING;

-- Planejamento TechStart 2025
INSERT INTO strategic_plans (id, name, execution_start, execution_end, company_id, created_by, created_at, updated_at)
VALUES 
  ('33300000-0000-4000-a000-000000000003', 
   'Plano de Crescimento 2025', 
   '2025-01-01', 
   '2025-12-31', 
   '30000000-0000-4000-a000-000000000003',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   now(), 
   now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. CRIAR MVV (Missão, Visão, Valores) PARA OS PLANEJAMENTOS
-- ============================================================================

-- MVV Zion
INSERT INTO plan_mvv (plan_id, mission, vision, values_text, updated_at)
VALUES 
  ('11100000-0000-4000-a000-000000000001',
   'Desenvolver soluções tecnológicas inovadoras que transformem a gestão empresarial.',
   'Ser referência nacional em sistemas de gestão estratégica até 2030.',
   'Inovação, Excelência, Transparência, Foco no Cliente',
   now())
ON CONFLICT (plan_id) DO UPDATE SET
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values_text = EXCLUDED.values_text,
  updated_at = EXCLUDED.updated_at;

-- MVV Acme
INSERT INTO plan_mvv (plan_id, mission, vision, values_text, updated_at)
VALUES 
  ('22200000-0000-4000-a000-000000000002',
   'Deliver world-class products and services to our customers.',
   'To be the global leader in our industry by 2030.',
   'Innovation, Integrity, Excellence, Customer Focus',
   now())
ON CONFLICT (plan_id) DO UPDATE SET
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values_text = EXCLUDED.values_text,
  updated_at = EXCLUDED.updated_at;

-- MVV TechStart
INSERT INTO plan_mvv (plan_id, mission, vision, values_text, updated_at)
VALUES 
  ('33300000-0000-4000-a000-000000000003',
   'Revolucionar o mercado com tecnologia disruptiva.',
   'Alcançar 100 mil clientes até 2026.',
   'Agilidade, Inovação, Resultados',
   now())
ON CONFLICT (plan_id) DO UPDATE SET
  mission = EXCLUDED.mission,
  vision = EXCLUDED.vision,
  values_text = EXCLUDED.values_text,
  updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 7. CRIAR OBJETIVOS ESTRATÉGICOS
-- ============================================================================

-- Objetivos Zion
INSERT INTO objectives (id, plan_id, title, summary, company_id, created_at, updated_at)
VALUES 
  ('01110000-0000-4000-a000-000000000001',
   '11100000-0000-4000-a000-000000000001',
   'Aumentar Receita em 50%',
   'Meta de crescimento de receita através de novos produtos e expansão de mercado.',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now()),
  ('01110000-0000-4000-a000-000000000002',
   '11100000-0000-4000-a000-000000000001',
   'Melhorar Satisfação do Cliente',
   'Atingir NPS de 80 pontos através de melhorias no atendimento e produto.',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now()),
  ('01110000-0000-4000-a000-000000000003',
   '11100000-0000-4000-a000-000000000001',
   'Expandir Equipe Técnica',
   'Contratar 20 novos desenvolvedores até o fim do ano.',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- Objetivos Acme
INSERT INTO objectives (id, plan_id, title, summary, company_id, created_at, updated_at)
VALUES 
  ('02220000-0000-4000-a000-000000000001',
   '22200000-0000-4000-a000-000000000002',
   'Market Expansion',
   'Enter 3 new international markets.',
   '20000000-0000-4000-a000-000000000002',
   now(),
   now()),
  ('02220000-0000-4000-a000-000000000002',
   '22200000-0000-4000-a000-000000000002',
   'Digital Transformation',
   'Implement cloud-first strategy across all departments.',
   '20000000-0000-4000-a000-000000000002',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- Objetivos TechStart
INSERT INTO objectives (id, plan_id, title, summary, company_id, created_at, updated_at)
VALUES 
  ('03330000-0000-4000-a000-000000000001',
   '33300000-0000-4000-a000-000000000003',
   'Captação de Investimento',
   'Conseguir Series A de R$ 5 milhões.',
   '30000000-0000-4000-a000-000000000003',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. CRIAR PLANOS DE AÇÃO (SMART)
-- ============================================================================

-- Planos de Ação Zion
INSERT INTO action_plans (
  id, plan_id, objective_id, title, description, owner_id, 
  start_date, end_date, status,
  company_id, created_at, updated_at
)
VALUES 
  ('a1110000-0000-4000-a000-000000000001',
   '11100000-0000-4000-a000-000000000001',
   '01110000-0000-4000-a000-000000000001',
   'Lançar Novo Produto SaaS',
   'Desenvolver e lançar sistema de gestão de projetos em cloud. Desenvolver plataforma SaaS de gestão de projetos com interface moderna. Atingir 500 clientes pagantes nos primeiros 6 meses.',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-01-15',
   '2025-06-30',
   'em_andamento',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now()),
  ('a1110000-0000-4000-a000-000000000002',
   '11100000-0000-4000-a000-000000000001',
   '01110000-0000-4000-a000-000000000002',
   'Programa de Satisfação do Cliente',
   'Implementar sistema de feedback e melhorias contínuas. Criar programa estruturado de coleta de feedback e ação. Aumentar NPS de 65 para 80 pontos.',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-02-01',
   '2025-08-31',
   'nao_iniciado',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- Planos de Ação Acme
INSERT INTO action_plans (
  id, plan_id, objective_id, title, description, owner_id, 
  start_date, end_date, status,
  company_id, created_at, updated_at
)
VALUES 
  ('a2220000-0000-4000-a000-000000000001',
   '22200000-0000-4000-a000-000000000002',
   '02220000-0000-4000-a000-000000000001',
   'Launch in LATAM',
   'Establish operations in Brazil, Mexico, and Argentina. Open offices and hire local teams in 3 LATAM countries. Achieve $2M revenue from LATAM by end of year.',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-03-01',
   '2025-12-31',
   'em_andamento',
   '20000000-0000-4000-a000-000000000002',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- Planos de Ação TechStart
INSERT INTO action_plans (
  id, plan_id, objective_id, title, description, owner_id, 
  start_date, end_date, status,
  company_id, created_at, updated_at
)
VALUES 
  ('a3330000-0000-4000-a000-000000000001',
   '33300000-0000-4000-a000-000000000003',
   '03330000-0000-4000-a000-000000000001',
   'Preparar Pitch de Investimento',
   'Desenvolver apresentação e materiais para investidores. Criar deck de apresentação, modelo financeiro e plano de negócios. Realizar 20 reuniões com fundos de VC até Abril.',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-01-10',
   '2025-04-30',
   'em_andamento',
   '30000000-0000-4000-a000-000000000003',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 9. CRIAR DESDOBRAMENTOS (Tarefas)
-- ============================================================================

-- Desdobramentos para "Lançar Novo Produto SaaS"
INSERT INTO action_breakdowns (
  id, action_plan_id, title, executor_id,
  start_date, end_date, status,
  company_id, created_at, updated_at
)
VALUES 
  ('b1110000-0000-4000-a000-000000000001',
   'a1110000-0000-4000-a000-000000000001',
   'Definir Requisitos do Produto - Levantar requisitos funcionais e não funcionais com stakeholders',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-01-15',
   '2025-02-15',
   'concluido',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now()),
  ('b1110000-0000-4000-a000-000000000002',
   'a1110000-0000-4000-a000-000000000001',
   'Desenvolver MVP - Implementar versão mínima viável do produto',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-02-16',
   '2025-04-30',
   'em_andamento',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now()),
  ('b1110000-0000-4000-a000-000000000003',
   'a1110000-0000-4000-a000-000000000001',
   'Testes Beta com Clientes - Realizar testes com 10 clientes selecionados',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-05-01',
   '2025-05-31',
   'nao_iniciado',
   '10000000-0000-4000-a000-000000000001',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- Desdobramentos para "Launch in LATAM"
INSERT INTO action_breakdowns (
  id, action_plan_id, title, executor_id,
  start_date, end_date, status,
  company_id, created_at, updated_at
)
VALUES 
  ('b2220000-0000-4000-a000-000000000001',
   'a2220000-0000-4000-a000-000000000001',
   'Market Research LATAM - Conduct comprehensive market analysis',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-03-01',
   '2025-04-15',
   'em_andamento',
   '20000000-0000-4000-a000-000000000002',
   now(),
   now()),
  ('b2220000-0000-4000-a000-000000000002',
   'a2220000-0000-4000-a000-000000000001',
   'Hire Country Managers - Recruit and onboard managers for Brazil, Mexico, Argentina',
   '40756abd-740a-48f7-aff2-e2c9889b9c2b',
   '2025-04-16',
   '2025-06-30',
   'nao_iniciado',
   '20000000-0000-4000-a000-000000000002',
   now(),
   now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 10. ATUALIZAR USUÁRIO GABRIEL COMO SUPERADMIN (se ainda não foi feito)
-- ============================================================================

UPDATE profiles 
SET 
  role = 'superadmin',
  company_id = NULL,
  updated_at = now()
WHERE id = '40756abd-740a-48f7-aff2-e2c9889b9c2b';

-- ============================================================================
-- 11. VERIFICAÇÕES FINAIS
-- ============================================================================

-- Ver resumo das empresas
SELECT 
  c.name as empresa,
  c.document as cnpj,
  (SELECT COUNT(*) FROM strategic_plans sp WHERE sp.company_id = c.id) as planejamentos,
  (SELECT COUNT(*) FROM departments d WHERE d.company_id = c.id) as departamentos,
  (SELECT COUNT(*) FROM clients cl WHERE cl.company_id = c.id) as clientes,
  (SELECT COUNT(*) FROM objectives o WHERE o.company_id = c.id) as objetivos,
  (SELECT COUNT(*) FROM action_plans ap WHERE ap.company_id = c.id) as planos_acao,
  (SELECT COUNT(*) FROM action_breakdowns ab WHERE ab.company_id = c.id) as desdobramentos
FROM companies c
ORDER BY c.name;

-- Ver usuário superadmin
SELECT id, email, nome, role, company_id 
FROM profiles 
WHERE role = 'superadmin';

-- ============================================================================
-- CONCLUÍDO!
-- ============================================================================
-- Dados de exemplo criados com sucesso!
-- 
-- EMPRESAS CRIADAS:
-- 1. Zion Tecnologia Ltda (11111111-1111-1111-1111-111111111111)
--    - 3 usuários, 3 departamentos, 3 clientes
--    - 1 planejamento com 3 objetivos e 2 planos de ação
--
-- 2. Acme Corporation (22222222-2222-2222-2222-222222222222)
--    - 2 usuários, 3 departamentos, 2 clientes
--    - 1 planejamento com 2 objetivos e 1 plano de ação
--
-- 3. TechStart Inovação (33333333-3333-3333-3333-333333333333)
--    - 1 usuário, 2 departamentos, 1 cliente
--    - 1 planejamento com 1 objetivo e 1 plano de ação
--
-- SUPERADMIN:
-- - gabriel@zion.tec.br pode acessar e gerenciar todas as empresas
-- ============================================================================
