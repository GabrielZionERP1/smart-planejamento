'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StrategicPlan } from '@/lib/types'

/**
 * Hook para obter o planejamento atual baseado na URL
 */
export function useCurrentPlan() {
  const params = useParams()
  const planId = params?.id as string | undefined
  
  const [plan, setPlan] = useState<StrategicPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!planId) {
      setLoading(false)
      return
    }

    async function fetchPlan() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('planejamentos')
          .select('*')
          .eq('id', planId)
          .single()

        if (error) throw error
        setPlan(data as StrategicPlan)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [planId])

  return { plan, loading, error }
}
