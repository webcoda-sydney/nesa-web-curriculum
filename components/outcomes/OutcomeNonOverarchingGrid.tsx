import { Outcome } from '@/kontent/content-types'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/system'
import clsx from 'clsx'
import { GridCol } from '../nsw/grid/GridCol'
import { GridWrapper } from '../nsw/grid/GridWrapper'
import OutcomePaper from '../papers/outcome/OutcomePaper'

export interface OutcomeNonOverarchingGridProps {
	outcomes: Outcome[]
	featureLifeSkill: boolean
	showAlignedContent: boolean
	showRelatedOutcome: boolean
	masonry?: boolean
	pageSize?: number
	lazyAlignedContent?: boolean
}

const useOutcomeGroupBucket = (masonry) => {
	const isMobile = useMediaQuery((theme: Theme) =>
		theme.breakpoints.down('md'),
	)
	const isTablet = useMediaQuery((theme: Theme) =>
		theme.breakpoints.between('md', 'lg'),
	)
	if (isMobile || !masonry) return [undefined]
	if (isTablet) return [undefined, undefined]
	return [undefined, undefined, undefined]
}

export const OutcomeNonOverarchingGrid = ({
	outcomes,
	featureLifeSkill,
	showAlignedContent,
	showRelatedOutcome,
	pageSize = 1,
	masonry = false,
	lazyAlignedContent = true,
}: OutcomeNonOverarchingGridProps) => {
	const outcomeBucket = useOutcomeGroupBucket(masonry)

	const outcomeCols = outcomeBucket.map((_, outcomeBucketIndex) => {
		return outcomes.filter(
			(_, index) => index % outcomeBucket.length === outcomeBucketIndex,
		)
	})

	return (
		<>
			{outcomeCols.map((outcomes, index) => {
				return (
					<GridCol
						key={index}
						xs={masonry ? 12 : 12 / pageSize}
						md={masonry ? 6 : undefined}
						lg={masonry ? 4 : undefined}
					>
						<div className="mt-4">
							<GridWrapper spacing={{ xs: 4 }}>
								{outcomes.map((outcome) => {
									const hasOutcomeTitle =
										!!outcome.elements.title.value
									return (
										<GridCol
											key={outcome.system.id}
											lg={
												masonry
													? undefined
													: pageSize === 1
													? 4
													: 12
											}
										>
											<OutcomePaper
												data-kontent-item-id={
													outcome.system.id
												}
												title={
													<span>
														<span
															className={clsx(
																hasOutcomeTitle &&
																	'mr-2',
															)}
														>
															{
																outcome.elements
																	.code.value
															}
														</span>
														{hasOutcomeTitle && (
															<span>
																{
																	outcome
																		.elements
																		.title
																		.value
																}
															</span>
														)}
													</span>
												}
												outcome={outcome}
												featureLifeSkill={
													featureLifeSkill
												}
												showAlignedContent={
													showAlignedContent
												}
												showRelatedOutcome={
													showRelatedOutcome
												}
												lazyAlignedContent={
													lazyAlignedContent
												}
											/>
										</GridCol>
									)
								})}
							</GridWrapper>
						</div>
					</GridCol>
				)
			})}
		</>
	)
}
