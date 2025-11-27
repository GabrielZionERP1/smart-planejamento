// ============================================
// USER & AUTH TYPES
// ============================================

export interface Profile {
  id: string
  email: string
  nome: string
  avatar_url?: string
  departamento_id?: string
  role: 'admin' | 'gestor' | 'usuario'
  created_at: string
  updated_at: string
}

// ============================================
// ORGANIZATION TYPES
// ============================================

export interface Department {
  id: string
  name: string
  created_at: string
  updated_at: string | null
}

export interface Client {
  id: string
  nome: string
  email?: string
  telefone?: string
  endereco?: string
  created_at: string
  updated_at: string
}

// ============================================
// STRATEGIC PLANNING TYPES
// ============================================

export interface StrategicPlan {
  id: string
  name: string
  description?: string | null
  planning_date?: string | null
  execution_start?: string | null
  execution_end?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string | null
}

// MVV - Missão, Visão e Valores
export interface MVV {
  plan_id: string
  mission?: string | null
  vision?: string | null
  values_text?: string | null
  updated_at: string
}

// Objective - Objetivos Estratégicos
export interface Objective {
  id: string
  plan_id: string
  title: string
  summary?: string | null
  status: string
  position: number
  created_at: string
  updated_at: string | null
}

// Legacy Vision type (manter para compatibilidade)
export interface Vision {
  id: string
  planejamento_id: string
  missao?: string
  visao?: string
  valores?: string[]
  created_at: string
  updated_at: string
}

// ============================================
// ACTION PLAN TYPES (SMART)
// ============================================

export interface ActionPlan {
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
  
  // Additional fields
  responsavel?: string
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'atrasado' | 'cancelado'
  progresso_percentual: number
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  plano_acao_id: string
  titulo: string
  data_prevista: string
  data_conclusao?: string
  status: 'pendente' | 'concluido' | 'atrasado'
  created_at: string
}

// ============================================
// BREAKDOWN TYPES
// ============================================

// Legacy ActionBreakdown type (deprecated - use Fase 5 ActionBreakdown instead)
export interface LegacyActionBreakdown {
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

export interface LegacyBreakdownHistory {
  id: string
  desdobramento_id: string
  usuario_id?: string
  tipo_atualizacao: 'status' | 'progresso' | 'comentario' | 'edicao'
  valor_anterior?: string
  valor_novo?: string
  comentario?: string
  created_at: string
}

// ============================================
// RELATIONSHIP TYPES (WITH JOINS)
// ============================================

export interface StrategicPlanWithVision extends StrategicPlan {
  visoes_estrategicas?: Vision[]
}

export interface VisionWithObjectives extends Vision {
  objetivos_estrategicos?: Objective[]
}

export interface ObjectiveWithActions extends Objective {
  planos_acao?: ActionPlan[]
}

export interface ActionPlanWithBreakdowns extends ActionPlan {
  desdobramentos?: ActionBreakdown[]
  marcos?: Milestone[]
}

export interface BreakdownWithHistory extends ActionBreakdown {
  historico_desdobramentos?: BreakdownHistory[]
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string
  password: string
}

export interface StrategicPlanFormData {
  name: string
  description?: string
  planning_date?: string
  execution_start?: string
  execution_end?: string
}

// Legacy interface (manter para compatibilidade)
export interface ObjectiveLegacyFormData {
  titulo: string
  descricao?: string
  categoria?: string
  prazo_esperado?: string
}

// Nova interface para novos formulários
export interface ObjectiveFormData {
  title: string
  summary?: string
}

export interface ActionPlanFormData {
  titulo: string
  descricao_especifica: string
  indicador: string
  meta_numerica: number
  unidade_medida: string
  recursos_necessarios?: string
  justificativa_relevancia: string
  data_inicio: string
  data_fim: string
  responsavel?: string
}

export interface BreakdownFormData {
  titulo: string
  descricao?: string
  responsavel?: string
  data_inicio?: string
  data_fim?: string
  ordem: number
}

// ============================================
// FASE 4: ACTION PLANS (PLANOS DE AÇÃO)
// ============================================

export interface ActionPlan {
  id: string
  plan_id: string
  objective_id: string | null
  title: string
  description?: string | null
  department_id?: string | null
  owner_id?: string | null
  start_date?: string | null
  end_date?: string | null
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado' | 'atrasado'
  progress: number
  created_at: string
  updated_at: string
}

export interface ActionPlanParticipant {
  action_plan_id: string
  profile_id: string
}

// ============================================
// FASE 5: ACTION BREAKDOWNS (DESDOBRAMENTOS)
// ============================================

export interface ActionBreakdown {
  id: string
  action_plan_id: string
  title: string
  executor_id?: string | null
  required_resources?: string | null
  financial_resources?: number | null
  start_date?: string | null
  end_date?: string | null
  effort: number
  status: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado' | 'atrasado'
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface BreakdownHistory {
  id: string
  breakdown_id: string
  created_by?: string | null
  created_at: string
  note: string
}

export interface BreakdownAttachment {
  id: string
  breakdown_id: string
  file_name: string
  file_url: string
  mime_type?: string | null
  file_size?: number | null
  uploaded_by?: string | null
  uploaded_at: string
}

// ============================================
// FASE 6: DASHBOARD TYPES
// ============================================

export interface UpcomingTask {
  id: string
  title: string
  due_date: string
  type: 'plan' | 'breakdown'
  status: string
}

export interface UserDashboardData {
  total_plans: number
  total_action_plans: number
  total_breakdowns: number
  upcoming_tasks: UpcomingTask[]
  late_tasks: number
}

export interface DepartmentRanking {
  department_id: string
  department_name: string
  progress: number
}

export interface StatusCounts {
  nao_iniciado: number
  em_andamento: number
  concluido: number
  atrasado: number
  cancelado: number
}

export interface ManagerDashboardData {
  total_plans: number
  total_objectives: number
  total_action_plans: number
  total_breakdowns: number
  global_progress: number
  department_ranking: DepartmentRanking[]
  status_counts: StatusCounts
  critical_alerts: number
}

export interface EffortDistribution {
  low: number
  medium: number
  high: number
}

export interface PlanOverview {
  plan_id: string
  plan_name: string
  objectives_count: number
  action_plans_count: number
  breakdowns_count: number
  progress: number
  late_breakdowns: number
  effort_distribution: EffortDistribution
}
