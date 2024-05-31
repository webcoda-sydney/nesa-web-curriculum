import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import {
	fetchFocusareaAndOptionListByTaxoSyllabuses,
	fetchOutcomesByTaxoSyllabuses,
} from '@/fetchers'
import { Syllabus } from '@/kontent/content-types'
import { TaxoStage } from '@/kontent/taxonomies'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import Content from '@/legacy-ported/components/syllabus/Content'
import {
	AssetWithRawElements,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	byTaxoCodename,
	fnExist,
	getFnIsItemHasStage,
	getFnSortStagesOnTaxoStages,
	getTaxoCodenamesFromTaxoTerms,
	isIntersect,
} from '@/utils'
import {
	convertToFocusareasOrOptionListOrFocusareaoptionsExtended,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import { isLifeSkillSyllabus, isStage6Syllabus } from '@/utils/syllabus'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { InView } from 'react-intersection-observer'
import { Spring, animated } from 'react-spring'
import { CurrentViewing } from '../CurrentViewing'
import { Loading } from '../Loading'
import { SyllabusViewProps } from '../SyllabusView'
import { WrapperWithInView } from '../WrapperWithInView'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'

interface SyllabusSectionFocusareaProps {
	title?: string
	syllabus: Syllabus
	currentStages: SyllabusViewProps['currentStages']
	currentOptions: SyllabusViewProps['currentOptions']
	allStages: SyllabusViewProps['allStages']
	initialYearCodename: SyllabusViewProps['initialYearCodename']
	initialStageCodename: SyllabusViewProps['initialStageCodename']
	enableContentCurrentlyViewing: SyllabusViewProps['enableContentCurrentlyViewing']
	syllabusAssets: AssetWithRawElements[]

	/**
	 * if true, when the focus area selected from (side) navigation,
	 * it won't redirect to the focus area page
	 */
	isFocusAreaNavigateInView?: boolean
}

export const SyllabusSectionFocusarea = ({
	title = 'Content',
	syllabus,
	currentStages,
	currentOptions,
	allStages,
	initialYearCodename,
	initialStageCodename,
	enableContentCurrentlyViewing,
	syllabusAssets,
	isFocusAreaNavigateInView = false,
}: SyllabusSectionFocusareaProps) => {
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	// Computed - Before (should be passed as props)
	const relatedLifeSkillsSyllabuses =
		getLinkedItems(
			syllabus.elements.relatedlifeskillssyllabus,
			pageResponseLinkedItems,
		) || []

	const filteredAndSortedCurrentStages = currentStages
		.filter((stage) => {
			if (isLifeSkillsSyl) {
				return stage === 'life_skills'
			}
			return allStages.some((_s) => _s.codename === stage)
		})
		.sort(getFnSortStagesOnTaxoStages())

	const taxoSyllabus = [
		...syllabus.elements.syllabus.value.map(byTaxoCodename),
		...relatedLifeSkillsSyllabuses.flatMap((relatedSyllabus) =>
			relatedSyllabus.elements.syllabus.value.map(byTaxoCodename),
		),
	].join(',')

	const { data: outcomesResponse, isFetched: isFetchedOutcomes } = useQuery(
		[`outcomes_${syllabus.system.codename}`, taxoSyllabus],
		() => fetchOutcomesByTaxoSyllabuses(taxoSyllabus),
		{
			staleTime: Infinity,
		},
	)

	const allOutcomes = outcomesResponse?.items || []

	// Query
	const { data: focusAreaResponse, isFetched: isFetchedFocusArea } = useQuery(
		[
			`SyllabusSectionFocusarea_${syllabus.system.codename}`,
			taxoSyllabus,
			syllabus.system.codename,
		],
		() => fetchFocusareaAndOptionListByTaxoSyllabuses(taxoSyllabus),
		{
			staleTime: Infinity,
		},
	)

	if (!(isFetchedFocusArea && isFetchedOutcomes)) {
		return <Loading />
	}

	const fnMapWithFocusAreaResponseItem = (focusAreaCodename) =>
		focusAreaResponse?.items?.find(
			(fa) => fa.system.codename === focusAreaCodename,
		)

	const focusAreas =
		[
			...syllabus?.elements?.focus_areas?.value?.map(
				fnMapWithFocusAreaResponseItem,
			),
			...relatedLifeSkillsSyllabuses?.flatMap((relatedSyllabus) => {
				return relatedSyllabus?.elements?.focus_areas?.value?.map(
					fnMapWithFocusAreaResponseItem,
				)
			}),
		].filter(fnExist) || []

	const isStage6Syl = isStage6Syllabus(syllabus)
	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)
	const hasLifeSkillsFocusAreas = focusAreas.some(
		isLifeSkillFocusAreaOrOptionListOrOutcome,
	)
	const hasLifeSkillsRelatedSyllabus =
		!!syllabus.elements.relatedlifeskillssyllabus.value.length

	const doesCurrentStageHaveLifeSkills = currentStages.includes('life_skills')
	const linkedItems = {
		...pageResponseLinkedItems,
		...(focusAreaResponse?.linkedItems || {}),
	}

	if (isStage6Syl) {
		let years: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[] = []

		/**
		 * Add Life Skill "year" accordion if:
		 * 1. the syllabus has life-skills related syllabus, or
		 * 2. the syllabus is a life-skills sylllabus
		 *
		 * and
		 * 3. the "Life skills" stage is selected in the Edit View modal
		 */

		if (!isLifeSkillsSyl && currentStages.includes('stage_6')) {
			years = syllabus.elements.stages__stage_years.value
		}

		if (
			(hasLifeSkillsRelatedSyllabus || isLifeSkillsSyl) &&
			doesCurrentStageHaveLifeSkills
		) {
			years = [...years, TAXO_TERM_LIFE_SKILLS]
		}

		return (
			<>
				<h2 className="mb-8">{title}</h2>
				{years.map((year) => {
					const eachStage: TaxoStageWithLifeSkill =
						year.codename === 'life_skills'
							? year.codename
							: 'stage_6'

					const contentFocusAreas = focusAreas.filter((fa) => {
						return year.codename === 'life_skills'
							? isLifeSkillFocusAreaOrOptionListOrOutcome(fa)
							: fa.elements.stages__stage_years.value
									.map(byTaxoCodename)
									.some((sy) => sy === year.codename)
					})

					const yearTitle =
						year.codename === 'life_skills'
							? year.name
							: `Year ${year.name}`

					return (
						<CustomAccordion
							key={year.codename}
							id={syllabus.system.codename + '_' + year.codename}
							title={yearTitle}
							startOpen={
								years.length === 1 ||
								year.codename === initialYearCodename
							}
							TransitionProps={{ timeout: 0 }}
						>
							{contentFocusAreas?.length ? (
								<WrapperWithInView>
									{(topInView) => {
										return (
											<InView>
												{({ ref, inView }) => {
													return (
														<>
															<Content
																ref={ref}
																syllabus={
																	syllabus
																}
																stages={
																	allStages
																}
																linkedItems={
																	linkedItems
																}
																stageId={
																	eachStage
																}
																yearId={
																	year.codename
																}
																supportElementId={
																	syllabus
																		.system
																		.id
																}
																focusAreasOrOptionList={convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
																	contentFocusAreas,
																	syllabus,
																)}
																files={syllabusAssets.filter(
																	(asset) => {
																		// if life skills
																		if (
																			year.codename ===
																			'life_skills'
																		) {
																			/**
																			 * Return only asset which has taxo syllabus intersect with
																			 * related syllabus
																			 */
																			if (
																				isLifeSkillsSyl
																			) {
																				return asset.stage.some(
																					(
																						s,
																					) =>
																						s.codename ===
																						'stage_6',
																				)
																			}

																			return isIntersect(
																				relatedLifeSkillsSyllabuses.flatMap(
																					(
																						syllabus,
																					) =>
																						syllabus.elements.syllabus.value.map(
																							byTaxoCodename,
																						),
																				),
																				asset.syllabus.map(
																					byTaxoCodename,
																				),
																			)
																		}
																		return getTaxoCodenamesFromTaxoTerms(
																			asset.stage_year,
																		).includes(
																			year.codename,
																		)
																	},
																)}
																initialState={
																	currentOptions
																}
																initialStageCodename={
																	initialStageCodename
																}
																initialYearCodename={
																	initialYearCodename
																}
																lifeSkillsInfoForFocusArea={
																	syllabus
																		.elements
																		.lifeskills_info_focusareas
																}
																hideToggleParallelContent
																hideToggleViewLifeSkills={
																	!hasLifeSkillsRelatedSyllabus ||
																	year.codename ===
																		'life_skills'
																}
																isFocusAreaNavigateInView={
																	isFocusAreaNavigateInView
																}
															/>
															{enableContentCurrentlyViewing && (
																<Spring
																	from={{
																		opacity: 0,
																	}}
																	to={{
																		opacity:
																			!topInView &&
																			inView
																				? 1
																				: 0,
																	}}
																>
																	{(styles) =>
																		inView && (
																			<animated.div
																				style={
																					styles
																				}
																			>
																				<CurrentViewing
																					syllabus={
																						syllabus
																							.elements
																							.title
																							.value
																					}
																					year={
																						yearTitle
																					}
																				></CurrentViewing>
																			</animated.div>
																		)
																	}
																</Spring>
															)}
														</>
													)
												}}
											</InView>
										)
									}}
								</WrapperWithInView>
							) : (
								<p>No content for selected stage(s)</p>
							)}
						</CustomAccordion>
					)
				})}
			</>
		)
	}

	return (
		<>
			{<h2 className="mb-8">{title}</h2>}{' '}
			{filteredAndSortedCurrentStages?.length ? (
				filteredAndSortedCurrentStages
					?.filter((stage) => {
						// if it's life skills, a syllabus needs to have life skills focus areas
						if (stage === 'life_skills') {
							return hasLifeSkillsFocusAreas
						}

						return syllabus.elements.stages__stages.value
							.map(byTaxoCodename)
							.some((s) => s === stage)
					})
					.map((eachStage) => {
						const isStageLifeSkill = eachStage === 'life_skills'
						const isCurrentStage4Or5Or6 =
							eachStage === 'stage_4' ||
							eachStage === 'stage_5' ||
							eachStage === 'stage_6'
						const contentFocusAreas = focusAreas.filter((fa) => {
							if (isStageLifeSkill)
								return isLifeSkillFocusAreaOrOptionListOrOutcome(
									fa,
								)
							const filter = getFnIsItemHasStage(eachStage)
							return filter(fa)
						})

						const disabled = isStageLifeSkill
							? !hasLifeSkillsFocusAreas
							: !focusAreas.some(
									getFnIsItemHasStage(eachStage as TaxoStage),
							  )

						const Component =
							currentStages.length === 1
								? Fragment
								: CustomAccordion

						return (
							<Component
								key={eachStage}
								id={syllabus.system.codename + '_' + eachStage}
								title={
									allStages.find(
										(s) => s.codename === eachStage,
									)?.name
								}
								startOpen={eachStage === initialStageCodename}
								disabled={disabled}
								TransitionProps={{ timeout: 0 }}
							>
								{contentFocusAreas?.length ? (
									<WrapperWithInView>
										{(topInView) => {
											return (
												<InView>
													{({ ref, inView }) => {
														return (
															<>
																<Content
																	ref={ref}
																	syllabus={
																		syllabus
																	}
																	stages={
																		allStages
																	}
																	linkedItems={
																		linkedItems
																	}
																	stageId={
																		eachStage
																	}
																	supportElementId={
																		syllabus
																			.system
																			.id
																	}
																	focusAreasOrOptionList={convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
																		contentFocusAreas,
																		syllabus,
																	)}
																	files={syllabusAssets.filter(
																		(
																			asset,
																		) => {
																			if (
																				eachStage ===
																				'life_skills'
																			) {
																				return true
																			}

																			return getTaxoCodenamesFromTaxoTerms(
																				asset.stage,
																			).includes(
																				eachStage as TaxoStage,
																			)
																		},
																	)}
																	initialState={
																		currentOptions
																	}
																	initialStageCodename={
																		initialStageCodename
																	}
																	lifeSkillsInfoForFocusArea={
																		syllabus
																			.elements
																			.lifeskills_info_focusareas
																	}
																	hideToggleViewLifeSkills={
																		!isCurrentStage4Or5Or6
																	}
																	outcomes={
																		allOutcomes
																	}
																	isFocusAreaNavigateInView={
																		isFocusAreaNavigateInView
																	}
																/>
																{enableContentCurrentlyViewing && (
																	<Spring
																		from={{
																			opacity: 0,
																		}}
																		to={{
																			opacity:
																				!topInView &&
																				inView
																					? 1
																					: 0,
																		}}
																	>
																		{(
																			styles,
																		) =>
																			inView && (
																				<animated.div
																					style={
																						styles
																					}
																				>
																					<CurrentViewing
																						syllabus={
																							syllabus
																								.elements
																								.title
																								.value
																						}
																						stage={
																							allStages?.find(
																								(
																									s,
																								) =>
																									s.codename ===
																									eachStage,
																							)
																								?.name
																						}
																					></CurrentViewing>
																				</animated.div>
																			)
																		}
																	</Spring>
																)}
															</>
														)
													}}
												</InView>
											)
										}}
									</WrapperWithInView>
								) : (
									<p>No content for selected stage(s)</p>
								)}
							</Component>
						)
					})
			) : (
				<p>No content for all stages</p>
			)}
		</>
	)
}
