'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'
import { StatusCounts } from '@/lib/types'

interface StatusDistributionChartProps {
  statusCounts: StatusCounts
}

export function StatusDistributionChart({ statusCounts }: StatusDistributionChartProps) {
  const total = Object.values(statusCounts).reduce((acc, count) => acc + count, 0)

  const statusData = [
    {
      label: 'Não Iniciado',
      count: statusCounts.nao_iniciado,
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
    },
    {
      label: 'Em Andamento',
      count: statusCounts.em_andamento,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      label: 'Concluído',
      count: statusCounts.concluido,
      color: 'bg-green-500',
      textColor: 'text-green-700',
    },
    {
      label: 'Atrasado',
      count: statusCounts.atrasado,
      color: 'bg-red-500',
      textColor: 'text-red-700',
    },
    {
      label: 'Cancelado',
      count: statusCounts.cancelado,
      color: 'bg-gray-300',
      textColor: 'text-gray-600',
    },
  ]

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Distribuição por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de progresso visual */}
          <div className="flex h-6 w-full overflow-hidden rounded-lg">
            {statusData.map((status) => {
              const percentage = total > 0 ? (status.count / total) * 100 : 0
              return percentage > 0 ? (
                <div
                  key={status.label}
                  className={`${status.color} flex items-center justify-center text-xs font-medium text-white transition-all hover:opacity-80`}
                  style={{ width: `${percentage}%` }}
                  title={`${status.label}: ${status.count} (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 10 && status.count}
                </div>
              ) : null
            })}
          </div>

          {/* Legenda */}
          <div className="grid grid-cols-2 gap-3">
            {statusData.map((status) => {
              const percentage = total > 0 ? (status.count / total) * 100 : 0
              return (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${status.color}`} />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <div className="text-sm font-semibold">
                    <Badge variant="outline" className={status.textColor}>
                      {status.count} ({percentage.toFixed(0)}%)
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
