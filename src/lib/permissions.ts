/**
 * FASE 7 & 8: PERMISSIONS - Sistema de Controle de Acesso Multi-Tenant
 * 
 * Este módulo implementa funções para verificar permissões baseadas em roles:
 * - admin: acesso total dentro da própria empresa
 * - gestor: acesso departamental dentro da própria empresa
 * - usuario: acesso limitado aos próprios registros dentro da própria empresa
 * 
 * IMPORTANTE: As Row Level Security (RLS) policies no Supabase já garantem
 * isolamento completo por company_id. As verificações aqui são complementares.
 */

import { createClient } from './supabase/client'
import { Profile, StrategicPlan, ActionPlan, ActionBreakdown } from './types'

export type UserRole = 'superadmin' | 'admin' | 'gestor' | 'usuario'

/**
 * Busca o perfil completo do usuário logado (incluindo company_id)
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('❌ permissions.ts: Erro ao obter usuário:', userError)
    return null
  }
  
  if (!user) {
    console.log('⚠️ permissions.ts: Nenhum usuário autenticado')
    return null
  }

  console.log('👤 permissions.ts: Buscando profile para user:', user.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('❌ permissions.ts: Erro ao buscar profile:', profileError)
    console.error('❌ permissions.ts: User ID:', user.id)
    console.error('❌ permissions.ts: User Email:', user.email)
    return null
  }

  if (!profile) {
    console.error('❌ permissions.ts: Profile não encontrado para o usuário:', user.email)
    return null
  }

  console.log('✅ permissions.ts: Profile encontrado:', {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    company_id: profile.company_id
  })

  return profile
}

/**
 * Retorna o role do usuário logado
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile()
  return profile?.role as UserRole || null
}

/**
 * Verifica se o usuário é administrador ou superadmin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin' || role === 'superadmin'
}

/**
 * Verifica se o usuário é superadmin global
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'superadmin'
}

/**
 * Verifica se o usuário é gestor
 */
export async function isManager(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'gestor'
}

/**
 * Verifica se o usuário é colaborador
 */
export async function isCollaborator(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'usuario'
}

/**
 * Verifica se o usuário pode editar um planejamento estratégico
 * NOTA: RLS já garante que o usuário só vê planejamentos da própria empresa
 */
export async function canEditPlan(
  plan: StrategicPlan,
  user: Profile
): Promise<boolean> {
  // Superadmin sempre pode editar qualquer plano
  if (user.role === 'superadmin') {
    return true
  }

  // Verificação adicional: usuário e plano devem ser da mesma empresa
  if (user.company_id && plan.company_id && user.company_id !== plan.company_id) {
    return false
  }

  // Admin sempre pode (dentro da própria empresa)
  if (user.role === 'admin') {
    return true
  }

  // Gestor pode editar se o departamento dele faz parte do plano
  if (user.role === 'gestor' && user.departamento_id) {
    const supabase = createClient()
    const { data } = await supabase
      .from('plan_departments')
      .select('id')
      .eq('plan_id', plan.id)
      .eq('department_id', user.departamento_id)
      .single()

    return !!data
  }

  // Usuário pode editar se for owner de algum action_plan no plano
  if (user.role === 'usuario') {
    const supabase = createClient()
    const { data } = await supabase
      .from('action_plans')
      .select('id')
      .eq('plan_id', plan.id)
      .eq('owner_id', user.id)
      .limit(1)

    return !!data && data.length > 0
  }

  return false
}

/**
 * Verifica se o usuário pode criar um novo planejamento
 */
export async function canCreatePlan(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestor'
}

/**
 * Verifica se o usuário pode deletar um planejamento
 */
