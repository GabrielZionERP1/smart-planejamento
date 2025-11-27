'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LateTasksBannerProps {
  count: number
  onViewDetails?: () => void
}

export function LateTasksBanner({ count, onViewDetails }: LateTasksBannerProps) {
  if (count === 0) {
    return null
  }

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100">
            Atenção: Tarefas Atrasadas
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Você possui <strong>{count}</strong> {count === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}.
            É importante revisar e atualizar o status dessas atividades.
          </p>
        </div>
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
          >
            Ver Detalhes
          </Button>
        )}
      </div>
    </div>
  )
}
