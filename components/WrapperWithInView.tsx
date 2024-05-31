import { IPropWithClassName } from '@/types'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { IntersectionOptions, useInView } from 'react-intersection-observer'

interface WrapperWithInViewProps extends IPropWithClassName {
	children: (_inView: boolean, _endInView?: boolean) => ReactNode
	inViewOptions?: IntersectionOptions
	/**
	 * @description if true, inView will be false only when scroll to bottom, not up
	 * @default true
	 */
	isWhenScrollBottomOnly?: boolean
}

export const WrapperWithInView = ({
	children,
	inViewOptions,
	className,
	isWhenScrollBottomOnly = true,
}: WrapperWithInViewProps) => {
	const { ref, inView, entry } = useInView(inViewOptions)
	let _inView = inView

	if (isWhenScrollBottomOnly && entry?.boundingClientRect && !inView) {
		_inView = entry.boundingClientRect.y > 0
	}

	return (
		<>
			<div
				className={clsx('WrapperWithInView-trigger', className)}
				ref={ref}
			/>
			{children(_inView)}
		</>
	)
}
