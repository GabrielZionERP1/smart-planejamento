import { createClient } from './supabase/client'
import { StrategicPlan, StrategicPlanFormData } from './types'
import { getCurrentUser, getCurrentUserCompanyId } from './auth'

// Criar cliente Supabase com sessão do usuário
function getSupabaseClient() {
  return createClient()
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Busca todos os planejamentos estratégicos ordenados por data de criação (sem paginação)
 */
export async function getStrategicPlans(): Promise<StrategicPlan[]> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  
  let query = supabase
    .from('strategic_plans')
    .select('*')
    .order('created_at', { ascending: false })

  // Filtrar por empresa se o usuário tiver company_id
  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar planejamentos: ${error.message}`)
  }

  return data as StrategicPlan[]
}

/**
 * Busca planejamentos estratégicos com paginação
 */
export async function getStrategicPlansPaginated(
  page = 1,
  pageSize = 10
): Promise<PaginatedResponse<StrategicPlan>> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('strategic_plans')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Filtrar por empresa se o usuário tiver company_id
  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Erro ao buscar planejamentos: ${error.message}`)
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return {
    data: data as StrategicPlan[],
    count: count || 0,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Busca um planejamento estratégico por ID
 */
export async function getStrategicPlanById(id: string): Promise<StrategicPlan | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('strategic_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Registro não encontrado
    }
    throw new Error(`Erro ao buscar planejamento: ${error.message}`)
  }

  return data as StrategicPlan
}

/**
 * Cria um novo planejamento estratégico
 */
export async function createStrategicPlan(
  payload: StrategicPlanFormData
): Promise<StrategicPlan> {
  let userId: string | null = null
  let companyId: string | null = null

  try {
    const user = await getCurrentUser()
    userId = user?.id || null
    companyId = await getCurrentUserCompanyId()
    console.log('👤 Usuário obtido para criação:', userId, 'Empresa:', companyId)
  } catch (error) {
    console.error('⚠️ Erro ao obter usuário:', error)
    // Se não conseguir obter o usuário, continua sem o created_by
  }

  const insertData = {
    name: payload.name,
    description: payload.description || null,
    planning_date: payload.planning_date || null,
    execution_start: payload.execution_start || null,
    execution_end: payload.execution_end || null,
    created_by: userId,
    company_id: companyId,
  }

  console.log('📤 Dados a inserir:', insertData)

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('strategic_plans')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('❌ Erro do Supabase:', error)
    throw new Error(`Erro ao criar planejamento: ${error.message}`)
  }

  console.log('✅ Planejamento criado:', data)

  return data as StrategicPlan
}

/**
 * Atualiza um planejamento estratégico existente
 */
export async function updateStrategicPlan(
  id: string,
  payload: Partial<StrategicPlanFormData>
): Promise<StrategicPlan> {
  const supabase = getSupabaseClient()
  const updateData: Partial<StrategicPlan> = {}

  if (payload.name !== undefined) updateData.name = payload.name
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.planning_date !== undefined) updateData.planning_date = payload.planning_date
  if (payload.execution_start !== undefined) updateData.execution_start = payload.execution_start
  if (payload.execution_end !== undefined) updateData.execution_end = payload.execution_end

  const { data, error } = await supabase
    .from('strategic_plans')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar planejamento: ${error.message}`)
  }

  return data as StrategicPlan
}

/**
 * Deleta um planejamento estratégico
 */
export async function deleteStrategicPlan(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('strategic_plans')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Erro ao deletar planejamento: ${error.message}`)
  }
}
