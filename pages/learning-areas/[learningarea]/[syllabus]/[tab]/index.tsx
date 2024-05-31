import { getOutcomesWithRelatedSyllabusOutcomes } from '@/components/SyllabusView'
import SyllabusViewNew from '@/components/SyllabusViewNew'
import { AssetsProvider } from '@/components/contexts/AssetsProvider'
import * as SyllabusTabPages from '@/components/syllabus-tabs'
import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import {
	Glossary,
	Syllabus,
	Weblinkext,
	Weblinkvideo,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoKeyLearningArea,
	TaxoStage,
	TaxoStageGroup,
} from '@/kontent/taxonomies'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import {
	getAllItemsByType,
	getCachedAssets,
	getItemByCodename,
	getSiteMappings,
	loadWebsiteConfig,
} from '@/lib/api'
import { NextPageGetLayout, NextPageWithLayout } from '@/pages/_app'
import {
	CommonPageProps,
	CustomSyllabusTab,
	KontentCurriculumCommonResultData,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import {
	byTaxoCodename,
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	excludeAceGlossaries,
	filterPreviewableSyllabusesOnly,
	getLinkedItems,
	getSlugByCodename,
	getSyllabusElements,
	getWebLinkWithoutAce,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	isShowPublished,
	redirectToHome,
	uniquePrimitiveArray,
} from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import { optimiseAssetWithRawElementsJson } from '@/utils/optimise-json'
import {
	getStaticPropsForRedirectToDefaultFocusArea,
	getSyllabusesResponsesToDetermineDefaultFocusArea,
	isLifeSkillSyllabus,
	isStage6Syllabus,
} from '@/utils/syllabus'
import {
	ElementModels,
	Elements,
	IContentItem,
	IContentItemElements,
	Responses,
} from '@kontent-ai/delivery-sdk'
import {
	GetStaticPaths,
	GetStaticProps,
	GetStaticPropsContext,
	InferGetStaticPropsType,
	PreviewData,
} from 'next'
import { CommonSyllabusPathParams } from './[stage]/[...afterStageSlugs]'

const SyllabusTabPage: NextPageWithLayout = (
	props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
	const SyllabusTabComp =
		SyllabusTabPages[props.params.tab.replace(/-/g, '_')].default

	return (
		<AssetsProvider assets={props.data.assets}>
			<SyllabusTabComp {...props} />
		</AssetsProvider>
	)
}

export type CommonContentTab<T extends IContentItem<IContentItemElements>> =
	KontentCurriculumCommonResultData<T> & {
		syllabus: Responses.IViewContentItemResponse<Syllabus>
		focusArea?: Responses.IViewContentItemResponse<FocusareaOrOptionListOrFocusareoptionExtended>
		years?: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[]
		defaultFocusAreaUrls?: Record<
			TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill,
			string
		>
		webLinkVideos?: Responses.IListContentItemsResponse<Weblinkvideo>
		webLinkExternals?: Responses.IListContentItemsResponse<Weblinkext>
		disabledStages?: Elements.TaxonomyElement<TaxoStage>
		stageOrYears?: ElementModels.TaxonomyTerm<
			TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill
		>[]
	}

export type RecordFocusAreaPaths = Record<string, { syllabusPaths: string[] }>

export const getStaticPaths: GetStaticPaths = async () => {
	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 0,
		preview: false,
		allFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
					value: ['no'],
			  },
		elementsParameter: [
			contentTypes.syllabus.elements.key_learning_area__items.codename,
			contentTypes.syllabus.elements.doredirect.codename,
			contentTypes.syllabus.elements.allowpreview.codename,
		],
	})

	const paths = syllabusResponse.items
		.filter(filterPreviewableSyllabusesOnly)
		.flatMap((syllabus) => {
			const { key_learning_area__items } = syllabus.elements

			return SYLLABUS_TABS.flatMap((tab) => {
				return key_learning_area__items.value.flatMap(
					(keyLearningArea) => {
						return {
							params: {
								learningarea: getSlugByCodename(
									keyLearningArea.codename,
								),
								syllabus: getSlugByCodename(
									syllabus.system.codename,
								),
								tab:
									tab.id === 'course-overview'
										? 'overview'
										: tab.id,
							},
						}
					},
				)
			})
		})

	return {
		paths: [],
		fallback: 'blocking',
	}
}

