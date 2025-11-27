'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import { Objective } from '@/lib/types'
import { ObjectiveForm } from './ObjectiveForm'
import { toast } from '@/lib/ui/toast'

interface ObjectiveItemProps {
  objective: Objective
  onUpdate: (id: string, data: { title: string; summary?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ObjectiveItem({ objective, onUpdate, onDelete }: ObjectiveItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async (data: { title: string; summary?: string }) => {
    try {
      setUpdating(true)
      await onUpdate(objective.id, data)
      setIsEditOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar objetivo'
      toast.error(message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este objetivo?')) {
      return
    }

    try {
      setIsDeleting(true)
      await onDelete(objective.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir objetivo'
      toast.error(message)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{objective.title}</CardTitle>
              {objective.summary && (
                <p className="text-sm text-muted-foreground mt-2">{objective.summary}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{objective.status}</span>
            <span>•</span>
            <span>Posição: {objective.position}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Objetivo</DialogTitle>
            <DialogDescription>
              Atualize as informações do objetivo estratégico
            </DialogDescription>
          </DialogHeader>
          <ObjectiveForm
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            initialData={{ title: objective.title, summary: objective.summary || '' }}
            loading={updating}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
