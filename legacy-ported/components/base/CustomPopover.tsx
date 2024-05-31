import Grid from '@mui/material/Grid'
import Popover, { PopoverProps } from '@mui/material/Popover'
import { Button } from 'nsw-ds-react'
import { MouseEvent, ReactNode } from 'react'

export interface CustomPopoverProps extends Omit<PopoverProps, 'open'> {
	/**
	 * Popover title
	 */
	title?: string
	/**
	 * Show/Hide popover
	 */
	popoverStatus: boolean
	/*
	 * Any react component as popover anchor
	 */
	popoverAnchor?: Element
	/**
	 * Any react component to be displayed in the modal body
	 */
	children: ReactNode
	/**
	 * Function to be used on the Cancel button
	 */
	onCancel?: (_event: MouseEvent<HTMLButtonElement>) => void
	/**
	 * Function to be used on the Confirm button
	 */
	onConfirm: (_event: MouseEvent<HTMLButtonElement>) => void
}

export default function CustomPopover(props: CustomPopoverProps) {
	const {
		title,
		popoverStatus,
		popoverAnchor,
		children,
		onConfirm,
		onCancel,
		...otherProps
	} = props

	return (
		<Popover
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			open={popoverStatus}
			anchorEl={popoverAnchor}
			onClose={onCancel}
			disableRestoreFocus
			{...otherProps}
		>
			{!!title && <div className="nsw-h4 p-8 border-b">{title}</div>}
			<div className="p-8">
				<div className="custom-popover__content">{children}</div>
				<Grid className="custom-popover__actions -mx-8 mt-8 px-8 pt-8 border-t gap-3">
					<Button style="dark-outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={onConfirm}>Done</Button>
				</Grid>
			</div>
		</Popover>
	)
}
