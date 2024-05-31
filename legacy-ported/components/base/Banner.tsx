import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import { HeroBanner } from 'nsw-ds-react'
import type { HeroBannerProps } from 'nsw-ds-react/dist/component/hero-banner/heroBanner'
import { MouseEvent } from 'react'

export interface IBannerProps {
	title: string
	description?: string
	buttonLabel: string
	buttonUrl: string
	className?: string
	image?: HeroBannerProps['image']
	// eslint-disable-next-line no-unused-vars
	onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

export default function Banner(props: IBannerProps) {
	const {
		buttonLabel,
		buttonUrl,
		title,
		description,
		className,
		image,
		onClick,
		...attrs
	} = props

	return (
		<HeroBanner
			{...attrs}
			className={className}
			cta={
				buttonUrl && buttonLabel
					? {
							text: buttonLabel,
							url: buttonUrl,
							onClick,
					  }
					: undefined
			}
			image={image}
			title={title}
			intro={
				<SanitisedHTMLContainer>{description}</SanitisedHTMLContainer>
			}
			style="dark"
		/>
	)
}
