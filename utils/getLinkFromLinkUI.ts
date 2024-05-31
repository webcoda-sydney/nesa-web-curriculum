import Link, { LinkNoPrefetch } from '@/components/Link'
import { UiMenu, Weblinkext, Weblinkint } from '@/kontent/content-types'
import { Mapping } from '@/types'
import { IContentItem, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { getLinkedItems, getUrlFromMapping, isNavItemExternalUrl } from '.'
import { isWebLinkext } from './type_predicates'

export const getLinkFromLinkUI = (
	navItem: IContentItem,
	mappings: Mapping[],
	linkedItems: IContentItemsContainer,
	preview = false,
) => {
	if (!linkedItems) {
		// console.error('utils/index.ts line 158 - Need to implement getLinkFromLinkUI with linkedItems')
		return {
			url: '',
			target: '',
			rel: undefined,
			linkComponent: 'a',
			isExternal: false,
		}
	}

	const isExternal = isNavItemExternalUrl(navItem)
	if (isExternal) {
		const _navItem = navItem as Weblinkext
		return {
			url: _navItem.elements.link_url.value || '',
			target: isExternal ? '_blank' : undefined,
			rel: isExternal ? 'nofollow noopener' : undefined,
			linkComponent: isExternal ? 'a' : Link,
			isExternal,
		}
	}

	let _navItemCodename = navItem?.system.codename
	if (navItem?.system.type === 'ui_menu') {
		const _navItem = navItem as UiMenu
		const _navItemItem = getLinkedItems(
			_navItem.elements.item,
			linkedItems,
		)?.[0]
		_navItemCodename = _navItemItem?.system.codename

		if (_navItemItem && isWebLinkext(_navItemItem)) {
			return {
				url: _navItemItem.elements.link_url.value || '',
				target: '_blank',
				rel: 'nofollow noopener',
				linkComponent: 'a',
				isExternal: true,
			}
		}
	} else if (navItem?.system.type === 'weblinkint') {
		const _navItem = navItem as Weblinkint
		_navItemCodename = getLinkedItems(
			_navItem.elements.item,
			linkedItems,
		)?.[0]?.system?.codename
	}

	const internalLink = preview ? LinkNoPrefetch : Link

	return {
		url: getUrlFromMapping(mappings, _navItemCodename) || '',
		target: isExternal ? '_blank' : undefined,
		rel: isExternal ? 'nofollow noopener' : undefined,
		linkComponent: isExternal ? 'a' : internalLink,
		isExternal,
	}
}
