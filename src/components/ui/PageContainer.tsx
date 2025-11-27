import * as React from 'react';
import { cn } from '@/lib/ui/ui.helpers';
import { uiStyles } from '@/lib/ui/ui.styles';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  breadcrumb?: React.ReactNode;
}

/**
 * PageContainer - Container principal para páginas
 * Fornece layout consistente com título, descrição e ações
 */
export function PageContainer({
  children,
  title,
  description,
  actions,
  className,
  contentClassName,
  breadcrumb,
}: PageContainerProps) {
  return (
    <div className={cn(uiStyles.container.page, className)}>
      <div className={uiStyles.container.content}>
        {/* Breadcrumb */}
        {breadcrumb && <div className="mb-4">{breadcrumb}</div>}

        {/* Header */}
        {(title || description || actions) && (
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                {title && (
                  <h1 className={uiStyles.typography.h1}>{title}</h1>
                )}
                {description && (
                  <p className={uiStyles.typography.subtitle}>{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 shrink-0">{actions}</div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={cn('space-y-6', contentClassName)}>{children}</div>
      </div>
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'card';
}

/**
 * Section - Seção de conteúdo com título e ações
 * Pode ser usada como card ou layout simples
 */
export function Section({
  children,
  title,
  description,
  subtitle,
  actions,
  className,
  contentClassName,
  variant = 'default',
}: SectionProps) {
  const isCard = variant === 'card';

  const header = (title || subtitle || description || actions) && (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', isCard ? 'px-6 pt-6' : 'mb-4')}>
      <div className="space-y-1.5">
        {title && (
          <h2 className={cn(
            isCard ? uiStyles.typography.h4 : uiStyles.typography.h3
          )}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className={uiStyles.typography.muted}>{subtitle}</p>
        )}
        {description && (
          <p className={uiStyles.typography.bodySmall}>{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );

  if (isCard) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card shadow-sm',
          className
        )}
      >
        {header}
        <div className={cn('p-6', header && 'pt-4', contentClassName)}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {header}
      <div className={contentClassName}>{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Cabeçalho reutilizável para páginas
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 md:mb-8', className)}>
      {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className={uiStyles.typography.h1}>{title}</h1>
          {description && (
            <p className={uiStyles.typography.subtitle}>{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState - Estado vazio para quando não há dados
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">{icon}</div>
      )}
      <h3 className={cn(uiStyles.typography.h5, 'mb-2')}>{title}</h3>
      {description && (
        <p className={cn(uiStyles.typography.muted, 'mb-6 max-w-sm')}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

interface DividerProps {
  label?: string;
  className?: string;
}

/**
 * Divider - Divisor de conteúdo
 */
export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('relative flex items-center py-4', className)}>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
        <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
          {label}
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
      </div>
    );
  }

  return <hr className={cn('border-t border-gray-200 dark:border-gray-800', className)} />;
}
