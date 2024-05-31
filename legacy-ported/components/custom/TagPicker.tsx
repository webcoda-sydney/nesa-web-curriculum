import { AllTags, NullTag } from '@/legacy-ported/store/mock/tags'
import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../base/SearchBar'
import TreePicker, { TreePickerProps } from './TreePicker'
import { TreeElement, filterTree } from './treeUtils'

export interface Tag extends TreeElement {
	shortName?: string
}

const buildTreeNodes = (
	existingNodes: TreeElement[],
	leafId: string,
	partialId: string,
	layers: string[],
): TreeElement[] => {
	const layerLabel = layers[0]
	if (layers.length === 1) {
		existingNodes.push({
			id: leafId,
			label: layerLabel,
			ancestorLabels: partialId,
		})
	} else {
		const layerId = [partialId, layerLabel].join('|')

		let layerNode = existingNodes.find((n) => n.id === layerId)
		if (!layerNode) {
			layerNode = {
				id: layerId,
				ancestorLabels: layerId,
				label: layerLabel,
				children: [],
			}
			existingNodes.push(layerNode)
		}

		layerNode.children = buildTreeNodes(
			layerNode.children!,
			leafId,
			layerId,
			layers.slice(1),
		)
	}

	return existingNodes
}

export const TagTree: TreeElement[] = AllTags.reduce<TreeElement[]>(
	(acc, tag) =>
		buildTreeNodes(
			acc,
			tag.code,
			'',
			[
				tag.category,
				tag.sub_category,
				tag.sub_sub_category,
				tag.tag,
			].filter((s) => s !== NullTag),
		),
	[],
)

export type FixedTreePickerProps = Omit<TreePickerProps, 'rootElements'> & {
	initialSearchText?: string
	onSearch?: (_text) => void
}

const TagPicker = ({
	initialSearchText = '',
	onSearch,
	...props
}: FixedTreePickerProps): JSX.Element => {
	const [tagFilter, setTagFilter] = useState(initialSearchText)

	const handleSearch = (text: string) => {
		setTagFilter(text)
		if (onSearch) {
			onSearch(text)
		}
	}

	const filteredTags = useMemo<TreeElement[]>(() => {
		if (tagFilter) {
			return TagTree.flatMap((root) => {
				return (
					filterTree(
						root,
						(e) =>
							e.label
								.toLowerCase()
								.includes(tagFilter.toLowerCase()) ||
							e.ancestorLabels
								?.toLowerCase()
								?.includes(tagFilter.toLowerCase()),
					) ?? []
				)
			})
		}
		return TagTree
	}, [tagFilter])

	useEffect(() => {
		setTagFilter(initialSearchText)
	}, [initialSearchText])

	return (
		<>
			<SearchBar
				initialSearchText={tagFilter}
				onSearch={handleSearch}
				className="mb-4"
				variant="with-icon"
				disableResetSearchText
			/>
			<TreePicker {...props} rootElements={filteredTags} />
		</>
	)
}

export default TagPicker
