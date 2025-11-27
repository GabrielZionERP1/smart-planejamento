"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { getProgressColor } from "@/lib/ui/ui.helpers"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number
  showPercentage?: boolean
  colorByValue?: boolean
}

function Progress({
  className,
  value = 0,
  showPercentage,
  colorByValue,
  ...props
}: ProgressProps) {
  const barColor = colorByValue ? getProgressColor(value) : 'bg-primary';

  return (
    <div className="w-full space-y-1">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "bg-gray-200 dark:bg-gray-800 relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out",
            barColor
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <div className="text-xs text-right text-muted-foreground">
          {Math.round(value)}%
        </div>
      )}
    </div>
  )
}

export { Progress }
