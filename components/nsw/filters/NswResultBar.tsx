import clsx from 'clsx'
import { calculateLimitAndOffset } from 'paginate-info'
import { ReactNode } from 'react'

export interface NswResultBarProps {
	className?: string
	page: number
	pageSize: number
	total: number
	slotBarSorting?: ReactNode
	slotShowingResultsBefore?: ReactNode
	slotShowingResultsAfter?: ReactNode
	slotShowingResultsNumberBefore?: ReactNode
}
export const NswResultBar = ({
	className,
	page,
	pageSize,
	total,
	slotBarSorting,
	slotShowingResultsBefore,
	slotShowingResultsAfter,
	slotShowingResultsNumberBefore,
}: NswResultBarProps) => {
	const { offset } = calculateLimitAndOffset(page, pageSize)

	const start = offset + 1
	const end = page * pageSize < total ? page * pageSize : total

	return (
		<div className={clsx('nsw-results-bar flex', className)}>
			<div className="nsw-results-bar__info">
				{slotShowingResultsBefore}
				<span className="NswResultBar__result">
					{slotShowingResultsNumberBefore}
					{total === 0
						? '0 results'
						: `Showing results ${start} - ${end} of ${total} result${
								total > 1 ? 's' : ''
						  }`}
				</span>
				{slotShowingResultsAfter}
			</div>
			<div className="nsw-results-bar__sorting">{slotBarSorting}</div>
		</div>
	)
}
