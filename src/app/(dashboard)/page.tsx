import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserDashboardData, getManagerDashboardData } from '@/lib/dashboardService'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { UpcomingTasksList } from '@/components/dashboard/UpcomingTasksList'
import { LateTasksBanner } from '@/components/dashboard/LateTasksBanner'
import { DepartmentRankingTable } from '@/components/dashboard/DepartmentRankingTable'
import { StatusDistributionChart } from '@/components/dashboard/StatusDistributionChart'
import { FolderKanban, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'admin' || profile?.role === 'gestor'

  // Carregar dados apropriados baseado no tipo de usuário
  if (isManager) {
    const dashboardData = await getManagerDashboardData()

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Gerencial</h1>
          <p className="text-muted-foreground">
            Visão completa do planejamento estratégico da organização
          </p>
        </div>

        {/* Alertas Críticos */}
        {dashboardData.critical_alerts > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Alertas Críticos
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Existem <strong>{dashboardData.critical_alerts}</strong> tarefas com atraso superior a 7 dias.
                  Revise imediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas */}
        <DashboardSection title="Visão Geral">
          <StatsGrid columns={4}>
            <DashboardCard
              title="Planejamentos"
              value={dashboardData.total_plans}
              description="Total de planejamentos estratégicos"
              icon="FolderKanban"
            />
            <DashboardCard
              title="Objetivos"
              value={dashboardData.total_objectives}
              description="Objetivos estratégicos definidos"
              icon="Target"
            />
            <DashboardCard
              title="Planos de Ação"
              value={dashboardData.total_action_plans}
              description="Total de planos de ação"
              icon="ListTodo"
            />
            <DashboardCard
              title="Desdobramentos"
              value={dashboardData.total_breakdowns}
              description="Total de desdobramentos"
              icon="CheckSquare"
            />
          </StatsGrid>
        </DashboardSection>

        {/* Progresso Global */}
        <DashboardSection title="Progresso Global">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">{dashboardData.global_progress}%</h3>
                <p className="text-sm text-muted-foreground">
                  Média de conclusão de todos os planos de ação
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={dashboardData.global_progress} className="h-3" />
          </div>
        </DashboardSection>

        {/* Distribuição e Ranking */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatusDistributionChart statusCounts={dashboardData.status_counts} />
          <DepartmentRankingTable departments={dashboardData.department_ranking} />
        </div>

        {/* Link para Planejamentos */}
        <div className="flex justify-center">
          <Link href="/plans">
            <Button size="lg">
              <FolderKanban className="mr-2 h-5 w-5" />
              Ver Todos os Planejamentos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Dashboard do usuário comum
  const dashboardData = await getUserDashboardData(user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meu Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe suas tarefas e atividades
        </p>
      </div>

      {/* Banner de Tarefas Atrasadas */}
      <LateTasksBanner count={dashboardData.late_tasks} />

      {/* Cards de Estatísticas */}
      <DashboardSection title="Minhas Atividades">
        <StatsGrid columns={3}>
          <DashboardCard
            title="Planejamentos"
            value={dashboardData.total_plans}
            description="Planejamentos em que participo"
            icon="FolderKanban"
          />
          <DashboardCard
            title="Planos de Ação"
            value={dashboardData.total_action_plans}
            description="Planos sob minha responsabilidade"
            icon="ListTodo"
          />
          <DashboardCard
            title="Desdobramentos"
            value={dashboardData.total_breakdowns}
            description="Tarefas para executar"
            icon="CheckSquare"
          />
        </StatsGrid>
      </DashboardSection>

      {/* Próximas Tarefas */}
      <UpcomingTasksList tasks={dashboardData.upcoming_tasks} />

      {/* Link para Planejamentos */}
      <div className="flex justify-center">
        <Link href="/plans">
          <Button size="lg">
            <FolderKanban className="mr-2 h-5 w-5" />
            Ver Planejamentos
          </Button>
        </Link>
      </div>
    </div>
  )
}
