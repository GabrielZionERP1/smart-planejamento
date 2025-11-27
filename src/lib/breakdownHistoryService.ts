import { createClient } from './supabase/client'

function getSupabaseClient() {
  return createClient()
}

export interface BreakdownHistory {
  id: string
  breakdown_id: string
  user_id: string
  entry_type: 'comment' | 'status_change' | 'update'
  content: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Busca o histórico completo de um desdobramento
 */
export async function getBreakdownHistory(
  breakdown_id: string
): Promise<BreakdownHistory[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('breakdown_history')
    .select('*')
    .eq('breakdown_id', breakdown_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao buscar histórico: ${error.message}`)
  }

  return data || []
}

/**
 * Adiciona um comentário ao histórico do desdobramento
 */
export async function addBreakdownComment(
  breakdown_id: string,
  content: string
): Promise<BreakdownHistory> {
  const supabase = getSupabaseClient()
  
  // Obter usuário atual
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('breakdown_history')
    .insert({
      breakdown_id,
      user_id: user.id,
      entry_type: 'comment',
      content,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao adicionar histórico: ${error.message}`)
  }

  if (!data) {
    throw new Error('Falha ao adicionar histórico')
  }

  return data
}

/**
 * Atualiza um comentário do histórico
 */
export async function updateBreakdownComment(
  historyId: string,
  content: string
): Promise<BreakdownHistory> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('breakdown_history')
    .update({ content })
    .eq('id', historyId)
    .eq('entry_type', 'comment') // Só permite atualizar comentários
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar comentário: ${error.message}`)
  }

  if (!data) {
    throw new Error('Comentário não encontrado')
  }

  return data
}

/**
 * Exclui uma entrada do histórico (apenas comentários do próprio usuário)
 */
export async function deleteBreakdownComment(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from('breakdown_history')
    .delete()
    .eq('id', id)
    .eq('entry_type', 'comment') // Só permite excluir comentários

  if (error) {
    throw new Error(`Erro ao excluir comentário: ${error.message}`)
  }
}