export async function canDeletePlan(
  plan: StrategicPlan,
  user: Profile
): Promise<boolean> {
  // Superadmin e admin podem deletar planejamentos
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode editar um plano de ação
 * NOTA: RLS já garante que o usuário só vê action plans da própria empresa
 */
export async function canEditActionPlan(
  actionPlan: ActionPlan,
  user: Profile
): Promise<boolean> {
  // Superadmin sempre pode editar
  if (user.role === 'superadmin') {
    return true
  }

  // Verificação adicional: usuário e action plan devem ser da mesma empresa
  if (user.company_id && actionPlan.company_id && user.company_id !== actionPlan.company_id) {
    return false
  }

  // Admin e SuperAdmin sempre podem (dentro da própria empresa)
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true
  }

  // Gestor pode editar se o plano pertence ao seu departamento
  if (user.role === 'gestor' && user.departamento_id) {
    return actionPlan.department_id === user.departamento_id
  }

  // Owner pode editar seu próprio plano
  if (actionPlan.owner_id === user.id) {
    return true
  }

  return false
}

/**
 * Verifica se o usuário pode criar um plano de ação
 */
export async function canCreateActionPlan(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestor'
}

/**
 * Verifica se o usuário pode deletar um plano de ação
 */
export async function canDeleteActionPlan(
  actionPlan: ActionPlan,
  user: Profile
): Promise<boolean> {
  // SuperAdmin e Admin sempre podem
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true
  }

  // Gestor pode deletar se o plano pertence ao seu departamento
  if (user.role === 'gestor' && user.departamento_id) {
    return actionPlan.department_id === user.departamento_id
  }

  return false
}

/**
 * Verifica se o usuário pode editar um desdobramento
 * NOTA: RLS já garante que o usuário só vê breakdowns da própria empresa
 */
export async function canEditBreakdown(
  breakdown: ActionBreakdown,
  user: Profile
): Promise<boolean> {
  // Superadmin sempre pode editar
  if (user.role === 'superadmin') {
    return true
  }

  // Verificação adicional: usuário e breakdown devem ser da mesma empresa
  if (user.company_id && breakdown.company_id && user.company_id !== breakdown.company_id) {
    return false
  }

  // SuperAdmin e Admin sempre podem (dentro da própria empresa)
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true
  }

  // Gestor pode editar se o breakdown pertence a um action_plan do seu departamento
  if (user.role === 'gestor' && user.departamento_id) {
    const supabase = createClient()
    const { data: actionPlan } = await supabase
      .from('action_plans')
      .select('department_id')
      .eq('id', breakdown.action_plan_id)
      .single()

    return actionPlan?.department_id === user.departamento_id
  }

  // Executor pode editar seu próprio breakdown
  if (breakdown.executor_id === user.id) {
    return true
  }

  return false
}

/**
 * Verifica se o usuário pode criar um desdobramento em um action_plan
 */
export async function canCreateBreakdown(
  actionPlanId: string,
  user: Profile
): Promise<boolean> {
  // SuperAdmin, Admin e Gestor sempre podem
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestor') {
    return true
  }

  // Owner do action_plan pode criar breakdowns
  const supabase = createClient()
  const { data: actionPlan } = await supabase
    .from('action_plans')
    .select('owner_id')
    .eq('id', actionPlanId)
    .single()

  return actionPlan?.owner_id === user.id
}

/**
 * Verifica se o usuário pode deletar um desdobramento
 */
export async function canDeleteBreakdown(
  breakdown: ActionBreakdown,
  user: Profile
): Promise<boolean> {
  // SuperAdmin e Admin sempre podem
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true
  }

  // Gestor pode deletar se o breakdown pertence a um action_plan do seu departamento
  if (user.role === 'gestor' && user.departamento_id) {
    const supabase = createClient()
    const { data: actionPlan } = await supabase
      .from('action_plans')
      .select('department_id')
      .eq('id', breakdown.action_plan_id)
      .single()

    return actionPlan?.department_id === user.departamento_id
  }

  return false
}

/**
 * Verifica se o usuário pode adicionar anexos a um desdobramento
 */
