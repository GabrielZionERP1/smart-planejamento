'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlanNavigationHeader } from '@/components/plan/PlanNavigationHeader'
import { getStrategicPlanById } from '@/lib/planService'
import { getActionPlanById } from '@/lib/actionPlanService'
import { StrategicPlan, ActionPlan } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { 
  getBreakdownById, 
  deleteBreakdown, 
  updateBreakdown 
} from '@/lib/breakdownService'
import { BreakdownForm } from '@/components/breakdown/BreakdownForm'
import { BreakdownHistory } from '@/components/breakdown/BreakdownHistory'
import { BreakdownAttachments } from '@/components/breakdown/BreakdownAttachments'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils/date'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'


interface Breakdown {
  id: string
  action_plan_id: string
  title: string
  description?: string | null
  status: string
  start_date?: string | null
  end_date?: string | null
  responsible?: string | null
  required_resources?: string | null
  financial_resources?: number | null
  effort?: number | null
  created_at: string
  updated_at: string
}

const statusTranslation: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'não iniciado': { label: 'Não Iniciado', variant: 'secondary' },
  'em andamento': { label: 'Em Andamento', variant: 'default' },
  'concluído': { label: 'Concluído', variant: 'outline' },
}

export default function BreakdownDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const breakdownId = params.breakdownId as string
  const actionId = params.actionId as string
  const planId = params.id as string

  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadBreakdown = async () => {
    try {
      setLoading(true)
      const [breakdownData, planData, actionData] = await Promise.all([
        getBreakdownById(breakdownId),
        getStrategicPlanById(planId),
        getActionPlanById(actionId),
      ])
      setBreakdown(breakdownData as Breakdown)
      setPlan(planData)
      setActionPlan(actionData)
    } catch (error) {
      console.error('Erro ao carregar desdobramento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o desdobramento',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBreakdown()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdownId])

  const handleUpdate = async (data: Record<string, unknown>) => {
    try {
      await updateBreakdown(breakdownId, data)
      await loadBreakdown()
      setIsEditSheetOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Desdobramento atualizado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o desdobramento',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteBreakdown(breakdownId)
      toast({
        title: 'Sucesso',
        description: 'Desdobramento excluído com sucesso',
      })
      router.push(`/plans/${planId}/actions/${actionId}`)
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o desdobramento',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading || !breakdown) {
    return (
      <>
        {plan && <PlanNavigationHeader planName={plan.name} planDescription={plan.description} />}
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </>
    )
  }

  const statusInfo = statusTranslation[breakdown.status] || { label: breakdown.status, variant: 'outline' }
  const effortMap: Record<number, { label: string; emoji: string }> = {
    1: { label: 'Baixo', emoji: '🟢' },
    2: { label: 'Médio', emoji: '🟡' },
    3: { label: 'Alto', emoji: '🔴' },
  }
  const effortInfo = breakdown.effort ? effortMap[breakdown.effort] : null

  return (
    <>
      {plan && <PlanNavigationHeader planName={plan.name} planDescription={plan.description} />}
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/plans/${planId}/actions/${actionId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{breakdown.title}</h1>
              <p className="text-sm text-muted-foreground">
                Desdobramento do Plano de Ação
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditSheetOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Visão Geral - Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>

              {effortInfo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Nível de Esforço</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{effortInfo.emoji}</span>
                    <span className="text-sm font-medium">{effortInfo.label}</span>
                  </div>
                </div>
              )}
            </div>

            {breakdown.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">{breakdown.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breakdown.start_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data de Início
                  </p>
                  <p className="text-sm">{formatDate(breakdown.start_date)}</p>
                </div>
              )}

              {breakdown.end_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Data de Término
                  </p>
                  <p className="text-sm">{formatDate(breakdown.end_date)}</p>
                </div>
              )}
            </div>

            {breakdown.responsible && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Responsável</p>
                <p className="text-sm">{breakdown.responsible}</p>
              </div>
            )}

            {breakdown.required_resources && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Recursos Necessários</p>
                <p className="text-sm whitespace-pre-wrap">{breakdown.required_resources}</p>
              </div>
            )}

            {breakdown.financial_resources && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Recursos Financeiros
                </p>
                <p className="text-sm font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(breakdown.financial_resources)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico e Anexos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <BreakdownHistory breakdownId={breakdownId} canEdit={true} />
          </div>
          <div>
            <BreakdownAttachments breakdownId={breakdownId} canEdit={true} />
          </div>
        </div>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Editar Desdobramento</SheetTitle>
            <SheetDescription>
              Atualize as informações do desdobramento
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6 mt-6">
            <BreakdownForm
              currentUser={null}
              actionStartDate={actionPlan?.start_date}
              actionEndDate={actionPlan?.end_date}
              initialData={{
                title: breakdown.title,
                status: breakdown.status as 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado' | 'atrasado',
                effort: breakdown.effort ?? 1,
                is_completed: false,
                executor_id: breakdown.responsible ?? undefined,
                required_resources: breakdown.required_resources ?? undefined,
                financial_resources: breakdown.financial_resources ?? undefined,
                start_date: breakdown.start_date ?? undefined,
                end_date: breakdown.end_date ?? undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir desdobramento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O desdobramento, seu histórico e todos os anexos
              serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  )
}
