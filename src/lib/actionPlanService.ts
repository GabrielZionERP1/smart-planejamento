import { supabaseClient } from './supabaseClient'
import { ActionPlan, ActionPlanParticipant } from './types'

/**
 * Busca todos os planos de ação de um planejamento estratégico
 */
export async function getActionPlans(planId: string): Promise<ActionPlan[]> {
  const { data, error } = await supabaseClient
    .from('action_plans')
    .select('*')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar planos de ação: ${error.message}`)
  }

  return data as ActionPlan[]
}

/**
 * Busca um plano de ação por ID
 */
export async function getActionPlanById(id: string): Promise<ActionPlan | null> {
  const { data, error } = await supabaseClient
    .from('action_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Registro não encontrado
    }
    throw new Error(`Erro ao buscar plano de ação: ${error.message}`)
  }

  return data as ActionPlan
}

/**
 * Cria um novo plano de ação
 */
export async function createActionPlan(payload: {
  plan_id: string
  objective_id?: string | null
  title: string
  description?: string
  department_id?: string | null
  owner_id?: string | null
  start_date?: string
  end_date?: string
}): Promise<ActionPlan> {
  const { data, error } = await supabaseClient
    .from('action_plans')
    .insert({
      plan_id: payload.plan_id,
      objective_id: payload.objective_id || null,
      title: payload.title,
      description: payload.description || null,
      department_id: payload.department_id || null,
      owner_id: payload.owner_id || null,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      status: 'nao_iniciado',
      progress: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar plano de ação: ${error.message}`)
  }

  return data as ActionPlan
}

/**
 * Atualiza um plano de ação existente
 */
export async function updateActionPlan(
  id: string,
  payload: Partial<{
    objective_id: string | null
    title: string
    description: string | null
    department_id: string | null
    owner_id: string | null
    start_date: string | null
    end_date: string | null
    status: string
    progress: number
  }>
): Promise<ActionPlan> {
  const { data, error } = await supabaseClient
    .from('action_plans')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar plano de ação: ${error.message}`)
  }

  return data as ActionPlan
}

/**
 * Exclui um plano de ação
 */
export async function deleteActionPlan(id: string): Promise<void> {
  const { error } = await supabaseClient
    .from('action_plans')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao excluir plano de ação: ${error.message}`)
  }
}

/**
 * Busca os participantes de um plano de ação
 */
export async function getActionPlanParticipants(
  actionPlanId: string
): Promise<ActionPlanParticipant[]> {
  const { data, error } = await supabaseClient
    .from('action_plan_participants')
    .select('*')
    .eq('action_plan_id', actionPlanId)

  if (error) {
    throw new Error(`Erro ao buscar participantes: ${error.message}`)
  }

  return data as ActionPlanParticipant[]
}

/**
 * Define os participantes de um plano de ação
 * Remove os participantes atuais e adiciona os novos
 */
export async function setActionPlanParticipants(
  actionPlanId: string,
  participantIds: string[]
): Promise<void> {
  // Primeiro, remove todos os participantes atuais
  const { error: deleteError } = await supabaseClient
    .from('action_plan_participants')
    .delete()
    .eq('action_plan_id', actionPlanId)

  if (deleteError) {
    throw new Error(`Erro ao remover participantes: ${deleteError.message}`)
  }

  // Se não há novos participantes, retorna
  if (participantIds.length === 0) {
    return
  }

  // Adiciona os novos participantes
  const participants = participantIds.map((profileId) => ({
    action_plan_id: actionPlanId,
    profile_id: profileId,
  }))

  const { error: insertError } = await supabaseClient
    .from('action_plan_participants')
    .insert(participants)

  if (insertError) {
    throw new Error(`Erro ao adicionar participantes: ${insertError.message}`)
  }
}
