import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'
import { useId } from 'react'
import { TagTreeMultiSelectNode } from './TagTreeMultiSelectNode'

export interface TagListTreeMultiSelectWrapperProps
	extends IPropWithClassNameChildren {
	showClearButton?: boolean
	onClearClick?: () => void
}

export const TagListTreeMultiSelectWrapper = ({
	className,
	children,
	showClearButton = false,
	onClearClick,
}: TagListTreeMultiSelectWrapperProps) => {
	const id = useId() + '-clear-all'

	const handleClearClick = () => {
		if (onClearClick) {
			onClearClick()
		}
	}

	return (
		<div className={clsx('flex gap-2 flex-wrap', className)}>
			{children}
			{showClearButton && (
				<TagTreeMultiSelectNode
					id={id}
					item={{
						value: '',
						label: 'Clear all',
						checked: false,
						children: [],
					}}
					onRemoveClick={handleClearClick}
					className="bg-white !text-nsw-brand-dark relative [&>button]:before:absolute [&>button]:before:inset-0"
				></TagTreeMultiSelectNode>
			)}
		</div>
	)
}
