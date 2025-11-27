'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Target } from 'lucide-react'
import { Objective } from '@/lib/types'
import { ObjectiveForm } from './ObjectiveForm'
import { ObjectiveItem } from './ObjectiveItem'
import { toast } from '@/lib/ui/toast'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/ui/animations'

interface ObjectiveListProps {
  objectives: Objective[]
  onCreate: (data: { title: string; summary?: string }) => Promise<void>
  onUpdate: (id: string, data: { title: string; summary?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading?: boolean
}

export function ObjectiveList({
  objectives,
  onCreate,
  onUpdate,
  onDelete,
  loading = false,
}: ObjectiveListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (data: { title: string; summary?: string }) => {
    try {
      setCreating(true)
      await onCreate(data)
      setIsCreateOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar objetivo'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos Estratégicos
            </CardTitle>
            <CardDescription>
              Defina os objetivos estratégicos que guiarão as ações do planejamento
            </CardDescription>
          </div>
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Objetivo
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>Novo Objetivo Estratégico</SheetTitle>
                <SheetDescription>
                  Adicione um novo objetivo ao planejamento estratégico
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 mt-6">
                <ObjectiveForm
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateOpen(false)}
                  loading={creating}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando objetivos...</p>
          </div>
        ) : objectives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-1">
              Nenhum objetivo estratégico definido
            </p>
            <p className="text-xs text-muted-foreground">
              Clique em &quot;Novo Objetivo&quot; para começar
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {objectives.map((objective, index) => (
              <motion.div key={objective.id} variants={staggerItem} custom={index}>
                <ObjectiveItem
                  objective={objective}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
