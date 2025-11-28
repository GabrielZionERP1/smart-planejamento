import { createClient } from './supabase/client'
import { Company } from './types'
import { getCurrentUserCompanyId, getCurrentUserProfile } from './auth'

/**
 * FASE 8: Company Service - Gerenciamento de Empresas (Multi-Tenant)
 * 
 * Este serviço gerencia as empresas no sistema multi-tenant.
 * Apenas admins podem gerenciar a própria empresa.
 * Super-admins (se implementados futuramente) poderiam gerenciar todas.
 */

// Criar cliente Supabase com sessão do usuário
function getSupabaseClient() {
  return createClient()
}

export interface CompanyFormData {
  name: string
  document?: string
  logo_url?: string
  admin_name?: string
  admin_email?: string
  admin_password?: string
}

/**
 * Busca a empresa do usuário atual
 */
export async function getCurrentCompany(): Promise<Company | null> {
  const supabase = getSupabaseClient()
  const companyId = await getCurrentUserCompanyId()

  if (!companyId) {
    return null
  }

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    console.error('Erro ao buscar empresa:', error)
    throw new Error(`Erro ao buscar empresa: ${error.message}`)
  }

  return data as Company
}

/**
 * Busca uma empresa por ID
 * Nota: Apenas a própria empresa do usuário pode ser acessada via RLS
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Registro não encontrado ou sem permissão
    }
    throw new Error(`Erro ao buscar empresa: ${error.message}`)
  }

  return data as Company
}

/**
 * Atualiza os dados da empresa
 * SuperAdmin pode atualizar qualquer empresa, Admin só pode atualizar a própria
 */
export async function updateCompany(
  companyId: string,
  payload: Partial<CompanyFormData>
): Promise<Company> {
  const supabase = getSupabaseClient()
  const profile = await getCurrentUserProfile()

  // Verificar se é admin ou superadmin
  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    throw new Error('Apenas administradores podem atualizar dados da empresa')
  }

  // SuperAdmin pode atualizar qualquer empresa
  // Admin só pode atualizar a própria empresa
  if (profile.role === 'admin' && profile.company_id !== companyId) {
    throw new Error('Você só pode atualizar dados da sua própria empresa')
  }

  const updateData: Partial<Company> = {
    updated_at: new Date().toISOString(),
  }

  if (payload.name !== undefined) updateData.name = payload.name
  if (payload.document !== undefined) updateData.document = payload.document
  if (payload.logo_url !== undefined) updateData.logo_url = payload.logo_url

  const { data, error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar empresa: ${error.message}`)
  }

  return data as Company
}

/**
 * Cria uma nova empresa com usuário administrador
 */
export async function createCompany(
  payload: CompanyFormData
): Promise<Company> {
  const supabase = getSupabaseClient()

  // 1. Criar empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: payload.name,
      document: payload.document || null,
      logo_url: payload.logo_url || null,
    })
    .select()
    .single()

  if (companyError) {
    throw new Error(`Erro ao criar empresa: ${companyError.message}`)
  }

  // 2. Se dados de admin foram fornecidos, criar usuário admin
  if (payload.admin_email && payload.admin_password && payload.admin_name) {
    try {
      // Chamar API Route que usa service_role key para criar usuário
      // Admin API não pode ser usada no frontend (requer chave secreta)
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: payload.admin_email,
          password: payload.admin_password,
          name: payload.admin_name,
          company_id: company.id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('Erro ao criar usuário admin via API:', result.error)
        // Se falhou ao criar usuário, deletar empresa
        await supabase.from('companies').delete().eq('id', company.id)
        throw new Error(`Erro ao criar usuário admin: ${result.error}`)
      }

      console.log('✅ Usuário admin criado com sucesso:', result.user_id)
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      // Rollback: deletar empresa se falhou ao criar admin
      await supabase.from('companies').delete().eq('id', company.id)
      throw error
    }
  }

  return company as Company
}

/**
 * Lista todas as empresas
 * NOTA: Por padrão, RLS bloqueia isso. Usuários só veem a própria empresa.
 * Esta função só funcionaria para um super-admin com RLS desabilitado
 * ou com uma policy especial.
 */
export async function getAllCompanies(): Promise<Company[]> {
  const supabase = getSupabaseClient()

  console.log('🏢 companyService: Buscando todas as empresas...')

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ companyService: Erro ao listar empresas:', error)
    throw new Error(`Erro ao listar empresas: ${error.message}`)
  }

  console.log('✅ companyService: Empresas encontradas:', data?.length || 0, data)

  return data as Company[]
}

/**
 * Obtém estatísticas da empresa
 * SuperAdmin pode consultar qualquer empresa, Admin só pode consultar a própria
 */
export async function getCompanyStats(companyId: string) {
  const supabase = getSupabaseClient()
  const profile = await getCurrentUserProfile()

  // SuperAdmin pode consultar qualquer empresa
  // Admin só pode consultar a própria empresa
  if (profile?.role === 'admin' && profile.company_id !== companyId) {
    throw new Error('Você só pode consultar estatísticas da sua própria empresa')
  }

  // Total de usuários
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // Total de planejamentos
  const { count: totalPlans } = await supabase
    .from('strategic_plans')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // Total de departamentos
  const { count: totalDepartments } = await supabase
    .from('departments')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // Total de planos de ação
  const { count: totalActionPlans } = await supabase
    .from('action_plans')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  return {
    total_users: totalUsers || 0,
    total_plans: totalPlans || 0,
    total_departments: totalDepartments || 0,
    total_action_plans: totalActionPlans || 0,
  }
}
