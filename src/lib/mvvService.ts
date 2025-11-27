import { createClient } from './supabase/client'

// Criar cliente Supabase com sessão do usuário
function getSupabaseClient() {
  return createClient()
}

export interface MVVPayload {
  mission?: string
  vision?: string
  values_text?: string
}

/**
 * Busca os dados de MVV (Missão, Visão, Valores) de um planejamento
 */
export async function getMVV(plan_id: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('plan_mvv')
    .select('*')
    .eq('plan_id', plan_id)
    .single()

  // Se não existe registro ainda, retorna estrutura vazia
  if (error && error.code === 'PGRST116') {
    return {
      plan_id,
      mission: null,
      vision: null,
      values_text: null,
      updated_at: new Date().toISOString(),
    }
  }

  if (error) {
    throw new Error(error.message || 'Erro ao buscar MVV')
  }

  return data
}

/**
 * Atualiza ou cria os dados de MVV de um planejamento
 */
export async function updateMVV(plan_id: string, payload: MVVPayload) {
  const supabase = getSupabaseClient()
  
  // Primeiro tenta fazer update
  const { data: existing } = await supabase
    .from('plan_mvv')
    .select('plan_id')
    .eq('plan_id', plan_id)
    .single()

  if (existing) {
    // Atualiza registro existente
    const { data, error } = await supabase
      .from('plan_mvv')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('plan_id', plan_id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Erro ao atualizar MVV')
    }

    return data
  } else {
    // Cria novo registro
    const { data, error } = await supabase
      .from('plan_mvv')
      .insert({
        plan_id,
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message || 'Erro ao criar MVV')
    }

    return data
  }
}
