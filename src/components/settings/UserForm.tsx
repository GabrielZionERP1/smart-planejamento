'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserProfileFormData } from '@/lib/userService'
import { getDepartments, Department } from '@/lib/departmentService'

interface UserFormProps {
  initialData: UserProfileFormData & { email: string }
  onSubmit: (data: UserProfileFormData) => Promise<void>
  onCancel: () => void
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserProfileFormData>({
    nome: initialData.nome,
    department_id: initialData.department_id,
    role: initialData.role,
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDepartments() {
      try {
        const data = await getDepartments()
        setDepartments(data)
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error)
      }
    }
    loadDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validação
    if (!formData.nome.trim()) {
      setError('O nome do usuário é obrigatório')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={initialData.email}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          O e-mail não pode ser alterado
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Nome do usuário"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Departamento</Label>
        <Select
          value={formData.department_id || ''}
          onValueChange={(value) => setFormData({ ...formData, department_id: value || undefined })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum departamento</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Perfil de Acesso *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: 'admin' | 'gestor' | 'usuario') => 
            setFormData({ ...formData, role: value })
          }
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="gestor">Gestor</SelectItem>
            <SelectItem value="usuario">Usuário</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          <strong>Admin:</strong> acesso total | <strong>Gestor:</strong> gerencia planos | <strong>Usuário:</strong> visualiza e executa
        </p>
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
          {isSubmitting ? 'Salvando...' : 'Atualizar'}
        </Button>
      </div>
    </form>
  )
}
