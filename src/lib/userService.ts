import { supabaseClient } from './supabaseClient'

export interface UserProfile {
  id: string
  email: string
  nome: string
  avatar_url: string | null
  department_id: string | null
  role: 'admin' | 'gestor' | 'usuario'
  created_at: string
  updated_at: string
  department?: {
    id: string
    name: string
  }
}

export interface UserProfileFormData {
  nome: string
  department_id?: string
  role: 'admin' | 'gestor' | 'usuario'
}

export interface InviteUserData {
  email: string
  nome: string
  department_id?: string
  role: 'admin' | 'gestor' | 'usuario'
}

/**
 * Convida um novo usuário via email
 * O usuário receberá um email para criar sua senha
 */
export async function inviteUser(data: InviteUserData): Promise<void> {
  const supabase = supabaseClient
  
  // Criar usuário no Supabase Auth
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    data: {
      nome: data.nome,
      department_id: data.department_id || null,
      role: data.role,
    },
  })
  
  if (authError) {
    console.error('Erro ao convidar usuário:', authError)
    throw new Error('Não foi possível enviar o convite. Verifique se o e-mail já não está cadastrado.')
  }

  // O profile será criado automaticamente via trigger quando o usuário aceitar o convite
}

/**
 * Busca todos os usuários (profiles)
 */
export async function getUserProfiles(): Promise<UserProfile[]> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      department:departments(id, name)
    `)
    .order('nome', { ascending: true })
  
  if (error) {
    console.error('Erro ao buscar usuários:', error)
    throw new Error('Não foi possível carregar os usuários')
  }
  
  return data || []
}

/**
 * Busca um usuário por ID
 */
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      department:departments(id, name)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }
  
  return data
}

/**
 * Atualiza um perfil de usuário existente
 * Nota: Não criamos novos usuários aqui, apenas editamos os existentes
 * Novos usuários devem ser criados via Supabase Auth
 */
export async function updateUserProfile(id: string, formData: UserProfileFormData): Promise<UserProfile> {
  const supabase = supabaseClient
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      nome: formData.nome,
      department_id: formData.department_id || null,
      role: formData.role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      department:departments(id, name)
    `)
    .single()
  
  if (error) {
    console.error('Erro ao atualizar usuário:', error)
    throw new Error('Não foi possível atualizar o usuário')
  }
  
  return data
}

/**
 * Exclui um usuário (apenas o profile, não a conta de autenticação)
 * Para excluir completamente, deve ser feito via Supabase Admin API
 */
export async function deleteUserProfile(id: string): Promise<void> {
  const supabase = supabaseClient
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Erro ao excluir usuário:', error)
    throw new Error('Não foi possível excluir o usuário')
  }
}
