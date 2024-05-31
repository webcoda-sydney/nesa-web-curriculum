import React, { HTMLProps } from 'react'

export interface ChipProps extends HTMLProps<HTMLDivElement> {
	text: string
}

const Chip = ({ text, className, ...others }: ChipProps): JSX.Element => (
	<div {...others} className={`chip ${className}`}>
		<span>{text}</span>
	</div>
)

export default Chip
