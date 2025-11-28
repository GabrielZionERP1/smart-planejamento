'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Company } from './types'
import { getCurrentUserProfile } from './auth'
import { getCurrentCompany, getAllCompanies } from './companyService'

interface CompanyContextType {
  currentCompanyId: string | null
  setCurrentCompanyId: (companyId: string | null) => void
  currentCompany: Company | null
  isSuperAdmin: boolean
  availableCompanies: Company[]
  isLoading: boolean
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

const STORAGE_KEY = 'smart_active_company_id'

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompanyId, setCurrentCompanyIdState] = useState<string | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const initializeCompanyContext = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🏢 CompanyContext: Inicializando...')
      
      const profile = await getCurrentUserProfile()

      if (!profile) {
        console.error('❌ CompanyContext: Profile não encontrado! Usuário não tem registro na tabela profiles.')
        setIsLoading(false)
        return
      }

      console.log('✅ CompanyContext: Profile carregado:', { role: profile.role, company_id: profile.company_id })

      const isSuperAdminUser = profile.role === 'superadmin'
      setIsSuperAdmin(isSuperAdminUser)

      if (isSuperAdminUser) {
        // SuperAdmin: carregar todas as empresas e usar empresa salva ou primeira da lista
        await loadCompaniesForSuperAdmin()
      } else {
        // Usuário normal: usar company_id do profile
        if (profile.company_id) {
          setCurrentCompanyIdState(profile.company_id)
          await loadCurrentCompany()
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar contexto de empresa:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Inicializar contexto ao montar
  useEffect(() => {
    initializeCompanyContext()
  }, [initializeCompanyContext])

  // Atualizar currentCompany quando currentCompanyId mudar
  useEffect(() => {
    if (currentCompanyId && availableCompanies.length > 0) {
      const company = availableCompanies.find(c => c.id === currentCompanyId)
      setCurrentCompany(company || null)
    } else if (currentCompanyId) {
      // Se não tem na lista, buscar individualmente
      loadCurrentCompany()
    }
  }, [currentCompanyId, availableCompanies])

  async function loadCompaniesForSuperAdmin() {
    try {
      console.log('🏢 CompanyContext: Carregando empresas para superadmin...')
      const companies = await getAllCompanies()
      console.log('🏢 CompanyContext: Empresas encontradas:', companies.length, companies)
      setAvailableCompanies(companies)

      // Tentar recuperar empresa salva no localStorage
      const savedCompanyId = localStorage.getItem(STORAGE_KEY)
      console.log('🏢 CompanyContext: Empresa salva no localStorage:', savedCompanyId)
      
      if (savedCompanyId && companies.some(c => c.id === savedCompanyId)) {
        // Usar empresa salva se ainda existe
        console.log('✅ CompanyContext: Usando empresa salva:', savedCompanyId)
        setCurrentCompanyIdState(savedCompanyId)
      } else if (companies.length > 0) {
        // Usar primeira empresa da lista
        const firstCompanyId = companies[0].id
        console.log('✅ CompanyContext: Usando primeira empresa da lista:', firstCompanyId, companies[0].name)
        setCurrentCompanyIdState(firstCompanyId)
        localStorage.setItem(STORAGE_KEY, firstCompanyId)
      } else {
        console.warn('⚠️ CompanyContext: NENHUMA EMPRESA CADASTRADA! Superadmin precisa cadastrar empresas.')
        setCurrentCompanyIdState(null)
      }
    } catch (error) {
      console.error('❌ CompanyContext: Erro ao carregar empresas para superadmin:', error)
    }
  }

  async function loadCurrentCompany() {
    try {
      const company = await getCurrentCompany()
      setCurrentCompany(company)
    } catch (error) {
      console.error('Erro ao carregar empresa atual:', error)
    }
  }

  async function refreshCompanies() {
    if (isSuperAdmin) {
      await loadCompaniesForSuperAdmin()
    }
  }

  function setCurrentCompanyId(companyId: string | null) {
    setCurrentCompanyIdState(companyId)
    
    // Salvar no localStorage se for superadmin
    if (isSuperAdmin && companyId) {
      localStorage.setItem(STORAGE_KEY, companyId)
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        currentCompanyId,
        setCurrentCompanyId,
        currentCompany,
        isSuperAdmin,
        availableCompanies,
        isLoading,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany deve ser usado dentro de CompanyProvider')
  }
  return context
}

/**
 * Hook para obter o company_id correto baseado no usuário
 * - SuperAdmin: retorna currentCompanyId do contexto
 * - Demais: retorna company_id do profile
 */
export function useCurrentCompanyId(): string | null {
  const { currentCompanyId, isSuperAdmin } = useCompany()
  const [profileCompanyId, setProfileCompanyId] = useState<string | null>(null)

  useEffect(() => {
    if (!isSuperAdmin) {
      getCurrentUserProfile().then(profile => {
        if (profile?.company_id) {
          setProfileCompanyId(profile.company_id)
        }
      })
    }
  }, [isSuperAdmin])

  return isSuperAdmin ? currentCompanyId : profileCompanyId
}
