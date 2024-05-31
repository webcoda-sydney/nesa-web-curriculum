import { Fragment, useId } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'
import {
	TagTreeMultiSelectNode,
	TagTreeMultiSelectNodeProps,
} from './TagTreeMultiSelectNode'

export interface TagListTreeMultiSelectNodeProps
	extends Omit<TagTreeMultiSelectNodeProps, 'item' | 'id'> {
	list: TreeNodeProps[]
	idPrefix?: string
}

export const TagListTreeMultiSelectNode = (
	props: TagListTreeMultiSelectNodeProps,
) => {
	const uuid = useId()
	const { list, children, onRemoveClick } = props
	const idPrefix = props.idPrefix || `tltms-${uuid}`

	return (
		<Fragment>
			{list.map((item, index) => (
				<TagTreeMultiSelectNode
					key={item.value}
					id={idPrefix + index}
					item={item}
					onRemoveClick={onRemoveClick}
				></TagTreeMultiSelectNode>
			))}
			{children}
		</Fragment>
	)
}
