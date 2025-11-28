'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { getCurrentUserProfile } from '@/lib/auth'
import { useCompany } from '@/lib/companyContext'
import type { UserDashboardData, ManagerDashboardData } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const { isLoading: contextLoading, currentCompanyId } = useCompany()
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<UserDashboardData | ManagerDashboardData | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentUserProfile()
        
        if (!profile) {
          console.log('❌ Dashboard: Nenhum profile encontrado, redirecionando para login')
          router.push('/login')
          return
        }

        console.log('✅ Dashboard: Profile carregado', { role: profile.role, company_id: profile.company_id })
        setUserRole(profile.role)

        // Superadmin sem empresa selecionada: redirecionar para admin/companies
        if (profile.role === 'superadmin' && !currentCompanyId) {
          console.log('🔄 Dashboard: Superadmin sem empresa, redirecionando para /admin/companies')
          router.push('/admin/companies')
          return
        }

        // Se for superadmin mas ainda não tem empresa no contexto, aguardar
        if (profile.role === 'superadmin' && !currentCompanyId) {
          console.log('⏳ Dashboard: Aguardando seleção de empresa...')
          return
        }

        const isManager = profile.role === 'admin' || profile.role === 'gestor' || profile.role === 'superadmin'

        console.log('📊 Dashboard: Carregando dados do dashboard...', { isManager, currentCompanyId })

        // Carregar dados apropriados baseado no tipo de usuário
        if (isManager) {
          const data = await getManagerDashboardData()
          setDashboardData(data)
        } else {
          const data = await getUserDashboardData(profile.id)
          setDashboardData(data)
        }

        console.log('✅ Dashboard: Dados carregados com sucesso')
      } catch (error) {
        console.error('❌ Dashboard: Erro ao carregar:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!contextLoading) {
      loadData()
    }
  }, [contextLoading, currentCompanyId, router])

  if (isLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    )
  }

  const isManager = userRole === 'admin' || userRole === 'gestor' || userRole === 'superadmin'

  // Dashboard do gerente
  if (isManager && 'global_progress' in dashboardData) {
    const managerData = dashboardData as ManagerDashboardData

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
        {managerData.critical_alerts > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  Alertas Críticos
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Existem <strong>{managerData.critical_alerts}</strong> tarefas com atraso superior a 7 dias.
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
              value={managerData.total_plans}
              description="Total de planejamentos estratégicos"
              icon="FolderKanban"
            />
            <DashboardCard
              title="Objetivos"
              value={managerData.total_objectives}
              description="Objetivos estratégicos definidos"
              icon="Target"
            />
            <DashboardCard
              title="Planos de Ação"
              value={managerData.total_action_plans}
              description="Total de planos de ação"
              icon="ListTodo"
            />
            <DashboardCard
              title="Desdobramentos"
              value={managerData.total_breakdowns}
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
                <h3 className="text-2xl font-bold">{managerData.global_progress}%</h3>
                <p className="text-sm text-muted-foreground">
                  Média de conclusão de todos os planos de ação
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={managerData.global_progress} className="h-3" />
          </div>
        </DashboardSection>

        {/* Distribuição e Ranking */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatusDistributionChart statusCounts={managerData.status_counts} />
          <DepartmentRankingTable departments={managerData.department_ranking} />
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
  const userData = dashboardData as UserDashboardData

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
      <LateTasksBanner count={userData.late_tasks} />

      {/* Cards de Estatísticas */}
      <DashboardSection title="Minhas Atividades">
        <StatsGrid columns={3}>
          <DashboardCard
            title="Planejamentos"
            value={userData.total_plans}
            description="Planejamentos em que participo"
            icon="FolderKanban"
          />
          <DashboardCard
            title="Planos de Ação"
            value={userData.total_action_plans}
            description="Planos sob minha responsabilidade"
            icon="ListTodo"
          />
          <DashboardCard
            title="Desdobramentos"
            value={userData.total_breakdowns}
            description="Tarefas para executar"
            icon="CheckSquare"
          />
        </StatsGrid>
      </DashboardSection>

      {/* Próximas Tarefas */}
      <UpcomingTasksList tasks={userData.upcoming_tasks} />

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
