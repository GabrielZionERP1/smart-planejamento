import { z } from 'zod'

export const strategicPlanSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  start_date: z.string()
    .min(1, 'A data de início é obrigatória'),
  
  end_date: z.string()
    .min(1, 'A data de término é obrigatória'),
})
.refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: 'A data de término deve ser posterior à data de início',
  path: ['end_date'],
})

export type StrategicPlanSchema = z.infer<typeof strategicPlanSchema>

export const objectiveSchema = z.object({
  title: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  
  summary: z.string()
    .max(1000, 'O resumo deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type ObjectiveSchema = z.infer<typeof objectiveSchema>

export const mvvSchema = z.object({
  mission: z.string()
    .min(10, 'A missão deve ter pelo menos 10 caracteres')
    .max(1000, 'A missão deve ter no máximo 1000 caracteres')
    .optional(),
  
  vision: z.string()
    .min(10, 'A visão deve ter pelo menos 10 caracteres')
    .max(1000, 'A visão deve ter no máximo 1000 caracteres')
    .optional(),
  
  values_text: z.string()
    .min(10, 'Os valores devem ter pelo menos 10 caracteres')
    .max(2000, 'Os valores devem ter no máximo 2000 caracteres')
    .optional(),
})

export type MvvSchema = z.infer<typeof mvvSchema>

export const actionPlanSchema = z.object({
  objective_id: z.string()
    .min(1, 'Selecione um objetivo estratégico')
    .optional()
    .or(z.literal('')),
  
  title: z.string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  
  description: z.string()
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  
  department_id: z.string()
    .optional()
    .or(z.literal('')),
  
  owner_id: z.string()
    .optional()
    .or(z.literal('')),
  
  start_date: z.string()
    .optional()
    .or(z.literal('')),
  
  end_date: z.string()
    .optional()
    .or(z.literal('')),
})
.refine((data) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end > start
  }
  return true
}, {
  message: 'A data de término deve ser posterior à data de início',
  path: ['end_date'],
})

export type ActionPlanSchema = z.infer<typeof actionPlanSchema>

/**
 * Cria schema de ActionPlan com validação de datas contra o plano estratégico
 */
export function createActionPlanSchemaWithDateValidation(
  planStartDate?: string | null,
  planEndDate?: string | null
) {
  return actionPlanSchema
    .refine((data) => {
      if (data.start_date && planStartDate) {
        const actionStart = new Date(data.start_date)
        const planStart = new Date(planStartDate)
        return actionStart >= planStart
      }
      return true
    }, {
      message: 'A data de início não pode ser anterior à data de início do planejamento estratégico',
      path: ['start_date'],
    })
    .refine((data) => {
      if (data.end_date && planEndDate) {
        const actionEnd = new Date(data.end_date)
        const planEnd = new Date(planEndDate)
        return actionEnd <= planEnd
      }
      return true
    }, {
      message: 'A data de término não pode ser posterior à data de término do planejamento estratégico',
      path: ['end_date'],
    })
}

// ============================================
// FASE 5: ACTION BREAKDOWNS SCHEMA
// ============================================

export const breakdownSchema = z.object({
  title: z.string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  
  executor_id: z.string()
    .optional()
    .or(z.literal('')),
  
  required_resources: z.string()
    .max(1000, 'Os recursos devem ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  financial_resources: z.number()
    .min(0, 'O valor deve ser maior ou igual a zero')
    .optional()
    .or(z.literal(0)),
  
  start_date: z.string()
    .optional()
    .or(z.literal('')),
  
  end_date: z.string()
    .optional()
    .or(z.literal('')),
  
  effort: z.number()
    .min(1, 'O esforço deve ser entre 1 e 3')
    .max(3, 'O esforço deve ser entre 1 e 3')
    .default(1),
  
  status: z.enum(['nao_iniciado', 'em_andamento', 'concluido', 'cancelado', 'atrasado'])
    .default('nao_iniciado'),
  
  is_completed: z.boolean()
    .default(false),
})
.refine((data) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end > start
  }
  return true
}, {
  message: 'A data de término deve ser posterior à data de início',
  path: ['end_date'],
})

export type BreakdownSchema = z.infer<typeof breakdownSchema>

/**
 * Cria schema de Breakdown com validação de datas contra o plano de ação
 */
export function createBreakdownSchemaWithDateValidation(
  actionStartDate?: string | null,
  actionEndDate?: string | null
) {
  return breakdownSchema
    .refine((data) => {
      if (data.start_date && actionStartDate) {
        const breakdownStart = new Date(data.start_date)
        const actionStart = new Date(actionStartDate)
        return breakdownStart >= actionStart
      }
      return true
    }, {
      message: 'A data de início não pode ser anterior à data de início do plano de ação',
      path: ['start_date'],
    })
    .refine((data) => {
      if (data.end_date && actionEndDate) {
        const breakdownEnd = new Date(data.end_date)
        const actionEnd = new Date(actionEndDate)
        return breakdownEnd <= actionEnd
      }
      return true
    }, {
      message: 'A data de término não pode ser posterior à data de término do plano de ação',
      path: ['end_date'],
    })
}
