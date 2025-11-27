'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, AlertCircle, Edit, Trash2, Mail, Phone } from 'lucide-react'
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
import { getCurrentUserProfile, canManageClients } from '@/lib/permissions'
import { Profile } from '@/lib/types'
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  Client,
  ClientFormData,
} from '@/lib/clientService'
import { ClientForm } from '@/components/settings/ClientForm'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils/date'

export default function ClientsPage() {
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const loadClients = useCallback(async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive',
      })
    }
  }, [toast])

  useEffect(() => {
    async function checkPermissions() {
      const profile = await getCurrentUserProfile()
      if (profile) {
        setUserProfile(profile)
        const hasPermission = await canManageClients(profile)
        setCanManage(hasPermission)
        if (hasPermission) {
          await loadClients()
        }
      }
      setLoading(false)
    }
    checkPermissions()
  }, [loadClients])

  const handleCreate = async (formData: ClientFormData) => {
    try {
      await createClient(formData)
      toast({
        title: 'Sucesso',
        description: 'Cliente criado com sucesso',
      })
      setIsSheetOpen(false)
      await loadClients()
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async (formData: ClientFormData) => {
    if (!editingClient) return
    try {
      await updateClient(editingClient.id, formData)
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      })
      setIsSheetOpen(false)
      setEditingClient(null)
      await loadClients()
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await deleteClient(id)
      toast({
        title: 'Sucesso',
        description: 'Cliente excluído com sucesso',
      })
      await loadClients()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
    setEditingClient(null)
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
          Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar clientes.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da organização
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </SheetTitle>
              <SheetDescription>
                {editingClient
                  ? 'Atualize as informações do cliente'
                  : 'Cadastre um novo cliente no sistema'}
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 pb-6 mt-6">
              <ClientForm
                initialData={editingClient ? {
                  nome: editingClient.nome,
                  email: editingClient.email || '',
                  telefone: editingClient.telefone || '',
                  endereco: editingClient.endereco || '',
                  cidade: editingClient.cidade || '',
                  estado: editingClient.estado || '',
                  cep: editingClient.cep || '',
                  cnpj_cpf: editingClient.cnpj_cpf || '',
                  observacoes: editingClient.observacoes || '',
                } : undefined}
                onSubmit={editingClient ? handleUpdate : handleCreate}
                onCancel={handleCloseSheet}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum cliente cadastrado. Clique em &quot;Novo Cliente&quot; para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{client.nome}</div>
                        {client.cnpj_cpf && (
                          <div className="text-xs text-muted-foreground">{client.cnpj_cpf}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                        {client.telefone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {client.telefone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.cidade && client.estado
                        ? `${client.cidade}/${client.estado}`
                        : client.cidade || client.estado || '-'}
                    </TableCell>
                    <TableCell>{formatDate(client.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(client.id)}
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
