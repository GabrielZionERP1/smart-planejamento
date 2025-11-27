'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PageContainer, EmptyState } from '@/components/ui/PageContainer'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PlanForm } from '@/components/plan/PlanForm'
import { PlanCard } from '@/components/plan/PlanCard'
import { PlanCardSkeleton } from '@/components/plan/PlanCardSkeleton'
import { StrategicPlan, StrategicPlanFormData } from '@/lib/types'
import { getStrategicPlansPaginated, createStrategicPlan } from '@/lib/planService'
import { getCurrentUserProfile, canCreatePlan } from '@/lib/permissions'
import { Pagination } from '@/components/ui/pagination'
import toast from '@/lib/ui/toast'
import { staggerContainer } from '@/lib/ui/animations'

export default function PlansPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [plans, setPlans] = useState<StrategicPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [canCreate, setCanCreate] = useState(false)
  const pageSize = 9

  useEffect(() => {
    loadUserPermissions()
    loadPlans(currentPage)
  }, [currentPage])

  async function loadUserPermissions() {
    const profile = await getCurrentUserProfile()
    if (profile) {
      const canCreatePlans = await canCreatePlan(profile)
      setCanCreate(canCreatePlans)
    }
  }

  async function loadPlans(page: number) {
    try {
      setLoading(true)
      setError(null)
      const response = await getStrategicPlansPaginated(page, pageSize)
      setPlans(response.data)
      setTotalPages(response.totalPages)
      setTotalCount(response.count)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar planejamentos'
      setError(message)
      toast.error('Erro ao carregar planejamentos', { description: message })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredPlans = useMemo(() => {
    if (!searchTerm.trim()) {
      return plans
    }

    const term = searchTerm.toLowerCase()
    return plans.filter((plan) => {
      const nameMatch = plan.name?.toLowerCase().includes(term)
      const descriptionMatch = plan.description?.toLowerCase().includes(term)
      return nameMatch || descriptionMatch
    })
  }, [plans, searchTerm])

  async function handleSubmit(data: StrategicPlanFormData) {
    try {
      setSubmitting(true)
      setError(null)
      console.log('📝 Criando planejamento:', data)
      await createStrategicPlan(data)
      setIsOpen(false)
      setCurrentPage(1)
      await loadPlans(1)
      toast.success('Planejamento estratégico criado com sucesso')
    } catch (err) {
      console.error('❌ Erro ao criar planejamento:', err)
      const message = err instanceof Error ? err.message : 'Erro ao criar planejamento'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="Planejamentos Estratégicos"
      description="Gerencie os planejamentos estratégicos da organização"
      actions={
        canCreate && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Planejamento
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle>Novo Planejamento Estratégico</SheetTitle>
                <SheetDescription>
                  Crie um novo planejamento definindo nome, descrição e período de execução
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 mt-6">
                <PlanForm
                  onSubmit={handleSubmit}
                  onCancel={() => setIsOpen(false)}
                  loading={submitting}
                />
              </div>
            </SheetContent>
          </Sheet>
        )
      }
    >
      {/* Barra de Busca */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar planejamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground">
            {filteredPlans.length} resultado{filteredPlans.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title={searchTerm ? 'Nenhum planejamento encontrado' : 'Nenhum planejamento cadastrado'}
          description={
            searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Clique em "Novo Planejamento" para começar'
          }
          action={
            !searchTerm && canCreate && (
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Planejamento
              </Button>
            )
          }
        />
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPlans.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </motion.div>

          {!searchTerm && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {!searchTerm && totalCount > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Mostrando {plans.length} de {totalCount} planejamento{totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </PageContainer>
  )
}
