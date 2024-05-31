import ClickAwayListener from '@mui/material/ClickAwayListener'
import MuiTooltip, {
	TooltipProps as MuiTooltipProps,
} from '@mui/material/Tooltip'
import { ReactNode, useState } from 'react'
import Icon from '../Icon'

export interface TooltipProps
	extends Omit<MuiTooltipProps, 'title' | 'children'> {
	text?: ReactNode
	icon?: string
	title?: MuiTooltipProps['title']
	children?: MuiTooltipProps['children']
	iconSizeInTooltip?: number
	iconSizeInButton?: number
}

export const tooltipIconColor = {
	color: 'rgba(34, 39, 43, .5)',
}

export const tooltipComponentProps = {
	tooltip: {
		sx: {
			background: 'white',
			border: '1px solid var(--nsw-grey-01)',
			padding: '1rem',
			color: 'var(--nsw-text-dark)',
			fontSize: 'var(--nsw-font-size-xs-desktop)',
			lineHeight: 'var(--nsw-line-height-xs-desktop)',
		},
	},
}

export const Tooltip = ({
	text,
	icon = 'ic:outline-info',
	iconSizeInTooltip = 16,
	iconSizeInButton = iconSizeInTooltip,
	...props
}: TooltipProps) => {
	const [open, setOpen] = useState(false)

	const handleTooltipClose = () => {
		setOpen(false)
	}

	const handleTooltipOpen = () => {
		setOpen(true)
	}
	return (
		<ClickAwayListener onClickAway={handleTooltipClose}>
			<MuiTooltip
				disableTouchListener
				open={open}
				componentsProps={tooltipComponentProps}
				onClose={handleTooltipClose}
				onOpen={handleTooltipOpen}
				title={
					<div className="flex gap-3 Tooltip__title">
						<Icon
							width={iconSizeInTooltip}
							height={iconSizeInTooltip}
							icon={icon}
							className="flex-shrink-0 Tooltip__title-icon"
							css={tooltipIconColor}
						/>
						{!!text && (
							<div className="bold flex-1 Tooltip__title-text">
								{text}
							</div>
						)}
					</div>
				}
				{...props}
			>
				<button
					type="button"
					aria-label="Show tooltip"
					css={tooltipIconColor}
					onClick={handleTooltipOpen}
				>
					<Icon
						width={iconSizeInButton}
						height={iconSizeInButton}
						icon={icon}
					/>
				</button>
			</MuiTooltip>
		</ClickAwayListener>
	)
}
