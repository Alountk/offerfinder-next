import type {ReactNode} from 'react'

export function Page({children}: {children: ReactNode}) {
  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
}
