import type {ComponentProps} from 'react'

const BUTTON_CLASSES =
  'rounded bg-brand px-4 py-1 text-brand-foreground enabled:hover:bg-brand/85 motion-safe:transition-[background-color,border-color] disabled:cursor-not-allowed disabled:opacity-50'

type ButtonProps = Omit<ComponentProps<'button'>, 'className'>

export function Button({type = 'button', ...props}: ButtonProps) {
  return <button type={type} className={BUTTON_CLASSES} {...props} />
}
