import type {ComponentProps} from 'react'

export type ButtonVariant = 'primary' | 'secondary'

const BASE_CLASSES =
  'rounded px-4 py-1 motion-safe:transition-[background-color,border-color] disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-foreground not-disabled:hover:bg-brand/85',
  secondary: 'border border-input not-disabled:hover:border-foreground'
}

export function buttonClasses(variant: ButtonVariant = 'primary') {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`
}

type ButtonProps = Omit<ComponentProps<'button'>, 'className'> & {variant?: ButtonVariant}

export function Button({type = 'button', variant, ...props}: ButtonProps) {
  return <button type={type} className={buttonClasses(variant)} {...props} />
}
