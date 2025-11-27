import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { applyStatusColor, formatStatus } from '@/lib/ui/ui.helpers';
import { cn } from '@/lib/ui/ui.helpers';

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
}

/**
 * StatusBadge - Badge de status com cores padronizadas
 */
export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const colors = applyStatusColor(status);
  const label = formatStatus(status);

  return (
    <Badge className={cn(colors.badge, className)}>
      {showDot && <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', colors.dot)} />}
      {label}
    </Badge>
  );
}
