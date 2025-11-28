'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField, TextareaField, SelectField } from '@/components/ui/FormField'
import { AlertCircle } from 'lucide-react'
import { breakdownSchema, BreakdownSchema, createBreakdownSchemaWithDateValidation } from '@/lib/schemas'
import { Profile } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BreakdownFormProps {
  onSubmit: (data: BreakdownSchema) => Promise<void>
  onCancel: () => void
  executors?: Profile[]
  initialData?: Partial<BreakdownSchema>
  loading?: boolean
  currentUser: Profile | null
  canEdit?: boolean
  actionStartDate?: string | null
  actionEndDate?: string | null
}

export function BreakdownForm({
  onSubmit,
  onCancel,
  executors = [],
  initialData,
  loading = false,
  currentUser,
  canEdit = true,
  actionStartDate,
  actionEndDate,
}: BreakdownFormProps) {
  const schema = actionStartDate || actionEndDate
    ? createBreakdownSchemaWithDateValidation(actionStartDate, actionEndDate)
    : breakdownSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      executor_id: initialData?.executor_id || '',
      required_resources: initialData?.required_resources || '',
      financial_resources: initialData?.financial_resources || 0,
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      effort: initialData?.effort ?? 1,
      status: initialData?.status || 'nao_iniciado',
      is_completed: initialData?.is_completed ?? false,
    },
  })

  const onSubmitForm = async (data: BreakdownSchema) => {
    if (!canEdit) return
    
    await onSubmit({
      ...data,
      executor_id: data.executor_id || undefined,
      required_resources: data.required_resources || undefined,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
    })
  }

  // Verificar se o usuário pode editar apenas campos específicos
  const isExecutorOnly = !!(currentUser && initialData?.executor_id === currentUser.id && currentUser.role === 'usuario')
  const isDisabled = loading || !canEdit

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {!canEdit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para editar este desdobramento.
          </AlertDescription>
        </Alert>
      )}

      <FormField
        label="Título do Desdobramento"
        placeholder="Ex: Pesquisar fornecedores"
        error={errors.title?.message}
        disabled={isDisabled || isExecutorOnly}
        required
        {...register('title')}
      />

      <SelectField
        label="Executor"
        options={[
          { label: 'Nenhum executor', value: '' },
          ...executors.map((executor) => ({ label: executor.nome, value: executor.id })),
        ]}
        error={errors.executor_id?.message}
        disabled={isDisabled || isExecutorOnly}
        helper="Opcional: atribua um responsável pela execução"
        {...register('executor_id')}
      />

      <TextareaField
        label="Recursos Necessários"
        placeholder="Descreva os recursos humanos, materiais ou tecnológicos necessários..."
        rows={3}
        error={errors.required_resources?.message}
        disabled={isDisabled || isExecutorOnly}
        helper="Opcional: detalhe os recursos necessários"
        {...register('required_resources')}
      />

      <FormField
        label="Recursos Financeiros (R$)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.financial_resources?.message}
        disabled={isDisabled || isExecutorOnly}
        helper="Opcional: valor estimado em reais"
        {...register('financial_resources', { valueAsNumber: true })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Data de Início"
          type="date"
          error={errors.start_date?.message}
          disabled={isDisabled || isExecutorOnly}
          helper="Opcional"
          {...register('start_date')}
        />

        <FormField
          label="Data de Término"
          type="date"
          error={errors.end_date?.message}
          disabled={isDisabled || isExecutorOnly}
          helper="Opcional"
          {...register('end_date')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Esforço"
          options={[
            { label: '🟢 Baixo (1)', value: '1' },
            { label: '🟡 Médio (2)', value: '2' },
            { label: '🔴 Alto (3)', value: '3' },
          ]}
          error={errors.effort?.message}
          disabled={isDisabled || isExecutorOnly}
          required
          {...register('effort', { valueAsNumber: true })}
        />

        <SelectField
          label={`Status${isExecutorOnly ? ' (executor pode atualizar)' : ''}`}
          options={[
            { label: 'Não Iniciado', value: 'nao_iniciado' },
            { label: 'Em Andamento', value: 'em_andamento' },
            { label: 'Concluído', value: 'concluido' },
            { label: 'Atrasado', value: 'atrasado' },
            { label: 'Cancelado', value: 'cancelado' },
          ]}
          error={errors.status?.message}
          disabled={isDisabled}
          required
          {...register('status')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isDisabled} loading={loading} loadingText={initialData ? 'Atualizando...' : 'Criando...'}>
          {initialData ? 'Atualizar' : 'Criar'} Desdobramento
        </Button>
      </div>
    </form>
  )
}
