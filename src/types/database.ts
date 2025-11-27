// Tipos gerados baseados no schema do Supabase

export interface Planejamento {
  id: string
  nome: string
  descricao?: string
  data_inicio: string
  data_fim: string
  status: 'ativo' | 'concluido' | 'cancelado'
  organizacao_id: string
  criado_por?: string
  created_at: string
  updated_at: string
}

export interface VisaoEstrategica {
  id: string
  planejamento_id: string
  missao?: string
  visao?: string
  valores?: string[]
  created_at: string
  updated_at: string
}

export interface ObjetivoEstrategico {
  id: string
  visao_estrategica_id: string
  titulo: string
  descricao?: string
  categoria?: string
  prazo_esperado?: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado'
  created_at: string
  updated_at: string
}

export interface PlanoAcao {
  id: string
  objetivo_estrategico_id: string
  
  // SMART: Specific
  titulo: string
  descricao_especifica: string
  
  // SMART: Measurable
  indicador: string
  meta_numerica: number
  unidade_medida: string
  
  // SMART: Achievable
  recursos_necessarios?: string
  viavel: boolean
  
  // SMART: Relevant
  justificativa_relevancia: string
  
  // SMART: Time-bound
  data_inicio: string
  data_fim: string
  
  // Campos adicionais
  responsavel?: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado'
  progresso_percentual: number
  created_at: string
  updated_at: string
}

export interface Marco {
  id: string
  plano_acao_id: string
  titulo: string
  data_prevista: string
  data_conclusao?: string
  status: 'pendente' | 'concluido' | 'atrasado'
  created_at: string
}

export interface Desdobramento {
  id: string
  plano_acao_id: string
  titulo: string
  descricao?: string
  responsavel?: string
  data_inicio?: string
  data_fim?: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  progresso_percentual: number
  ordem: number
  created_at: string
  updated_at: string
}

export interface HistoricoDesdobramento {
  id: string
  desdobramento_id: string
  usuario_id?: string
  tipo_atualizacao: 'status' | 'progresso' | 'comentario' | 'edicao'
  valor_anterior?: string
  valor_novo?: string
  comentario?: string
  created_at: string
}

// Tipos com relacionamentos (para queries com joins)
export interface PlanejamentoComVisoes extends Planejamento {
  visoes_estrategicas?: VisaoEstrategica[]
}

export interface VisaoEstrategicaComObjetivos extends VisaoEstrategica {
  objetivos_estrategicos?: ObjetivoEstrategico[]
}

export interface ObjetivoComPlanos extends ObjetivoEstrategico {
  planos_acao?: PlanoAcao[]
}

export interface PlanoAcaoComDesdobramentos extends PlanoAcao {
  desdobramentos?: Desdobramento[]
  marcos?: Marco[]
}

export interface DesdobramentoComHistorico extends Desdobramento {
  historico_desdobramentos?: HistoricoDesdobramento[]
}
