import { DEFAULT_NUQS_TRANSITION_OPTIONS } from '@/constants'
import { delay } from '@/utils'
import type { TransitionOptions } from 'next-usequerystate/dist/types/defs'
import { useState } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'

const filterOutRemovedNodeFromCurrentNodes = (
	removedNode: TreeNodeProps,
	currentNodes: TreeNodeProps[],
) => {
	if (!removedNode.path.includes('children')) {
		return currentNodes.filter((s) => {
			return !s.path.startsWith(removedNode.path)
		})
	}
	return currentNodes.filter((s) => s.value !== removedNode.value)
}

function flattenTree(tree: TreeNodeProps[]) {
	let result = []
	for (let node of tree) {
		if (node.children && node.children.length > 0) {
			result = result.concat(flattenTree(node.children))
		} else {
			result.push(node)
		}
	}
	return result
}

interface IUseTreeMultiSelectSelectedParams<TSelectedNodeValue extends string> {
	initialSelectedNodes?: any[]
	initialSelectedChildNodes?: any[]
	additionalFnOnDropdownChange?: (
		_selectedNodes: TreeNodeProps[],
		_selectedChildNodes: TreeNodeProps[],
	) => void
	additionalFnOnRemoveNode?: (_removedNode: TreeNodeProps) => void
	additionalFnOnReset?: () => void
}

export const useTreeMultiSelectSelected = <TSelectedNodeValue extends string>({
	initialSelectedNodes = [],
	initialSelectedChildNodes = [],
	additionalFnOnDropdownChange,
	additionalFnOnRemoveNode,
	additionalFnOnReset,
}: IUseTreeMultiSelectSelectedParams<TSelectedNodeValue> = {}) => {
	/**
	 * This is used for tracking the selected child nodes only from the dropdown
	 */
	const [selectedChildNodes, setSelectedChildNodes] =
		useState<TreeNodeProps[]>(initialSelectedNodes)

	/**
	 * This is used for tracking the selected nodes from the dropdown
	 * (if the children nodes are selected, only the parent node that is tracked)
	 */
	const [selectedNodes, setSelectedNodes] = useState<TreeNodeProps[]>(
		initialSelectedChildNodes,
	)

	const selectedNodesValues = selectedNodes.map(
		(s) => s.value as TSelectedNodeValue,
	)
	const selectedChildNodesValues = selectedChildNodes.map(
		(s) => s.value as TSelectedNodeValue,
	)

	const handleDrodpownChange = (
		_currentNode,
		_selectedNodes,
		_selectedChildNodes,
	) => {
		setSelectedChildNodes(_selectedChildNodes)
		setSelectedNodes(_selectedNodes)
		if (additionalFnOnDropdownChange) {
			additionalFnOnDropdownChange(_selectedNodes, _selectedChildNodes)
		}
	}

	/**
	 * This is used for removing the selected node from tag list
	 */
	const handleRemoveNode = (removedNode: TreeNodeProps) => {
		setSelectedChildNodes((current) =>
			filterOutRemovedNodeFromCurrentNodes(removedNode, current),
		)
		setSelectedNodes((current) =>
			filterOutRemovedNodeFromCurrentNodes(removedNode, current),
		)
		if (additionalFnOnRemoveNode) {
			additionalFnOnRemoveNode(removedNode)
		}
	}

	const handleReset = () => {
		setSelectedChildNodes([])
		setSelectedNodes([])
		if (additionalFnOnReset) {
			additionalFnOnReset()
		}
	}

	return {
		selectedChildNodes,
		selectedNodes,
		selectedNodesValues,
		selectedChildNodesValues,
		handleDrodpownChange,
		handleRemoveNode,
		handleReset,
		setSelectedNodes,
		setSelectedChildNodes,
	}
}

/**
 * Returns an object containing functions that are commonly used in useTreeMultiSelectSelected and next-usequerystate.
 * These functions include additionalFnOnDropdownChange, additionalFnOnRemoveNode, and additionalFnOnReset.
 *
 * @param {Function} setQueryState - A function that updates the query state.
 * @param {boolean} isUseSelectedNodes - A boolean that determines if the selectedNodes or selectedChildNodes will be used in the query state.
 * @returns {Object} An object containing the common additional functions.
 */
export const getCommonAdditionalFunctions = (
	setQueryState: (
		_value: string | ((_old: string) => string),
		_removedNodetransitionOptions?: TransitionOptions,
	) => void,
	isUseSelectedNodes = false,
) => {
	return {
		additionalFnOnDropdownChange: async (
			_selectedNodes: TreeNodeProps[],
			selectedChildNodes: TreeNodeProps[],
		) => {
			await delay(0)

			// if isOnDropdownChangeUseSelectedNodes is true, use selectedNodes, else use selectedChildNodes
			setQueryState(
				isUseSelectedNodes
					? _selectedNodes.length
						? _selectedNodes.map((n) => n.value).join(',')
						: null
					: selectedChildNodes.length
						? selectedChildNodes.map((n) => n.value).join(',')
						: null,
				DEFAULT_NUQS_TRANSITION_OPTIONS,
			)

		},
		additionalFnOnRemoveNode: async (_removedNode: TreeNodeProps) => {
			await delay(0)

			// get value of removed node and also its children and all of its descendants' values
			const flattenedRemoveNode = flattenTree([_removedNode])
			const removedNodeValues = flattenedRemoveNode.map((n) => n.value)
			setQueryState((_qs) => {
				const qArray = (_qs || '').split(',')
				const result = qArray.filter(
					(s) => !removedNodeValues.includes(s),
				)
				return result?.length ? result.join(',') : null
			}, DEFAULT_NUQS_TRANSITION_OPTIONS)
		},
		additionalFnOnReset: async () => {
			await delay(0)
			setQueryState(null, DEFAULT_NUQS_TRANSITION_OPTIONS)
		},
	}
}
