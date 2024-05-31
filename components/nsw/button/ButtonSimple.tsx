import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'
import { ComponentPropsWithoutRef, ReactNode } from 'react'

export interface ButtonSimpleProps
	extends IPropWithClassNameChildren,
		ComponentPropsWithoutRef<'button'> {
	slotBeforeChildren?: ReactNode
	slotAfterChildren?: ReactNode
}

export const ButtonSimple = ({
	className,
	children,
	slotBeforeChildren,
	slotAfterChildren,
	type = 'button',
	...props
}: ButtonSimpleProps) => {
	return (
		<button
			type={type}
			{...props}
			className={clsx(
				'inline-flex align-middle items-center gap-2 text-base font-bold underline text-nsw-brand-dark',
				className,
			)}
		>
			{slotBeforeChildren}
			<span>{children}</span>
			{slotAfterChildren}
		</button>
	)
}
