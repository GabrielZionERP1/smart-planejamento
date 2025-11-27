/**
 * Toast System - Sistema global de notificações
 * Wrapper sobre sonner para notificações padronizadas
 */

import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast de sucesso
 */
export function success(message: string, options?: ToastOptions) {
  sonnerToast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Toast de erro
 */
export function error(message: string, options?: ToastOptions) {
  sonnerToast.error(message, {
    description: options?.description,
    duration: options?.duration || 5000,
    action: options?.action,
  });
}

/**
 * Toast informativo
 */
export function info(message: string, options?: ToastOptions) {
  sonnerToast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Toast de aviso
 */
export function warning(message: string, options?: ToastOptions) {
  sonnerToast.warning(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Toast de loading/promessa
 */
export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return sonnerToast.promise(promise, messages);
}

/**
 * Toast customizado
 */
export function custom(message: string, options?: ToastOptions) {
  sonnerToast(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

/**
 * Fechar toast específico
 */
export function dismiss(toastId?: string | number) {
  sonnerToast.dismiss(toastId);
}

/**
 * Exporta o objeto toast com todos os métodos
 */
export const toast = {
  success,
  error,
  info,
  warning,
  promise,
  custom,
  dismiss,
};

export default toast;
