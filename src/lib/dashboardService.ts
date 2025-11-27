import { createClient } from '@/lib/supabase/client'
import {
  UserDashboardData,
  ManagerDashboardData,
  PlanOverview,
  UpcomingTask,
  DepartmentRanking,
  StatusCounts,
  EffortDistribution,
} from './types'

/**
 * FASE 6: Dashboard Service
 * Serviço para buscar dados estatísticos e métricas para os dashboards
 */

// ============================================
// USER DASHBOARD DATA
// ============================================

export async function getUserDashboardData(userId: string): Promise<UserDashboardData> {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // Buscar perfil do usuário para pegar department_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('department_id')
      .eq('id', userId)
      .single()

    const departmentId = profile?.department_id

    // 1. Total de planejamentos (onde o usuário é criador ou do mesmo departamento)
    const { count: totalPlans } = await supabase
      .from('strategic_plans')
      .select('*', { count: 'exact', head: true })
      .or(`created_by.eq.${userId}${departmentId ? `,department_id.eq.${departmentId}` : ''}`)

    // 2. Total de planos de ação onde é owner
    const { count: totalActionPlans } = await supabase
      .from('action_plans')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)

    // 3. Total de desdobramentos onde é executor
    const { count: totalBreakdowns } = await supabase
      .from('action_breakdowns')
      .select('*', { count: 'exact', head: true })
      .eq('executor_id', userId)

    // 4. Próximas tarefas (planos de ação + desdobramentos com prazos próximos)
    const { data: upcomingActionPlans } = await supabase
      .from('action_plans')
      .select('id, title, end_date, status')
      .eq('owner_id', userId)
      .gte('end_date', today)
      .order('end_date', { ascending: true })
      .limit(5)

    const { data: upcomingBreakdowns } = await supabase
      .from('action_breakdowns')
      .select('id, title, end_date, status')
      .eq('executor_id', userId)
      .gte('end_date', today)
      .order('end_date', { ascending: true })
      .limit(5)

    const upcomingTasks: UpcomingTask[] = [
      ...(upcomingActionPlans || []).map((task) => ({
        id: task.id,
        title: task.title,
        due_date: task.end_date || '',
        type: 'plan' as const,
        status: task.status,
      })),
      ...(upcomingBreakdowns || []).map((task) => ({
        id: task.id,
        title: task.title,
        due_date: task.end_date || '',
        type: 'breakdown' as const,
        status: task.status,
      })),
    ]
      .filter((task) => task.due_date)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, 10)

    // 5. Tarefas atrasadas
    const { count: lateActionPlans } = await supabase
      .from('action_plans')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .lt('end_date', today)
      .neq('status', 'concluido')

    const { count: lateBreakdowns } = await supabase
      .from('action_breakdowns')
      .select('*', { count: 'exact', head: true })
      .eq('executor_id', userId)
      .lt('end_date', today)
      .eq('is_completed', false)

    return {
      total_plans: totalPlans || 0,
      total_action_plans: totalActionPlans || 0,
      total_breakdowns: totalBreakdowns || 0,
      upcoming_tasks: upcomingTasks,
      late_tasks: (lateActionPlans || 0) + (lateBreakdowns || 0),
    }
  } catch (error) {
    console.error('Error fetching user dashboard data:', error)
    throw error
  }
}

