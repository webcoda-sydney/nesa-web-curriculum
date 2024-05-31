import { useMetaDescriptionSyllabus } from '@/components/SyllabusViewNew'
import { StageOrYearContentAccordion } from '@/components/syllabus-tabs/Content'
import { STAGE_YEARS, YEARS } from '@/constants'
import { useQueryStringByRouterOrWindow } from '@/hooks/useQueryStringByRouterOrWindow'
import {
	Focusarea,
	Focusareaoption,
	Optionslist,
	Syllabus,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies } from '@/kontent/project/taxonomies'
import { TaxoStageYear } from '@/kontent/taxonomies'
import Content, {
	ContentOrganizerProps,
} from '@/legacy-ported/components/syllabus/Content'
import { getUrlFromFocusArea } from '@/legacy-ported/components/syllabus/ContentSideNav'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import { getAllItemsByType, getItemByCodename } from '@/lib/api'
import { NextPageGetLayout, getTitleWithSuffix } from '@/pages/_app'
import {
	CommonPageProps,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import {
	byIContentItemCodename,
	byTaxoCodename,
	filterPreviewableSyllabusesOnly,
	fnExist,
	getCodenameBySlug,
	getLinkedItems,
	getSlugByCodename,
	getSyllabusElements,
	getTaxoCodenamesFromTaxoTerms,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	isYes,
	uniquePrimitiveArray,
} from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import {
	convertToFocusareasOrOptionListOrFocusareaoptionsExtended,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import {
	getStageAndYearCodenamesFromStageOrYearSlug,
	hasLifeSkillRelatedSyllabus,
	isLifeSkillSyllabus,
	isStage6Syllabus,
} from '@/utils/syllabus'
import {
	isFocusarea,
	isFocusareaoption,
	isOptionList,
	isWebLinkVideo,
	isWebLinkext,
} from '@/utils/type_predicates'
import {
	ElementModels,
	IContentItemsContainer,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { useQueryState } from 'next-usequerystate'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { useMemo } from 'react'
import {
	CommonContentTab,
	RecordFocusAreaPaths,
	getCommonSyllabusData,
	getStagesOrYearsBasedOnSyllabusAndDisabledStages,
	getLayout as getTabLayout,
} from '..'

type ContentStageFocusAreaPageResultData =
	CommonContentTab<FocusareaOrOptionListOrFocusareoptionExtended> & {
		stageFocusAreas: FocusareaOrOptionListOrFocusareoptionExtended[]
		stageOrYears: ElementModels.TaxonomyTerm<
			TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill
		>[]
	}

type ContentStageFocusAreaPageProps = CommonPageProps<
	Syllabus,
	ContentStageFocusAreaPageResultData
> & {
	showExamples?: boolean
}

const getYearOrStageTitle = (stageId, yearId) => {
	if (yearId === 'life_skills' || stageId === 'life_skills')
		return 'Life Skills'

	if (yearId) {
		return `Year ${taxonomies.stage_year.terms[yearId]?.name}`
	}
	if (stageId) {
		return taxonomies.stage.terms[stageId]?.name
	}
	return ''
}

export const QS_SHOW = {
	ADVICE: 'advice',
	EXAMPLE: 'example',
	ACCESS_CONTENT_POINTS: 'accesscontent',
	VIEW_LIFE_SKILLS: 'ls',
	CURRICULUM_CONNECTION: 'cc',
}

export const useShowAndTaScrollQueryString = () => {
	const [qsShow] = useQueryState('show')
	const [qsTaScroll] = useQueryState('ta_scroll')
	const showSplit = (qsShow || '')?.split(',')
	const showTeachingAdvice = showSplit?.includes(QS_SHOW.ADVICE)
	const showExamples = showSplit?.includes(QS_SHOW.EXAMPLE)
	const showAccessContentPoints = showSplit?.includes(
		QS_SHOW.ACCESS_CONTENT_POINTS,
	)
	const taScroll = qsTaScroll !== 'no'
	const showCurriculumConnection = showSplit?.includes(
		QS_SHOW.CURRICULUM_CONNECTION,
	)

	return {
		showTeachingAdvice,
		showExamples,
		showAccessContentPoints,
		taScroll,
		showCurriculumConnection,
	}
}

export const getFocusAreaCanonicalUrl = ({
	focusArea,
	syllabusResponse,
	currentStage,
	currentYear,
}: {
	focusArea: FocusareaOrOptionListOrFocusareoptionExtended

	// Focus area's syllabus
	syllabusResponse: Responses.IViewContentItemResponse<Syllabus>

	// Current stage
	currentStage: TaxoStageWithLifeSkill

	// Current year
	currentYear: TaxoStageYearWithLifeSkill
}) => {
	const isFocusareaLifeSkill =
		isLifeSkillFocusAreaOrOptionListOrOutcome(focusArea)
	let stage = currentStage
	let year = currentYear

	// check whether its syllabus has related life skills syllabus or is life skills syllabus
	let syllabusCodename = getSlugByCodename(
		syllabusResponse.item.system.codename,
	)
	if (isLifeSkillSyllabus(syllabusResponse.item) || isFocusareaLifeSkill) {
		stage = 'life_skills'
		year = 'life_skills'
	}

	if (
		syllabusResponse.item.elements.relatedlifeskillssyllabus.value.length &&
		isFocusareaLifeSkill
	) {
		syllabusCodename = getSlugByCodename(
			syllabusResponse.item.elements.relatedlifeskillssyllabus.value[0],
		)
	}

	const href = getUrlFromFocusArea(focusArea, syllabusCodename, stage, year)

	return href
}

export default function ContentStageFocusAreaPage({
	params,
	data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	const {
		focusArea: focusAreaOrOptionlist,
		syllabus: syllabusResponse,
		stageFocusAreas,
		assets,
		config,
	} = data
	const syllabus = syllabusResponse.item
	const isStage6Syl = isStage6Syllabus(syllabus)
	const isLifeSkillSyl = isLifeSkillSyllabus(syllabus)
	const stageOrYearId = getCodenameBySlug(
		params.stage,
	) as TaxoStageWithLifeSkill

	const { query } = useRouter()

	const isParamStage_stage =
		stageOrYearId === 'life_skills' ||
		Object.keys(STAGE_YEARS).includes(stageOrYearId)
	const isParamStage_year =
		stageOrYearId === 'life_skills' ||
		YEARS.map((y) => y.codename).includes(stageOrYearId as TaxoStageYear)

	const hasLifeSkillRelatedSyl = hasLifeSkillRelatedSyllabus(syllabus)

	const isCurrentStage4Or5Or6 =
		stageOrYearId === 'stage_4' ||
		stageOrYearId === 'stage_5' ||
		isStage6Syl

	const {
		showAccessContentPoints,
		showExamples,
		showTeachingAdvice,
		taScroll,
		showCurriculumConnection,
	} = useShowAndTaScrollQueryString()

	const { state: langs } = useQueryStringByRouterOrWindow('langs', '', true)
	const { state: paths } = useQueryStringByRouterOrWindow('paths', '', true)

	const initialState = useMemo<ContentOrganizerProps['initialState']>(() => {
		return {
			teachingSupport: showTeachingAdvice,
			examples: showExamples,
			accessPoints: showAccessContentPoints,
			taScroll,
			focusAreaOption: getCodenameBySlug(
				query.afterStageSlugs?.[1] || params.afterStageSlugs?.[1] || '',
			),
			langs,
			pathways: paths,
			curriculumConnection: showCurriculumConnection,
		}
	}, [
		showAccessContentPoints,
		showExamples,
		showTeachingAdvice,
		taScroll,
		params.afterStageSlugs,
		query,
		langs,
		paths,
		showCurriculumConnection,
	])

	const stageId = useMemo(() => {
		if (isParamStage_stage) {
			return stageOrYearId
		} else {
			if (isStage6Syl) {
				return 'stage_6'
			}
			if (isLifeSkillSyl) {
				return 'life_skills'
			}
		}
		return undefined
	}, [isLifeSkillSyl, isParamStage_stage, isStage6Syl, stageOrYearId])

	const yearId = useMemo<TaxoStageYearWithLifeSkill>(() => {
		if (isParamStage_year) {
			return stageOrYearId as TaxoStageYearWithLifeSkill
		}
		return undefined
	}, [isParamStage_year, stageOrYearId])

	const stageOrYearTitle = getYearOrStageTitle(stageId, yearId)
	const metaDescription = useMetaDescriptionSyllabus({
		syllabus,
		syllabusTab: SYLLABUS_TABS.find((t) => t.id === 'content'),
		stage: stageOrYearTitle,
		focusAreaOrOptionlist: focusAreaOrOptionlist.item,
	})

	return (
		<>
			<Head>
				<title>
					{getTitleWithSuffix(
						`${syllabus.elements.title.value} - ${stageOrYearTitle} - ${focusAreaOrOptionlist.item.elements.title.value}`,
						config,
					)}
				</title>
				<meta name="robots" content="noindex,nofollow" />
				<meta name="description" content={metaDescription} />
				<link
					key="canonical"
					rel="canonical"
					href={getFocusAreaCanonicalUrl({
						focusArea: focusAreaOrOptionlist.item,
						syllabusResponse,
						currentStage: stageId,
						currentYear: yearId,
					})}
				/>
			</Head>
			<Content
				linkedItems={Object.assign(
					syllabusResponse.linkedItems,
					focusAreaOrOptionlist.linkedItems,
				)}
				stages={
					focusAreaOrOptionlist.item.elements.stages__stages
						.value as ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
				}
				stageId={stageId}
				yearId={yearId}
				supportElementId=""
				syllabus={syllabus}
				focusAreasOrOptionList={stageFocusAreas}
				files={assets}
				hideToggleViewLifeSkills={
					(isStage6Syl && !hasLifeSkillRelatedSyl) ||
					params.stage === 'life-skills' ||
					!isCurrentStage4Or5Or6
				}
				initialState={initialState}
				lifeSkillsInfoForFocusArea={
					syllabus.elements.lifeskills_info_focusareas
				}
				initialStageCodename={stageId}
				initialYearCodename={yearId}
				focusAreaResponse={focusAreaOrOptionlist}
			></Content>
		</>
	)
}

export type CommonSyllabusPathParams = ParsedUrlQuery & {
	learningarea: string
	syllabus: string
	tab?: string
	stage?: string
	afterStageSlugs?: string[]
}

export type ReturnTypeOfGetStaticProps = CommonPageProps<
	Syllabus,
	ContentStageFocusAreaPageResultData,
	CommonSyllabusPathParams
>

const getLifeSkillStages = (
	obj: Focusarea | Optionslist | Focusareaoption,
	syllabus: Syllabus,
	linkedItems: IContentItemsContainer,
) => {
	const isStage6Syl = isStage6Syllabus(syllabus)
	const isLifeSkillFA = isLifeSkillFocusAreaOrOptionListOrOutcome(obj)
	if (!isLifeSkillFA)
		return syllabus.elements.stages__stages.value.flatMap(byTaxoCodename)

	const relatedMainstreamFAs =
		(isFocusarea(obj) || isFocusareaoption(obj)) &&
		obj.elements.related_focusareas?.value?.length
			? getLinkedItems(obj.elements.related_focusareas, linkedItems)
			: [obj]

	// if no related mainstream FAs & not stage 6, return 4/5 and life skills
	if (!isStage6Syl) {
		return ['stage_4', 'stage_5', 'life_skills'] as TaxoStageWithLifeSkill[]
	}

	return [
		'life_skills',
		...(relatedMainstreamFAs?.flatMap((fa) => {
			const faYearsOrStages = (
				isStage6Syl
					? fa.elements.stages__stage_years.value
					: fa.elements.stages__stages.value
			).flatMap(byTaxoCodename)

			return faYearsOrStages
		}) || []),
	] as TaxoStageWithLifeSkill[]
}

export const getStaticPaths: GetStaticPaths = async () => {
	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 2,
		preview: false,
		elementsParameter: [
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.syllabus.elements.key_learning_area__items.codename,
			contentTypes.syllabus.elements.stages__stages.codename,
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename,
			contentTypes.syllabus.elements.doredirect.codename,
			contentTypes.syllabus.elements.allowpreview.codename,
			contentTypes.focusarea.elements.syllabus_type__items.codename,
			contentTypes.focusarea.elements.stages__stages.codename,
			contentTypes.focusarea.elements.stages__stage_years.codename,
			contentTypes.focusarea.elements.syllabus.codename,
			contentTypes.optionslist.elements.focus_area_options.codename,
		],
		allFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
					value: ['no'],
			  },
	})

	const previewableSyllabusesOnly = syllabusResponse.items.filter(
		filterPreviewableSyllabusesOnly,
	)

	const syllabusPathsByFocusAreaCodename = previewableSyllabusesOnly.reduce(
		(acc, syllabus) => {
			const { focus_areas } = syllabus.elements

			let relatedLsSyllabuses =
				syllabus.elements.relatedlifeskillssyllabus.value || []
			if (!relatedLsSyllabuses.length) {
				relatedLsSyllabuses = previewableSyllabusesOnly
					.filter((syl) =>
						syl.elements.relatedlifeskillssyllabus.value.includes(
							syllabus.system.codename,
						),
					)
					.map((syl) => syl.system.codename)
			}

			const syllabusPaths = [
				syllabus.system.codename,
				...relatedLsSyllabuses,
			].map(getSlugByCodename)

			focus_areas.value.forEach((fa) => {
				acc[fa] = {
					syllabusPaths,
				}
			})
			return acc
		},
		{} as RecordFocusAreaPaths,
	)

	const focusAreasOrOptionslist = previewableSyllabusesOnly.flatMap(
		(syllabus) => {
			return getLinkedItems(
				syllabus.elements.focus_areas,
				syllabusResponse.linkedItems,
			)
		},
	)

	const paths = focusAreasOrOptionslist
		.flatMap((focusAreaOrOptionslist) => {
			const _isOptionList = isOptionList(focusAreaOrOptionslist)

			// syllabus path for the focus area
			const { syllabusPaths } =
				syllabusPathsByFocusAreaCodename[
					focusAreaOrOptionslist.system.codename
				]

			return syllabusPaths.flatMap((syllabusPath) => {
				// syllabus for the focus area
				const syllabus = syllabusResponse.items.find(
					(_syllabus) =>
						_syllabus.system.codename ===
						getCodenameBySlug(syllabusPath),
				)
				if (!syllabus) return null

				const isStage6Syl = isStage6Syllabus(syllabus)

				let lifeSkillFaStages =
					isFocusarea(focusAreaOrOptionslist) ||
					isOptionList(focusAreaOrOptionslist)
						? getLifeSkillStages(
								focusAreaOrOptionslist,
								syllabus,
								syllabusResponse.linkedItems,
						  )
						: []

				const stagesOrYears = uniquePrimitiveArray([
					...(isStage6Syl
						? focusAreaOrOptionslist.elements.stages__stage_years.value.flatMap(
								byTaxoCodename,
						  )
						: focusAreaOrOptionslist.elements.stages__stages.value.flatMap(
								byTaxoCodename,
						  )),
					...lifeSkillFaStages,
				]).filter(
					(stageOrYearCodename) => stageOrYearCodename != 'stage_6',
				)

				return stagesOrYears.filter(fnExist).flatMap((stageOrYear) => {
					// if it's a life skill focus area

					return syllabus.elements.key_learning_area__items.value.flatMap(
						(keyLearningArea) => {
							if (_isOptionList) {
								return focusAreaOrOptionslist.elements.focus_area_options.value.map(
									(optionCodename) => {
										return {
											params: {
												learningarea: getSlugByCodename(
													keyLearningArea.codename,
												),
												syllabus: syllabusPath,
												tab: 'content',
												stage: getSlugByCodename(
													stageOrYear,
												),
												afterStageSlugs: [
													focusAreaOrOptionslist
														.system.codename,
													optionCodename,
												].map(getSlugByCodename),
											},
										}
									},
								)
							}

							return [
								{
									params: {
										learningarea: getSlugByCodename(
											keyLearningArea.codename,
										),
										syllabus: syllabusPath,
										tab: 'content',
										stage: getSlugByCodename(stageOrYear),
										afterStageSlugs: [
											getSlugByCodename(
												focusAreaOrOptionslist.system
													.codename,
											),
										],
									},
								},
							]
						},
					)
				})
			})
		})
		.filter(fnExist)

	return {
		paths: [],
		fallback: 'blocking',
	}
}

export const getStageOrYearFocusAreas = (
	syllabuses: Syllabus[], //for stage 6 expect syllabus with related life skills syllabus
	stage: TaxoStageWithLifeSkill,
	year: TaxoStageYearWithLifeSkill | '',
	linkedItems: IContentItemsContainer, //for stage 6 expect syllabus with related life skills syllabus
	isStage6Syl = false,
	mainFocusArea?: Focusarea | Optionslist, //i.e. focus area page LHS
) => {
	const isMainFocusAreaLifeSkill =
		isLifeSkillFocusAreaOrOptionListOrOutcome(mainFocusArea)

	return syllabuses
		?.flatMap((syl) => {
			const _focusAreas = getLinkedItems(
				syl.elements.focus_areas,
				linkedItems,
			)
			const filteredFocusAreas = _focusAreas.filter(fnExist)

			return convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
				filteredFocusAreas,
				syl,
			)
		})
		.filter(fnExist)
		.filter((item) => {
			const isLifeSkillFocusArea =
				isLifeSkillFocusAreaOrOptionListOrOutcome(item)

			if (stage === 'life_skills' || year === 'life_skills') {
				return isLifeSkillFocusArea
			}

			const isFocusAreaWithinStage = item.elements.stages__stages?.value
				.map(byTaxoCodename)
				.includes(stage)
			const isFocusAreaWithinYear =
				item.elements.stages__stage_years?.value
					.map(byTaxoCodename)
					.includes(year as TaxoStageYear)

			if (isStage6Syl && stage === 'stage_6' && year) {
				// if mainFocusArea specified and is life skill focus area, return only life skill focus area within year
				if (mainFocusArea && isMainFocusAreaLifeSkill) {
					return isFocusAreaWithinYear && isMainFocusAreaLifeSkill
				}
				return isFocusAreaWithinYear
			}
			// if mainFocusArea specified and is life skill focus area, return only life skill focus area within stage
			if (mainFocusArea && isMainFocusAreaLifeSkill) {
				return isFocusAreaWithinStage && isMainFocusAreaLifeSkill
			}
			return isFocusAreaWithinStage
		})
		.sort((a, b) => {
			const isLifeSkillA = isLifeSkillFocusAreaOrOptionListOrOutcome(a)
			const isLifeSkillB = isLifeSkillFocusAreaOrOptionListOrOutcome(b)

			// mainstream first then life skills
			if (isLifeSkillA && !isLifeSkillB) return 1
			if (!isLifeSkillA && isLifeSkillB) return -1
			return 0
		})
}

