import Icon from '@/components/Icon'
import Link from '@/components/Link'
import { SideNavItem } from '@/components/nsw/side-nav/SideNav'
import { Tooltip } from '@/components/tooltip/Tooltip'
import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'

interface IPrevNextButtonProps extends IPropWithClassNameChildren {
	type: 'Next' | 'Previous'
	contentItem: SideNavItem
}

export const PrevNextButton = ({
	type,
	contentItem,
	children,
	className,
}: IPrevNextButtonProps) => {
	const Comp = contentItem.href ? Link : 'button'

	return (
		<div className={clsx('flex gap-2', className)}>
			{type === 'Next' && <Tooltip text={contentItem.text} />}
			<Comp
				href={contentItem.href}
				onClick={contentItem.onClick as any}
				shallow={contentItem.shallow}
				scroll={contentItem.scroll}
				className="flex gap-2 items-center Link"
				type={Comp === 'button' ? 'button' : undefined}
			>
				{type === 'Previous' && (
					<>
						<Icon icon="ic:baseline-west" width={16} height={16} />
					</>
				)}

				{children ? children : <span>{type} rule</span>}

				{type === 'Next' && (
					<Icon icon="ic:baseline-east" width={16} height={16} />
				)}
			</Comp>
			{type === 'Previous' && <Tooltip text={contentItem.text} />}
		</div>
	)
}
