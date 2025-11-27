import { Skeleton } from '@/components/ui/skeleton';
import { uiStyles } from '@/lib/ui/ui.styles';
import { cn } from '@/lib/ui/ui.helpers';

export default function PlansLoading() {
  return (
    <div className={uiStyles.container.page}>
      <div className={uiStyles.container.content}>
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>

        {/* Plans Grid Skeleton */}
        <div className={cn(uiStyles.container.gridCols3)}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>

              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
