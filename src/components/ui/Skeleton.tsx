export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-bg-surface2 rounded animate-shimmer bg-gradient-to-r from-bg-surface2 via-bg-overlay to-bg-surface2 bg-[length:200%_100%] ${className}`}
    />
  )
}

export function SkeletonBastionCard() {
  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-3 w-48" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </div>
    </div>
  )
}

export default Skeleton
