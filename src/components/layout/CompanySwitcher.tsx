'use client'

import React from 'react'
import { useCompany } from '@/lib/companyContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * COMPONENTE: CompanySwitcher
 * 
 * Seletor de empresa para usuários superadmin.
 * Permite trocar a empresa ativa que está sendo visualizada.
 * 
 * Exibição:
 * - Visível APENAS para usuários com role 'superadmin'
 * - Usuários normais não veem este componente
 * 
 * Funcionalidade:
 * - Lista todas as empresas disponíveis
 * - Mostra empresa atualmente selecionada
 * - Atualiza contexto ao trocar empresa
 * - Persiste seleção no localStorage
 */

export function CompanySwitcher() {
  const {
    currentCompanyId,
    setCurrentCompanyId,
    currentCompany,
    isSuperAdmin,
    availableCompanies,
    isLoading,
  } = useCompany()

  // Não renderizar para usuários normais
  if (!isSuperAdmin) {
    return null
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-5 w-40" />
      </div>
    )
  }

  // Nenhuma empresa disponível
  if (availableCompanies.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Nenhuma empresa cadastrada</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      
      <Select
        value={currentCompanyId || undefined}
        onValueChange={setCurrentCompanyId}
      >
        <SelectTrigger className="w-[220px] bg-background border-input hover:bg-accent hover:text-accent-foreground transition-colors">
          <SelectValue placeholder="Selecione uma empresa">
            {currentCompany?.name || 'Selecione uma empresa'}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {availableCompanies.map((company) => (
            <SelectItem
              key={company.id}
              value={company.id}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{company.name}</span>
                {company.document && (
                  <span className="text-xs text-muted-foreground">
                    {company.document}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * COMPONENTE: CompanySwitcherCompact
 * 
 * Versão compacta do seletor para uso em headers mobile
 * ou locais com espaço limitado.
 */

export function CompanySwitcherCompact() {
  const {
    currentCompanyId,
    setCurrentCompanyId,
    currentCompany,
    isSuperAdmin,
    availableCompanies,
    isLoading,
  } = useCompany()

  if (!isSuperAdmin) {
    return null
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-md" />
  }

  if (availableCompanies.length === 0) {
    return null
  }

  return (
    <Select
      value={currentCompanyId || undefined}
      onValueChange={setCurrentCompanyId}
    >
      <SelectTrigger className="w-[50px] h-9 px-2 bg-background">
        <Building2 className="h-4 w-4" />
      </SelectTrigger>
      
      <SelectContent align="end">
        {availableCompanies.map((company) => (
          <SelectItem
            key={company.id}
            value={company.id}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3" />
              <span>{company.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * COMPONENTE: CompanyInfo
 * 
 * Exibe informações da empresa atual de forma simples.
 * Útil para mostrar qual empresa está ativa sem permitir troca.
 */

export function CompanyInfo() {
  const { currentCompany, isSuperAdmin, isLoading } = useCompany()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (!currentCompany) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Building2 className="h-4 w-4" />
      <span className="font-medium text-foreground">{currentCompany.name}</span>
      {isSuperAdmin && (
        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">
          SuperAdmin
        </span>
      )}
    </div>
  )
}
