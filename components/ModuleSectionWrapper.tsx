import clsx from 'clsx'
import type { ReactNode } from 'react'

export type ModuleSectionWrapperProps = {
	className?: string
	children?: ReactNode
}
export const ModuleSectionWrapper = (props: ModuleSectionWrapperProps) => {
	const { className, children, ...attrs } = props
	return (
		<section {...attrs} className={clsx('module nsw-section', className)}>
			<div className="nsw-container">{children}</div>
		</section>
	)
}
