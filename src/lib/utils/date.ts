import { format, formatDistance, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata uma data para o padrão brasileiro (dd/MM/yyyy)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}

/**
 * Formata uma data e hora para o padrão brasileiro
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Retorna a distância relativa entre uma data e agora
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true, 
    locale: ptBR 
  })
}

/**
 * Verifica se uma data está no passado
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj < new Date()
}

/**
 * Verifica se uma data está próxima (dentro de X dias)
 */
export function isDateNear(date: string | Date, daysThreshold: number = 7): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + daysThreshold)
  return dateObj <= threshold && dateObj >= new Date()
}
