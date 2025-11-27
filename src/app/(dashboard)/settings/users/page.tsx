'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, Edit, Trash2, Shield, User, Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { getCurrentUserProfile, canManageUsers } from '@/lib/permissions'
import { Profile } from '@/lib/types'
import {
  getUserProfiles,
  updateUserProfile,
  deleteUserProfile,
  inviteUser,
  UserProfile,
  UserProfileFormData,
  InviteUserData,
} from '@/lib/userService'
import { UserForm } from '@/components/settings/UserForm'
import { InviteUserForm } from '@/components/settings/InviteUserForm'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils/date'

const roleLabels = {
  admin: { label: 'Administrador', variant: 'default' as const },
  gestor: { label: 'Gestor', variant: 'secondary' as const },
  usuario: { label: 'Usuário', variant: 'outline' as const },
}

export default function UsersPage() {
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUserProfiles()
      setUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    async function checkPermissions() {
      const profile = await getCurrentUserProfile()
      if (profile) {
        setUserProfile(profile)
        const hasPermission = await canManageUsers(profile)
        setCanManage(hasPermission)
        if (hasPermission) {
          await loadUsers()
        }
      }
      setLoading(false)
    }
    checkPermissions()
  }, [loadUsers])

  const handleUpdate = async (formData: UserProfileFormData) => {
    if (!editingUser) return
    try {
      await updateUserProfile(editingUser.id, formData)
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
      })
      setIsSheetOpen(false)
      setEditingUser(null)
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const handleInvite = async (formData: InviteUserData) => {
    try {
      await inviteUser(formData)
      toast({
        title: 'Convite enviado',
        description: 'Um e-mail de convite foi enviado para o usuário',
      })
      setIsSheetOpen(false)
      await loadUsers()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      await deleteUserProfile(id)
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso',
      })
      await loadUsers()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingUser(null)
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
          Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>

        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Convidar Usuário
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {editingUser ? 'Editar Usuário' : 'Convidar Novo Usuário'}
            </SheetTitle>
            <SheetDescription>
              {editingUser
                ? 'Atualize as informações e permissões do usuário'
                : 'Envie um convite por e-mail para um novo usuário'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6 mt-6">
            {editingUser ? (
              <UserForm
                initialData={{
                  email: editingUser.email,
                  nome: editingUser.nome,
                  department_id: editingUser.department_id || undefined,
                  role: editingUser.role,
                }}
                onSubmit={handleUpdate}
                onCancel={handleCloseSheet}
              />
            ) : (
              <InviteUserForm onSubmit={handleInvite} onCancel={handleCloseSheet} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum usuário cadastrado no sistema
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleInfo = roleLabels[user.role]
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{user.nome}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.department ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3" />
                            {user.department.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleInfo.variant} className="gap-1">
                          <Shield className="h-3 w-3" />
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === userProfile?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