export async function canAddAttachment(
  breakdown: ActionBreakdown,
  user: Profile
): Promise<boolean> {
  // SuperAdmin, Admin e Gestor sempre podem
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'gestor') {
    return true
  }

  // Executor pode adicionar anexos ao seu breakdown
  if (breakdown.executor_id === user.id) {
    return true
  }

  return false
}

/**
 * Verifica se o usuário pode adicionar histórico a um desdobramento
 */
export async function canAddBreakdownHistory(
  breakdown: ActionBreakdown,
  user: Profile
): Promise<boolean> {
  // Mesmas regras de adicionar anexo
  return canAddAttachment(breakdown, user)
}

/**
 * Verifica se o usuário pode visualizar dashboard avançado (gerencial)
 */
export async function canViewAdvancedDashboard(user: Profile): Promise<boolean> {
  return user.role === 'admin' || user.role === 'gestor'
}

/**
 * Verifica se o usuário pode acessar configurações
 */
export async function canAccessSettings(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode gerenciar departamentos
 */
export async function canManageDepartments(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode gerenciar usuários
 */
export async function canManageUsers(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode gerenciar clientes
 */
export async function canManageClients(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode visualizar todos os planejamentos
 */
export async function canViewAllPlans(user: Profile): Promise<boolean> {
  return user.role === 'superadmin' || user.role === 'admin'
}

/**
 * Verifica se o usuário pode adicionar/remover participantes em um action_plan
 */
export async function canManageParticipants(
  actionPlan: ActionPlan,
  user: Profile
): Promise<boolean> {
  // Admin e Gestor podem gerenciar participantes
  if (user.role === 'admin' || user.role === 'gestor') {
    return true
  }

  return false
}

/**
 * Verifica se o usuário pode editar objetivos estratégicos
 */
export async function canEditObjectives(
  planId: string,
  user: Profile
): Promise<boolean> {
  // SuperAdmin e Admin sempre podem
  if (user.role === 'superadmin' || user.role === 'admin') {
    return true
  }

  // Gestor pode editar objetivos de planejamentos do seu departamento
  if (user.role === 'gestor' && user.departamento_id) {
    const supabase = createClient()
    const { data } = await supabase
      .from('plan_departments')
      .select('id')
      .eq('plan_id', planId)
      .eq('department_id', user.departamento_id)
      .single()

    return !!data
  }

  return false
}

/**
 * Verifica se o usuário pode editar MVV (Missão, Visão, Valores)
 */
export async function canEditMVV(
  planId: string,
  user: Profile
): Promise<boolean> {
  // Mesmas regras de editar objetivos
  return canEditObjectives(planId, user)
}

/**
 * Helper: Verifica se o usuário tem pelo menos um dos roles especificados
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const role = await getUserRole()
  return role ? roles.includes(role) : false
}

/**
 * Helper: Verifica se o usuário tem permissão para uma ação específica
 */
export async function checkPermission(
  action: string,
  resource: any,
  user?: Profile
): Promise<boolean> {
  if (!user) {
    const profile = await getCurrentUserProfile()
    if (!profile) return false
    user = profile
  }

  switch (action) {
    case 'plan:create':
      return canCreatePlan(user)
    case 'plan:edit':
      return canEditPlan(resource, user)
    case 'plan:delete':
      return canDeletePlan(resource, user)
    case 'actionPlan:create':
      return canCreateActionPlan(user)
    case 'actionPlan:edit':
      return canEditActionPlan(resource, user)
    case 'actionPlan:delete':
      return canDeleteActionPlan(resource, user)
    case 'breakdown:create':
      return canCreateBreakdown(resource, user)
    case 'breakdown:edit':
      return canEditBreakdown(resource, user)
    case 'breakdown:delete':
      return canDeleteBreakdown(resource, user)
    case 'attachment:add':
      return canAddAttachment(resource, user)
    case 'settings:access':
      return canAccessSettings(user)
    case 'dashboard:advanced':
      return canViewAdvancedDashboard(user)
    default:
      return false
  }
}
