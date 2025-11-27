'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { 
  BreakdownHistory as BreakdownHistoryType,
  getBreakdownHistory, 
  addBreakdownComment,
  updateBreakdownComment,
  deleteBreakdownComment
} from '@/lib/breakdownHistoryService'
import { MessageSquare, Clock, Activity, Pencil, Trash2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BreakdownHistoryProps {
  breakdownId: string
  canEdit?: boolean
}

export function BreakdownHistory({ breakdownId, canEdit = false }: BreakdownHistoryProps) {
  const [history, setHistory] = useState<BreakdownHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdownId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await getBreakdownHistory(breakdownId)
      setHistory(data)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      await addBreakdownComment(breakdownId, newComment.trim())
      setNewComment('')
      await loadHistory()
      toast({
        title: 'Sucesso',
        description: 'Comentário adicionado',
      })
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateComment = async (id: string) => {
    if (!editContent.trim()) return

    try {
      setSubmitting(true)
      await updateBreakdownComment(id, editContent.trim())
      setEditingId(null)
      setEditContent('')
      await loadHistory()
      toast({
        title: 'Sucesso',
        description: 'Comentário atualizado',
      })
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o comentário',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!deletingId) return

    try {
      setSubmitting(true)
      await deleteBreakdownComment(deletingId)
      setDeletingId(null)
      await loadHistory()
      toast({
        title: 'Sucesso',
        description: 'Comentário excluído',
      })
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      case 'status_change':
        return <Activity className="h-4 w-4" />
      case 'update':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEntryBadge = (type: string) => {
    switch (type) {
      case 'comment':
        return <Badge variant="secondary">Comentário</Badge>
      case 'status_change':
        return <Badge variant="default">Mudança de Status</Badge>
      case 'update':
        return <Badge variant="outline">Atualização</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-sm text-muted-foreground">Carregando histórico...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico & Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar novo comentário */}
        {canEdit && (
          <div className="space-y-2">
            <Textarea
              placeholder="Adicionar um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                <Send className="mr-2 h-4 w-4" />
                Adicionar Comentário
              </Button>
            </div>
          </div>
        )}

        {/* Timeline de histórico */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Clock className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Nenhum histórico registrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex gap-4">
                {/* Linha vertical da timeline */}
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getEntryIcon(entry.entry_type)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>

                {/* Conteúdo da entrada */}
                <div className="flex-1 space-y-2 pb-4">
                  <div className="flex items-center gap-2">
                    {getEntryBadge(entry.entry_type)}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {editingId === entry.id ? (
                    // Modo de edição
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateComment(entry.id)}
                          disabled={!editContent.trim() || submitting}
                          size="sm"
                        >
                          Salvar
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(null)
                            setEditContent('')
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                      
                      {/* Metadados (para mudanças de status) */}
                      {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {entry.entry_type === 'status_change' && entry.metadata.old_status && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {entry.metadata.old_status}
                              </Badge>
                              <span>→</span>
                              <Badge variant="outline" className="text-xs">
                                {entry.metadata.new_status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ações (apenas para comentários do usuário) */}
                  {canEdit && entry.entry_type === 'comment' && editingId !== entry.id && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(entry.id)
                          setEditContent(entry.content)
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setDeletingId(entry.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
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
            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O comentário será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} disabled={submitting}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
