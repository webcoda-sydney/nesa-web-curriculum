import { AceRule, AceSubgroup } from '@/kontent/content-types'
import { Mapping } from '@/types'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { ACE_RULE_HASH_PREFIX, getSubgroupUrl } from '.'

export const getRuleUrl = (
	rule: AceRule,
	subgroups: AceSubgroup[],
	linkedItems: IContentItemsContainer,
	mappings: Mapping[],
) => {
	const subgroupUrl = getSubgroupUrl(rule, subgroups, linkedItems, mappings)

	if (subgroupUrl) {
		return `${subgroupUrl}${ACE_RULE_HASH_PREFIX}${rule.system.codename}`
	}
}
