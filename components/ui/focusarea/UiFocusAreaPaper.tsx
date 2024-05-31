import Icon from '@/components/Icon'
import { IPropWithClassNameChildren } from '@/types'
import Paper, { PaperProps } from '@mui/material/Paper'
import clsx from 'clsx'
import { ReactNode } from 'react'

export interface UiFocusAreaPaperProps extends IPropWithClassNameChildren {
	title?: ReactNode
	pretitle?: ReactNode
	variant?: 'default' | 'brand-dark' | 'brand-light' | 'white'
	paperProps?: PaperProps
}

const UiFocusAreaPaper = ({
	className,
	children,
	title,
	pretitle,
	variant = 'default',
	paperProps,
}: UiFocusAreaPaperProps) => {
	return (
		<Paper
			variant="outlined"
			{...paperProps}
			className={clsx(
				'p-8',
				className,
				variant === 'default' && 'bg-nsw-off-white',
				variant === 'white' && 'bg-white',
				variant === 'brand-light' &&
					'bg-nsw-brand-light border-nsw-brand-light',
				variant === 'brand-dark' &&
					'text-white bg-nsw-brand-dark border-nsw-brand-dark',
			)}
		>
			{!!pretitle && <div className="text-subtext mb-3">{pretitle}</div>}
			{!!title && (
				<div className="flex gap-3 nsw-h4 mb-3">
					<div className="flex-1">{title}</div>

					<Icon
						icon="ic:chevron-right"
						width={30}
						height={30}
						className="flex-shrink-0"
					/>
				</div>
			)}
			{children}
		</Paper>
	)
}

export default UiFocusAreaPaper
