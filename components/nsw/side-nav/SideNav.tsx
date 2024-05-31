import Icon from '@/components/Icon'
import Link from '@/components/Link'
import { useToggle } from '@/hooks/useToggle'
import { IPropWithClassName } from '@/types'
import Collapse from '@mui/material/Collapse'
import clsx from 'clsx'
import { ElementType, ReactNode, useId } from 'react'

export interface SideNavItem {
	text?: ReactNode
	href?: string
	codename?: string
	id?: string
	onClick: (_e: MouseEvent) => void
	tag?: 'a' | string | ElementType
	isActive?: boolean
	shallow?: boolean
	scroll?: boolean
	prefetch?: boolean
	subNav?: this[]
}

export interface SideNavListItemProps {
	item: SideNavItem
	level?: number
	withToggle?: boolean
}

export interface SideNavProps extends IPropWithClassName {
	items: SideNavItem[]
	header?: SideNavItem
	withToggle?: boolean
}

export const getStickySideNavStyle = (isSticky) => {
	return {
		'.is-preview &': {
			top: 26,
			maxHeight: isSticky && 'calc(100vh - 26px)',
		},
		'&': {
			overflow: isSticky && 'auto',
			maxHeight: isSticky && '100vh',
		},
	}
}
const flattenSubnavItems = (subNav: SideNavItem[]): SideNavItem[] => {
	return subNav
		? [
				...subNav,
				...subNav.flatMap((item) => flattenSubnavItems(item.subNav)),
		  ]
		: []
}

const hasActiveChild = (item: SideNavItem) => {
	if (item.subNav?.length) {
		const subnavItems = flattenSubnavItems(item.subNav)
		return subnavItems.some((_item) => _item.isActive)
	}
	return false
}

const SideNavList = ({
	className,
	items,
	level = 0,
	withToggle = false,
}: Pick<SideNavProps, 'className' | 'items'> & {
	level?: number
	withToggle?: boolean
}) => {
	return (
		<ul className={className}>
			{items.map((item, index) => {
				return (
					<SideNavListItem
						key={item.text + item.href + index}
						item={item}
						level={level}
						withToggle={withToggle}
					/>
				)
			})}
		</ul>
	)
}

const SideNavListItem = ({
	item,
	level = 0,
	withToggle = false,
}: SideNavListItemProps) => {
	const ItemTag = item.tag || Link
	const _hasActiveChild = hasActiveChild(item)
	const hasActiveClass = (item.isActive && level != 1) || _hasActiveChild

	const [showSubNav, toggle] = useToggle(hasActiveClass)
	return (
		<li
			className={clsx(
				'relative nsw-side-nav__item [&.active>.SideNavListItemLinkWrapper>a]:font-bold',
				hasActiveClass && 'active',
			)}
		>
			<div className="relative SideNavListItemLinkWrapper">
				<ItemTag
					href={item.href}
					shallow={item.shallow}
					className={clsx(
						'nsw-side-nav__item-link',
						item.isActive && 'current',
						withToggle && 'with-toggle [&.with-toggle]:pr-8',
					)}
					onClick={item.onClick}
					scroll={item.scroll ?? true}
					prefetch={item.prefetch ?? true}
				>
					{item.text}
				</ItemTag>
				{!!item.subNav?.length && withToggle && (
					<button
						type="button"
						className="flex items-center justify-center absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 z-10"
						aria-label="Toggle"
						onClick={toggle}
					>
						<Icon
							icon={
								showSubNav
									? 'ic:baseline-expand-less'
									: 'ic:baseline-expand-more'
							}
						/>
					</button>
				)}
			</div>
			{!!item.subNav?.length &&
				(_hasActiveChild || item.isActive || withToggle) && (
					<SideNavList
						className={clsx({
							hidden: !showSubNav,
						})}
						items={item.subNav}
						level={level + 1}
					/>
				)}
		</li>
	)
}

export const SideNav = ({
	className,
	header,
	items,
	withToggle = false,
}: SideNavProps) => {
	const uniqueId = useId()

	const HeaderTag = header?.tag || 'a'

	return (
		<nav
			className={clsx('nsw-side-nav [&_li_li_a]:pl-8', className)}
			aria-labelledby={header ? uniqueId : undefined}
		>
			{!!header && (
				<div className="nsw-side-nav__header" id={uniqueId}>
					<HeaderTag href={header.href}>{header.text}</HeaderTag>
				</div>
			)}
			{!!items?.length && (
				<SideNavList
					items={items}
					withToggle={withToggle}
				></SideNavList>
			)}
		</nav>
	)
}

export interface ISideNavWithCollapseProps extends SideNavProps {
	initialExpand?: boolean
	parentClassName?: string
}

export const SideNavWithCollapse = (props: ISideNavWithCollapseProps) => {
	const {
		initialExpand = false,
		parentClassName,
		withToggle,
		...sideNavProps
	} = props
	const [expand, toggle] = useToggle(initialExpand)
	return (
		<div
			className={clsx(parentClassName)}
			css={{
				'.nsw-side-nav .nsw-side-nav__header': {
					display: 'none',
				},
			}}
		>
			<button
				type="button"
				className="flex gap-3 w-full font-bold py-2 text-left nsw-side-nav__header SideNavWithCollapse__toggle"
				onClick={() => toggle()}
			>
				<span className="flex-1">{sideNavProps.header?.text}</span>
				<Icon icon={expand ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
			</button>
			<Collapse in={expand}>
				<SideNav {...sideNavProps} withToggle={withToggle} />
			</Collapse>
		</div>
	)
}
