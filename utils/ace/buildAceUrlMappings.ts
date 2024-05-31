import { AceGroup } from '@/kontent/content-types'
import { Mapping } from '@/types'
import { Responses } from '@kontent-ai/delivery-sdk'
import slugify from 'slugify'
import { getLinkedItems } from '..'
import { optimiseSystemJson } from '../optimise-json'

export function buildAceUrlMappings(
	aceGroupsForMapping: Responses.IListContentItemsResponse<AceGroup>,
): Mapping[] {
	const aceMappings: Mapping[] = []

	aceGroupsForMapping.items.forEach((aceGroup) => {
		const { title, subgroups } = aceGroup.elements
		const _subgroups = getLinkedItems(
			subgroups,
			aceGroupsForMapping.linkedItems,
		)
		const groupSlug = slugify(
			aceGroup.system.codename.replace(/_/g, '-') || '',
		)

		aceMappings.push({
			params: {
				pageTitle: title.value,
				slug: [
					'ace-rules',
					slugify(aceGroup.system.codename.replace(/_/g, '-') || ''),
				].filter((item) => !!item),
				navigationItem: optimiseSystemJson(aceGroup.system),
				excludeInSitemap: false,
				isCanonical: true,
			},
		})

		_subgroups.forEach((subgroup) => {
			const rules = getLinkedItems(
				subgroup.elements.rules,
				aceGroupsForMapping.linkedItems,
			)
			const subGroupSlug = slugify(
				subgroup.system.codename.replace(/_/g, '-') || '',
			)

			aceMappings.push({
				params: {
					pageTitle: subgroup.elements.title.value,
					slug: ['ace-rules', groupSlug, subGroupSlug].filter(
						(item) => !!item,
					),
					navigationItem: optimiseSystemJson(subgroup.system),
					excludeInSitemap: false,
					isCanonical: true,
				},
			})

			rules.forEach((rule) => {
				const ruleContentItems = getLinkedItems(
					rule.elements.items,
					aceGroupsForMapping.linkedItems,
				)
				const ruleCodename = rule.system.codename

				aceMappings.push({
					params: {
						pageTitle: subgroup.elements.title.value,
						slug: [
							'ace-rules',
							groupSlug,
							subGroupSlug + `#acerule=${ruleCodename}`,
						].filter((item) => !!item),
						navigationItem: optimiseSystemJson(rule.system),
						excludeInSitemap: true,
						isCanonical: false,
					},
				})

				ruleContentItems.forEach((ruleContentItem, index) => {
					aceMappings.push({
						params: {
							pageTitle: subgroup.elements.title.value,
							slug: [
								'ace-rules',
								groupSlug,
								subGroupSlug +
									`#acerule=${ruleCodename}&part=content_${index}`,
							].filter((item) => !!item),
							navigationItem: optimiseSystemJson(
								ruleContentItem.system,
							),
							excludeInSitemap: true,
							isCanonical: false,
						},
					})
				})
			})
		})
	})

	return aceMappings
}
