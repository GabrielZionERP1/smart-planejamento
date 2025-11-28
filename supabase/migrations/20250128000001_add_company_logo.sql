-- ============================================================================
-- MIGRATION: Adicionar campo logo_url na tabela companies
-- ============================================================================

-- Adicionar coluna logo_url se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' 
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN logo_url TEXT;
    COMMENT ON COLUMN public.companies.logo_url IS 'URL da logo da empresa';
  END IF;
END $$;
