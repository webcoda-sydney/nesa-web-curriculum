import { RESOURCE_TYPE_OPTIONS } from '@/components/SyllabusTeachingLearningSupport'
import { TaxoResourceType } from '@/kontent/taxonomies'
import { mapTreeElementToTreeNode } from '@/layouts/wp_dc_recentchanges'
import { useMemo } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'

export const useResourceTypeTreeNodeProps = ({
	selectedResourceTypes,
	excludeResourceTypes = [],
}: {
	selectedResourceTypes: TaxoResourceType[]
	excludeResourceTypes?: TaxoResourceType[]
}) =>
	useMemo<TreeNodeProps[]>(() => {
		return [
			...RESOURCE_TYPE_OPTIONS.map<TreeNodeProps>((option) => {
				const treeElement = {
					id: option.value,
					label: option.text,
					children: [],
				}
				return mapTreeElementToTreeNode(
					treeElement,
					selectedResourceTypes,
				)
			}).filter((option) => {
				return !excludeResourceTypes.includes(
					option.value as TaxoResourceType,
				)
			}),
		]
	}, [excludeResourceTypes, selectedResourceTypes])
