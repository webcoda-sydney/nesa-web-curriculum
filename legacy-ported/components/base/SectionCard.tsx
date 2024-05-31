import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import type { UiMenu } from '@/kontent/content-types/ui_menu'
import type { Mapping } from '@/types'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { Card, CardCopy } from 'nsw-ds-react'
export interface SectionCardProps {
	/**
	 * Card's title
	 */

	title: string
	/**
	 * Card's subtitle
	 */
	subtitle?: string

	/**
	 * Card's background colour
	 */
	backgroundColor: string

	/**
	 * Divider bar colour, it shows between the titles and pages links
	 */
	dividerColor: string

	/**
	 * Card's font colour
	 */
	fontColor: string

	/**
	 * Arrow's font colour
	 */
	arrowColor?: string

	/**
	 * Based on the design, this field allows you to define the number of Columns
	 * to display the items in large screens only
	 */
	numberOfColumns: number

	/**
	 * Array of section pages
	 */
	tiles: UiMenu[]

	mappings: Mapping[]
}

export default function SectionCard(props: SectionCardProps) {
	const { title, subtitle, fontColor, tiles, mappings } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	return (
		<div css={{ color: fontColor }}>
			<h2 className="nsw-section-title">{title}</h2>
			<div className="section-card__titles">
				{subtitle && <p>{subtitle}</p>}
			</div>
			<GridWrapper>
				{tiles.map((tile) => {
					const tileSubtitle = tile.elements.subtitle.value
					const navigationItem = getLinkedItems(
						tile.elements.item,
						pageResponseLinkedItems,
					)?.[0]
					const {
						url = '/',
						target,
						linkComponent,
					} = getLinkFromLinkUI(
						navigationItem,
						mappings,
						pageResponseLinkedItems,
					)

					return (
						<GridCol
							lg={Math.max(12 / tiles.length, 4)}
							key={tile.system.id}
						>
							<Card
								headline={tile.elements.title.value}
								link={url}
								linkTarget={target}
								linkComponent={linkComponent}
							>
								{tileSubtitle && (
									<CardCopy>{tileSubtitle}</CardCopy>
								)}
							</Card>
						</GridCol>
					)
				})}
			</GridWrapper>
		</div>
	)
}
