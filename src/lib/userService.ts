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
  password: string
  department_id?: string
  role: 'admin' | 'gestor' | 'usuario'
}

/**
 * Cria um novo usuário diretamente com senha
 * Usa a API Route para criar com Admin API (sem afetar sessão atual)
 */
export async function inviteUser(data: InviteUserData): Promise<void> {
  // Obter company_id do usuário atual
  const supabase = supabaseClient
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Buscar company_id do profile do usuário atual
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile?.company_id) {
    throw new Error('Empresa não encontrada')
  }

  // Chamar API Route que usa Admin API
  const response = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.nome,
      company_id: profile.company_id,
      role: data.role,
      department_id: data.department_id || null,
    }),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error('Erro ao criar usuário:', result.error)
    throw new Error(result.error || 'Não foi possível criar o usuário')
  }
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
