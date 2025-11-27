'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStrategicPlanById } from '@/lib/planService'
import { PlanNavigationHeader } from '@/components/plan/PlanNavigationHeader'
import { getMVV, updateMVV } from '@/lib/mvvService'
import {
  getObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
} from '@/lib/objectiveService'
import { StrategicPlan, MVV, Objective } from '@/lib/types'
import { MvvCard } from '@/components/mvv/MvvCard'
import { MvvCardSkeleton } from '@/components/mvv/MvvCardSkeleton'
import { ObjectiveList } from '@/components/objective/ObjectiveList'
import { ObjectiveItemSkeleton } from '@/components/objective/ObjectiveItemSkeleton'
import { useToast } from '@/components/ui/use-toast'

export default function VisionPage() {
  const { toast } = useToast()
  const params = useParams()
  const planId = params.id as string

  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [mvv, setMvv] = useState<MVV | null>(null)
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [planData, mvvData, objectivesData] = await Promise.all([
        getStrategicPlanById(planId),
        getMVV(planId),
        getObjectives(planId),
      ])

      setPlan(planData)
      setMvv(mvvData)
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
  }, [planId, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateMission = async (value: string) => {
    try {
      await updateMVV(planId, { mission: value })
      setMvv((prev) => (prev ? { ...prev, mission: value } : null))
      toast({
        title: "Sucesso!",
        description: "Missão atualizada com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : 'Erro ao atualizar missão',
        variant: "destructive",
      })
      throw err
    }
  }

  const handleUpdateVision = async (value: string) => {
    try {
      await updateMVV(planId, { vision: value })
      setMvv((prev) => (prev ? { ...prev, vision: value } : null))
      toast({
        title: "Sucesso!",
        description: "Visão atualizada com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : 'Erro ao atualizar visão',
        variant: "destructive",
      })
      throw err
    }
  }

  const handleUpdateValues = async (value: string) => {
    try {
      await updateMVV(planId, { values_text: value })
      setMvv((prev) => (prev ? { ...prev, values_text: value } : null))
      toast({
        title: "Sucesso!",
        description: "Valores atualizados com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : 'Erro ao atualizar valores',
        variant: "destructive",
      })
      throw err
    }
  }

  const handleCreateObjective = async (data: { title: string; summary?: string }) => {
    try {
      const newObjective = await createObjective(planId, data)
      setObjectives((prev) => [...prev, newObjective])
      toast({
        title: "Sucesso!",
        description: "Objetivo estratégico criado com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao criar",
        description: err instanceof Error ? err.message : 'Erro ao criar objetivo',
        variant: "destructive",
      })
      throw err
    }
  }

  const handleUpdateObjective = async (
    id: string,
    data: { title: string; summary?: string }
  ) => {
    try {
      const updated = await updateObjective(id, data)
      setObjectives((prev) => prev.map((obj) => (obj.id === id ? updated : obj)))
      toast({
        title: "Sucesso!",
        description: "Objetivo atualizado com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : 'Erro ao atualizar objetivo',
        variant: "destructive",
      })
      throw err
    }
  }

  const handleDeleteObjective = async (id: string) => {
    try {
      await deleteObjective(id)
      setObjectives((prev) => prev.filter((obj) => obj.id !== id))
      toast({
        title: "Sucesso!",
        description: "Objetivo excluído com sucesso.",
      })
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : 'Erro ao excluir objetivo',
        variant: "destructive",
      })
      throw err
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/plans">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-1 h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MvvCardSkeleton />
          <MvvCardSkeleton />
          <MvvCardSkeleton />
        </div>

        <div className="space-y-4">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            <ObjectiveItemSkeleton />
            <ObjectiveItemSkeleton />
            <ObjectiveItemSkeleton />
          </div>
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
      />

      {/* Conteúdo da página */}
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Visão Estratégica</h2>
          <p className="text-sm text-muted-foreground">
            Defina a missão, visão, valores e objetivos estratégicos do planejamento
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Missão, Visão e Valores</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <MvvCard
            title="Missão"
            description="Razão de existir da organização"
            value={mvv?.mission || null}
            onSave={handleUpdateMission}
          />
          <MvvCard
            title="Visão"
            description="Onde queremos chegar"
            value={mvv?.vision || null}
            onSave={handleUpdateVision}
          />
          <MvvCard
            title="Valores"
            description="Princípios que nos guiam"
            value={mvv?.values_text || null}
            onSave={handleUpdateValues}
          />
        </div>
      </div>

        <div className="space-y-4">
          <ObjectiveList
            objectives={objectives}
            onCreate={handleCreateObjective}
            onUpdate={handleUpdateObjective}
            onDelete={handleDeleteObjective}
          />
        </div>
      </div>
    </>
  )
}
