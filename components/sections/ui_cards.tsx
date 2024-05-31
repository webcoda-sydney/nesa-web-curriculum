import type { RichtextSectionProps } from '@/components/sections'
import type { Contentblock } from '@/kontent/content-types/contentblock'

import Image from '@/components/Image'
import NewsletterSubscribeBox from '@/components/sections/NewsletterSubscribeBox'
import { EMPTY_KONTENT_RICHTEXT } from '@/constants'
import type { UiCardNewsletterSubscription } from '@/kontent/content-types/ui_card_newsletter_subscription'
import type { UiCards } from '@/kontent/content-types/ui_cards'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { Card, CardCopy } from 'nsw-ds-react'
import type { CardProps } from 'nsw-ds-react/dist/component/card/card'
import Icon from '../Icon'
import { ModuleSectionWrapper } from '../ModuleSectionWrapper'
import SanitisedHTMLContainer from '../SanitisedHTMLContainer'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import { GridCol } from '../nsw/grid/GridCol'
import { GridWrapper } from '../nsw/grid/GridWrapper'

export type UiCardsDisplayOptions =
	| 'headline_only'
	| 'headline_and_copy'
	| 'image'
	| 'image_horizontal'

export type UiCardsThemeOptions =
	| 'white'
	| 'brand_light'
	| 'brand_dark'
	| 'highlight'

export const getCardStyleBasedOnUiCardsThemeOption = (
	theme: UiCardsThemeOptions | undefined,
): CardProps['style'] => {
	if (!theme) return 'white'

	switch (theme) {
		case 'brand_light':
		case 'brand_dark':
			return theme.replace('brand_', '')
		case 'white':
			return theme
	}
}

export default function UiCardsComponent(props: RichtextSectionProps<UiCards>) {
	const { linkedItem, mappings } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	const title = linkedItem.elements.title.value
	const theme = (linkedItem.elements.theme.value?.[0]?.codename ||
		'white') as UiCardsThemeOptions
	// const display = linkedItem.elements.display.value?.[0]?.codename as
	// 	| UiCardsDisplayOptions
	// 	| undefined

	const items = getLinkedItems(
		linkedItem.elements.items,
		pageResponseLinkedItems,
	)

	const renderTile = (item: Contentblock | UiCardNewsletterSubscription) => {
		if (item.system.type === 'contentblock') {
			const _item = item as Contentblock

			const navItem = getLinkedItems(
				_item.elements.more_info_link,
				pageResponseLinkedItems,
			)[0]

			const { url, target, linkComponent, isExternal } =
				getLinkFromLinkUI(navItem, mappings, pageResponseLinkedItems)

			return (
				<Card
					headline={
						<span className="gap-2">
							{_item.elements.title.value}
							{isExternal && (
								<Icon
									icon="fa-solid:external-link-alt"
									className="-mt-1 ml-2 align-middle"
									width="1em"
									height="1em"
								/>
							)}
						</span>
					}
					image={
						<Image
							asset={_item.elements.image.value?.[0]}
							objectFit="cover"
							alt={_item.elements.image.value?.[0]?.description}
						/>
					}
					link={url}
					linkComponent={linkComponent}
					linkTarget={target}
					data-kontent-item-id={item.system.id}
					style={getCardStyleBasedOnUiCardsThemeOption(theme)}
					highlight={theme === 'highlight'}
				>
					{_item.elements.content.value !==
						EMPTY_KONTENT_RICHTEXT && (
						<CardCopy>
							<SanitisedHTMLContainer>
								{_item.elements.content.value}
							</SanitisedHTMLContainer>
						</CardCopy>
					)}
				</Card>
			)
		}
		return (
			<NewsletterSubscribeBox
				section={item as UiCardNewsletterSubscription}
				data-kontent-item-id={item.system.id}
			/>
		)
	}

	return (
		<ModuleSectionWrapper>
			{title && <h2 className="nsw-section-title md:mb-4">{title}</h2>}
			<GridWrapper>
				{items.map((item: Contentblock) => {
					return (
						<GridCol
							key={item.system.id}
							md={4}
							lg={Math.max(12 / items.length, 4)}
							data-kontent-item-id={item.system.id}
						>
							{renderTile(item)}
						</GridCol>
					)
				})}
			</GridWrapper>
		</ModuleSectionWrapper>
	)
}
