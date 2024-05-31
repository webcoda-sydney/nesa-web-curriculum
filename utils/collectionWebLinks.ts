import type { CollectionWeblink } from '@/kontent/content-types'
import { getLinkedItems } from '@/utils'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'

export function flattenCollectionWebLinks(
	links: CollectionWeblink[],
	linkedItems: IContentItemsContainer,
) {
	return links.flatMap((link) =>
		getLinkedItems(link.elements.items, linkedItems),
	)
}
