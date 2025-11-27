'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Edit, Trash2 } from 'lucide-react'
import { ActionPlan, Objective } from '@/lib/types'
import { formatDate } from '@/lib/utils/date'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/ui/animations'

interface ActionPlanListProps {
  actions: ActionPlan[]
  objectives: Objective[]
  planId: string
  onEdit: (action: ActionPlan) => void
  onDelete: (actionId: string) => void
}

export function ActionPlanList({ 
  actions, 
  objectives, 
  planId,
  onEdit,
  onDelete,
}: ActionPlanListProps) {
  const getObjectiveTitle = (objectiveId: string | null) => {
    if (!objectiveId) return 'Nenhum objetivo vinculado'
    const objective = objectives.find(obj => obj.id === objectiveId)
    return objective?.title || 'Objetivo não encontrado'
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
          Nenhum plano de ação cadastrado. Clique em &quot;Novo Plano de Ação&quot; para começar.
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, index) => {
        return (
          <motion.div key={action.id} variants={staggerItem} custom={index}>
            <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/plans/${planId}/actions/${action.id}`}
                      className="hover:underline"
                    >
                      {action.title}
                    </Link>
                  </CardTitle>
                  {action.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={action.status} />
                  <Link href={`/plans/${planId}/actions/${action.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Desdobramentos
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(action)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este plano de ação?')) {
                        onDelete(action.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{action.progress}%</span>
                </div>
                <Progress value={action.progress} />
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objetivo:</span>
                  <span className="font-medium">{getObjectiveTitle(action.objective_id)}</span>
                </div>
                {action.start_date && action.end_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="font-medium">
                      {formatDate(action.start_date)} - {formatDate(action.end_date)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
