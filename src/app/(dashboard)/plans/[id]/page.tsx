'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Trash2, Edit, Loader2, ArrowLeft, Calendar, Target, ListTodo, CheckSquare, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlanNavigationHeader } from '@/components/plan/PlanNavigationHeader'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StrategicPlan, StrategicPlanFormData, Profile } from '@/lib/types'
import { getStrategicPlanById, deleteStrategicPlan, updateStrategicPlan } from '@/lib/planService'
import { PlanForm } from '@/components/plan/PlanForm'
import { formatDate, formatRelativeDate } from '@/lib/utils/date'
import { useToast } from '@/components/ui/use-toast'
import { getCurrentUserProfile, canEditPlan, canDeletePlan } from '@/lib/permissions'

export default function PlanDetailPage() {
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  const loadPlan = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getStrategicPlanById(planId)
      setPlan(data)
      
      // Carregar permissões
      const profile = await getCurrentUserProfile()
      if (profile && data) {
        setUserProfile(profile)
        const editPermission = await canEditPlan(data, profile)
        const deletePermission = await canDeletePlan(data, profile)
        setCanEdit(editPermission)
        setCanDelete(deletePermission)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar planejamento'
      setError(message)
      toast({
        title: "Erro ao carregar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdate = async (data: StrategicPlanFormData) => {
    try {
      setUpdating(true)
      setError(null)
      const updated = await updateStrategicPlan(planId, data)
      setPlan(updated)
      setIsEditOpen(false)
      toast({
        title: "Sucesso!",
        description: "Planejamento atualizado com sucesso.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar planejamento'
      setError(message)
      toast({
        title: "Erro ao atualizar",
        description: message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este planejamento?')) {
      return
    }

    try {
      setDeleting(true)
      setError(null)
      await deleteStrategicPlan(planId)
      toast({
        title: "Sucesso!",
        description: "Planejamento excluído com sucesso.",
      })
      router.push('/plans')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir planejamento'
      setError(message)
      toast({
        title: "Erro ao excluir",
        description: message,
        variant: "destructive",
      })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <Link href="/plans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive max-w-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <p className="text-muted-foreground">Planejamento não encontrado</p>
        <Link href="/plans">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planejamentos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header fixo no topo */}
      <PlanNavigationHeader 
        planName={plan.name}
        planDescription={plan.description || undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {/* Conteúdo da página */}
      <div className="container mx-auto py-6 space-y-6">
        {/* Card de informações */}
        <Card>
            <CardHeader>
              <CardTitle>Informações do Planejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Data de Planejamento
                  </p>
                  <p className="font-medium">
                    {plan.planning_date ? formatDate(plan.planning_date) : 'Não definida'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Início da Execução
                  </p>
                  <p className="font-medium">
                    {plan.execution_start ? formatDate(plan.execution_start) : 'Não definida'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Fim da Execução
                  </p>
                  <p className="font-medium">
                    {plan.execution_end ? formatDate(plan.execution_end) : 'Não definida'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Próximos Passos
          </CardTitle>
          <CardDescription>
            Estruture seu planejamento estratégico seguindo os 3 níveis hierárquicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fluxo de Trabalho */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Visão Estratégica
                  </h4>
                  <Badge variant="outline" className="text-xs">Nível 1</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Defina a <strong>Missão</strong>, <strong>Visão</strong> e <strong>Valores</strong> da organização. 
                  Em seguida, crie os <strong>Objetivos Estratégicos</strong> de longo prazo.
                </p>
                <Link href={`/plans/${planId}/vision`}>
                  <Button size="sm" className="mt-2">
                    Configurar Visão Estratégica
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <div className="mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                  2
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Planos de Ação
                  </h4>
                  <Badge variant="outline" className="text-xs">Nível 2</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para cada objetivo estratégico, crie <strong>Planos de Ação SMART</strong> com metas 
                  específicas, mensuráveis, alcançáveis, relevantes e temporais.
                </p>
                <Link href={`/plans/${planId}/actions`}>
                  <Button size="sm" variant="outline" className="mt-2">
                    Gerenciar Planos de Ação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-border bg-card hover:border-primary/30 transition-colors">
              <div className="mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                  3
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Desdobramentos
                  </h4>
                  <Badge variant="outline" className="text-xs">Nível 3</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quebre cada plano de ação em <strong>tarefas menores</strong> (desdobramentos), 
                  atribua responsáveis e acompanhe o progresso com histórico detalhado.
                </p>
              </div>
            </div>
          </div>

          {/* Dica Rápida */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Dica: Use a navegação no topo
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Os botões <strong>Visão Geral</strong>, <strong>Visão Estratégica</strong> e <strong>Planos de Ação</strong> 
                facilitam a navegação entre as seções do planejamento.
              </p>
            </div>
          </div>

          {/* Informação de Criação */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Planejamento criado em {formatRelativeDate(new Date(plan.created_at))}
            </p>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Sheet de Edição */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Editar Planejamento</SheetTitle>
            <SheetDescription>
              Atualize as informações do planejamento estratégico
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6 mt-6">
            <PlanForm
              onSubmit={handleUpdate}
              onCancel={() => setIsEditOpen(false)}
              initialData={{
                name: plan.name,
                description: plan.description || '',
                planning_date: plan.planning_date || '',
                execution_start: plan.execution_start || '',
                execution_end: plan.execution_end || '',
              }}
              loading={updating}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
