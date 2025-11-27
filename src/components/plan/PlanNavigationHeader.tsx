'use client'

import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Target, ListTodo, Edit, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanNavigationHeaderProps {
  planName: string
  planDescription?: string | null
  canEdit?: boolean
  canDelete?: boolean
  onEdit?: () => void
  onDelete?: () => void
  deleting?: boolean
}

export function PlanNavigationHeader({ 
  planName, 
  planDescription,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  deleting = false
}: PlanNavigationHeaderProps) {
  const params = useParams()
  const pathname = usePathname()
  const planId = params.id as string

  const isActive = (path: string) => {
    return pathname === path
  }

  const isOverviewPage = pathname === `/plans/${planId}`

  return (
    <div className="bg-background border border-border rounded-lg shadow-sm mb-6">
      <div className="px-6 py-5 space-y-5">
        {/* Título e botão voltar */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link href="/plans">
              <Button variant="ghost" size="sm" className="mb-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold mt-1">{planName}</h1>
            {planDescription && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{planDescription}</p>
            )}
          </div>
        </div>

        {/* Navegação de abas */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3 flex-wrap">
            <Link href={`/plans/${planId}`}>
              <Button 
                variant={isActive(`/plans/${planId}`) ? "default" : "outline"} 
                size="sm"
                className={cn(
                  "transition-colors rounded-full",
                  isActive(`/plans/${planId}`) && "shadow-sm"
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Visão Geral
              </Button>
            </Link>
            <Link href={`/plans/${planId}/vision`}>
              <Button 
                variant={pathname?.includes('/vision') ? "default" : "outline"} 
                size="sm"
                className={cn(
                  "transition-colors rounded-full",
                  pathname?.includes('/vision') && "shadow-sm"
                )}
              >
                <Target className="h-4 w-4 mr-2" />
                Visão Estratégica
              </Button>
            </Link>
            <Link href={`/plans/${planId}/actions`}>
              <Button 
                variant={pathname?.includes('/actions') ? "default" : "outline"} 
                size="sm"
                className={cn(
                  "transition-colors rounded-full",
                  pathname?.includes('/actions') && "shadow-sm"
                )}
              >
                <ListTodo className="h-4 w-4 mr-2" />
                Planos de Ação
              </Button>
            </Link>
          </div>

          {/* Botões de ação - apenas na visão geral */}
          {isOverviewPage && (canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEdit}
                  disabled={deleting}
                  className="rounded-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {canDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-full"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
