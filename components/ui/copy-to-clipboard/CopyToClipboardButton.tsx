import { IPropWithClassNameChildren } from '@/types'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip/Tooltip'
import clsx from 'clsx'
import { Button } from 'nsw-ds-react'
import { ButtonProps } from 'nsw-ds-react/dist/component/button/button'
import { ReactElement, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export interface CopyToClipboardButtonProps extends IPropWithClassNameChildren {
	textToCopy: string
	successMessage?: string
	defaultMessage?: string
	buttonStyle?: ButtonProps['style']
	leaveDelay?: TooltipProps['leaveDelay']
	renderButton?: (_onMouseOut: () => void) => ReactElement<any, any>
	onCopy?: () => void
}

export const CopyToClipboardButton = (props: CopyToClipboardButtonProps) => {
	const {
		className,
		buttonStyle = 'white',
		textToCopy,
		defaultMessage = '',
		successMessage = 'Copied!',
		children,
		leaveDelay = 5000,
		renderButton,
		onCopy,
	} = props
	const [currentSuccessMessage, setCurrentSuccessMessage] =
		useState(defaultMessage)

	const onMouseOut = () => {
		setTimeout(() => {
			setCurrentSuccessMessage(defaultMessage)
		}, leaveDelay)
	}

	const handleCopy = () => {
		setCurrentSuccessMessage(successMessage)
		if (onCopy) {
			onCopy()
		}
	}

	return (
		<CopyToClipboard text={textToCopy} onCopy={handleCopy}>
			<Tooltip
				title={currentSuccessMessage}
				arrow
				leaveDelay={
					currentSuccessMessage === successMessage ? leaveDelay : 0
				}
			>
				{renderButton ? (
					renderButton(onMouseOut)
				) : (
					<Button
						style={buttonStyle}
						className={clsx('inline-flex gap-2 w-auto', className)}
						onMouseOut={onMouseOut}
					>
						{children}
					</Button>
				)}
			</Tooltip>
		</CopyToClipboard>
	)
}
