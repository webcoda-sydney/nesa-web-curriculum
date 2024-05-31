import { contentTypes } from '@/kontent/project/contentTypes'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { cleanJson } from './cleanJson'

export const getOnlyNecessaryLinkedItems = (
	linkedItems: IContentItemsContainer,
	depth = 6,
) => {
	const neccessaryTypes = [
		'ui_',
		'collection_',
		contentTypes.teachingadvice.codename, //for link
		contentTypes.focusarea.codename, //for teaching advice link
		contentTypes.contentblock.codename,
		contentTypes.contentrichtext.codename,
		contentTypes.weblinkext.codename,
		contentTypes.weblinkint.codename,
		contentTypes.web_link_syllabus.codename,
		contentTypes.outcome.codename,
		contentTypes.outcome.elements.relatedlifeskillsoutcomes.codename,
		'modular_data',
	]

	const regexRequiredLinkedItems = new RegExp(
		`^(${neccessaryTypes.join('|')})`,
	)

	return Object.entries(linkedItems)
		.filter(([_, data]) => regexRequiredLinkedItems.test(data.system.type))
		.reduce((acc, [key, data]) => {
			return {
				...acc,
				[key]: cleanJson(data, depth), //deepest found in homepage (for the links in HomepageTileCallout)
			}
		}, {})
}
