import { AceRule, AceSubgroup } from '@/kontent/content-types'
import { Mapping } from '@/types'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { getLinkFromLinkUI } from '../getLinkFromLinkUI'

export const getSubgroupUrl = (
	rule: AceRule,
	subgroups: AceSubgroup[],
	linkedItems: IContentItemsContainer,
	mappings: Mapping[],
) => {
	if (!subgroups || !subgroups?.length) return
	const ruleSubgroup = subgroups.find((subgroup) =>
		subgroup.elements.rules.value.some((sr) => sr === rule.system.codename),
	)

	if (ruleSubgroup) {
		const { url } = getLinkFromLinkUI(ruleSubgroup, mappings, linkedItems)
		return url
	}
}
