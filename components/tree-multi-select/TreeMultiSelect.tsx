import { css } from '@emotion/react'
import isEqual from 'lodash.isequal'
import { forwardRef, memo, useState } from 'react'
import DropdownTreeSelect, {
	DropdownTreeSelectProps,
	TreeNode,
} from 'react-dropdown-tree-select'
import 'react-dropdown-tree-select/dist/styles.css'

export const TREE_MULTISELECT_OPTION_ALL_VALUE = 'all'

export const useTreeMultiSelectUtilities = () => {
	// To re-render multi-select, i.e. when resetting the tree
	const [key, setKey] = useState(+new Date())

	const [selectedValues, setSelectedValues] = useState([])

	const handleChange: ITreeMultiSelectProps['onChange'] = (
		_currentNode,
		_selectedNodes,
		selectedChildNodes,
	) => {
		setSelectedValues(selectedChildNodes)
	}

	const handleReset = () => {
		setKey(+new Date())
	}

	return {
		key,
		selectedValues,
		handleChange,
		handleReset,
	}
}

export interface ITreeMultiSelectProps
	extends Omit<DropdownTreeSelectProps, 'onChange'> {
	onChange: (
		_currentNode: TreeNode,
		_selectedNodes: TreeNode[],
		_selectedChildNodesOnly: TreeNode[],
	) => void
	placeholder?: string
	hideTagsSelected?: boolean
}

const assignObjectPaths = (obj, stack?: string): any => {
	const isArray = Array.isArray(obj)
	return Object.keys(obj).forEach((k) => {
		const node = obj[k]
		const key = isArray ? `[${k}]` : k

		if (typeof node === 'object') {
			node.path = stack ? `${stack}.${key}` : key
			assignObjectPaths(node, node.path)
		}
	})
}

function flattenTree(tree) {
	let result = []
	for (let node of tree) {
		if (node.children) {
			result = result.concat(flattenTree(node.children))
		} else {
			result.push(node)
		}
	}
	return result
}

