import { IPropWithClassName } from '@/types'
import clsx from 'clsx'
import { Button } from 'nsw-ds-react'
import { MouseEvent, ReactNode } from 'react'
import Icon from './Icon'

export interface SyllabusHeaderProps extends IPropWithClassName {
	title: string
	pretitle?: string
	slotRight?: ReactNode
	slotAfterTitle?: ReactNode
	onEditViewClick?: (_e: MouseEvent<HTMLButtonElement>) => void
	onDownloadViewClick?: (_e: MouseEvent<HTMLButtonElement>) => void
	slotAfter?: ReactNode
	slotAfterButtons?: ReactNode
}

export const SyllabusHeader = (props: SyllabusHeaderProps) => {
	const {
		title,
		pretitle,
		slotAfterTitle,
		slotRight,
		slotAfter,
		slotAfterButtons,
		onEditViewClick,
		onDownloadViewClick,
		className,
	} = props

	return (
		<div
			className={clsx(
				'nsw-bg--brand-dark text-white SyllabusHeader',
				className,
			)}
		>
			<div className="nsw-container md:min-h-[180px] lg:min-h-[267px] py-8 flex flex-wrap items-center gap-4 lg:gap-x-8">
				<div className="flex-1 basis-auto">
					{!!title && (
						<h1>
							{!!pretitle && (
								<>
									<span>{pretitle}</span>
									<span className="mx-3 lg:mx-6 align-middle inline-flex border-l-2 h-[1em]"></span>
								</>
							)}
							{/* Do not remove search title class, Used for site search360 */}
							{!!title && (
								<span className="search-title">{title}</span>
							)}
						</h1>
					)}
					{slotAfterTitle}
				</div>
				<div className="flex-auto xl:flex-initial">
					<div className="flex-1 flex gap-2 xl:justify-end SyllabusHeader__buttons">
						{!!onEditViewClick && (
							<Button style="white" onClick={onEditViewClick}>
								Edit view
							</Button>
						)}
						{!!onDownloadViewClick && (
							<Button
								className="flex justify-center"
								style="white"
								onClick={onDownloadViewClick}
								css={{
									'& > *': {
										flexShrink: 0,
									},
								}}
							>
								<span className="mr-2">Download view</span>
								<Icon icon="bxs:download" />
							</Button>
						)}
						{slotAfterButtons}
					</div>
					{!!slotRight && <div>{slotRight}</div>}
				</div>
			</div>
			{slotAfter}
		</div>
	)
}
