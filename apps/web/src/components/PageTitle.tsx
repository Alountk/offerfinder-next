import type {ReactNode} from 'react'

export function PageTitle({children}: {children: ReactNode}) {
  return <h1 className="text-title font-bold sm:text-title-lg">{children}</h1>
}
