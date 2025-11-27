'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'
import { EffortDistribution } from '@/lib/types'

interface EffortDistributionBarProps {
  distribution: EffortDistribution
}

export function EffortDistributionBar({ distribution }: EffortDistributionBarProps) {
  const total = distribution.low + distribution.medium + distribution.high

  const effortData = [
    {
      label: 'Baixo',
      count: distribution.low,
      color: 'bg-green-500',
      icon: '🟢',
    },
    {
      label: 'Médio',
      count: distribution.medium,
      color: 'bg-yellow-500',
      icon: '🟡',
    },
    {
      label: 'Alto',
      count: distribution.high,
      color: 'bg-red-500',
      icon: '🔴',
    },
  ]

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Distribuição de Esforço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum desdobramento com esforço definido
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Distribuição de Esforço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de progresso visual */}
          <div className="flex h-8 w-full overflow-hidden rounded-lg border">
            {effortData.map((effort) => {
              const percentage = total > 0 ? (effort.count / total) * 100 : 0
              return percentage > 0 ? (
                <div
                  key={effort.label}
                  className={`${effort.color} flex items-center justify-center text-sm font-bold text-white transition-all hover:opacity-80`}
                  style={{ width: `${percentage}%` }}
                  title={`${effort.label}: ${effort.count} (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 15 && (
                    <span>
                      {effort.icon} {effort.count}
                    </span>
                  )}
                </div>
              ) : null
            })}
          </div>

          {/* Detalhes */}
          <div className="space-y-2">
            {effortData.map((effort) => {
              const percentage = total > 0 ? (effort.count / total) * 100 : 0
              return (
                <div
                  key={effort.label}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{effort.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{effort.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Nível {effort.label === 'Baixo' ? '1' : effort.label === 'Médio' ? '2' : '3'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{effort.count}</p>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Total de Desdobramentos
              </span>
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
