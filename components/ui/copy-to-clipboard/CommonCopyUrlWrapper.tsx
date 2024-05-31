import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'
import { HTMLAttributes, ReactNode } from 'react'
import { CommonCopyToUrlButton } from './CommonCopyUrlButton'

export interface CommonCopyUrlWrapperProps
	extends IPropWithClassNameChildren,
		HTMLAttributes<HTMLElement> {
	url: string
	slotAfterButton?: ReactNode
	copyButtonClassName?: string
	excludeOrigin?: boolean
}

export const CommonCopyUrlWrapper = ({
	url,
	children,
	className,
	slotAfterButton,
	copyButtonClassName,
	excludeOrigin,
	...attributes
}: CommonCopyUrlWrapperProps) => {
	return (
		<div {...attributes} className={clsx('group', className)}>
			<span className="align-middle mr-2 [&>*]:inline [&>*]:scroll-mt-4">
				{children}
			</span>
			{url && (
				<span className="align-middle relative">
					<CommonCopyToUrlButton
						url={url}
						className={clsx(
							copyButtonClassName,
							'[&]:w-auto [&]:h-auto',
						)}
						excludeOrigin={excludeOrigin}
						css={{
							['@media(hover: hover) and (pointer: fine)']: {
								position: 'absolute',
								top: '50%',
								transform: 'translateY(-50%)',
							},
						}}
					></CommonCopyToUrlButton>
				</span>
			)}
			{slotAfterButton}
		</div>
	)
}
