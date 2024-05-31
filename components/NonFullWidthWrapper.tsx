import clsx from 'clsx'
import type { ReactNode } from 'react'
import { GridCol } from './nsw/grid/GridCol'
import { GridWrapper } from './nsw/grid/GridWrapper'

const NonFullWidthWrapper = (props: {
	children?: ReactNode
	slotBefore?: ReactNode
	className?: string
}) => {
	const { children, className, slotBefore } = props
	return (
		<div className={clsx('NonFullWidthWrapper', className)}>
			<GridWrapper>
				{slotBefore}
				<GridCol lg={8}>{children}</GridCol>
			</GridWrapper>
		</div>
	)
}
export default NonFullWidthWrapper
