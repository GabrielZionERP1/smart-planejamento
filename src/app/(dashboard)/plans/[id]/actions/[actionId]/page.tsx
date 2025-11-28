'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, User, Building, Target, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanNavigationHeader } from '@/components/plan/PlanNavigationHeader'
import { getStrategicPlanById } from '@/lib/planService'
import { StrategicPlan } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getActionPlanById, deleteActionPlan, updateActionPlan } from '@/lib/actionPlanService'
import { getObjectives } from '@/lib/objectiveService'
import { ActionPlan, Objective } from '@/lib/types'
import { ActionPlanForm } from '@/components/action-plan/ActionPlanForm'
import { PlanCardSkeleton } from '@/components/plan/PlanCardSkeleton'
import { BreakdownList } from '@/components/breakdown/BreakdownList'
import { useToast } from '@/components/ui/use-toast'
import { ActionPlanSchema } from '@/lib/schemas'
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

const statusTranslation: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  nao_iniciado: { label: 'Não Iniciado', variant: 'secondary' },
  em_andamento: { label: 'Em Andamento', variant: 'default' },
  concluido: { label: 'Concluído', variant: 'default' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
  atrasado: { label: 'Atrasado', variant: 'destructive' },
}

export default function ActionDetailPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string
  const actionId = params.actionId as string

  const [action, setAction] = useState<ActionPlan | null>(null)
  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [actionData, planData, objectivesData] = await Promise.all([
        getActionPlanById(actionId),
        getStrategicPlanById(planId),
        getObjectives(planId),
      ])

      setAction(actionData)
      setPlan(planData)
      setObjectives(objectivesData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
      toast({
        title: "Erro ao carregar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [actionId, planId, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (data: ActionPlanSchema) => {
    try {
      await updateActionPlan(actionId, {
        objective_id: data.objective_id || null,
        title: data.title,
        description: data.description || null,
        department_id: data.department_id || null,
        owner_id: data.owner_id || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      })

      setIsEditOpen(false)
      await loadData()
      toast({
        title: "Sucesso!",
        description: "Plano de ação atualizado com sucesso.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar plano de ação'
      toast({
        title: "Erro ao atualizar",
        description: message,
        variant: "destructive",
      })
      throw err
    }
  }

  const handleDelete = async () => {
    try {
      await deleteActionPlan(actionId)
      toast({
        title: "Sucesso!",
        description: "Plano de ação excluído com sucesso.",
      })
      router.push(`/plans/${planId}/actions`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir plano de ação'
      toast({
        title: "Erro ao excluir",
        description: message,
        variant: "destructive",
      })
    }
  }

  const getObjectiveTitle = (objectiveId: string | null) => {
    if (!objectiveId) return 'Sem objetivo vinculado'
    const objective = objectives.find((obj) => obj.id === objectiveId)
    return objective?.title || 'Objetivo não encontrado'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Planos de Ação
          </Button>
          <h1 className="text-3xl font-bold">Detalhes do Plano de Ação</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <PlanCardSkeleton />
      </div>
    )
  }

  if (error || !action) {
    return (
      <div className="space-y-6">
        <div>
          <Link href={`/plans/${planId}/actions`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Planos de Ação
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Detalhes do Plano de Ação</h1>
          <p className="text-muted-foreground text-red-600 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error || 'Plano de ação não encontrado'}
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  const statusInfo = statusTranslation[action.status] || { label: action.status, variant: 'default' }

  return (
    <>
      {/* Header fixo no topo */}
      {plan && (
        <PlanNavigationHeader 
          planName={plan.name}
          planDescription={plan.description || undefined}
        />
      )}

      {/* Conteúdo da página */}
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <Link href={`/plans/${planId}/actions`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Planos de Ação
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{action.title}</h2>
            <p className="text-muted-foreground">
              Detalhes e informações do plano de ação
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações do Plano de Ação</CardTitle>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {action.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrição</h3>
              <p className="text-sm">{action.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Objetivo Vinculado</h3>
                <p className="text-sm">{getObjectiveTitle(action.objective_id)}</p>
              </div>
            </div>

            {action.start_date && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Início</h3>
                  <p className="text-sm">{formatDate(action.start_date)}</p>
                </div>
              </div>
            )}

            {action.end_date && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Término</h3>
                  <p className="text-sm">{formatDate(action.end_date)}</p>
                </div>
              </div>
            )}

            {action.department_id && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Departamento</h3>
                  <p className="text-sm">{action.department_id}</p>
                </div>
              </div>
            )}

            {action.owner_id && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Responsável</h3>
                  <p className="text-sm">{action.owner_id}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Progresso</h3>
              <span className="text-sm font-medium">{action.progress}%</span>
            </div>
            <Progress value={action.progress} />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Criado em: {formatDate(action.created_at)}</p>
            {action.updated_at && <p>Última atualização: {formatDate(action.updated_at)}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Desdobramentos */}
      <BreakdownList 
        actionPlanId={actionId}
        planId={planId}
        canEdit={true}
      />

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Editar Plano de Ação</SheetTitle>
            <SheetDescription>
              Atualize as informações do plano de ação
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6 mt-6">
            <ActionPlanForm
              objectives={objectives}
              planStartDate={plan?.start_date}
              planEndDate={plan?.end_date}
              initialData={{
                title: action.title,
                objective_id: action.objective_id || '',
                description: action.description || '',
                department_id: action.department_id || '',
                owner_id: action.owner_id || '',
                start_date: action.start_date || '',
                end_date: action.end_date || '',
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano de ação &quot;{action.title}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  )
}
