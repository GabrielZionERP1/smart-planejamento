-- Migration: Histórico e Anexos de Desdobramentos
-- Criado em: 2025-01-26
-- Descrição: Tabelas para armazenar histórico textual e anexos dos desdobramentos

-- =====================================================
-- REMOVER TABELAS ANTIGAS
-- =====================================================
DROP TABLE IF EXISTS public.breakdown_history CASCADE;
DROP TABLE IF EXISTS public.action_breakdown_attachments CASCADE;

-- =====================================================
-- TABELA: breakdown_history
-- Descrição: Armazena histórico de comentários e mudanças de status
-- =====================================================
CREATE TABLE public.breakdown_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakdown_id UUID NOT NULL REFERENCES public.action_breakdowns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de entrada: 'comment' (comentário), 'status_change' (mudança de status), 'update' (atualização geral)
  entry_type TEXT NOT NULL CHECK (entry_type IN ('comment', 'status_change', 'update')),
  
  -- Conteúdo textual
  content TEXT NOT NULL,
  
  -- Metadados opcionais (JSON)
  -- Para status_change: { "old_status": "não iniciado", "new_status": "em andamento" }
  -- Para update: { "field": "responsible", "old_value": "João", "new_value": "Maria" }
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para performance
CREATE INDEX idx_breakdown_history_breakdown_id ON public.breakdown_history(breakdown_id);
CREATE INDEX idx_breakdown_history_user_id ON public.breakdown_history(user_id);
CREATE INDEX idx_breakdown_history_created_at ON public.breakdown_history(created_at DESC);
CREATE INDEX idx_breakdown_history_entry_type ON public.breakdown_history(entry_type);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_breakdown_history_updated_at
  BEFORE UPDATE ON public.breakdown_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.breakdown_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_can_select_breakdown_history"
  ON public.breakdown_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_insert_breakdown_history"
  ON public.breakdown_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_update_own_breakdown_history"
  ON public.breakdown_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_delete_own_breakdown_history"
  ON public.breakdown_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: breakdown_attachments
-- Descrição: Armazena metadados de arquivos anexados aos desdobramentos
-- =====================================================
CREATE TABLE public.breakdown_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakdown_id UUID NOT NULL REFERENCES public.action_breakdowns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informações do arquivo
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Caminho no Supabase Storage
  file_size BIGINT NOT NULL, -- Tamanho em bytes
  file_type TEXT NOT NULL, -- MIME type (image/png, application/pdf, etc.)
  
  -- Descrição opcional do anexo
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para performance
CREATE INDEX idx_breakdown_attachments_breakdown_id ON public.breakdown_attachments(breakdown_id);
CREATE INDEX idx_breakdown_attachments_user_id ON public.breakdown_attachments(user_id);
CREATE INDEX idx_breakdown_attachments_created_at ON public.breakdown_attachments(created_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_breakdown_attachments_updated_at
  BEFORE UPDATE ON public.breakdown_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.breakdown_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_can_select_breakdown_attachments"
  ON public.breakdown_attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_insert_breakdown_attachments"
  ON public.breakdown_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_update_own_breakdown_attachments"
  ON public.breakdown_attachments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_can_delete_own_breakdown_attachments"
  ON public.breakdown_attachments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- STORAGE: breakdown-attachments bucket
-- Descrição: Bucket para armazenar arquivos dos desdobramentos
-- =====================================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('breakdown-attachments', 'breakdown-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket
CREATE POLICY "authenticated_can_upload_breakdown_attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'breakdown-attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "authenticated_can_view_breakdown_attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'breakdown-attachments');

CREATE POLICY "authenticated_can_delete_own_breakdown_attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'breakdown-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- FUNÇÃO: Registrar mudança de status automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION log_breakdown_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou, registrar no histórico
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.breakdown_history (
      breakdown_id,
      user_id,
      entry_type,
      content,
      metadata
    ) VALUES (
      NEW.id,
      auth.uid(),
      'status_change',
      'Status alterado de "' || OLD.status || '" para "' || NEW.status || '"',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar mudanças de status
CREATE TRIGGER breakdown_status_change_trigger
  AFTER UPDATE ON public.action_breakdowns
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_breakdown_status_change();

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================
COMMENT ON TABLE public.breakdown_history IS 'Histórico de comentários e mudanças nos desdobramentos';
COMMENT ON TABLE public.breakdown_attachments IS 'Metadados de arquivos anexados aos desdobramentos';
COMMENT ON COLUMN public.breakdown_history.entry_type IS 'Tipo: comment, status_change ou update';
COMMENT ON COLUMN public.breakdown_history.metadata IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN public.breakdown_attachments.file_path IS 'Caminho completo no Supabase Storage';
