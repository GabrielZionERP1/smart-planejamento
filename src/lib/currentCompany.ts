import { getCurrentUserProfile } from './auth'

/**
 * HELPER: getCurrentCompanyIdForUser
 * 
 * Retorna o company_id correto baseado no tipo de usuário:
 * - SuperAdmin: retorna o activeCompanyId passado como parâmetro (empresa selecionada)
 * - Demais usuários: retorna o company_id do próprio profile
 * 
 * IMPORTANTE: Esta função deve ser usada em Server Actions e API Routes.
 * Para componentes Client, use o hook useCurrentCompanyId() do CompanyContext.
 * 
 * @param activeCompanyId - ID da empresa ativa (usado apenas para superadmin)
 * @returns company_id a ser usado nas queries
 */
export async function getCurrentCompanyIdForUser(
  activeCompanyId?: string | null
): Promise<string | null> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    return null
  }

  // Se é superadmin, usar empresa ativa passada como parâmetro
  if (profile.role === 'superadmin') {
    return activeCompanyId || null
  }

  // Usuários normais sempre usam o company_id do profile
  return profile.company_id
}

/**
 * HELPER: requireCompanyId
 * 
 * Similar ao getCurrentCompanyIdForUser, mas lança erro se company_id for null.
 * Útil para operações que OBRIGATORIAMENTE precisam de um company_id.
 * 
 * @param activeCompanyId - ID da empresa ativa (usado apenas para superadmin)
 * @returns company_id garantido
 * @throws Error se company_id for null
 */
export async function requireCompanyId(
  activeCompanyId?: string | null
): Promise<string> {
  const companyId = await getCurrentCompanyIdForUser(activeCompanyId)

  if (!companyId) {
    throw new Error('Company ID é obrigatório para esta operação')
  }

  return companyId
}
