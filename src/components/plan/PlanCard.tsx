'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StrategicPlan } from '@/lib/types'
import { formatDate, isOverdue, daysUntil } from '@/lib/ui/ui.helpers'
import { fadeInUp } from '@/lib/ui/animations'

interface PlanCardProps {
  plan: StrategicPlan
  index?: number
}

export function PlanCard({ plan, index = 0 }: PlanCardProps) {
  const hasExecutionPeriod = plan.execution_start && plan.execution_end
  const isLate = hasExecutionPeriod && isOverdue(plan.execution_end!)
  const daysRemaining = hasExecutionPeriod ? daysUntil(plan.execution_end!) : null
  
  // Simular progresso - posteriormente integrar com dados reais
  const progress = 45

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/plans/${plan.id}`}>
        <Card interactive className="h-full">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg line-clamp-1">
                    {plan.name}
                  </CardTitle>
                  {isLate && (
                    <Badge variant="destructive" className="shrink-0">
                      Atrasado
                    </Badge>
                  )}
                </div>
                {plan.description && (
                  <CardDescription className="line-clamp-2">
                    {plan.description}
                  </CardDescription>
                )}
              </div>
              <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Dates */}
            <div className="space-y-2">
              {plan.planning_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Planejamento:</span>
                  <span className="font-medium">{formatDate(plan.planning_date)}</span>
                </div>
              )}
              
              {hasExecutionPeriod && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className={`h-4 w-4 shrink-0 ${isLate ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className="text-muted-foreground">Execução:</span>
                  <span className={`font-medium ${isLate ? 'text-destructive' : ''}`}>
                    {formatDate(plan.execution_start!)} - {formatDate(plan.execution_end!)}
                  </span>
                </div>
              )}

              {daysRemaining !== null && daysRemaining > 0 && (
                <div className="text-xs text-muted-foreground pl-6">
                  {daysRemaining} dias restantes
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                Abrir Planejamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
