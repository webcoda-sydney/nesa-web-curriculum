import OutcomePaper from '@/components/papers/outcome/OutcomePaper'
import { Outcome } from '@/kontent/content-types'
import { TaxoStageYear } from '@/kontent/taxonomies'
import {
	IPropWithClassNameChildren,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	compareValueWithMultipleChoiceCodename,
	getFnSortStagesOnTaxoStages,
	getFnSortYears,
	isYes,
} from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ButtonIcon } from './nsw/button/ButtonIcon'
import { GridCol } from './nsw/grid/GridCol'
import { GridWrapper } from './nsw/grid/GridWrapper'
import { ExtendedOutcome } from './outcomes/KontentOutcomeWrapper'
import { OutcomeNonOverarchingGrid } from './outcomes/OutcomeNonOverarchingGrid'

export interface OutcomeSliderProps extends IPropWithClassNameChildren {
	pageSize?: number
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	years: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[]
	outcomes: Outcome[] | ExtendedOutcome[]
	showRelatedOutcome?: boolean
	showAlignedContent?: boolean
	featureLifeSkill?: boolean
	isGroupedByYear?: boolean
	slotBeforeOverarching?: ReactNode

	/**
	 * Lazy aligned content. Default: true
	 */
	lazyAlignedContent?: boolean
}

const stageHeaderGradient = {
	'&:after': {
		// eslint-disable-next-line quotes
		content: "''",
		height: 80,
		position: 'absolute',
		top: 'calc(100% + 2px)',
		left: 0,
		width: '100%',
		backgroundImage:
			'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
	},
}

export const OutcomeSlider = (props: OutcomeSliderProps) => {
	const {
		className,
		stages,
		years,
		outcomes,
		pageSize = 3,
		featureLifeSkill,
		showAlignedContent,
		showRelatedOutcome,
		isGroupedByYear = false,
		slotBeforeOverarching,
		lazyAlignedContent = true,
	} = props

	const [page, setPage] = useState(1)
	const { ref, inView } = useInView({
		/* Optional options */
		threshold: 0,
	})

	const pageIndex = page - 1
	const paginatedGroups = (isGroupedByYear ? years : stages)
		.slice(pageIndex, pageIndex + pageSize)
		.sort((a, b) => {
			const sortFn = isGroupedByYear
				? getFnSortYears()
				: getFnSortStagesOnTaxoStages()
			return sortFn(a, b)
		})
	const needPagination = (isGroupedByYear ? years : stages).length > pageSize

	const handlePrev = () => {
		setPage((prevPage) => prevPage - 1)
	}
	const handleNext = () => {
		setPage((prevPage) => prevPage + 1)
	}

	return (
		<div className={clsx('relative w-full OutcomeSlider', className)}>
			{/* Previous Button (Desktop) */}
			{needPagination && (
				<div className="hidden lg:block absolute top-120px h-full -left-6 z-10">
					<ButtonIcon
						aria-label="Prev"
						onClick={handlePrev}
						disabled={page === 1}
						className="sticky my-[120px] top-[50%]"
						icon="mdi:chevron-left"
						iconSize={30}
					/>
				</div>
			)}

			{/* to determine whether the stage header becomes sticky or not. !inView means it becomes sticky */}
			<div ref={ref}></div>

			{needPagination && (
				<div className="flex justify-between lg:hidden relative z-[1]">
					<ButtonIcon
						aria-label="Prev"
						onClick={handlePrev}
						disabled={page === 1}
						icon="mdi:chevron-left"
						iconSize={30}
					/>
					<ButtonIcon
						aria-label="Next"
						onClick={handleNext}
						disabled={page === stages.length - pageSize + 1}
						icon="mdi:chevron-right"
						iconSize={30}
					/>
				</div>
			)}

			<div className="sticky top-0 mb-4 bg-white overflow-hidden">
				<GridWrapper>
					{paginatedGroups.map(
						(
							group:
								| ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>
								| ElementModels.TaxonomyTerm<TaxoStageYear>,
						) => (
							<GridCol key={group.codename} xs={12 / pageSize}>
								<div
									className="bold py-4 border-b-2"
									css={[
										!inView && (stageHeaderGradient as any),
										{
											borderColor: 'var(--nsw-grey-01)',
											'.is-preview &': {
												top: 26,
											},
										},
									]}
								>
									{group?.codename?.match(/^n\d+$/)?.length
										? `Year ${group.name}`
										: group.name}
								</div>
							</GridCol>
						),
					)}
				</GridWrapper>
			</div>

			{slotBeforeOverarching}

			{/* Overarching Outcome(s) */}
			<GridWrapper spacing={4}>
				{outcomes
					?.filter((outcome) => isYes(outcome.elements.isoverarching))
					.map((outcome) => {
						const hasOutcomeTitle = !!outcome.elements.title.value
						return (
							<GridCol
								key={outcome.system.id}
								display="flex"
								flexDirection="column"
								lg={
									paginatedGroups.length > 1
										? paginatedGroups.length * 4
										: 12
								}
							>
								<OutcomePaper
									className="flex-1"
									data-kontent-item-id={outcome.system.id}
									title={
										<span>
											<span
												className={clsx(
													hasOutcomeTitle && 'mr-3',
												)}
											>
												{outcome.elements.code.value}
											</span>
											{hasOutcomeTitle && (
												<span>
													{
														outcome.elements.title
															.value
													}
												</span>
											)}
										</span>
									}
									outcome={outcome}
									featureLifeSkill={featureLifeSkill}
									showAlignedContent={showAlignedContent}
									lazyAlignedContent={lazyAlignedContent}
								/>
							</GridCol>
						)
					})}
			</GridWrapper>

			<GridWrapper>
				{paginatedGroups.map((group) => {
					const nonOverarchingOutcomes = outcomes
						.filter(
							(outcome) => !isYes(outcome.elements.isoverarching),
						)
						?.filter((o) => {
							if (group.codename === 'life_skills') {
								return compareValueWithMultipleChoiceCodename(
									o.elements.syllabus_type__items,
									'life_skills',
								)
							}

							if (isGroupedByYear) {
								return (
									o.elements.stages__stage_years.value.some(
										(y) => y.codename === group.codename,
									) &&
									compareValueWithMultipleChoiceCodename(
										o.elements.syllabus_type__items,
										'mainstream',
									)
								)
							}

							return (
								o.elements.stages__stages.value.some(
									(s) => s.codename === group.codename,
								) &&
								compareValueWithMultipleChoiceCodename(
									o.elements.syllabus_type__items,
									'mainstream',
								)
							)
						})

					return (
						<OutcomeNonOverarchingGrid
							key={group.codename}
							outcomes={nonOverarchingOutcomes}
							featureLifeSkill={featureLifeSkill}
							showAlignedContent={showAlignedContent}
							showRelatedOutcome={showRelatedOutcome}
							masonry={paginatedGroups.length === 1}
							pageSize={pageSize}
							lazyAlignedContent={lazyAlignedContent}
						></OutcomeNonOverarchingGrid>
					)
				})}
			</GridWrapper>

			{needPagination && (
				<div className="hidden lg:block absolute top-0 h-full -right-6">
					{/* Next Button (Desktop) */}
					<ButtonIcon
						aria-label="Next"
						onClick={handleNext}
						disabled={page === stages.length - pageSize + 1}
						className="sticky my-[120px] top-[50%] "
						icon="mdi:chevron-right"
						iconSize={30}
					/>
				</div>
			)}
		</div>
	)
}
