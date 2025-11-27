-- =====================================================
-- FASE 5: ACTION BREAKDOWNS (DESDOBRAMENTOS DE AÇÃO)
-- =====================================================
-- Este módulo implementa desdobramentos de ação com:
-- - Subatividades detalhadas
-- - Histórico textual
-- - Anexos múltiplos via Storage
-- =====================================================

-- Tabela de Desdobramentos de Ação
CREATE TABLE IF NOT EXISTS public.action_breakdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executor_id UUID,
  required_resources TEXT,
  financial_resources NUMERIC(14,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  effort SMALLINT DEFAULT 1 CHECK (effort >= 1 AND effort <= 3),
  status TEXT DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido', 'cancelado', 'atrasado')),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Histórico de Desdobramentos
CREATE TABLE IF NOT EXISTS public.breakdown_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakdown_id UUID NOT NULL REFERENCES public.action_breakdowns(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT NOT NULL
);

-- Tabela de Anexos de Desdobramentos
CREATE TABLE IF NOT EXISTS public.action_breakdown_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breakdown_id UUID NOT NULL REFERENCES public.action_breakdowns(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_breakdowns_action_plan ON public.action_breakdowns(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_breakdowns_status ON public.action_breakdowns(status);
CREATE INDEX IF NOT EXISTS idx_breakdowns_executor ON public.action_breakdowns(executor_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_history_breakdown ON public.breakdown_history(breakdown_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_attachments_breakdown ON public.action_breakdown_attachments(breakdown_id);

-- Trigger para atualizar updated_at em action_breakdowns
CREATE OR REPLACE FUNCTION update_breakdown_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_breakdown_updated_at
  BEFORE UPDATE ON public.action_breakdowns
  FOR EACH ROW
  EXECUTE FUNCTION update_breakdown_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.action_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakdown_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_breakdown_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para action_breakdowns
CREATE POLICY "Usuários autenticados podem visualizar desdobramentos"
  ON public.action_breakdowns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar desdobramentos"
  ON public.action_breakdowns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar desdobramentos"
  ON public.action_breakdowns FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem excluir desdobramentos"
  ON public.action_breakdowns FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para breakdown_history
CREATE POLICY "Usuários autenticados podem visualizar histórico"
  ON public.breakdown_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem adicionar histórico"
  ON public.breakdown_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem excluir histórico"
  ON public.breakdown_history FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para action_breakdown_attachments
CREATE POLICY "Usuários autenticados podem visualizar anexos"
  ON public.action_breakdown_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem adicionar anexos"
  ON public.action_breakdown_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem excluir anexos"
  ON public.action_breakdown_attachments FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- STORAGE BUCKET PARA ANEXOS
-- =====================================================

-- Criar bucket para anexos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('smart-attachments', 'smart-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Usuários autenticados podem fazer upload de anexos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'smart-attachments');

CREATE POLICY "Anexos são publicamente acessíveis"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'smart-attachments');

CREATE POLICY "Usuários autenticados podem excluir anexos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'smart-attachments');
