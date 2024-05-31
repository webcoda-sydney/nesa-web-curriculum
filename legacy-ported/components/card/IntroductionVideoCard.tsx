import { styleCardTagListOnHover } from '@/components/cards/CardAsset'
import NextMuiLink from '@/components/ui/NextMuiLink'
import { Card, CardCopy } from 'nsw-ds-react'
import { ReactNode, useEffect, useId } from 'react'
import { formatDate } from '../../utilities/functions'

export interface IntroductionVideoCardProps {
	thumbnail?: string
	video?: string
	label: string
	date: Date
	title: string
	description?: ReactNode
	transcriptFile: string
	onCardClick?: (_video: string, _label: string) => void
}

const IntroductionVideoCard = (
	props: IntroductionVideoCardProps,
): JSX.Element => {
	const {
		thumbnail,
		video,
		label,
		date,
		title,
		description,
		onCardClick,
		transcriptFile,
	} = props

	const id = useId()

	useEffect(() => {
		const listenerFn = () => {
			onCardClick(video, label)
		}

		const $card = document.querySelector(`[data-id="${id}"]`)
		if (!$card) return
		const $cardImg = $card.querySelector('.nsw-card__image')

		$cardImg?.addEventListener('click', listenerFn)

		return () => {
			$cardImg?.removeEventListener('click', listenerFn)
		}
	}, [id, label, onCardClick, video])

	return (
		<Card
			data-id={id}
			tag={label}
			headline={title}
			date={formatDate(date)}
			image={thumbnail}
			imageAlt={`Thumbnail for ${label} video`}
			css={[
				styleCardTagListOnHover,
				{
					'.nsw-card__title': {
						fontSize: 'var(--nsw-font-size-sm-desktop)',
						lineHeight: 'var(--nsw-line-height-sm-desktop)',
					},
					'.nsw-card__copy': {
						marginTop: '.75rem',
						fontSize: 'var(--nsw-font-size-xs-desktop)',
						lineHeight: 'var(--nsw-line-height-xs-desktop)',
					},
					'.nsw-card__date': {
						display: 'none',
					},
					'.nsw-card__image': {
						cursor: 'pointer',
						paddingBottom: '56.25%',
						position: 'relative',
						width: '100%',
						height: 0,

						'& > img': {
							position: 'absolute',
							width: '100%',
							height: '100%',
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
						},
					},
					'.nsw-card__content': {
						padding: '1rem',
						border: 0,
						background: 'var(--nsw-off-white)',
					},
					'&&:hover': {
						color: 'var(--nsw-text-dark)',
					},
					'&&:hover .nsw-card__content': {
						color: 'inherit',
						background: 'var(--nsw-off-white)',
					},
					'.nsw-card__icon': {
						display: 'none',
					},
				},
			]}
		>
			{description && <CardCopy>{description}</CardCopy>}
			<div className="mt-3">
				{transcriptFile && (
					<NextMuiLink
						href={transcriptFile}
						className="no-icon text-inherit"
						css={{
							'&&&': {
								color: 'var(--nsw-brand-dark)',
								fontSize: 'var(--nsw-font-size-xs-desktop)',
								lineHeight: 'var(--nsw-line-height-xs-desktop)',
							},
						}}
					>
						Download transcript
					</NextMuiLink>
				)}
			</div>
		</Card>
	)
}

export default IntroductionVideoCard
