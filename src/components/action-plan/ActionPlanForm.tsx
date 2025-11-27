'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField'
import { actionPlanSchema, ActionPlanSchema } from '@/lib/schemas'
import { Objective } from '@/lib/types'

interface ActionPlanFormProps {
  onSubmit: (data: ActionPlanSchema & { participant_ids?: string[] }) => Promise<void>
  onCancel: () => void
  objectives: Objective[]
  initialData?: Partial<ActionPlanSchema & { participant_ids?: string[] }>
  loading?: boolean
}

export function ActionPlanForm({
  onSubmit,
  onCancel,
  objectives,
  initialData,
  loading = false,
}: ActionPlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActionPlanSchema>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      objective_id: initialData?.objective_id || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      department_id: initialData?.department_id || '',
      owner_id: initialData?.owner_id || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
    },
  })

  const onSubmitForm = async (data: ActionPlanSchema) => {
    await onSubmit({
      ...data,
      objective_id: data.objective_id || undefined,
      department_id: data.department_id || undefined,
      owner_id: data.owner_id || undefined,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <SelectField
        label="Objetivo Estratégico"
        options={[
          { label: 'Nenhum objetivo', value: '' },
          ...objectives.map((obj) => ({ label: obj.title, value: obj.id })),
        ]}
        error={errors.objective_id?.message}
        disabled={loading}
        helper="Opcional: vincule este plano a um objetivo estratégico"
        {...register('objective_id')}
      />

      <FormField
        label="Título do Plano de Ação"
        placeholder="Ex: Campanha de marketing digital"
        error={errors.title?.message}
        disabled={loading}
        required
        {...register('title')}
      />

      <TextareaField
        label="Descrição"
        placeholder="Descreva as ações e atividades previstas..."
        rows={4}
        error={errors.description?.message}
        disabled={loading}
        helper="Opcional: adicione uma descrição detalhada"
        {...register('description')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Data de Início"
          type="date"
          error={errors.start_date?.message}
          disabled={loading}
          helper="Opcional"
          {...register('start_date')}
        />

        <FormField
          label="Data de Término"
          type="date"
          error={errors.end_date?.message}
          disabled={loading}
          helper="Opcional"
          {...register('end_date')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} loadingText={initialData ? 'Atualizando...' : 'Criando...'}>
          {initialData ? 'Atualizar' : 'Criar'} Plano de Ação
        </Button>
      </div>
    </form>
  )
}
