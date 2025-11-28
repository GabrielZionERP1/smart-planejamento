'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Building2, Pencil, Calendar, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import toast from '@/lib/ui/toast'
import { Company } from '@/lib/types'
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  getCompanyStats,
} from '@/lib/companyService'
import { useCompany } from '@/lib/companyContext'
import { useRouter } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/auth'

interface CompanyWithStats extends Company {
  stats?: {
    total_users: number
    total_plans: number
    total_departments: number
    total_action_plans: number
  }
}

export default function CompaniesAdminPage() {
  const router = useRouter()
  const { isSuperAdmin, isLoading: contextLoading, refreshCompanies } = useCompany()
  const [companies, setCompanies] = useState<CompanyWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState<any>({ 
    name: '', 
    document: '',
    logo_url: '',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getAllCompanies()
      
      // Carregar estatísticas para cada empresa
      const companiesWithStats = await Promise.all(
        data.map(async (company) => {
          try {
            const stats = await getCompanyStats(company.id)
            return { ...company, stats }
          } catch {
            return { ...company, stats: undefined }
          }
        })
      )

      setCompanies(companiesWithStats)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verificar permissão e carregar dados
  useEffect(() => {
    async function checkPermissionAndLoad() {
      if (contextLoading) return

      // Verificar se é superadmin
      const profile = await getCurrentUserProfile()
      if (!profile || profile.role !== 'superadmin') {
        toast.error('Acesso negado. Apenas superadmins podem acessar esta página.')
        router.push('/')
        return
      }

      loadCompanies()
    }

    checkPermissionAndLoad()
  }, [isSuperAdmin, contextLoading, loadCompanies, router])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nome da empresa é obrigatório')
      return
    }

    // Validações adicionais para nova empresa
    if (!editingCompany) {
      if (!formData.admin_name?.trim()) {
        toast.error('Nome do administrador é obrigatório')
        return
      }
      if (!formData.admin_email?.trim()) {
        toast.error('Email do administrador é obrigatório')
        return
      }
      if (!formData.admin_password || formData.admin_password.length < 6) {
        toast.error('Senha deve ter no mínimo 6 caracteres')
        return
      }
    }

    try {
      // A logo já está em base64 no logoPreview (se foi selecionada)
      const logoUrl = logoPreview || formData.logo_url

      if (editingCompany) {
        // Atualizar empresa existente
        await updateCompany(editingCompany.id, {
          name: formData.name,
          document: formData.document || undefined,
          logo_url: logoUrl || undefined,
        })
        toast.success('Empresa atualizada com sucesso')
      } else {
        // Criar nova empresa com admin
        await createCompany({
          name: formData.name,
          document: formData.document || undefined,
          logo_url: logoUrl || undefined,
          admin_name: formData.admin_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
        })
        toast.success('Empresa e administrador criados com sucesso!')
      }

      setIsDialogOpen(false)
      setEditingCompany(null)
      setLogoFile(null)
      setLogoPreview('')
      setFormData({ 
        name: '', 
        document: '',
        logo_url: '',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      })
      await loadCompanies()
      await refreshCompanies() // Atualizar contexto
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(errorMessage)
    }
  }, [editingCompany, formData, logoPreview, loadCompanies, refreshCompanies])

  const handleEdit = useCallback((company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      document: company.document || '',
      logo_url: company.logo_url || '',
      admin_name: '',
      admin_email: '',
      admin_password: ''
    })
    setLogoPreview(company.logo_url || '')
    setLogoFile(null)
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setEditingCompany(null)
    setLogoFile(null)
    setLogoPreview('')
    setFormData({ 
      name: '', 
      document: '',
      logo_url: '',
      admin_name: '',
      admin_email: '',
      admin_password: ''
    })
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas')
      return
    }

    // Criar uma imagem para redimensionar
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return
      
      img.onload = () => {
        // Redimensionar para no máximo 400x400 mantendo proporção
        const maxSize = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        // Criar canvas e desenhar imagem redimensionada
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          toast.error('Erro ao processar imagem')
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Converter para base64 com qualidade reduzida (0.7 = 70%)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)

        // Verificar tamanho do base64 (máximo ~500KB em base64)
        if (base64.length > 700000) {
          toast.error('Imagem ainda muito grande após compressão. Tente outra imagem.')
          return
        }

        setLogoFile(file)
        setLogoPreview(base64)
      }

      img.src = event.target.result as string
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setFormData({ ...formData, logo_url: '' })
  }

  if (contextLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Cadastro e gerenciamento de empresas do sistema
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleCloseDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
                </DialogTitle>
                <DialogDescription>
                  {editingCompany
                    ? 'Atualize os dados da empresa'
                    : 'Preencha os dados para criar uma nova empresa'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Empresa XYZ Ltda"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ</Label>
                  <Input
                    id="document"
                    value={formData.document}
                    onChange={(e) => {
                      // Aplicar máscara de CNPJ
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 14) {
                        value = value.replace(/^(\d{2})(\d)/, '$1.$2')
                        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
                        value = value.replace(/(\d{4})(\d)/, '$1-$2')
                      }
                      setFormData({ ...formData, document: value })
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo da Empresa</Label>
                  {logoPreview ? (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          toast.error('Erro ao carregar preview da imagem')
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Imagem
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Será redimensionada para 400x400px
                      </span>
                    </div>
                  )}
                </div>

                {!editingCompany && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Usuário Administrador *</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Crie o primeiro usuário admin para esta empresa
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin_name">Nome do Administrador *</Label>
                      <Input
                        id="admin_name"
                        value={(formData as any).admin_name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, admin_name: e.target.value } as any)
                        }
                        placeholder="Ex: João Silva"
                        required={!editingCompany}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Email do Administrador *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        value={(formData as any).admin_email || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, admin_email: e.target.value } as any)
                        }
                        placeholder="Ex: admin@empresa.com"
                        required={!editingCompany}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin_password">Senha *</Label>
                      <Input
                        id="admin_password"
                        type="password"
                        value={(formData as any).admin_password || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, admin_password: e.target.value } as any)
                        }
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required={!editingCompany}
                      />
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
          <CardDescription>
            {companies.length} {companies.length === 1 ? 'empresa' : 'empresas'} no
            sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma empresa cadastrada</p>
              <p className="text-sm mt-1">Clique em &quot;Nova Empresa&quot; para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead className="text-center">Usuários</TableHead>
                  <TableHead className="text-center">Planejamentos</TableHead>
                  <TableHead className="text-center">Planos de Ação</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {company.logo_url ? (
                          <div className="h-8 w-8 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                            <img
                              src={company.logo_url}
                              alt={`Logo ${company.name}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                // Se imagem falhar ao carregar, esconder
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                        <span className="font-medium">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.document || (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {company.stats?.total_users || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {company.stats?.total_plans || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {company.stats?.total_action_plans || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(company.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
