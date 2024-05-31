import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'
import { MouseEventHandler } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'
import Icon from '../Icon'

export interface TagTreeMultiSelectNodeProps
	extends IPropWithClassNameChildren {
	id: string
	item: TreeNodeProps
	onRemoveClick?: (
		_e: MouseEventHandler<HTMLButtonElement>,
		_removedNode: TreeNodeProps,
	) => void
}

export const TagTreeMultiSelectNode = ({
	id,
	children,
	className,
	item,
	onRemoveClick,
}: TagTreeMultiSelectNodeProps) => {
	const handleRemove = (e) => {
		onRemoveClick(e, item)
	}
	return (
		<span
			id={id}
			className={clsx(
				'bg-nsw-brand-dark text-white px-3 py-2 rounded-[4px] text-sm font-bold inline-flex items-center gap-2 border-2 border-nsw-brand-dark',
				className,
			)}
			css={{
				'&:focus-within': {
					backgroundImage:
						'linear-gradient(rgba(var(--nsw-white-rgb),.15), rgba(var(--nsw-white-rgb),.15))',
				},
			}}
		>
			{item.label}
			<button
				type="button"
				aria-label="Remove"
				aria-labelledby={id}
				className="w-5 h-5 flex-shrink-0"
				onClick={handleRemove}
			>
				<Icon icon={'ic:baseline-close'} width={20} height={20} />
			</button>
			{children}
		</span>
	)
}
