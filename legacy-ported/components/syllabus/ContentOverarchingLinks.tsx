import Link from '@/components/Link'
import { IPropWithClassNameChildren } from '@/types'
import { TOverarchingLinkProps } from '@/utils/getLinksFromOverarchingLinks'
import clsx from 'clsx'
import { ReactNode } from 'react'

export interface ContentOverarchingLinksProps
	extends IPropWithClassNameChildren {
	links: TOverarchingLinkProps[]
	pretitle?: ReactNode
}

export const ContentOverarchingLinks = ({
	className,
	links,
	pretitle = 'Related',
}: ContentOverarchingLinksProps) => {
	if (!links || (links && links.length === 0)) return null

	return (
		<div className={clsx('flex gap-4', className)}>
			{pretitle && (
				<span className="bold flex-shrink-0 ContentOverarchingLinks__pretitle">
					{pretitle}
				</span>
			)}
			<div className="ContentOverarchingLinks__items">
				{links.filter(Boolean).map((link, index, _links) => {
					const olItem = link.overarchingLinkItem
					const isHashedLink = !!link.href?.toString().includes('#')

					return (
						<span
							key={olItem.system.codename}
							className={clsx(
								index < _links.length - 1 &&
									'border-r pr-2 mr-2',
								'ContentOverarchingLinks__item',
							)}
						>
							{isHashedLink ? (
								<a href={link.href as string}>
									{olItem.elements.title.value}
								</a>
							) : (
								<Link
									href={link.href}
									shallow={false}
									scroll={true}
								>
									{olItem.elements.title.value}
								</Link>
							)}
						</span>
					)
				})}
			</div>
		</div>
	)
}
