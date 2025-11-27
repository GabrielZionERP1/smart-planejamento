/**
 * Design System - UI Helpers
 * Funções utilitárias para manipulação de UI
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Mescla classes CSS de forma inteligente
 * Combina clsx e tailwind-merge para evitar conflitos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata título de card removendo caracteres especiais e aplicando capitalização
 */
export function formatCardTitle(title: string): string {
  if (!title) return '';
  
  return title
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Aplica cor baseada no status
 */
export function applyStatusColor(status: string): {
  badge: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const statusLower = status.toLowerCase();

  const statusMap: Record<string, ReturnType<typeof applyStatusColor>> = {
    // Status de planejamento
    'em_andamento': {
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
    },
    'planejamento': {
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      dot: 'bg-purple-500',
    },
    'concluido': {
      badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      dot: 'bg-green-500',
    },
    'cancelado': {
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-950/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    },
    'pausado': {
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      dot: 'bg-yellow-500',
    },
    'pendente': {
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      dot: 'bg-orange-500',
    },
    'atrasado': {
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-950/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
    },
    'nao_iniciado': {
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
      bg: 'bg-gray-50 dark:bg-gray-950/20',
      text: 'text-gray-700 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-800',
      dot: 'bg-gray-500',
    },
  };

  return statusMap[statusLower] || statusMap['nao_iniciado'];
}

/**
 * Formata status para exibição
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'em_andamento': 'Em Andamento',
    'planejamento': 'Planejamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado',
    'pausado': 'Pausado',
    'pendente': 'Pendente',
    'atrasado': 'Atrasado',
    'nao_iniciado': 'Não Iniciado',
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Calcula a cor da barra de progresso baseada no percentual
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Verifica se uma data está atrasada
 */
export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return false;
  
  return d < new Date();
}

/**
 * Calcula dias restantes até uma data
 */
export function daysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return 0;
  
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Trunca texto com elipse
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

/**
 * Gera iniciais a partir de um nome
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Gera cor consistente baseada em string
 */
export function stringToColor(str: string): string {
  if (!str) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Debounce function para otimizar performance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
