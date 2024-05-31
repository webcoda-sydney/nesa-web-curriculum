import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Fade from '@mui/material/Fade'
import { Button } from 'nsw-ds-react'
import React, { MouseEvent, ReactNode } from 'react'

const Transition = React.forwardRef(
	(
		props: { children: React.ReactElement<any, any> },
		ref: React.Ref<unknown>,
	) => <Fade ref={ref} {...props} />,
)

export interface CustomModalProps {
	/*
	 * Modal title
	 * */
	title: string

	slotAfterTitle?: ReactNode

	/*
	 * Modal position at the moment can be LEFT,
	 * otherwise it will be centered as default
	 * */
	modalPosition?: string
	/*
	 * Show/Hide modal flag variable
	 * */
	modalStatus: boolean
	/*
	 * Any react component to be displayed in the modal body
	 * */
	children: ReactNode
	/*
	 * Flag to hide/show cancel button
	 * */
	hideCancelButton?: boolean
	/*
	 * Flag to hide/show confirm button
	 * */
	hideConfirmButton?: boolean
	/*
	 * Function to be used on the Cancel button
	 * */
	handleCancel?: (_event: MouseEvent<HTMLButtonElement>) => void
	/*
	 * Function to be used on the Confirm button
	 * */
	handleConfirm?: (_event: MouseEvent<HTMLButtonElement>) => void

	/**
	 * Function to be used on the Confirm button
	 */

	confirmButtonText?: ReactNode
	/*
	 * Flag to hide/show Change Log button
	 * */
	showChangeLogButton?: boolean
	/*
	 * Function to be used on the Change log button
	 * */
	handleChangeLog?: (_event: MouseEvent<HTMLButtonElement>) => void
	maxWidth?: DialogProps['maxWidth']

	className?: string

	slotBeforeActions?: ReactNode
	slotActions?: ReactNode

	// if it's false, "Cancel" will happen on close and on clicking Cancel button.
	// if it's true, only when clicking Cancel button
	isExplicitClose?: boolean

	// disable Confirm button
	disableConfirm?: boolean
}

export default function CustomModal(props: CustomModalProps) {
	const {
		className,
		title,
		slotAfterTitle,
		children,
		handleConfirm,
		handleCancel,
		modalStatus,
		hideCancelButton,
		hideConfirmButton,
		maxWidth,
		slotBeforeActions,
		slotActions,
		isExplicitClose,
		confirmButtonText = 'Confirm',
		disableConfirm = false,
	} = props

	return (
		<Dialog
			className={className}
			open={modalStatus}
			keepMounted
			onClose={isExplicitClose ? undefined : handleCancel}
			aria-labelledby={title}
			aria-describedby={title}
			TransitionComponent={Transition}
			maxWidth={maxWidth}
		>
			{!!title && (
				<div className="nsw-h4 p-8 border-b CustomModal__title">
					<span>{title}</span>
					{slotAfterTitle}
				</div>
			)}

			<DialogContent className="p-8">{children}</DialogContent>
			<DialogActions className="border-t p-8">
				<GridWrapper
					spacing={{ xs: 4 }}
					justifyContent={{ xs: 'flex-end' }}
				>
					{slotBeforeActions}
					{!hideCancelButton && (
						<GridCol xs="auto">
							<Button style="dark-outline" onClick={handleCancel}>
								Cancel
							</Button>
						</GridCol>
					)}
					{!hideConfirmButton && (
						<GridCol xs="auto">
							<Button
								style="dark"
								onClick={handleConfirm}
								disabled={disableConfirm}
							>
								{confirmButtonText}
							</Button>
						</GridCol>
					)}
					{slotActions}
				</GridWrapper>
			</DialogActions>
		</Dialog>
	)
}
