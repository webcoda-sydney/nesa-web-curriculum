import Icon from '@/components/Icon'
import { useToggle } from '@/hooks/useToggle'
import clsx from 'clsx'
import { Button } from 'nsw-ds-react'
import type { ReactNode } from 'react'

export const NswFilter = ({
	className,
	title = 'Filter results',
	children,
	slotBeforeWrapper,
	totalItems = 0,
	mobileToggleFilterLabel = 'Filter results',
}: {
	className?: string
	title?: ReactNode
	children: ReactNode
	slotBeforeWrapper?: ReactNode
	totalItems?: number
	mobileToggleFilterLabel?: ReactNode
}) => {
	const [mobileFilterOpen, setMobileFilterOpen] = useToggle(false)
	return (
		<div
			className={clsx(
				'nsw-filters nsw-filters--fixed',
				mobileFilterOpen && 'active',
				className,
			)}
		>
			{slotBeforeWrapper}
			<div
				className={clsx(
					'nsw-filters__controls',
					!mobileFilterOpen && 'active',
				)}
			>
				<button type="button" onClick={setMobileFilterOpen}>
					<Icon icon="mdi:tune" className="nsw-material-icons" />
					<span>{mobileToggleFilterLabel}</span>
				</button>
			</div>
			<div className="nsw-filters__wrapper [.active_&]:flex flex-col">
				<div className="nsw-filters__back">
					<button
						className="nsw-icon-button nsw-icon-button--flex"
						type="button"
						aria-expanded="true"
						onClick={setMobileFilterOpen}
					>
						<Icon
							icon="ic:baseline-keyboard-arrow-left"
							className="nsw-material-icons"
						/>
						<span>Back</span>
					</button>
				</div>
				{!!title && (
					<div className="nsw-filters__title !mt-0 lg:block">
						{title}
					</div>
				)}
				<div className="flex-1 lg:flex-initial overflow-auto lg:overflow-visible">
					{children}
				</div>
				<div className="nsw-filters__accept lg:hidden">
					<Button
						className="nsw-button--full-width"
						onClick={setMobileFilterOpen}
					>
						Apply filters {totalItems > 0 ? `(${totalItems})` : ''}
					</Button>
				</div>
			</div>
		</div>
	)
}
