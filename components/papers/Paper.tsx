import MuiPaper, {
	PaperProps as MuiPaperProps,
} from '@mui/material/Paper/Paper'
import clsx from 'clsx'
import { ReactNode } from 'react'
import Icon from '../Icon'

export interface PaperProps extends Omit<MuiPaperProps, 'title'> {
	pretitle?: string
	title?: ReactNode
	slotBefore?: ReactNode
}

export const Paper = ({
	className,
	slotBefore,
	children,
	title,
	pretitle,
	...props
}: PaperProps) => {
	const { onClick } = props
	return (
		<MuiPaper
			{...props}
			elevation={0}
			variant="outlined"
			className={clsx('p-8', className)}
		>
			{slotBefore}
			{!!pretitle && pretitle && (
				<small className="text-subtext inline-block mb-2">
					{pretitle}
				</small>
			)}
			{!!title && (
				<div className="bold mb-2">
					{title}{' '}
					{onClick && <Icon icon="ic:baseline-chevron-right" />}
				</div>
			)}

			{children}
		</MuiPaper>
	)
}
