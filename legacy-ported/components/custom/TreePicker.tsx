import { Checkbox } from '@/components/nsw/Checkbox'
import ErrorIcon from '@mui/icons-material/Error'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { withStyles } from '@mui/styles'
import clsx from 'clsx'
import { ReactNode, useId, useState } from 'react'
import DESIGN from '../../constants/designConstants'
import { arrayToggle } from '../../utilities/functions'
import { TreeElement, getLeaves, getNodes } from './treeUtils'

const ChildTaken = (
	element: TreeElement,
	selected: TreeElement['id'][],
): boolean => {
	if (element.children) {
		for (let i = 0; i < element.children.length; i++) {
			const child = element.children[i]
			if (selected.includes(child.id) || ChildTaken(child, selected)) {
				return true
			}
		}
	}

	return false
}

const recursiveChildrenTakenCheck = (
	element: TreeElement,
	selected: TreeElement['id'][],
): [boolean, boolean, boolean] => {
	let childAvailable = false
	let untakenAvailableChild = false
	let untakenDisabledChild = false

	if (element.children) {
		for (let i = 0; i < element.children.length; i++) {
			const child = element.children[i]

			if (child.children?.length) {
				const [ca, ua, ud] = recursiveChildrenTakenCheck(
					child,
					selected,
				)
				childAvailable = childAvailable || ca
				untakenAvailableChild = untakenAvailableChild || ua
				untakenDisabledChild = untakenDisabledChild || ud
			} else if (child.disabled) {
				if (!untakenDisabledChild) {
					untakenDisabledChild = !selected.includes(child.id)
				}
			} else {
				childAvailable = true
				if (!untakenAvailableChild) {
					untakenAvailableChild = !selected.includes(child.id)
				}
			}
		}
	}

	return [childAvailable, untakenAvailableChild, untakenDisabledChild]
}

const AllChildrenTaken = (
	element: TreeElement,
	selected: TreeElement['id'][],
): boolean => {
	const [childAvailable, untakenAvailableChild, untakenDisabledChild] =
		recursiveChildrenTakenCheck(element, selected)

	return (
		(childAvailable && !untakenAvailableChild) ||
		(!childAvailable && !untakenDisabledChild)
	)
}

const CustomTooltip = withStyles(() => ({
	tooltip: {
		backgroundColor: DESIGN.COLOR_WHITE,
		maxWidth: 'unset',
		color: DESIGN.COLOR_BLACK,
		padding: '0px',
		// box-shadow from Material UI Paper
		boxShadow:
			'0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
	},
}))(Tooltip)

interface SubtreeProps {
	rootElement: TreeElement
	selected: TreeElement['id'][]
	collapsed: TreeElement['id'][]
	depth: number
	forceExpand?: boolean
	onToggle?: (_element: TreeElement) => void
	onExpand?: (_element: TreeElement) => void
}

