import type {ReactNode} from 'react'

export function Skeleton({className}: {className: string}) {
  return <div className={`rounded bg-border ${className}`} />
}

interface SkeletonRegionProps {
  label: string
  children: ReactNode
}

export function SkeletonRegion({label, children}: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        {children}
      </div>
    </div>
  )
}
