'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ClientFormData } from '@/lib/clientService'

interface ClientFormProps {
  initialData?: ClientFormData
  onSubmit: (data: ClientFormData) => Promise<void>
  onCancel: () => void
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    nome: initialData?.nome || '',
    email: initialData?.email || '',
    telefone: initialData?.telefone || '',
    endereco: initialData?.endereco || '',
    cidade: initialData?.cidade || '',
    estado: initialData?.estado || '',
    cep: initialData?.cep || '',
    cnpj_cpf: initialData?.cnpj_cpf || '',
    observacoes: initialData?.observacoes || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação
    if (!formData.nome.trim()) {
      setError('O nome do cliente é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do cliente"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
          <Input
            id="cnpj_cpf"
            value={formData.cnpj_cpf}
            onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
            placeholder="00.000.000/0000-00"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            placeholder="00000-000"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            placeholder="Rua, número, complemento"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            placeholder="Nome da cidade"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            placeholder="UF"
            maxLength={2}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Informações adicionais sobre o cliente"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}
