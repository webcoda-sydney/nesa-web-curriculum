import { IPropWithClassNameChildren } from '@/types'
import { TOverarchingLinkProps } from '@/utils/getLinksFromOverarchingLinks'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { ContentOverarchingLinks } from './ContentOverarchingLinks'

export interface ContentOverarchingLinksProps
	extends IPropWithClassNameChildren {
	links: TOverarchingLinkProps[]
	pretitle?: ReactNode
}

export const ContentCurriculumConnectionLinks = ({
	className,
	links,
	pretitle = 'Related',
}: ContentOverarchingLinksProps) => {
	if (!links || (links && links.length === 0)) return null

	return (
		<ContentOverarchingLinks
			className={clsx(
				// prettier-ignore
				// eslint-disable-next-line quotes
				`[&]:block LinksPlaceholderCc`,
				className,
			)}
			css={{
				'& .ContentOverarchingLinks__item': {
					display: 'block',
					border: 'none',
				},
				'& .ContentOverarchingLinks__pretitle': {
					fontWeight: 'normal',
				},
			}}
			pretitle={pretitle}
			links={links}
		></ContentOverarchingLinks>
	)
}
