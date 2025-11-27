'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCurrentUserProfile, canManageDepartments } from '@/lib/permissions'
import { Profile } from '@/lib/types'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
  DepartmentFormData,
} from '@/lib/departmentService'
import { DepartmentForm } from '@/components/settings/DepartmentForm'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils/date'

export default function DepartmentsPage() {
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)

  const loadDepartments = useCallback(async () => {
    try {
      const data = await getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os departamentos',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    async function checkPermissions() {
      const profile = await getCurrentUserProfile()
      if (profile) {
        setUserProfile(profile)
        const hasPermission = await canManageDepartments(profile)
        setCanManage(hasPermission)
        if (hasPermission) {
          await loadDepartments()
        }
      }
      setLoading(false)
    }
    checkPermissions()
  }, [loadDepartments])

  const handleCreate = async (formData: DepartmentFormData) => {
    try {
      await createDepartment(formData)
      toast({
        title: 'Sucesso',
        description: 'Departamento criado com sucesso',
      })
      setIsSheetOpen(false)
      await loadDepartments()
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async (formData: DepartmentFormData) => {
    if (!editingDepartment) return
    try {
      await updateDepartment(editingDepartment.id, formData)
      toast({
        title: 'Sucesso',
        description: 'Departamento atualizado com sucesso',
      })
      setIsSheetOpen(false)
      setEditingDepartment(null)
      await loadDepartments()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) return
    try {
      await deleteDepartment(id)
      toast({
        title: 'Sucesso',
        description: 'Departamento excluído com sucesso',
      })
      await loadDepartments()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o departamento',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingDepartment(null)
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Carregando...</div>
  }

  if (!canManage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>
          Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar departamentos.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os departamentos da organização
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
          <SheetContent className="overflow-y-auto">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>
                {editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
              </SheetTitle>
              <SheetDescription>
                {editingDepartment
                  ? 'Atualize as informações do departamento'
                  : 'Crie um novo departamento para organizar sua equipe'}
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-6 mt-6">
              <DepartmentForm
                initialData={editingDepartment ? { name: editingDepartment.name } : undefined}
                onSubmit={editingDepartment ? handleUpdate : handleCreate}
                onCancel={handleCloseSheet}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum departamento cadastrado. Clique em &quot;Novo Departamento&quot; para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{formatDate(department.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(department)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(department.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
