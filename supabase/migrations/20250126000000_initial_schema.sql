-- Criação das tabelas para o sistema SMART de Planejamento Estratégico
-- Hierarquia: Planejamento > Visão Estratégica > Planos de Ação > Desdobramentos

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NÍVEL 1: PLANEJAMENTO
-- ============================================
CREATE TABLE planejamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  organizacao_id UUID NOT NULL,
  criado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT datas_validas CHECK (data_fim > data_inicio)
);

-- ============================================
-- NÍVEL 2: VISÃO ESTRATÉGICA
-- ============================================
CREATE TABLE visoes_estrategicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planejamento_id UUID NOT NULL REFERENCES planejamentos(id) ON DELETE CASCADE,
  missao TEXT,
  visao TEXT,
  valores TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objetivos Estratégicos (parte da Visão Estratégica)
CREATE TABLE objetivos_estrategicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visao_estrategica_id UUID NOT NULL REFERENCES visoes_estrategicas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  prazo_esperado DATE,
  status VARCHAR(50) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido', 'atrasado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NÍVEL 3: PLANOS DE AÇÃO (SMART)
-- ============================================
CREATE TABLE planos_acao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objetivo_estrategico_id UUID NOT NULL REFERENCES objetivos_estrategicos(id) ON DELETE CASCADE,
  
  -- Critério SMART: Specific
  titulo VARCHAR(255) NOT NULL,
  descricao_especifica TEXT NOT NULL,
  
  -- Critério SMART: Measurable
  indicador VARCHAR(255) NOT NULL,
  meta_numerica DECIMAL(15, 2) NOT NULL,
  unidade_medida VARCHAR(50) NOT NULL,
  
  -- Critério SMART: Achievable
  recursos_necessarios TEXT,
  viavel BOOLEAN DEFAULT true,
  
  -- Critério SMART: Relevant
  justificativa_relevancia TEXT NOT NULL,
  
  -- Critério SMART: Time-bound
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  -- Campos adicionais
  responsavel UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido', 'atrasado', 'cancelado')),
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT datas_validas CHECK (data_fim > data_inicio)
);

-- Marcos/Milestones do Plano de Ação
CREATE TABLE marcos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_acao_id UUID NOT NULL REFERENCES planos_acao(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  data_prevista DATE NOT NULL,
  data_conclusao DATE,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'atrasado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NÍVEL 4: DESDOBRAMENTOS
-- ============================================
CREATE TABLE desdobramentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_acao_id UUID NOT NULL REFERENCES planos_acao(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  responsavel UUID REFERENCES auth.users(id),
  data_inicio DATE,
  data_fim DATE,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de atualizações dos desdobramentos
CREATE TABLE historico_desdobramentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  desdobramento_id UUID NOT NULL REFERENCES desdobramentos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  tipo_atualizacao VARCHAR(50) NOT NULL CHECK (tipo_atualizacao IN ('status', 'progresso', 'comentario', 'edicao')),
  valor_anterior TEXT,
  valor_novo TEXT,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_planejamentos_org ON planejamentos(organizacao_id);
CREATE INDEX idx_visoes_planejamento ON visoes_estrategicas(planejamento_id);
CREATE INDEX idx_objetivos_visao ON objetivos_estrategicos(visao_estrategica_id);
CREATE INDEX idx_planos_objetivo ON planos_acao(objetivo_estrategico_id);
CREATE INDEX idx_marcos_plano ON marcos(plano_acao_id);
CREATE INDEX idx_desdobramentos_plano ON desdobramentos(plano_acao_id);
CREATE INDEX idx_historico_desdobramento ON historico_desdobramentos(desdobramento_id);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_planejamentos_updated_at BEFORE UPDATE ON planejamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visoes_updated_at BEFORE UPDATE ON visoes_estrategicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objetivos_updated_at BEFORE UPDATE ON objetivos_estrategicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON planos_acao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desdobramentos_updated_at BEFORE UPDATE ON desdobramentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE planejamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visoes_estrategicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos_estrategicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE desdobramentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_desdobramentos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidades específicas de permissões)
-- Por enquanto, usuários autenticados podem ver e editar tudo da sua organização

CREATE POLICY "Usuários podem ver planejamentos da própria org" ON planejamentos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar planejamentos" ON planejamentos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar planejamentos" ON planejamentos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar planejamentos" ON planejamentos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas similares para outras tabelas (simplificado por ora)
CREATE POLICY "Usuários autenticados podem acessar visões" ON visoes_estrategicas
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem acessar objetivos" ON objetivos_estrategicos
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem acessar planos" ON planos_acao
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem acessar marcos" ON marcos
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem acessar desdobramentos" ON desdobramentos
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem acessar histórico" ON historico_desdobramentos
  FOR ALL USING (auth.uid() IS NOT NULL);
