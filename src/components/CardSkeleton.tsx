export default function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse">
      <div className="p-6 space-y-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-1/3 bg-slate-200 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded-md" />
              <div className="h-3 w-4/5 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="h-20 bg-slate-100 rounded-lg" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-md bg-slate-200" />
            <div className="h-8 w-8 rounded-md bg-slate-200" />
          </div>
          <div className="h-8 w-24 rounded-md bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
