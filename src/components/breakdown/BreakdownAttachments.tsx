'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  BreakdownAttachment,
  getAttachments, 
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl
} from '@/lib/breakdownAttachmentService'
import { Paperclip, Download, Trash2, Upload, FileText, File, Image as ImageIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BreakdownAttachmentsProps {
  breakdownId: string
  canEdit?: boolean
}

export function BreakdownAttachments({ breakdownId, canEdit = false }: BreakdownAttachmentsProps) {
  const [attachments, setAttachments] = useState<BreakdownAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAttachments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdownId])

  const loadAttachments = async () => {
    try {
      setLoading(true)
      const data = await getAttachments(breakdownId)
      setAttachments(data)
    } catch (error) {
      console.error('Erro ao carregar anexos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os anexos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'Arquivo muito grande. Tamanho máximo: 10MB',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setUploadProgress(0)

      // Simular progresso (Supabase não retorna progresso real)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      await uploadAttachment(breakdownId, selectedFile, description || undefined)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Resetar formulário
      setSelectedFile(null)
      setDescription('')
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      await loadAttachments()
      
      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso',
      })
    } catch (error: unknown) {
      console.error('Erro ao fazer upload:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o arquivo',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDownload = async (attachment: BreakdownAttachment) => {
    try {
      const url = await getAttachmentUrl(attachment.file_path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o arquivo',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await deleteAttachment(deletingId)
      setDeletingId(null)
      await loadAttachments()
      toast({
        title: 'Sucesso',
        description: 'Arquivo excluído',
      })
    } catch (error) {
      console.error('Erro ao excluir anexo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o arquivo',
        variant: 'destructive',
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-sm text-muted-foreground">Carregando anexos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Anexos
          <Badge variant="secondary">{attachments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload de arquivo */}
        {canEdit && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Label htmlFor="file-input">Selecionar arquivo</Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              />
              <p className="text-xs text-muted-foreground">
                Tamanho máximo: 10MB. Formatos: Imagens, PDF, Word, Excel, TXT, CSV
              </p>
            </div>

            {selectedFile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Adicione uma descrição para o arquivo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    disabled={uploading}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.type)}
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      onClick={() => {
                        setSelectedFile(null)
                        setDescription('')
                        const fileInput = document.getElementById('file-input') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      Remover
                    </Button>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-center text-xs text-muted-foreground">
                      Enviando... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Lista de anexos */}
        {attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Paperclip className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Nenhum anexo adicionado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                    {attachment.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {attachment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {formatFileSize(attachment.file_size)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(attachment.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 ml-2">
                  <Button
                    onClick={() => handleDownload(attachment)}
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      onClick={() => setDeletingId(attachment.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anexo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
