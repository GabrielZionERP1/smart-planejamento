import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlanOverview } from '@/lib/dashboardService'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { EffortDistributionBar } from '@/components/dashboard/EffortDistributionBar'
import {
  Target,
  ListTodo,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface PlanOverviewPageProps {
  params: {
    id: string
  }
}

export default async function PlanOverviewPage({ params }: PlanOverviewPageProps) {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados do overview
  const overview = await getPlanOverview(params.id)

  return (
    <div className="space-y-6">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4">
        <Link href={`/plans/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{overview.plan_name}</h1>
          <p className="text-muted-foreground">Visão geral do planejamento</p>
        </div>
      </div>

      {/* Progresso Geral */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {overview.progress}% Concluído
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Progresso médio dos planos de ação
            </p>
          </div>
          <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <Progress value={overview.progress} className="h-4" />
      </div>

      {/* Alertas de Atraso */}
      {overview.late_breakdowns > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Desdobramentos Atrasados
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Este planejamento possui <strong>{overview.late_breakdowns}</strong>{' '}
                {overview.late_breakdowns === 1 ? 'desdobramento atrasado' : 'desdobramentos atrasados'}.
                Revise as datas e status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <DashboardSection title="Estatísticas">
        <StatsGrid columns={4}>
          <DashboardCard
            title="Objetivos"
            value={overview.objectives_count}
            description="Objetivos estratégicos definidos"
            icon="Target"
          />
          <DashboardCard
            title="Planos de Ação"
            value={overview.action_plans_count}
            description="Total de planos de ação"
            icon="ListTodo"
          />
          <DashboardCard
            title="Desdobramentos"
            value={overview.breakdowns_count}
            description="Total de desdobramentos"
            icon="CheckSquare"
          />
          <DashboardCard
            title="Atrasados"
            value={overview.late_breakdowns}
            description="Desdobramentos com atraso"
            icon="AlertTriangle"
          />
        </StatsGrid>
      </DashboardSection>

      {/* Distribuição de Esforço */}
      <DashboardSection 
        title="Análise de Esforço"
        description="Distribuição do nível de esforço dos desdobramentos"
      >
        <EffortDistributionBar distribution={overview.effort_distribution} />
      </DashboardSection>

      {/* Links Rápidos */}
      <DashboardSection title="Navegação Rápida">
        <div className="grid gap-4 md:grid-cols-3">
          <Link href={`/plans/${params.id}`}>
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Target className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-1">Visão Estratégica</h3>
              <p className="text-sm text-muted-foreground">
                Missão, Visão, Valores e Objetivos
              </p>
            </div>
          </Link>

          <Link href={`/plans/${params.id}/actions`}>
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <ListTodo className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-1">Planos de Ação</h3>
              <p className="text-sm text-muted-foreground">
                Gerenciar planos e desdobramentos
              </p>
            </div>
          </Link>

          <Link href="/plans">
            <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <ArrowLeft className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-1">Todos os Planos</h3>
              <p className="text-sm text-muted-foreground">
                Voltar para lista de planejamentos
              </p>
            </div>
          </Link>
        </div>
      </DashboardSection>
    </div>
  )
}
