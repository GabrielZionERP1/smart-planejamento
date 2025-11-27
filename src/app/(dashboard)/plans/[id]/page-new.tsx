'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Trash2, Edit, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StrategicPlan } from '@/lib/types'
import { getStrategicPlanById, deleteStrategicPlan } from '@/lib/planService'
import { formatDate, formatRelativeDate } from '@/lib/utils/date'

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPlan = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getStrategicPlanById(planId)
      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planejamento')
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este planejamento?')) {
      return
    }

    try {
      setDeleting(true)
      setError(null)
      await deleteStrategicPlan(planId)
      router.push('/plans')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir planejamento')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/plans">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{plan.name}</h1>
          {plan.description && (
            <p className="text-muted-foreground">{plan.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Criado em {formatRelativeDate(plan.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Excluir
          </Button>
        </div>
      </div>

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

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="visao" disabled>
            Visão Estratégica
          </TabsTrigger>
          <TabsTrigger value="acoes" disabled>
            Planos de Ação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Planejamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Informações gerais e métricas do planejamento aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
