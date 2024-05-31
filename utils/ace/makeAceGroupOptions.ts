import { TREE_MULTISELECT_OPTION_ALL_VALUE } from '@/components/tree-multi-select/TreeMultiSelect'
import { AceGroup } from '@/kontent/content-types'
import { TreeElement } from '@/legacy-ported/components/custom/treeUtils'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { getLinkedItems } from '..'
import { sortAceGroupByTitleAndCode } from './sortAceGroupByTitleAndCode'

export const makeAceGroupOptions = (
	aceGroups: AceGroup[],
	linkedItems: IContentItemsContainer,
	includeSelectAll: boolean = false,
): TreeElement[] => {
	const aceGroupOptions: TreeElement[] = sortAceGroupByTitleAndCode(
		aceGroups,
	).map((aceGroup) => {
		const subgroups = getLinkedItems(
			aceGroup.elements.subgroups,
			linkedItems,
		)
		return {
			id: aceGroup.system.codename,
			label: aceGroup.elements.title.value,
			value: aceGroup.system.codename,
			children: subgroups.map((subgroup) => {
				return {
					id: subgroup.system.codename,
					label: subgroup.elements.title.value,
					value: subgroup.system.codename,
				} as TreeElement
			}),
		}
	})

	if (includeSelectAll) {
		return [
			{
				id: TREE_MULTISELECT_OPTION_ALL_VALUE,
				label: 'All ACE Rules',
				value: TREE_MULTISELECT_OPTION_ALL_VALUE,
				children: [],
			} as TreeElement,
			...aceGroupOptions,
		]
	}
	return aceGroupOptions
}