const STYLE = {
	'&': {
		'.dropdown': {
			width: '100%',
		},
		'.dropdown.dropdown .dropdown-trigger': {
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			borderRadius: 4,
			borderColor: 'currentColor',
			padding: '2px 16px 2px 4px',
			minHeight: 48,
			color: 'var(--nsw-text-dark)',

			'&.arrow.arrow:after': {
				content: '""',
				backgroundImage:
					'url(https://api.iconify.design/mdi/chevron-down.svg?color=%2322272B&width=30&height=30)',
				backgroundSize: '30px 30px',
				backgroundRepeat: 'no-repeat',
				width: 30,
				height: 30,
				alignSelf: 'center',
			},
			'&.arrow.top:after': {
				backgroundImage:
					'url(https://api.iconify.design/mdi/chevron-up.svg?color=%2322272B&width=30&height=30)',
			},

			'&[aria-labelledby]': {
				alignItems: 'flex-start',
			},
		},
		'.tag:hover': {
			backgroundColor: 'var(--nsw-brand-dark)',
			borderColor: 'var(--nsw-brand-dark)',
		},
		'.tag:focus-within': {
			backgroundColor: 'var(--nsw-brand-dark)',
			borderColor: 'var(--nsw-brand-dark)',
			backgroundImage:
				'linear-gradient(rgba(var(--nsw-white-rgb),.15),rgba(var(--nsw-white-rgb),.15))',
		},
		'.tag-list': {
			flex: '1',
		},
		'.tag-item': {
			margin: 2,
			'& .search': {
				borderBottom: 0,
				background: 'transparent',

				'&::placeholder, &::-ms-input-placeholder': {
					color: 'var(--nsw-text-dark)',
					opacity: 1,
				},
			},
			'&:last-of-type': {
				display: 'none',
			},
			'&:first-of-type:last-of-type': {
				display: 'inline-block',
				width: '100%',
				marginLeft: 12,
			},
		},

		'.toggle': {
			display: 'none',
		},
		'.dropdown.dropdown .dropdown-content': {
			width: '100%',
			padding: 0,
		},

		'.checkbox-item': {
			position: 'absolute',
			width: '1px',
			height: '1px',
			padding: '0',
			margin: '-1px',
			overflow: 'hidden',
			clip: 'rect(0,0,0,0)',
			whiteSpace: 'nowrap',
			border: '0',
		},
		'.node': {
			padding: 8,
			marginTop: 0,
			marginRight: 10,
			position: 'relative',
			display: 'flex',

			'&.focused': {
				backgroundColor: 'transparent',
			},
			'&.checked': {
				backgroundColor: 'rgba(0, 38, 100, .1)',
			},
			'&:hover': {
				backgroundColor: 'var(--nsw-off-white)',
			},

			label: {
				paddingLeft: 16,

				'&:before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
				},
			},
		},

		'.tag': {
			backgroundColor: 'var(--nsw-brand-dark)',
			color: '#fff',
			padding: '8px 12px',
			borderRadius: '4px',
			fontSize: '14px',
			lineHeight: '1.36',
			fontWeight: '700',
			whiteSpace: 'normal',
			display: 'inline-flex',
			alignItems: 'center',
			gap: 8,
		},
		'.tag-remove': {
			width: '20px',
			height: '20px',
			color: '#fff',
			textIndent: '-9999px',
			position: 'relative',
			flexShrink: '0',

			'&:before': {
				content: '""',
				width: '100%',
				height: '100%',
				backgroundImage:
					'url(https://api.iconify.design/material-symbols/close.svg?color=white&width=20&height=20)',
				backgroundRepeat: 'no-repeat',
				backgroundSize: '100%',
				position: 'absolute',
				left: 0,
				top: 0,
			},
		},
		input: {
			fontWeight: 'normal',
			width: 'calc(100% - 8px)',
		},
		'.node-label': {
			color: '#22272B',
			whiteSpace: 'normal',
			display: 'inline-block',
		},
		'.root': {
			maxHeight: '480px',
			overflow: 'auto',
		},
		'.no-matches': {
			display: 'block',
			padding: '.75rem 1rem',
		},
	},
} as any

const _TreeMultiSelect = forwardRef((props: ITreeMultiSelectProps) => {
	const {
		data = true,
		onChange,
		placeholder,
		hideTagsSelected = false,
		...rest
	} = props

	assignObjectPaths(data)

	const _onChange: DropdownTreeSelectProps['onChange'] = (
		currentNode,
		selectedNodes,
	) => {
		const flattenedData = flattenTree(data)
		const selectedChildNodes = selectedNodes.flatMap<TreeNode>(
			(selectedNode) => {
				return flattenedData.filter((item) =>
					new RegExp(
						`^${selectedNode.path}`
							.replaceAll('.', '\\.')
							.replaceAll('[', '\\[')
							.replaceAll(']', '\\]'),
					).test(item.path),
				)
			},
		)

		if (onChange) {
			onChange(currentNode, selectedNodes, selectedChildNodes)
		}
	}
	const _onAction = (node, action) => {
		console.log('onAction::', action, node)
	}
	const _onNodeToggle = (currentNode) => {
		console.log('onNodeToggle::', currentNode)
	}

	return (
		<DropdownTreeSelect
			css={css(
				STYLE,
				hideTagsSelected && {
					'.tag-item': {
						':not(:last-child)': {
							display: 'none',
						},
						':last-of-type': {
							display: 'inline-block',
							width: '100%',
							marginLeft: 12,
						},
					},
					'.dropdown.dropdown .dropdown-trigger[aria-labelledby]': {
						alignItems: 'center',
					},
				},
			)}
			{...rest}
			data={data}
			onChange={_onChange}
			onAction={_onAction}
			onNodeToggle={_onNodeToggle}
			keepTreeOnSearch
			showPartiallySelected
			texts={{ placeholder }}
		/>
	)
})

export const TreeMultiSelect = memo(_TreeMultiSelect, (prevProps, nextProps) =>
	isEqual(nextProps.data, prevProps.data),
)
