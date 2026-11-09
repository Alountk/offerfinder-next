import {Skeleton} from './Skeleton'

export function FiltersLoading() {
  return (
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      <Skeleton className="h-10 w-full md:hidden" />
      <div className="hidden gap-4 md:flex">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-8 w-20 self-end" />
      </div>
    </div>
  )
}