const Subtree = (props: SubtreeProps) => {
	const {
		rootElement,
		selected,
		collapsed,
		depth,
		forceExpand,
		onToggle,
		onExpand,
	} = props

	const handleToggle = () => {
		if (onToggle) {
			onToggle(rootElement)
		}
	}

	const handleExpand = () => {
		if (onExpand) {
			onExpand(rootElement)
		}
	}

	const hasChildren = rootElement.children && rootElement.children.length > 0
	const isSelected = hasChildren
		? AllChildrenTaken(rootElement, selected)
		: selected.includes(rootElement.id)

	const allowExpand = !forceExpand && hasChildren && !rootElement.disabled
	const isExpanded =
		(forceExpand || !collapsed.includes(rootElement.id)) && hasChildren

	const checkboxId = useId()

	return (
		<div
			className={clsx(
				'tree-picker__element-wrapper',
				`tree-picker-id-${rootElement.id}`,
			)}
		>
			<div className="tree-picker__subtree">
				<div className="tree-picker__element-wrapper">
					<div
						className={clsx(
							'tree-picker__element',
							isSelected && 'tree-picker__checkbox--selected',
							rootElement.children &&
								rootElement.children.length > 0
								? `tree-picker__element--depth-${depth}`
								: 'tree-picker__element--depth-1',
						)}
					>
						<FormControlLabel
							htmlFor={checkboxId}
							sx={{
								alignItems: 'stretch',
							}}
							control={
								<Checkbox
									id={checkboxId}
									className="tree-picker__checkbox"
									checked={isSelected}
									indeterminate={
										!isSelected &&
										ChildTaken(rootElement, selected)
									}
									onChange={handleToggle}
									disabled={rootElement.disabled}
								/>
							}
							label={
								<span className="inline-block mt-3">
									{rootElement.label}
								</span>
							}
						/>

						{allowExpand && (
							<IconButton
								onClick={handleExpand}
								aria-label={isExpanded ? 'collapse' : 'expand'}
								className="tree-picker__iconbtn nsw-text--brand-dark"
							>
								{isExpanded ? <ExpandLess /> : <ExpandMore />}
							</IconButton>
						)}
						{rootElement.moreInfo && (
							<CustomTooltip
								title={
									<Grid className="tree-picker__info">
										<p className="tree-picker__info-detail">
											{rootElement.moreInfo}
										</p>
									</Grid>
								}
								placement="right"
							>
								<div className="tree-picker__tooltip-icon">
									<ErrorIcon
										style={{
											fontSize: '18px',
											color: DESIGN.COLOR_BLUE_PRIMARY,
										}}
									/>
								</div>
							</CustomTooltip>
						)}
					</div>
				</div>
				{isExpanded && (
					<div className="tree-picker__subtree-children">
						{rootElement.children?.map((child) => (
							<Subtree
								{...props}
								rootElement={child}
								depth={depth + 1}
								forceExpand={false}
								key={child.id}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export interface PureTreePickerProps
	extends Pick<
		SubtreeProps,
		'selected' | 'collapsed' | 'onToggle' | 'onExpand'
	> {
	/**
	 * Top level tree elements, these form the root of independent trees
	 */
	rootElements: TreeElement[]
}

export const PureTreePicker = (props: PureTreePickerProps): JSX.Element => {
	const { rootElements, selected, collapsed, onToggle, onExpand } = props

	return (
		<div className="tree-picker">
			{rootElements.map((element) => (
				<Subtree
					rootElement={element}
					selected={selected}
					collapsed={collapsed}
					key={element.id}
					depth={0}
					forceExpand={rootElements.length === 1}
					onToggle={onToggle}
					onExpand={onExpand}
				/>
			))}
		</div>
	)
}

export interface TreePickerProps
	extends Pick<PureTreePickerProps, 'rootElements' | 'selected'> {
	/**
	 * callback fired with all selected leaf nodes
	 * @param ids all leaf nodes that are currently selected
	 */
	onChange?: (_ids: TreeElement['id'][]) => void

	/**
	 * What nodes should start expanded. Defaults to 'top-level'
	 */
	defaultExpanded?: 'all' | 'none' | 'top-level'

	title?: string
	slotAfterTitle?: ReactNode
	className?: string
}

export const TreePicker = (props: TreePickerProps) => {
	const {
		className,
		rootElements = [],
		selected,
		onChange,
		title,
		slotAfterTitle,
	} = props
	let defaultExpanded =
		props.defaultExpanded ||
		(rootElements.length === 1 ? 'top-level' : 'none')

	let defaultCollapsed: TreeElement[] = []
	switch (defaultExpanded) {
		case 'none':
			defaultCollapsed = getNodes(
				rootElements,
				(n) => !!n.children?.length,
			)
			break
		case 'top-level':
			defaultCollapsed = getNodes(
				rootElements,
				(n) => !rootElements.includes(n),
			)
			break
		default:
			break
	}

	const [collapsed, setCollapsed] = useState(
		defaultCollapsed.map((n) => n.id),
	)

	const handleToggle = (node: TreeElement) => {
		if (onChange) {
			if (node.children?.length) {
				// Node has children, we're gonna operate on the enabled leaf children.
				const childNodes = getLeaves([node]).filter((n) => !n.disabled)
				const unSelected = childNodes.filter(
					(n) => !selected.includes(n.id),
				)

				if (unSelected.length) {
					// This node was indeterminate or unchecked, so this action is select all
					// unselected children.
					onChange(unSelected.map((n) => n.id))
				} else {
					// Node was checked, so uncheck all children
					onChange(childNodes.map((n) => n.id))
				}
			} else {
				// Node has no children, was a simple toggle.
				onChange([node.id])
			}
		}
	}

	const handleExpand = (node: TreeElement) => {
		setCollapsed(arrayToggle(collapsed, node.id))
	}

	return (
		<div className={className}>
			{!!title && (
				<div className="bold border-b-[3px] border-[#22272B] pb-3 mb-4">
					{title}
				</div>
			)}
			{slotAfterTitle}
			<div>
				<PureTreePicker
					rootElements={rootElements}
					selected={selected}
					collapsed={collapsed}
					onToggle={handleToggle}
					onExpand={handleExpand}
				/>
			</div>
		</div>
	)
}

export default TreePicker
