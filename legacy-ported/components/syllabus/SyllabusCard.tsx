import Link from '@/components/Link'
import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import { useToggle } from '@/hooks/useToggle'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { Card, CardCopy } from 'nsw-ds-react'
import { useEffect, useRef } from 'react'
import type { UrlLink } from '../../utilities/frontendTypes'
import CustomModal from '../base/CustomModal'

export type SyllabusCardColor = 'primary' | 'secondary'

export interface SyllabusCardProps {
	/**
	 * Headline text of the card.
	 */
	headline: string

	/**
	 * Main text of the card
	 */
	body?: string

	/**
	 * The Url to link to when the card is clicked
	 */
	url: UrlLink

	/**
	 * Marks the card with a coloured top border
	 */
	highlight?: boolean

	className?: string

	// Kontent SmartLink
	kontentId?: string

	enablePopupOnExternalLink?: boolean
}

/**
 * A clickable Card that displays a single syllabus item
 * @param props
 * @constructor
 */
const SyllabusCard = (props: SyllabusCardProps): JSX.Element => {
	const {
		className,
		headline,
		body,
		url,
		kontentId,
		enablePopupOnExternalLink = false,
		highlight = false,
	} = props
	let shouldBeDisabled = false
	const { config } = useKontentHomeConfig()
	const [showExternalLinkPopup, toggleShowExternalLinkPopup] =
		useToggle(false)
	const ref = useRef<HTMLDivElement>()
	useEffect(() => {
		const listenerFn = (ev) => {
			ev.preventDefault()
			toggleShowExternalLinkPopup()
		}
		if (enablePopupOnExternalLink && url.external) {
			const $a = ref?.current?.querySelector('a')
			if (!$a) return () => {}

			$a.addEventListener('click', listenerFn)
			return () => {
				$a.removeEventListener('click', listenerFn)
			}
		}
	}, [enablePopupOnExternalLink, toggleShowExternalLinkPopup, url.external])

	return (
		<div ref={ref} className={clsx(className)}>
			{shouldBeDisabled ? (
				<Card headline={headline} data-kontent-item-id={kontentId}>
					<CardCopy>{!!body && body}</CardCopy>
				</Card>
			) : (
				<Card
					headline={
						<>
							<span className="gap-2">
								{headline}
								{url.external && (
									<Icon
										icon="fa-solid:external-link-alt"
										className="-mt-1 ml-2 align-middle"
										width="1em"
										height="1em"
									/>
								)}
							</span>
						</>
					}
					link={url.url}
					linkComponent={url.external ? 'a' : Link}
					highlight={highlight}
					{...(url.external
						? {
								href: url.url,
								target: '_blank',
								linkTarget: '_blank',
						  }
						: { href: url.url })}
				>
					<CardCopy>
						{body && (
							<SanitisedHTMLContainer>
								{body}
							</SanitisedHTMLContainer>
						)}
					</CardCopy>
				</Card>
			)}
			{enablePopupOnExternalLink && (
				<CustomModal
					title="You are now leaving the NSW Curriculum site"
					modalStatus={showExternalLinkPopup}
					confirmButtonText="Continue"
					handleConfirm={() => {
						window.open(url.url, '_blank').focus()
						toggleShowExternalLinkPopup()
					}}
					handleCancel={toggleShowExternalLinkPopup}
				>
					<p>
						{config.item.elements.externallink_popup_message
							.value ||
							'Click continue to view the current version of this syllabus on the NSW Education Standards Authority website.'}
					</p>
				</CustomModal>
			)}
		</div>
	)
}

export default SyllabusCard
