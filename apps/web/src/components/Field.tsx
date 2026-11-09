import type {ComponentProps, ReactNode} from 'react'

const CONTROL_CLASSES =
  'rounded border border-border bg-background px-2 py-1 enabled:not-aria-invalid:hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50'

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({label, children}: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {children}
    </label>
  )
}

export function Input(props: Omit<ComponentProps<'input'>, 'className'>) {
  return <input className={CONTROL_CLASSES} {...props} />
}

export function Select(props: Omit<ComponentProps<'select'>, 'className'>) {
  return <select className={CONTROL_CLASSES} {...props} />
}
