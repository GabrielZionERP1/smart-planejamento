'use client'

import { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}

export function DashboardSection({
  title,
  description,
  children,
  action,
}: DashboardSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
