'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanNavigationHeader } from '@/components/plan/PlanNavigationHeader'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getStrategicPlanById } from '@/lib/planService'
import { getObjectives } from '@/lib/objectiveService'
import {
  getActionPlans,
  createActionPlan,
  updateActionPlan,
  deleteActionPlan,
} from '@/lib/actionPlanService'
import { StrategicPlan, Objective, ActionPlan } from '@/lib/types'
import { ActionPlanForm } from '@/components/action-plan/ActionPlanForm'
import { ActionPlanList } from '@/components/action-plan/ActionPlanList'
import { PlanCardSkeleton } from '@/components/plan/PlanCardSkeleton'
import { useToast } from '@/components/ui/use-toast'
import { ActionPlanSchema } from '@/lib/schemas'

export default function ActionsPage() {
  const { toast } = useToast()
  const params = useParams()
  const planId = params.id as string

  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<ActionPlan | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [planData, objectivesData, actionsData] = await Promise.all([
        getStrategicPlanById(planId),
        getObjectives(planId),
        getActionPlans(planId),
      ])

      setPlan(planData)
      setObjectives(objectivesData)
      setActionPlans(actionsData)
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
  }, [planId, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async (data: ActionPlanSchema) => {
    try {
      await createActionPlan({
        plan_id: planId,
        objective_id: data.objective_id || null,
        title: data.title,
        description: data.description || undefined,
        department_id: data.department_id || null,
        owner_id: data.owner_id || null,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      })

      setIsSheetOpen(false)
      await loadData()
      toast({
        title: "Sucesso!",
        description: "Plano de ação criado com sucesso.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar plano de ação'
      toast({
        title: "Erro ao criar",
        description: message,
        variant: "destructive",
      })
      throw err
    }
  }

  const handleUpdate = async (data: ActionPlanSchema) => {
    if (!editingAction) return

    try {
      await updateActionPlan(editingAction.id, {
        objective_id: data.objective_id || null,
        title: data.title,
        description: data.description || null,
        department_id: data.department_id || null,
        owner_id: data.owner_id || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      })

      setIsSheetOpen(false)
      setEditingAction(null)
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

  const handleDelete = async (actionId: string) => {
    try {
      await deleteActionPlan(actionId)
      await loadData()
      toast({
        title: "Sucesso!",
        description: "Plano de ação excluído com sucesso.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir plano de ação'
      toast({
        title: "Erro ao excluir",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (action: ActionPlan) => {
    setEditingAction(action)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingAction(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Planejamento
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Planos de Ação</h1>
              <p className="text-muted-foreground">
                Carregando planos de ação...
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <Link href={`/plans/${planId}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Planejamento
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Planos de Ação</h1>
              <p className="text-muted-foreground text-red-600 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Planos de Ação</h2>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie planos de ação vinculados aos objetivos estratégicos
            </p>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Plano de Ação
            </Button>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>
                  {editingAction ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
                </SheetTitle>
                <SheetDescription>
                  {editingAction
                    ? 'Atualize as informações do plano de ação'
                    : 'Crie um novo plano de ação vinculado a um objetivo estratégico'}
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 mt-6">
                <ActionPlanForm
                  objectives={objectives}
                  initialData={editingAction ? {
                    title: editingAction.title,
                    objective_id: editingAction.objective_id || '',
                    description: editingAction.description || '',
                    department_id: editingAction.department_id || '',
                    owner_id: editingAction.owner_id || '',
                    start_date: editingAction.start_date || '',
                    end_date: editingAction.end_date || '',
                  } : undefined}
                  onSubmit={editingAction ? handleUpdate : handleCreate}
                  onCancel={handleCloseSheet}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <ActionPlanList
          actions={actionPlans}
          objectives={objectives}
          planId={planId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}