export const getStaticProps: GetStaticProps<
	ReturnTypeOfGetStaticProps,
	CommonSyllabusPathParams
> = async (context) => {
	const { params, preview } = context
	const {
		learningarea: learningAreaSlug,
		syllabus: syllabusSlug,
		stage: stageOrYearSlug,
		afterStageSlugs,
	} = params
	const [focusAreaSlug] = afterStageSlugs

	const {
		config,
		keyLearningAreas,
		mappings,
		syllabusesResponse,
		syllabusResponse,
		stageGroups,
		stages,
		years,
		syllabus,
		assets,
		defaultFocusAreaUrls,
		disabledStages,
	} = await getCommonSyllabusData(context)

	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)
	const isStage6Syl = isStage6Syllabus(syllabus)
	const hasLifeSkillRelatedSyl = hasLifeSkillRelatedSyllabus(syllabus)

	const focusareaCodename = getCodenameBySlug(focusAreaSlug as string)
	const { stageCodename, yearCodename } =
		getStageAndYearCodenamesFromStageOrYearSlug(
			syllabusResponse,
			stageOrYearSlug as TaxoStageWithLifeSkill,
		)
	let syllabusCodename = getCodenameBySlug(syllabusSlug)

	const focusAreaElements = uniquePrimitiveArray([
		// Focus area
		contentTypes.focusarea.elements.outcomes.codename,
		contentTypes.focusarea.elements.stages__stages.codename,
		contentTypes.focusarea.elements.stages__stage_years.codename,
		contentTypes.focusarea.elements.contentgroups.codename,
		contentTypes.focusarea.elements.accesspointgroups.codename,
		contentTypes.focusarea.elements.syllabus_type__items.codename,
		contentTypes.focusarea.elements.content.codename,
		contentTypes.focusarea.elements.teachingadvice.codename,
		contentTypes.focusarea.elements.title.codename,
		contentTypes.focusarea.elements.content_staged.codename,
		contentTypes.focusarea.elements.related_focusareas.codename,
		contentTypes.focusarea.elements.syllabus.codename,
		contentTypes.focusarea.elements.seo_description.codename,
		contentTypes.focusarea.elements.accesspointcontent.codename,

		// Focus area - Outcomes
		contentTypes.outcome.elements.code.codename,
		contentTypes.outcome.elements.description.codename,
		contentTypes.outcome.elements.isoverarching.codename,

		// Focus area - Content groups
		contentTypes.contentgroup.elements.content_items.codename,
		contentTypes.contentgroup.elements.stages__stages.codename,
		contentTypes.contentgroup.elements.stages__stage_years.codename,
		contentTypes.contentgroup.elements.content_staged.codename,
		contentTypes.contentgroup.elements.title.codename,
		contentTypes.contentgroup.elements.content.codename,
		contentTypes.contentgroup.elements.chps_links.codename,

		// Focus area - Content groups - Content item
		contentTypes.contentitem.elements.including_statements.codename,
		contentTypes.contentitem.elements.learningprogression_tags__literacy
			.codename,
		contentTypes.contentitem.elements.learningprogression_tags__numeracy
			.codename,
		contentTypes.contentitem.elements.examples_lang.codename,
		contentTypes.contentitem.elements.pathway__pathway.codename,

		// Focus area - Access point groups
		contentTypes.accesscontentgroup.elements.title.codename,
		contentTypes.accesscontentgroup.elements.stages__stages.codename,
		contentTypes.accesscontentgroup.elements.stages__stage_years.codename,
		contentTypes.accesscontentgroup.elements.access_content_items.codename,

		// Focus area - Access point groups - Access content items
		contentTypes.accesscontentitem.elements.title.codename,
		contentTypes.accesscontentitem.elements.examples.codename,

		// Focus area - Teaching advice
		contentTypes.teachingadvice.elements.resources.codename,

		// Focus area - content richtext elements
		contentTypes.contentrichtext.elements.content.codename,
		contentTypes.contentrichtext.elements.stages.codename,
		contentTypes.contentrichtext.elements.stage_years.codename,

		// Options list
		contentTypes.optionslist.elements.focus_area_options.codename,

		// Web link focus area
		contentTypes.web_link_contentgroup.elements.item.codename,
		contentTypes.web_link_contentgroup.elements.stages__stage_years
			.codename,
		contentTypes.web_link_contentgroup.elements.stages__stages.codename,
		contentTypes.web_link_contentgroup.elements.syllabus.codename,
		contentTypes.web_link_contentgroup.elements.title.codename,

		// Content lang
		contentTypes.content_langexample.elements.language.codename,

		// for links_placeholder_cc & links_placeholder_overarching
		contentTypes.links_placeholder_cc.elements.links.codename,
		contentTypes.links_placeholder_overarching.elements.links.codename,
	])

	// if syllabus is stage 6 syllabus and has related life skills syllabus, use related life skills syllabus
	let [
		_focusAreaOrOptionListResponse,
		syllabusFocusAreaResponse,
		_syllabusResponse,
	] = await Promise.all([
		getItemByCodename<Focusarea | Optionslist>({
			codename: focusareaCodename,
			preview,
			depth: 3,
			elementsParameter: focusAreaElements,
		}),
		getAllItemsByType<Syllabus>({
			type: contentTypes.syllabus.codename,
			inFilter: {
				element: 'system.codename',
				value:
					isStage6Syl &&
					hasLifeSkillRelatedSyl &&
					stageOrYearSlug === 'life-skills'
						? syllabus.elements.relatedlifeskillssyllabus.value
						: [
								syllabusCodename,
								...syllabus.elements.relatedlifeskillssyllabus
									.value,
						  ],
			},
			preview,
			depth: 2,
			elementsParameter: uniquePrimitiveArray([
				// Syllabus
				contentTypes.syllabus.elements.focus_areas.codename,
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.has_examples.codename,
				contentTypes.syllabus.elements.has_examples_in.codename,
				contentTypes.syllabus.elements.pathways.codename,
				...focusAreaElements,
			]),
		}),
		getItemByCodename<Syllabus>({
			codename: (syllabusSlug as string).replace(/-/g, '_'),
			preview,
			depth: 1,
			elementsParameter: getSyllabusElements(['content']),
		}),
	])

	if (!_focusAreaOrOptionListResponse?.item) {
		return {
			redirect: {
				destination: `/learning-area/${learningAreaSlug}/${syllabusSlug}/content/${stageOrYearSlug}`,
				permanent: false,
			},
		}
	}

	const focusAreaOrOptionList = _focusAreaOrOptionListResponse.item
	const _isFocusArea = isFocusarea(focusAreaOrOptionList)

	const relatedLifeSkillsSyllabuses =
		getLinkedItems(
			syllabus.elements.relatedlifeskillssyllabus,
			syllabusResponse.linkedItems,
		) || []
	const stageFocusAreas = getStageOrYearFocusAreas(
		syllabusFocusAreaResponse.items,
		stageCodename,
		yearCodename,
		syllabusFocusAreaResponse.linkedItems,
		isStage6Syl,
		focusAreaOrOptionList,
	)
	const focusAreaOutcomes = _isFocusArea
		? getLinkedItems(
				focusAreaOrOptionList.elements.outcomes,
				_focusAreaOrOptionListResponse.linkedItems,
		  )
		: []

	const stageOverarchingOutcomes = _isFocusArea
		? syllabusFocusAreaResponse.items.flatMap((focusArea) => {
				const outcomes = getLinkedItems(
					focusArea.elements.outcomes,
					syllabusFocusAreaResponse.linkedItems,
				)
				return outcomes.filter((outcome) =>
					isYes(outcome.elements.isoverarching),
				)
		  })
		: []

	const stageFocusAreaOutcomes = _isFocusArea
		? [
				...stageOverarchingOutcomes,
				...focusAreaOutcomes?.filter((outcome) => {
					if (isYes(outcome.elements.isoverarching)) return true
					if (stageCodename === 'life_skills') {
						return isLifeSkillFocusAreaOrOptionListOrOutcome(
							outcome,
						)
					}

					return outcome.elements.stages__stages.value
						.map(byTaxoCodename)
						.includes(stageCodename)
				}),
		  ]
		: []

	const stageFocusAreaOutcomesCodenames = stageFocusAreaOutcomes.map(
		byIContentItemCodename,
	)

	const _props: InferGetStaticPropsType<typeof getStaticProps> = {
		mappings,
		preview: !!preview,
		previewData: null,
		params: {
			...params,
			slug: ['learning-areas', params.learningarea, params.syllabus],
		},
		data: {
			config,
			pageResponse: null,
			syllabuses: syllabusesResponse,
			stages,
			years,
			stageGroups,
			keyLearningAreas,
			glossaries: null,
			assets: assets
				.filter(
					(asset) => !(isWebLinkVideo(asset) || isWebLinkext(asset)),
				)
				.filter((asset) => {
					// if life skills
					if (stageCodename === 'life_skills') {
						/**
						 * Return only asset which has taxo syllabus intersect with
						 * related syllabus
						 */
						if (isLifeSkillsSyl) {
							return asset.stage.some(
								(s) => s.codename === 'stage_6',
							)
						}

						return relatedLifeSkillsSyllabuses?.length
							? isIntersect(
									relatedLifeSkillsSyllabuses.flatMap(
										(syllabus) =>
											syllabus.elements.syllabus.value.map(
												byTaxoCodename,
											),
									),
									asset.syllabus.map(byTaxoCodename),
							  )
							: true
					}

					const assetYears = getTaxoCodenamesFromTaxoTerms(
						asset.stage_year,
					)

					const currentPageYears = yearCodename
						? [yearCodename]
						: STAGE_YEARS[stageCodename]

					return isIntersect(assetYears, currentPageYears)
				}),
			stageFocusAreas,
			syllabus: _syllabusResponse,
			focusArea: {
				..._focusAreaOrOptionListResponse,
				item: {
					...focusAreaOrOptionList,
					elements: {
						...focusAreaOrOptionList.elements,
						outcomes:
							focusAreaOrOptionList.elements && _isFocusArea
								? {
										...focusAreaOrOptionList.elements
											.outcomes,
										value: stageFocusAreaOutcomesCodenames,
								  }
								: undefined,
						focus_area_options:
							focusAreaOrOptionList && !_isFocusArea
								? {
										...focusAreaOrOptionList.elements
											.focus_area_options,
								  }
								: undefined,
						key_learning_area__items:
							syllabus.elements.key_learning_area__items,
					},
				},
			} as unknown as Responses.IViewContentItemResponse<FocusareaOrOptionListOrFocusareoptionExtended>,
			defaultFocusAreaUrls,
			disabledStages,
			stageOrYears: getStagesOrYearsBasedOnSyllabusAndDisabledStages(
				stages,
				years,
				disabledStages,
				syllabusResponse.item,
			),
		},
	}

	const cleanProps = cleanJson(_props)

	return {
		props: {
			rootLayoutClassName: 'max-w-none mx-0 px-0 !pt-0',
			...cleanProps,
		},
	}
}

export const getContentStageLayout: NextPageGetLayout = (
	page,
	serverRouter,
	pageProps: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>,
) => {
	if (serverRouter.isFallback) return <>Fallback...</>

	const { params, data } = pageProps || {}
	const { stageOrYears } = data || {}

	return getTabLayout(
		<StageOrYearContentAccordion
			params={params}
			stagesOrYears={stageOrYears}
			defaultFocusAreaPerStageOrYear={data.defaultFocusAreaUrls}
		>
			{page}
		</StageOrYearContentAccordion>,
		serverRouter,
		pageProps,
	)
}

const getLayout: NextPageGetLayout = (
	page,
	serverRouter,
	pageProps: ContentStageFocusAreaPageProps,
) => {
	if (serverRouter.isFallback) return <>Fallback...</>
	return getContentStageLayout(page, serverRouter, pageProps)
}

ContentStageFocusAreaPage.getLayout = getLayout
