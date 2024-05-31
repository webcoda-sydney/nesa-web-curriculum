import { useEffect } from 'react'
import { TreeNode, TreeNodeProps } from 'react-dropdown-tree-select'

export const useSetTreeNodeStateBasedOnQueryString = (
	queryValue: string,
	options: TreeNodeProps[],
	callback: (_newState: TreeNode[]) => void,
) => {
	useEffect(() => {
		if (queryValue) {
			const _qSplit = queryValue.split(',')
			const newState = options
				.flatMap((option) =>
					option.children?.length ? option.children : [option],
				)
				.filter((optionNode) => _qSplit.includes(optionNode.value))
			callback(newState)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryValue, options.map((r) => r.value).join(',')])
}
