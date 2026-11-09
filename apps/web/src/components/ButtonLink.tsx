import type {ComponentProps} from 'react'
import Link from 'next/link'
import {buttonClasses, type ButtonVariant} from './Button'

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {variant?: ButtonVariant}

export function ButtonLink({variant, ...props}: ButtonLinkProps) {
  return <Link className={buttonClasses(variant)} {...props} />
}
