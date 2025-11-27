'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, AlertCircle, Target, ListTodo, CheckSquare, TrendingUp } from 'lucide-react'
import { UpcomingTask } from '@/lib/types'
import { formatDate } from '@/lib/utils/date'
import { Progress } from '@/components/ui/progress'

interface UpcomingTasksListProps {
  tasks: UpcomingTask[]
}

export function UpcomingTasksList({ tasks }: UpcomingTasksListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'atrasado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído'
      case 'em_andamento':
        return 'Em Andamento'
      case 'atrasado':
        return 'Atrasado'
      case 'cancelado':
        return 'Cancelado'
      default:
        return 'Não Iniciado'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'plan' ? ListTodo : CheckSquare
  }

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600 dark:text-red-400'
    if (days <= 3) return 'text-orange-600 dark:text-orange-400'
    if (days <= 7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getDaysRemainingText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} dias de atraso`
    if (days === 0) return 'Vence hoje'
    if (days === 1) return 'Vence amanhã'
    return `${days} dias restantes`
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Passos
          </CardTitle>
          <CardDescription>
            Suas tarefas e atividades com prazos próximos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Nenhuma tarefa próxima
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Você está em dia com todas as suas atividades! Continue assim.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estatísticas rápidas
  const lateTasks = tasks.filter((t) => calculateDaysRemaining(t.due_date) < 0).length
  const urgentTasks = tasks.filter((t) => {
    const days = calculateDaysRemaining(t.due_date)
    return days >= 0 && days <= 3
  }).length
  const inProgressTasks = tasks.filter((t) => t.status === 'em_andamento').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
            <CardDescription>
              Acompanhe suas {tasks.length} tarefas e atividades mais próximas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {lateTasks > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {lateTasks} atrasada{lateTasks > 1 ? 's' : ''}
              </Badge>
            )}
            {urgentTasks > 0 && (
              <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                <Clock className="h-3 w-3" />
                {urgentTasks} urgente{urgentTasks > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => {
            const TypeIcon = getTypeIcon(task.type)
            const daysRemaining = calculateDaysRemaining(task.due_date)
            const isLate = daysRemaining < 0
            const isUrgent = daysRemaining >= 0 && daysRemaining <= 3

            return (
              <div
                key={`${task.type}-${task.id}`}
                className={`flex flex-col gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isLate
                    ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                    : isUrgent
                    ? 'border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                {/* Cabeçalho da Tarefa */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-xs shrink-0">
                          {task.type === 'plan' ? 'Plano de Ação' : 'Desdobramento'}
                        </Badge>
                        <Badge className={`text-xs shrink-0 ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm leading-tight mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações de Prazo e Progresso */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDate(task.due_date)}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-medium ${getDaysRemainingColor(daysRemaining)}`}>
                      {isLate && <AlertCircle className="h-3.5 w-3.5" />}
                      <span>{getDaysRemainingText(daysRemaining)}</span>
                    </div>
                  </div>

                  {task.progress !== undefined && task.progress !== null && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="w-20 h-2" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo no Rodapé */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-foreground">{inProgressTasks}</strong> em andamento
              </span>
              <span>•</span>
              <span>
                <strong className="text-foreground">{tasks.length}</strong> total
              </span>
            </div>
            <Target className="h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
