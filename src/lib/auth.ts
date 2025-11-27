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