const getStageYearsOfStage6Syllabus = (syllabus: Syllabus) => {
	const isStage6Syl = isStage6Syllabus(syllabus)
	if (!isStage6Syl) {
		return []
	}

	const currentStages: TaxoStageWithLifeSkill[] = [
		...syllabus.elements.stages__stages.value.map(byTaxoCodename),
		'life_skills',
	]
	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)

	const hasLifeSkillsRelatedSyllabus =
		!!syllabus.elements.relatedlifeskillssyllabus.value.length
	const doesCurrentStageHaveLifeSkills = currentStages.includes('life_skills')
	let stagesOrYears: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[] =
		[]

	/**
	 * Add Life Skill "year" accordion if:
	 * 1. the syllabus has life-skills related syllabus, or
	 * 2. the syllabus is a life-skills sylllabus
	 *
	 * and
	 * 3. the "Life skills" stage is selected in the Edit View modal
	 */

	if (!isLifeSkillsSyl && currentStages.includes('stage_6')) {
		stagesOrYears = syllabus.elements.stages__stage_years.value
	}

	if (
		(hasLifeSkillsRelatedSyllabus || isLifeSkillsSyl) &&
		doesCurrentStageHaveLifeSkills
	) {
		stagesOrYears = [...stagesOrYears, TAXO_TERM_LIFE_SKILLS]
	}
	return stagesOrYears
}

export const getCommonSyllabusData = async <
	TContextParams extends CommonSyllabusPathParams = CommonSyllabusPathParams,
	TContext extends GetStaticPropsContext<TContextParams> = GetStaticPropsContext<TContextParams>,