// ============================================
// MANAGER DASHBOARD DATA
// ============================================

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
  try {
    const supabase = createClient()

    // 1. Total de planejamentos
    const { count: totalPlans } = await supabase
      .from('strategic_plans')
      .select('*', { count: 'exact', head: true })

    // 2. Total de objetivos
    const { count: totalObjectives } = await supabase
      .from('objectives')
      .select('*', { count: 'exact', head: true })

    // 3. Total de planos de ação
    const { count: totalActionPlans } = await supabase
      .from('action_plans')
      .select('*', { count: 'exact', head: true })

    // 4. Total de desdobramentos
    const { count: totalBreakdowns } = await supabase
      .from('action_breakdowns')
      .select('*', { count: 'exact', head: true })

    // 5. Progresso global (média de progress dos action_plans)
    const { data: actionPlansProgress } = await supabase
      .from('action_plans')
      .select('progress')

    const globalProgress =
      actionPlansProgress && actionPlansProgress.length > 0
        ? actionPlansProgress.reduce((acc: number, plan: { progress: number }) => acc + plan.progress, 0) /
          actionPlansProgress.length
        : 0

    // 6. Ranking de departamentos por progresso
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')

    const departmentRanking: DepartmentRanking[] = []

    if (departments) {
      for (const dept of departments) {
        const { data: deptActionPlans } = await supabase
          .from('action_plans')
          .select('progress')
          .eq('department_id', dept.id)

        const avgProgress =
          deptActionPlans && deptActionPlans.length > 0
            ? deptActionPlans.reduce((acc: number, plan: { progress: number }) => acc + plan.progress, 0) /
              deptActionPlans.length
            : 0

        departmentRanking.push({
          department_id: dept.id,
          department_name: dept.name,
          progress: Math.round(avgProgress),
        })
      }
    }

    departmentRanking.sort((a, b) => b.progress - a.progress)

    // 7. Contagem de status (action_plans + breakdowns)
    const statusCounts: StatusCounts = {
      nao_iniciado: 0,
      em_andamento: 0,
      concluido: 0,
      atrasado: 0,
      cancelado: 0,
    }

    // Contar status dos action_plans
    const { data: actionPlansStatus } = await supabase
      .from('action_plans')
      .select('status')

    if (actionPlansStatus) {
      actionPlansStatus.forEach((plan: { status: string }) => {
        if (plan.status in statusCounts) {
          statusCounts[plan.status as keyof StatusCounts]++
        }
      })
    }

    // Contar status dos breakdowns
    const { data: breakdownsStatus } = await supabase
      .from('action_breakdowns')
      .select('status')

    if (breakdownsStatus) {
      breakdownsStatus.forEach((breakdown: { status: string }) => {
        if (breakdown.status in statusCounts) {
          statusCounts[breakdown.status as keyof StatusCounts]++
        }
      })
    }

    // 8. Alertas críticos (tarefas com mais de 7 dias de atraso)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const { count: criticalActionPlans } = await supabase
      .from('action_plans')
      .select('*', { count: 'exact', head: true })
      .lt('end_date', sevenDaysAgoStr)
      .neq('status', 'concluido')
      .neq('status', 'cancelado')

    const { count: criticalBreakdowns } = await supabase
      .from('action_breakdowns')
      .select('*', { count: 'exact', head: true })
      .lt('end_date', sevenDaysAgoStr)
      .eq('is_completed', false)

    return {
      total_plans: totalPlans || 0,
      total_objectives: totalObjectives || 0,
      total_action_plans: totalActionPlans || 0,
      total_breakdowns: totalBreakdowns || 0,
      global_progress: Math.round(globalProgress),
      department_ranking: departmentRanking,
      status_counts: statusCounts,
      critical_alerts: (criticalActionPlans || 0) + (criticalBreakdowns || 0),
    }
  } catch (error) {
    console.error('Error fetching manager dashboard data:', error)
    throw error
  }
}

// ============================================
// PLAN OVERVIEW
// ============================================

export async function getPlanOverview(planId: string): Promise<PlanOverview> {
  try {
    const supabase = createClient()
    
    // 1. Buscar informações do plano
    const { data: plan } = await supabase
      .from('strategic_plans')
      .select('name')
      .eq('id', planId)
      .single()

    // 2. Contar objetivos
    const { count: objectivesCount } = await supabase
      .from('objectives')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)

    // 3. Contar planos de ação
    const { count: actionPlansCount } = await supabase
      .from('action_plans')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)

    // 4. Buscar planos de ação para calcular progresso
    const { data: actionPlans } = await supabase
      .from('action_plans')
      .select('id, progress')
      .eq('plan_id', planId)

    const progress =
      actionPlans && actionPlans.length > 0
        ? actionPlans.reduce((acc: number, plan: { progress: number }) => acc + plan.progress, 0) / actionPlans.length
        : 0

    // 5. Contar desdobramentos
    let breakdownsCount = 0
    const today = new Date().toISOString().split('T')[0]
    let lateBreakdowns = 0

    if (actionPlans) {
      for (const actionPlan of actionPlans) {
        const { count } = await supabase
          .from('action_breakdowns')
          .select('*', { count: 'exact', head: true })
          .eq('action_plan_id', actionPlan.id)

        breakdownsCount += count || 0

        const { count: lateCount } = await supabase
          .from('action_breakdowns')
          .select('*', { count: 'exact', head: true })
          .eq('action_plan_id', actionPlan.id)
          .lt('end_date', today)
          .eq('is_completed', false)

        lateBreakdowns += lateCount || 0
      }
    }

    // 6. Distribuição de esforço
    const effortDistribution: EffortDistribution = {
      low: 0,
      medium: 0,
      high: 0,
    }

    if (actionPlans) {
      for (const actionPlan of actionPlans) {
        const { data: breakdowns } = await supabase
          .from('action_breakdowns')
          .select('effort')
          .eq('action_plan_id', actionPlan.id)

        if (breakdowns) {
          breakdowns.forEach((breakdown: { effort: number }) => {
            if (breakdown.effort === 1) effortDistribution.low++
            else if (breakdown.effort === 2) effortDistribution.medium++
            else if (breakdown.effort === 3) effortDistribution.high++
          })
        }
      }
    }

    return {
      plan_id: planId,
      plan_name: plan?.name || '',
      objectives_count: objectivesCount || 0,
      action_plans_count: actionPlansCount || 0,
      breakdowns_count: breakdownsCount,
      progress: Math.round(progress),
      late_breakdowns: lateBreakdowns,
      effort_distribution: effortDistribution,
    }
  } catch (error) {
    console.error('Error fetching plan overview:', error)
    throw error
  }
}
