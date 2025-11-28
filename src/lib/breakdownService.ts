import { createClient } from './supabase/client'
import { getCurrentUserCompanyId } from './auth'

// Criar cliente Supabase com sessão do usuário
function getSupabaseClient() {
  return createClient()
}

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
  status: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateBreakdownPayload {
  action_plan_id: string
  title: string
  executor_id?: string
  required_resources?: string
  financial_resources?: number
  start_date?: string
  end_date?: string
  effort?: number
  status?: string
}

export interface UpdateBreakdownPayload {
  title?: string
  executor_id?: string | null
  required_resources?: string | null
  financial_resources?: number | null
  start_date?: string | null
  end_date?: string | null
  effort?: number
  status?: string
  is_completed?: boolean
}

/**
 * Busca todos os desdobramentos de um plano de ação
 */
export async function getBreakdownsByActionPlan(
  action_plan_id: string
): Promise<ActionBreakdown[]> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('action_breakdowns')
    .select('*')
    .eq('action_plan_id', action_plan_id)
    .order('created_at', { ascending: true })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar desdobramentos: ${error.message}`)
  }

  return data || []
}

/**
 * Busca um desdobramento por ID
 */
export async function getBreakdownById(id: string): Promise<ActionBreakdown> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('action_breakdowns')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Erro ao buscar desdobramento: ${error.message}`)
  }

  if (!data) {
    throw new Error('Desdobramento não encontrado')
  }

  return data
}

/**
 * Cria um novo desdobramento
 */
export async function createBreakdown(
  payload: CreateBreakdownPayload
): Promise<ActionBreakdown> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  const { data, error } = await supabase
    .from('action_breakdowns')
    .insert({
      action_plan_id: payload.action_plan_id,
      title: payload.title,
      executor_id: payload.executor_id || null,
      required_resources: payload.required_resources || null,
      financial_resources: payload.financial_resources || 0,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      effort: payload.effort || 1,
      status: payload.status || 'nao_iniciado',
      is_completed: false,
      company_id: companyId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar desdobramento: ${error.message}`)
  }

  if (!data) {
    throw new Error('Falha ao criar desdobramento')
  }

  return data
}

/**
 * Atualiza um desdobramento existente
 */
export async function updateBreakdown(
  id: string,
  payload: UpdateBreakdownPayload
): Promise<ActionBreakdown> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('action_breakdowns')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar desdobramento: ${error.message}`)
  }

  if (!data) {
    throw new Error('Desdobramento não encontrado')
  }

  return data
}

/**
 * Exclui um desdobramento
 */
export async function deleteBreakdown(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('action_breakdowns')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao excluir desdobramento: ${error.message}`)
  }
}

/**
 * Marca um desdobramento como concluído
 */
export async function toggleBreakdownCompletion(
  id: string,
  is_completed: boolean
): Promise<ActionBreakdown> {
  const status = is_completed ? 'concluido' : 'em_andamento'
  
  return updateBreakdown(id, {
    is_completed,
    status,
  })
}