>(
	context: TContext,
) => {
	const { params, preview, previewData } = context
	const { syllabus: syllabusSlug, stage: stageSlug } = params
	let tab = params.tab === 'overview' ? 'course-overview' : params.tab
	const _tab =
		SYLLABUS_TABS.find((t) => t.id === tab)?.id || 'course-overview'

	const isGetPreviewContent = !isShowPublished(previewData) && preview

	let [
		config,
		mappings,
		syllabusesResponse,
		syllabusResponse,
		glossariesResponse,
	] = await Promise.all([
		loadWebsiteConfig(isGetPreviewContent),
		getSiteMappings(isGetPreviewContent),
		getAllItemsByType<Syllabus>({
			type: 'syllabus',
			depth: 0,
			elementsParameter: [
				contentTypes.syllabus.elements.title.codename,
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.key_learning_area_default
					.codename,
				contentTypes.syllabus.elements.syllabus.codename,
				contentTypes.syllabus.elements.doredirect.codename,
				contentTypes.syllabus.elements.allowpreview.codename,
				contentTypes.syllabus.elements.languages.codename,
			],
			allFilter: isAllowPreviewExternalSyllabus()
				? null
				: {
						element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
						value: ['no'],
				  },
			preview,
		}),
		getItemByCodename<Syllabus>({
			codename: (syllabusSlug as string).replace(/-/g, '_'),
			preview,
			depth: _tab === 'assessment' ? 5 : 2,
			elementsParameter: getSyllabusElements([_tab]).filter((field) => {
				if (_tab === 'content' && !stageSlug) {
					return [
						contentTypes.syllabus.elements.seo_description_overview
							.codename,
						contentTypes.syllabus.elements.seo_description_support
							.codename,
						contentTypes.syllabus.elements.seo_description_aim
							.codename,
						contentTypes.syllabus.elements
							.seo_description_assessment.codename,
						contentTypes.syllabus.elements.seo_description_content
							.codename,
						contentTypes.syllabus.elements.seo_description_glossary
							.codename,
						contentTypes.syllabus.elements.seo_description_outcomes
							.codename,
						contentTypes.syllabus.elements.seo_description_overview
							.codename,
						contentTypes.syllabus.elements.seo_description_rationale
							.codename,
						contentTypes.syllabus.elements.seo_description_support
							.codename,

						contentTypes.syllabus.elements.relatedlifeskillssyllabus
							.codename,
						contentTypes.syllabus.elements.stages__stages.codename,
						contentTypes.syllabus.elements.stages__stage_years
							.codename,
						contentTypes.syllabus.elements.implementation_title
							.codename,
						contentTypes.syllabus.elements.implementation_info
							.codename,
						contentTypes.syllabus.elements.implementation_summary
							.codename,
						contentTypes.syllabus.elements.syllabus.codename,
						contentTypes.syllabus.elements.title.codename,
						contentTypes.syllabus.elements.description.codename,
					].includes(field)
				}
				return true
			}),
		}),
		getAllItemsByType<Glossary>({
			type: 'glossary',
			preview,
			depth: 0,
		}),
	])

	if (!syllabusResponse) return null

	let webLinkVideos: Responses.IListContentItemsResponse<Weblinkvideo>
	let webLinkExternals: Responses.IListContentItemsResponse<Weblinkext>

	const relatedLifeSkillSyllabuses = getLinkedItems(
		syllabusResponse.item.elements.relatedlifeskillssyllabus,
		syllabusResponse.linkedItems,
	)

	if (_tab === 'teaching-and-learning') {
		const [_webLinkVideos, _webLinkExternals] = await Promise.all([
			getAllItemsByType<Weblinkvideo>({
				type: contentTypes.weblinkvideo.codename,
				preview,
				containsFilter: {
					element: `elements.${contentTypes.weblinkvideo.elements.syllabus.codename}`,
					value: syllabusResponse.item.elements.syllabus.value.map(
						byTaxoCodename,
					),
				},
			}),
			getAllItemsByType<Weblinkext>({
				type: contentTypes.weblinkext.codename,
				preview,
				containsFilter: {
					element: `elements.${contentTypes.weblinkext.elements.syllabus.codename}`,
					value: syllabusResponse.item.elements.syllabus.value.map(
						byTaxoCodename,
					),
				},
			}),
		])
		webLinkVideos = _webLinkVideos
		webLinkExternals = _webLinkExternals
	}
	if (_tab === 'outcomes') {
		// for outcomes tab, if the syllabus is a life-skills syllabus, we need to fetch the related syllabus
		// and get the focus areas from those syllabuses as well

		const isLifeSkillsSyl = isLifeSkillSyllabus(syllabusResponse.item)
		if (isLifeSkillsSyl) {
			// fetch all the syllabuses that are related to the current syllabus
			const parentSyllabusOfLifeskillsSyl =
				await getAllItemsByType<Syllabus>({
					type: 'syllabus',
					preview,
					containsFilter: {
						element: `elements.${contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename}`,
						value: [syllabusResponse.item.system.codename],
					},
					elementsParameter: getSyllabusElements([_tab]),
					depth: 2,
				})

			// include the focus areas of the related syllabuses
			syllabusResponse.item.elements.focus_areas.value =
				uniquePrimitiveArray([
					...syllabusResponse.item.elements.focus_areas.value,
					...parentSyllabusOfLifeskillsSyl.items.flatMap(
						(syl) => syl.elements.focus_areas.value,
					),
				])
			syllabusResponse.linkedItems = {
				...syllabusResponse.linkedItems,
				...parentSyllabusOfLifeskillsSyl.linkedItems,
			}
		} else if (
			isStage6Syllabus(syllabusResponse.item) &&
			syllabusResponse.item.elements.relatedlifeskillssyllabus.value
				?.length
		) {
			const currentStages: TaxoStageWithLifeSkill[] = [
				...syllabusResponse.item.elements.stages__stages.value.map(
					byTaxoCodename,
				),
				'life_skills',
			]

			const outcomes = getOutcomesWithRelatedSyllabusOutcomes(
				syllabusResponse.item,
				currentStages,
				syllabusResponse.linkedItems,
			)

			syllabusResponse.item.elements.outcomes.value =
				uniquePrimitiveArray([
					...syllabusResponse.item.elements.outcomes.value,
					...outcomes.map((outcome) => outcome.system.codename),
				])

			syllabusResponse.item.elements.focus_areas.value =
				uniquePrimitiveArray([
					...syllabusResponse.item.elements.focus_areas.value,
					...relatedLifeSkillSyllabuses.flatMap(
						(relatedLsSyl) =>
							relatedLsSyl.elements.focus_areas.value,
					),
				])
		}
	}
	const disabledStages = config.item.elements.disabled_stages
	const syllabus = syllabusResponse.item

	const taxoSyllabusesOfSyllabusAndRelatedSyllabuses = [
		...syllabus.elements.syllabus.value.map(byTaxoCodename),
		...(relatedLifeSkillSyllabuses?.flatMap((relatedSyllabus) =>
			relatedSyllabus.elements.syllabus.value.map(byTaxoCodename),
		) || []),
	]

	let _assets = await getCachedAssets(isGetPreviewContent)

	const assets =
		_assets
			?.filter((asset) => {
				return (
					asset.syllabus.some((taxoSyl) => {
						return taxoSyllabusesOfSyllabusAndRelatedSyllabuses.includes(
							taxoSyl.codename,
						)
					}) &&
					asset.resource_type.length &&
					asset.resource_type.every(
						(rt) => !rt.codename.includes('ace_'),
					)
				)
			})
			.map(optimiseAssetWithRawElementsJson) || []

	const stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[] = [
		...(convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		) as ElementModels.TaxonomyTerm<TaxoStage>[]),
		TAXO_TERM_LIFE_SKILLS,
	]

	const years = getStageYearsOfStage6Syllabus(syllabus)

	const stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage_group,
		)
	const keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)

	const defaultFocusAreaUrls = await getDefaultFocusAreaUrls(
		stages,
		years,
		syllabus,
		disabledStages,
		context,
	)

	return {
		config,
		mappings,
		syllabusesResponse,
		syllabusResponse,
		syllabus,
		disabledStages,
		stages,
		years,
		stageGroups,
		keyLearningAreas,
		assets,
		glossariesResponse: excludeAceGlossaries(glossariesResponse),
		webLinkExternals: webLinkExternals
			? getWebLinkWithoutAce(webLinkExternals)
			: undefined,
		webLinkVideos: webLinkVideos
			? getWebLinkWithoutAce(webLinkVideos)
			: undefined,
		defaultFocusAreaUrls,
	}
}

