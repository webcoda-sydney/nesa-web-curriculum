import { TreeNodeProps } from 'react-dropdown-tree-select'

export const getSelectedChildNodesFromData = (data: TreeNodeProps[]) => {
	return data.reduce((acc, node) => {
		return [
			...acc,
			...(node.children.filter((child) => child.checked) || []),
		]
	}, [])
}

export const getSelectedNodesFromData = (data: TreeNodeProps[]) => {
	return data.reduce((acc, node) => {
		let _tmp = [...acc]
		if (
			(node.children.length &&
				node.children?.every((child) => child.checked)) ||
			(!node.children.length && node.checked)
		) {
			_tmp.push(node)
		} else {
			_tmp = [
				..._tmp,
				...(node.children.filter((child) => child.checked) || []),
			]
		}
		return _tmp
	}, [])
}
