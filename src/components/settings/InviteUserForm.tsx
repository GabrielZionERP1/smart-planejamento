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
import { getDepartments, Department } from '@/lib/departmentService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface InviteUserFormData {
  email: string
  nome: string
  password: string
  department_id?: string
  role: 'admin' | 'gestor' | 'usuario'
}

interface InviteUserFormProps {
  onSubmit: (data: InviteUserFormData) => Promise<void>
  onCancel: () => void
}

export function InviteUserForm({ onSubmit, onCancel }: InviteUserFormProps) {
  const [formData, setFormData] = useState<InviteUserFormData>({
    email: '',
    nome: '',
    password: '',
    department_id: undefined,
    role: 'usuario',
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
    if (!formData.email.trim()) {
      setError('O e-mail é obrigatório')
      return
    }
    if (!formData.nome.trim()) {
      setError('O nome é obrigatório')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Digite um e-mail válido')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription className="text-sm">
          O usuário será criado imediatamente e poderá fazer login com a senha definida.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
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

      <div className="space-y-3">
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@exemplo.com"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="password">Senha *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="department">Departamento</Label>
        <Select
          value={formData.department_id || 'none'}
          onValueChange={(value) => setFormData({ ...formData, department_id: value === 'none' ? undefined : value })}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum departamento</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
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
        <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div>
            <strong className="text-foreground">👑 Administrador:</strong> Acesso total ao sistema. Pode gerenciar usuários, departamentos, 
            clientes e todas as funcionalidades de planejamento estratégico.
          </div>
          <div>
            <strong className="text-foreground">📊 Gestor:</strong> Pode criar e gerenciar planejamentos, objetivos estratégicos, 
            planos de ação e desdobramentos. Visualiza dashboards gerenciais.
          </div>
          <div>
            <strong className="text-foreground">👤 Usuário:</strong> Pode visualizar planejamentos, executar desdobramentos atribuídos 
            e atualizar progresso de suas tarefas.
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          {isSubmitting ? 'Criando usuário...' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  )
}
