import { UiAccordion } from '@/kontent/content-types'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import type { RichtextSectionProps } from '.'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'
import RichText from '../RichText'
export default function ui_accordion({
	linkedItem,
	linkedItems,
	mappings,
}: RichtextSectionProps<UiAccordion>) {
	const { items: _items } = linkedItem.elements
	const items = getLinkedItems(_items, linkedItems)

	return items?.length ? (
		<div>
			{items.map((item) => {
				return (
					<CustomAccordion
						key={item.system.id}
						title={item.elements.title.value}
					>
						<RichText
							richTextElement={item.elements.content}
							linkedItems={linkedItems}
							mappings={mappings}
						/>
					</CustomAccordion>
				)
			})}
		</div>
	) : null
}
