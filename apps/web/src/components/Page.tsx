import type {ReactNode} from 'react'

export function Page({children}: {children: ReactNode}) {
  return (
    <main className="mx-auto max-w-page space-y-section px-gutter py-8 sm:px-6 sm:py-12 print:max-w-none print:p-0">
      {children}
    </main>
  )
}
