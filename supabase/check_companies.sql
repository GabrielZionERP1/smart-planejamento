-- ============================================================================
-- VERIFICAR EMPRESAS NO BANCO
-- ============================================================================

-- 1. Ver todas as empresas cadastradas
SELECT id, name, document, created_at FROM companies ORDER BY created_at;

-- 2. Contar total de empresas
SELECT COUNT(*) as total_empresas FROM companies;

-- 3. Verificar se as empresas do seed existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE id = '10000000-0000-4000-a000-000000000001') 
    THEN 'SIM' ELSE 'NÃO' 
  END as zion_existe,
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE id = '20000000-0000-4000-a000-000000000002') 
    THEN 'SIM' ELSE 'NÃO' 
  END as acme_existe,
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE id = '30000000-0000-4000-a000-000000000003') 
    THEN 'SIM' ELSE 'NÃO' 
  END as techstart_existe;
