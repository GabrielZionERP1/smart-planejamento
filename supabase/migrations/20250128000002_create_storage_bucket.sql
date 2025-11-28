-- ============================================================================
-- MIGRATION: Criar bucket de storage para logos de empresas
-- ============================================================================

-- Criar bucket público se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public' AND (storage.foldername(name))[1] = 'company-logos');

-- Política para permitir leitura pública
CREATE POLICY IF NOT EXISTS "Logos são públicas para leitura"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'company-logos');

-- Política para permitir atualização (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem atualizar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'company-logos');

-- Política para permitir deleção (apenas autenticados)
CREATE POLICY IF NOT EXISTS "Usuários autenticados podem deletar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'company-logos');
