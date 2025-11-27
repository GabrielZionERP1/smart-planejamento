'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Loader2 } from 'lucide-react'
import { toast } from '@/lib/ui/toast'

interface MvvCardProps {
  title: string
  description: string
  value: string | null
  onSave: (value: string) => Promise<void>
}

export function MvvCard({ title, description, value, onSave }: MvvCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(editValue)
      setIsOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditValue(value || '')
    }
    setIsOpen(open)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar {title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Digite ${title.toLowerCase()} aqui...`}
                  rows={6}
                  disabled={saving}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {value ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nenhum conteúdo definido. Clique em &quot;Editar&quot; para adicionar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
