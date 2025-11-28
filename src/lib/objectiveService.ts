import { createClient } from './supabase/client'
import { getCurrentUserCompanyId } from './auth'

// Criar cliente Supabase com sessão do usuário
function getSupabaseClient() {
  return createClient()
}

export interface ObjectivePayload {
  title: string
  summary?: string
}

export interface ObjectiveUpdatePayload {
  title?: string
  summary?: string
  status?: string
  position?: number
}

/**
 * Busca todos os objetivos de um planejamento
 */
export async function getObjectives(plan_id: string) {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('objectives')
    .select('*')
    .eq('plan_id', plan_id)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  // Filtrar por empresa se o usuário tiver company_id
  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message || 'Erro ao buscar objetivos')
  }

  return data || []
}

/**
 * Cria um novo objetivo estratégico
 */
export async function createObjective(plan_id: string, payload: ObjectivePayload) {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  // Busca a maior posição atual para adicionar no final
  const { data: maxPosition } = await supabase
    .from('objectives')
    .select('position')
    .eq('plan_id', plan_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = maxPosition ? maxPosition.position + 1 : 0

  const { data, error } = await supabase
    .from('objectives')
    .insert({
      plan_id,
      title: payload.title,
      summary: payload.summary || null,
      position: newPosition,
      status: 'ativo',
      company_id: companyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Erro ao criar objetivo')
  }

  return data
}

/**
 * Atualiza um objetivo existente
 */
export async function updateObjective(id: string, payload: ObjectiveUpdatePayload) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('objectives')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Erro ao atualizar objetivo')
  }

  return data
}

/**
 * Exclui um objetivo
 */
export async function deleteObjective(id: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('objectives')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message || 'Erro ao excluir objetivo')
  }
}
