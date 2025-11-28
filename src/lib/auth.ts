import { createClient } from './supabase/client'

/**
 * Faz login do usuário com email e senha
 */
export async function login(email: string, password: string) {
  console.log('🔑 auth.ts: Iniciando login...')
  
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('❌ auth.ts: Erro do Supabase:', error)
    throw new Error(error.message || 'Erro ao fazer login')
  }

  console.log('✅ auth.ts: Login bem-sucedido', {
    userId: data.user?.id,
    email: data.user?.email,
    hasSession: !!data.session,
    accessToken: data.session?.access_token?.substring(0, 20) + '...',
  })

  return data
}

/**
 * Faz logout do usuário atual
 */
export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message || 'Erro ao fazer logout')
  }
}

/**
 * Retorna o usuário autenticado atual
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message || 'Erro ao obter usuário')
  }

  return user
}

/**
 * Obtém a sessão atual
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message || 'Erro ao obter sessão')
  }

  return session
}

/**
 * Verifica se há um usuário autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession()
    return !!session
  } catch {
    return false
  }
}

/**
 * Obtém o perfil completo do usuário autenticado incluindo company_id
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('❌ auth.ts: Erro ao obter usuário:', userError)
    return null
  }

  console.log('👤 auth.ts: Buscando profile para user:', user.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('❌ auth.ts: Erro ao buscar perfil:', profileError)
    console.error('❌ auth.ts: User ID:', user.id)
    console.error('❌ auth.ts: User Email:', user.email)
    console.error('❌ auth.ts: ERRO CRÍTICO - Profile não existe para este usuário!')
    return null
  }

  console.log('✅ auth.ts: Profile encontrado:', {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    company_id: profile.company_id
  })

  return profile
}

/**
 * Obtém o company_id do usuário autenticado
 */
export async function getCurrentUserCompanyId(): Promise<string | null> {
  const profile = await getCurrentUserProfile()
  return profile?.company_id || null
}
