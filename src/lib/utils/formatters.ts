/**
 * Formata um número como porcentagem
 */
export function formatPercentage(value: number): string {
  return `${value}%`
}

/**
 * Formata um número com separadores de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formata um valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Retorna iniciais de um nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Gera cor baseada em status (compatível com Badge do shadcn/ui)
 */
export function getStatusColor(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    concluido: 'default',
    em_andamento: 'secondary',
    nao_iniciado: 'outline',
    atrasado: 'destructive',
    cancelado: 'destructive',
    pendente: 'outline',
    ativo: 'default',
  }

  return statusMap[status] || 'default'
}

/**
 * Traduz status para português
 */
export function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    nao_iniciado: 'Não Iniciado',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    atrasado: 'Atrasado',
    cancelado: 'Cancelado',
    pendente: 'Pendente',
    ativo: 'Ativo',
  }

  return translations[status] || status
}
