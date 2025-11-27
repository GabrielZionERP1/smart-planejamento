'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField, TextareaField } from '@/components/ui/FormField'
import { StrategicPlanFormData } from '@/lib/types'
import { strategicPlanSchema, StrategicPlanSchema } from '@/lib/schemas'

interface PlanFormProps {
  onSubmit: (data: StrategicPlanFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<StrategicPlanFormData>
  loading?: boolean
}

export function PlanForm({ onSubmit, onCancel, initialData, loading }: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StrategicPlanSchema>({
    resolver: zodResolver(strategicPlanSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      start_date: initialData?.execution_start || '',
      end_date: initialData?.execution_end || '',
    },
  })

  const onSubmitForm = async (data: StrategicPlanSchema) => {
    await onSubmit({
      name: data.name,
      description: data.description || '',
      planning_date: new Date().toISOString().split('T')[0],
      execution_start: data.start_date,
      execution_end: data.end_date,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <FormField
        label="Nome do Planejamento"
        placeholder="Ex: Planejamento Estratégico 2025"
        error={errors.name?.message}
        disabled={loading}
        required
        {...register('name')}
      />

      <TextareaField
        label="Descrição"
        placeholder="Descreva os objetivos do planejamento..."
        rows={3}
        error={errors.description?.message}
        disabled={loading}
        helper="Opcional: adicione uma descrição detalhada"
        {...register('description')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Início da Execução"
          type="date"
          error={errors.start_date?.message}
          disabled={loading}
          required
          {...register('start_date')}
        />

        <FormField
          label="Fim da Execução"
          type="date"
          error={errors.end_date?.message}
          disabled={loading}
          required
          {...register('end_date')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} loadingText="Salvando...">
          Salvar Planejamento
        </Button>
      </div>
    </form>
  )
}