export const getStagesOrYearsBasedOnSyllabusAndDisabledStages = (
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
	years: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[],
	disabledStages: Elements.TaxonomyElement<TaxoStage>,
	syllabus: Syllabus,
) => {
	const yearsOrStages: ElementModels.TaxonomyTerm<
		TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill
	>[] = years.length ? years : stages.length ? stages : []

	const _yearsOfStages = yearsOrStages.filter((stageOrYear) => {
		if (stageOrYear.codename === 'life_skills') {
			return isIntersect(
				['stage_4', 'stage_5', 'stage_6'],
				syllabus.elements.stages__stages.value.map(byTaxoCodename),
			)
		}

		if (
			disabledStages.value
				.map(byTaxoCodename)
				.includes(stageOrYear.codename as TaxoStage)
		) {
			return false
		}

		return [
			...syllabus.elements.stages__stage_years.value,
			...syllabus.elements.stages__stages.value,
		]
			.map(byTaxoCodename)
			.includes(stageOrYear.codename as TaxoStage)
	})

	return _yearsOfStages
}

export const getDefaultFocusAreaUrls = async (
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
	years: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[],
	syllabus: Syllabus,
	disabledStages: Elements.TaxonomyElement<TaxoStage>,
	context: GetStaticPropsContext<CommonSyllabusPathParams, PreviewData>,
): Promise<CommonContentTab<any>['defaultFocusAreaUrls']> => {
	const _yearsOfStages = getStagesOrYearsBasedOnSyllabusAndDisabledStages(
		stages,
		years,
		disabledStages,
		syllabus,
	)

	const syllabusResponses =
		await getSyllabusesResponsesToDetermineDefaultFocusArea(
			syllabus.system.codename,
			context.preview,
			context.params.stage,
		)

	const _defaultFocusAreaUrls = await Promise.all(
		_yearsOfStages.map(async (stageOrYear) => {
			const { redirect } =
				await getStaticPropsForRedirectToDefaultFocusArea(
					{
						...context,
						params: {
							...context.params,
							stage: getSlugByCodename(stageOrYear.codename),
						},
					},
					syllabusResponses,
				)
			return {
				stageOrYearId: stageOrYear.codename,
				defaultFocusAreaUrl: redirect.destination,
			}
		}),
	)

	return _defaultFocusAreaUrls.reduce((curr, acc) => {
		return {
			...curr,
			[acc.stageOrYearId]: acc.defaultFocusAreaUrl,
		}
	}, {} as CommonContentTab<any>['defaultFocusAreaUrls'])
}

