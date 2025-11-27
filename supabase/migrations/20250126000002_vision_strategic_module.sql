-- ============================================
-- FASE 3: VISÃO ESTRATÉGICA - TABELAS SUPABASE
-- ============================================
-- Execute este SQL no seu projeto Supabase para criar as tabelas necessárias

-- Tabela para MVV (Missão, Visão e Valores)
CREATE TABLE IF NOT EXISTS public.plan_mvv (
  plan_id UUID PRIMARY KEY REFERENCES public.strategic_plans(id) ON DELETE CASCADE,
  mission TEXT,
  vision TEXT,
  values_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para Objetivos Estratégicos
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.strategic_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'ativo',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_plan_mvv_plan_id ON public.plan_mvv(plan_id);
CREATE INDEX IF NOT EXISTS idx_objectives_plan_id ON public.objectives(plan_id);
CREATE INDEX IF NOT EXISTS idx_objectives_position ON public.objectives(position);

-- RLS (Row Level Security) Policies
-- Habilitar RLS nas tabelas
ALTER TABLE public.plan_mvv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

-- Política para plan_mvv: usuários autenticados podem ler e modificar
CREATE POLICY "Usuarios autenticados podem ler MVV"
  ON public.plan_mvv FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem inserir MVV"
  ON public.plan_mvv FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem atualizar MVV"
  ON public.plan_mvv FOR UPDATE
  TO authenticated
  USING (true);

-- Política para objectives: usuários autenticados podem fazer CRUD
CREATE POLICY "Usuarios autenticados podem ler objectives"
  ON public.objectives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem inserir objectives"
  ON public.objectives FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados podem atualizar objectives"
  ON public.objectives FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados podem deletar objectives"
  ON public.objectives FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_mvv_updated_at
  BEFORE UPDATE ON public.plan_mvv
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
