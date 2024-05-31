import { useOrigin } from '@/hooks/useOrigin'
import clsx from 'clsx'
import { IconLink } from '../../ace/subgroup/AccordionRule'
import {
	CopyToClipboardButton,
	CopyToClipboardButtonProps,
} from './CopyToClipboardButton'

export type CommonCopyToUrlButtonProps = Omit<
	CopyToClipboardButtonProps,
	'textToCopy'
> & {
	/** url without origin */
	url: string

	/** if true, the url copied is `url` passed to the component, otherwise origin + url */
	excludeOrigin?: boolean
}

export const CommonCopyToUrlButton = ({
	url,
	defaultMessage = 'Copy link',
	leaveDelay = 2000,
	className,
	excludeOrigin = false,
	onCopy,
}: CommonCopyToUrlButtonProps) => {
	const origin = useOrigin()
	return (
		<CopyToClipboardButton
			textToCopy={excludeOrigin ? url : origin + url}
			defaultMessage={defaultMessage}
			leaveDelay={leaveDelay}
			onCopy={onCopy}
			renderButton={(onMouseOut) => {
				return (
					<button
						type="button"
						className={clsx(
							'!text-inherit no-underline inline-block w-12 h-12 CopyToClipboardButtonButton',
							className,
						)}
						onMouseOut={() => {
							onMouseOut()
						}}
						css={{
							['@media(hover: hover) and (pointer: fine)']: {
								opacity: 0,
								'.group:hover &, .group.active &': {
									opacity: 1,
								},
							},
						}}
					>
						<IconLink />
					</button>
				)
			}}
		></CopyToClipboardButton>
	)
}
