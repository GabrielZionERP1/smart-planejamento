import { Skeleton } from '@/components/ui/skeleton';
import { uiStyles } from '@/lib/ui/ui.styles';
import { cn } from '@/lib/ui/ui.helpers';

export default function Loading() {
  return (
    <div className={uiStyles.container.page}>
      <div className={uiStyles.container.content}>
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Cards Grid */}
          <div className={cn(uiStyles.container.gridCols3)}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Section Skeleton */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
