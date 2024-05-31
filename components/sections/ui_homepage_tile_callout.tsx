import type { RichtextSectionProps } from '@/components/sections'
import type { UiHomepageTileCallout } from '@/kontent/content-types/ui_homepage_tile_callout'
import type { UiMenu } from '@/kontent/content-types/ui_menu'
import SectionCard from '@/legacy-ported/components/base/SectionCard'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import { ModuleSectionWrapper } from '../ModuleSectionWrapper'

export const HomepageTileCallout = (
	props: RichtextSectionProps<UiHomepageTileCallout>,
) => {
	const { linkedItem, mappings } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	const mainTile = getLinkedItems(
		linkedItem.elements.tiles,
		pageResponseLinkedItems,
	)[0] as UiMenu

	if (!mainTile) return

	const tiles = getLinkedItems(
		mainTile.elements.subitems,
		pageResponseLinkedItems,
	) as UiMenu[]

	return (
		<ModuleSectionWrapper
			css={{
				backgroundColor: linkedItem.elements.background_color.value,
			}}
			className="ui_homepage_tile_callout"
			data-kontent-item-id={linkedItem.system.id}
		>
			<SectionCard
				backgroundColor={linkedItem.elements.background_color.value}
				dividerColor={linkedItem.elements.divider_color.value}
				fontColor={linkedItem.elements.font_color.value}
				numberOfColumns={linkedItem.elements.tiles.value.length}
				title={mainTile.elements.title.value}
				arrowColor={linkedItem.elements.arrow_color.value}
				tiles={tiles}
				mappings={mappings}
			/>
		</ModuleSectionWrapper>
	)
}

export default HomepageTileCallout
