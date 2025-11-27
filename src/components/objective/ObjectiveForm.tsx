'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField, TextareaField } from '@/components/ui/FormField'
import { objectiveSchema, ObjectiveSchema } from '@/lib/schemas'

interface ObjectiveFormProps {
  onSubmit: (data: { title: string; summary?: string }) => Promise<void>
  onCancel: () => void
  initialData?: { title: string; summary?: string }
  loading?: boolean
}

export function ObjectiveForm({ onSubmit, onCancel, initialData, loading = false }: ObjectiveFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ObjectiveSchema>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: initialData?.title || '',
      summary: initialData?.summary || '',
    },
  })

  const onSubmitForm = async (data: ObjectiveSchema) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <FormField
        label="Título"
        placeholder="Ex: Aumentar participação de mercado"
        error={errors.title?.message}
        disabled={loading}
        required
        {...register('title')}
      />

      <TextareaField
        label="Resumo"
        placeholder="Breve descrição do objetivo estratégico..."
        rows={4}
        error={errors.summary?.message}
        disabled={loading}
        helper="Opcional: adicione uma descrição detalhada"
        {...register('summary')}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} loadingText={initialData ? 'Atualizando...' : 'Criando...'}>
          {initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}
