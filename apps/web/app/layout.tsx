import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import {DevToolsLoader} from '@live-coding/devtools'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prueba técnica · Buscador de ofertas',
  description: 'Prueba técnica de frontend: buscador de ofertas con Next.js'
}

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="es">
      <body className="bg-background text-foreground antialiased">
        {children}
        <DevToolsLoader />
      </body>
    </html>
  )
}
