import { Icon } from '@iconify/react'
import { Card } from 'nsw-ds-react'
import type { ReactNode } from 'react'

export interface LinkCardProps {
	headline: ReactNode
	link: string
	linkTarget?: string
	className?: string
}

const LinkCard = (props: LinkCardProps): JSX.Element => {
	const { headline, link, linkTarget, className = '' } = props

	const isExternal = linkTarget === '_blank'

	return (
		<Card
			headline={
				<>
					<span
						style={{
							verticalAlign: 'middle',
							marginRight: isExternal ? 8 : 0,
						}}
					>
						{headline}
					</span>
					{isExternal ? (
						<Icon
							style={{ verticalAlign: 'middle' }}
							icon="fa-solid:external-link-alt"
						/>
					) : null}
				</>
			}
			highlight
			link={link}
			linkTarget={linkTarget}
			className={className}
		/>
	)
}

export default LinkCard