export const redirectToOverview = (params: CommonSyllabusPathParams) => {
	return {
		redirect: {
			destination: `/learning-area/${params.learningarea}/${params.syllabus}/overview`,
			permanent: false,
		},
	}
}

export const getStaticProps: GetStaticProps<
	CommonPageProps<
		Syllabus,
		CommonContentTab<Syllabus>,
		CommonSyllabusPathParams
	>,
	CommonSyllabusPathParams
> = async (context) => {
	const { params, preview } = context
	const { tab: tabSlug } = params
	const _tab = SYLLABUS_TABS.find((t) => {
		if (tabSlug === 'overview') return t.id === 'course-overview'
		return t.id === tabSlug
	})?.id

	if (!_tab) {
		return redirectToOverview(params)
	}

	const {
		config,
		mappings,
		syllabusesResponse,
		syllabusResponse,
		stages,
		years,
		stageGroups,
		keyLearningAreas,
		assets,
		glossariesResponse,
		webLinkExternals,
		webLinkVideos,
		defaultFocusAreaUrls,
		disabledStages,
	} = (await getCommonSyllabusData(context)) || {}

	if (!syllabusResponse) {
		return redirectToHome()
	}
	if (!syllabusResponse.item) {
		return redirectToOverview(params)
	}

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
			syllabuses: {
				...syllabusesResponse,
				items: syllabusesResponse.items.filter(
					filterPreviewableSyllabusesOnly,
				),
			},
			syllabus: syllabusResponse,
			focusArea: null,
			stages,
			years,
			stageGroups,
			keyLearningAreas,
			glossaries: _tab === 'glossary' ? glossariesResponse : null,
			assets: (
				['teaching-and-learning', 'assessment'] as CustomSyllabusTab[]
			).includes(_tab)
				? assets
				: [],
			webLinkExternals,
			webLinkVideos,
			defaultFocusAreaUrls,
			disabledStages,
		},
	}

	return {
		props: {
			rootLayoutClassName: 'max-w-none mx-0 px-0 !pt-0',
			...cleanJson(_props),
		},
	}
}

export const getLayout: NextPageGetLayout = (
	page,
	serverRouter,
	pageProps: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>,
) => {
	if (serverRouter.isFallback) return <>Fallback...</>
	if (pageProps?.data) {
		const {
			config,
			syllabuses,
			keyLearningAreas,
			stages,
			syllabus,
			focusArea,
		} = pageProps.data
		return (
			<SyllabusViewNew
				config={config}
				mappings={pageProps.mappings}
				linkedItems={{
					...syllabus.linkedItems,
					...(focusArea?.linkedItems || {}),
				}}
				syllabus={syllabus.item}
				allSyllabuses={syllabuses}
				allKeyLearningAreas={keyLearningAreas}
				allStages={stages}
				preview={pageProps.preview}
			>
				{page}
			</SyllabusViewNew>
		)
	}
	return <>{page}</>
}

SyllabusTabPage.getLayout = getLayout

export default SyllabusTabPage
