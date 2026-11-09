import {Skeleton, SkeletonRegion} from './Skeleton'

export function OfferLoading() {
  return (
    <SkeletonRegion label="Cargando oferta…">
      <div className="space-y-section">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </SkeletonRegion>
  )
}
