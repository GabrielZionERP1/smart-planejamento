'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, Calendar, Eye, History, Paperclip } from 'lucide-react'
import { 
  getBreakdownsByActionPlan, 
  createBreakdown, 
  updateBreakdown, 
  deleteBreakdown,
  ActionBreakdown,
  CreateBreakdownPayload 
} from '@/lib/breakdownService'
import { getActionPlanById } from '@/lib/actionPlanService'
import { ActionPlan } from '@/lib/types'
import { BreakdownForm } from './BreakdownForm'
import { BreakdownHistory } from './BreakdownHistory'
import { BreakdownAttachments } from './BreakdownAttachments'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils/date'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { BreakdownSchema } from '@/lib/schemas'

interface BreakdownListProps {
  actionPlanId: string
  planId: string
  canEdit?: boolean
}

const statusMap = {
  nao_iniciado: { label: 'Não Iniciado', icon: Circle, color: 'text-gray-500' },
  em_andamento: { label: 'Em Andamento', icon: Clock, color: 'text-blue-500' },
  concluido: { label: 'Concluído', icon: CheckCircle2, color: 'text-green-500' },
}

export function BreakdownList({ actionPlanId, planId, canEdit = true }: BreakdownListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [breakdowns, setBreakdowns] = useState<ActionBreakdown[]>([])
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingBreakdown, setEditingBreakdown] = useState<ActionBreakdown | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [historyBreakdownId, setHistoryBreakdownId] = useState<string | null>(null)
  const [attachmentsBreakdownId, setAttachmentsBreakdownId] = useState<string | null>(null)

  async function loadBreakdowns() {
    try {
      setLoading(true)
      const [breakdownsData, actionData] = await Promise.all([
        getBreakdownsByActionPlan(actionPlanId),
        getActionPlanById(actionPlanId)
      ])
      setBreakdowns(breakdownsData)
      setActionPlan(actionData)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar desdobramentos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBreakdowns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionPlanId])

  async function handleCreate(data: BreakdownSchema) {
    try {
      setSubmitting(true)
      const payload: CreateBreakdownPayload = {
        action_plan_id: actionPlanId,
        title: data.title,
        executor_id: data.executor_id || undefined,
        required_resources: data.required_resources || undefined,
        financial_resources: data.financial_resources || 0,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        effort: data.effort || 1,
        status: data.status || 'nao_iniciado',
      }
      
      await createBreakdown(payload)
      await loadBreakdowns()
      setIsSheetOpen(false)
      toast({
        title: 'Sucesso!',
        description: 'Desdobramento criado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar desdobramento',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(data: BreakdownSchema) {
    if (!editingBreakdown) return
    
    try {
      setSubmitting(true)
      await updateBreakdown(editingBreakdown.id, {
        title: data.title,
        executor_id: data.executor_id || null,
        required_resources: data.required_resources || null,
        financial_resources: data.financial_resources || 0,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        effort: data.effort || 1,
        status: data.status || 'nao_iniciado',
        is_completed: data.is_completed || false,
      })
      
      await loadBreakdowns()
      setIsSheetOpen(false)
      setEditingBreakdown(null)
      toast({
        title: 'Sucesso!',
        description: 'Desdobramento atualizado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar desdobramento',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    
    try {
      await deleteBreakdown(deletingId)
      await loadBreakdowns()
      setDeletingId(null)
      toast({
        title: 'Sucesso!',
        description: 'Desdobramento excluído com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao excluir desdobramento',
        variant: 'destructive',
      })
    }
  }

  function openEditSheet(breakdown: ActionBreakdown) {
    setEditingBreakdown(breakdown)
    setIsSheetOpen(true)
  }

  function openCreateSheet() {
    setEditingBreakdown(null)
    setIsSheetOpen(true)
  }

  function closeSheet() {
    setIsSheetOpen(false)
    setEditingBreakdown(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desdobramentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Desdobramentos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Tarefas e subatividades do plano de ação
              </p>
            </div>
            {canEdit && (
              <Button onClick={openCreateSheet}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Desdobramento
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {breakdowns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum desdobramento cadastrado.</p>
              {canEdit && (
                <p className="text-sm mt-2">
                  Clique em &quot;Novo Desdobramento&quot; para começar.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {breakdowns.map((breakdown, index) => {
                const statusInfo = statusMap[breakdown.status as keyof typeof statusMap]
                const StatusIcon = statusInfo?.icon || Circle

                return (
                  <div
                    key={breakdown.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-medium">
                          {index + 1}. {breakdown.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <StatusIcon className={`h-3 w-3 ${statusInfo?.color || ''}`} />
                            <span className="text-xs">{statusInfo?.label || breakdown.status}</span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/plans/${planId}/actions/${actionPlanId}/breakdowns/${breakdown.id}`)}
                            title="Ver detalhes completos"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHistoryBreakdownId(breakdown.id)}
                            title="Ver histórico e comentários"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAttachmentsBreakdownId(breakdown.id)}
                            title="Ver anexos"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditSheet(breakdown)}
                                title="Editar desdobramento"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingId(breakdown.id)}
                                title="Excluir desdobramento"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {(breakdown.start_date || breakdown.end_date) && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {breakdown.start_date && formatDate(breakdown.start_date)}
                            {breakdown.start_date && breakdown.end_date && ' - '}
                            {breakdown.end_date && formatDate(breakdown.end_date)}
                          </div>
                        )}
                        
                        <div>
                          <span className="text-muted-foreground">Esforço: </span>
                          {breakdown.effort === 1 && '🟢 Baixo'}
                          {breakdown.effort === 2 && '🟡 Médio'}
                          {breakdown.effort === 3 && '🔴 Alto'}
                        </div>

                        {breakdown.financial_resources && breakdown.financial_resources > 0 && (
                          <div>
                            <span>R$ {breakdown.financial_resources.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>

                      {breakdown.required_resources && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Recursos: </span>
                          {breakdown.required_resources}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet de Criar/Editar */}
      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>
              {editingBreakdown ? 'Editar Desdobramento' : 'Novo Desdobramento'}
            </SheetTitle>
            <SheetDescription>
              {editingBreakdown
                ? 'Atualize as informações do desdobramento'
                : 'Crie uma nova tarefa ou subatividade'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6 mt-6">
            <BreakdownForm
              onSubmit={editingBreakdown ? handleUpdate : handleCreate}
              onCancel={closeSheet}
              actionStartDate={actionPlan?.start_date}
              actionEndDate={actionPlan?.end_date}
              initialData={editingBreakdown ? {
                title: editingBreakdown.title,
                executor_id: editingBreakdown.executor_id || '',
                required_resources: editingBreakdown.required_resources || '',
                financial_resources: editingBreakdown.financial_resources || 0,
                start_date: editingBreakdown.start_date || '',
                end_date: editingBreakdown.end_date || '',
                effort: editingBreakdown.effort,
                status: editingBreakdown.status as 'nao_iniciado' | 'em_andamento' | 'concluido' | 'cancelado' | 'atrasado',
                is_completed: editingBreakdown.is_completed,
              } : undefined}
              loading={submitting}
              currentUser={null}
              canEdit={canEdit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este desdobramento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Histórico */}
      <Dialog open={!!historyBreakdownId} onOpenChange={() => setHistoryBreakdownId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico & Comentários</DialogTitle>
          </DialogHeader>
          {historyBreakdownId && (
            <BreakdownHistory breakdownId={historyBreakdownId} canEdit={canEdit} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Anexos */}
      <Dialog open={!!attachmentsBreakdownId} onOpenChange={() => setAttachmentsBreakdownId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anexos do Desdobramento</DialogTitle>
          </DialogHeader>
          {attachmentsBreakdownId && (
            <BreakdownAttachments breakdownId={attachmentsBreakdownId} canEdit={canEdit} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
