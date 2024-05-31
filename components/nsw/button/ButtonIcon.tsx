import Icon from '@/components/Icon'
import clsx from 'clsx'
import { Button } from 'nsw-ds-react'
import { ButtonProps } from 'nsw-ds-react/dist/component/button/button'
import { ReactNode } from 'react'

export type ButtonIconProps = Omit<ButtonProps, 'children'> & {
	icon: string
	children?: ReactNode
	disabled?: boolean
	iconSize?: number
}

export const ButtonIcon = (props: ButtonIconProps) => {
	const { icon, className, iconSize = 24, ...attrs } = props

	return (
		<Button
			{...(attrs as any)}
			className={clsx('w-12 h-12 !min-w-0 p-0', className)}
		>
			<Icon icon={icon} width={iconSize} height={iconSize} />
		</Button>
	)
}
