import { Focusarea, Syllabus, Teachingadvice } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import {
	getAllItemsByType,
	getItemByCodename,
	getSiteMappings,
} from '@/lib/api'
import { QS_SHOW } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]/[stage]/[...afterStageSlugs]'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { ExtendedTeachingAdvice } from '@/types/customKontentTypes'
import {
	byTaxoCodename,
	fnExist,
	getLinkedItems,
	getSlugByCodename,
	getSortedStageByTaxoTerms,
	redirectToHome,
} from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import {
	getSortedFocusAreasBySyllabusTypeItem,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import { getSyllabusUrlFromMappingBySyllabusCodename } from '@/utils/getSyllabusUrlFromMapping'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { isLifeSkillSyllabus } from '@/utils/syllabus'
import { isFocusarea } from '@/utils/type_predicates'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { stringify } from 'qs'
import { ParsedUrlQuery } from 'querystring'

export interface TeachingAdviceLinkResult {
	url: string
}

export interface TeachingAdviceLinkParams extends ParsedUrlQuery {
	slug: string[]
}

export default function TeachingAdviceLinkPage() {
	return null
}

export const fetchPageApiTeachingAdviceLink = async ({
	codename,
	stage,
	year,
}: {
	codename: string
	stage?: string
	year?: string
}) => {
	let paths = [codename, stage, year].filter(fnExist).join('/')

	const { ok, json } = await commonFetch<
		CommonPageAPIType<TeachingAdviceLinkResult>,
		null
	>(
		`${PAGE_API_BASE_PATH}/page-api/teaching-advice-link/${paths}.json`,
		null,
		{
			method: 'GET',
		},
	)

	if (ok) {
		return json
	}
}

export const getStaticPaths: GetStaticPaths<
	TeachingAdviceLinkParams
> = async () => {
	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 2,
		elementsParameter: [
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.focusarea.elements.teachingadvice.codename,
			contentTypes.teachingadvice.elements.stages__stages.codename,
			contentTypes.teachingadvice.elements.stages__stage_years.codename,
		],
		allFilter: {
			element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
			value: ['no'],
		},
		preview: false,
	})

	const teachingAdvices = syllabusResponse.items
		.flatMap((syllabus) => {
			const focusAreas = getLinkedItems(
				syllabus.elements.focus_areas,
				syllabusResponse.linkedItems,
			)
			return (
				focusAreas?.filter(isFocusarea).flatMap((focusArea) => {
					return getLinkedItems(
						focusArea.elements.teachingadvice,
						syllabusResponse.linkedItems,
					)
				}) || []
			)
		})
		.filter(fnExist)

	const paths: GetStaticPathsResult<TeachingAdviceLinkParams>['paths'] = [
		...teachingAdvices.map((advice) => {
			return {
				params: {
					slug: [advice.system.codename],
				},
			}
		}),
		...teachingAdvices.flatMap((advice) => {
			return advice.elements.stages__stages.value
				.map(byTaxoCodename)
				.flatMap((stage) => {
					return {
						params: {
							slug: [advice.system.codename, stage],
						},
					}
				})
		}),
		...teachingAdvices.flatMap((advice) => {
			return advice.elements.stages__stages.value
				.map(byTaxoCodename)
				.flatMap((stage) => {
					return advice.elements.stages__stage_years.value
						.map(byTaxoCodename)
						.flatMap((year) => {
							return {
								params: {
									slug: [advice.system.codename, stage, year],
								},
							}
						})
				})
		}),
	]

	return {
		paths: [],
		fallback: 'blocking',
	}
}

const setStageOrYear = <
	T extends
		| TaxoStageWithLifeSkill
		| TaxoStageYearWithLifeSkill = TaxoStageWithLifeSkill,
>(
	adviceStagesOrYears: ElementModels.TaxonomyTerm<T>[],
	slugStageOrYear?: string,
	isYear?: boolean,
) => {
	const adviceStagesSorted = isYear
		? adviceStagesOrYears
		: getSortedStageByTaxoTerms(
				adviceStagesOrYears as ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
		  )
	if (slugStageOrYear) {
		return adviceStagesSorted.some((s) => s.codename === slugStageOrYear)
			? slugStageOrYear
			: isYear
			? ''
			: adviceStagesSorted[0].codename
	}
	return isYear ? '' : adviceStagesSorted[0].codename
}

export const getStaticProps: GetStaticProps<
	TeachingAdviceLinkResult,
	TeachingAdviceLinkParams
> = async ({ params, preview }) => {
	const { slug } = params

	// /page-api/teaching-advice-link/[codename]/[stage]/[year]
	const [codename, slugStage, slugYear] = slug

	const [response, mappings] = await Promise.all([
		getItemByCodename<Teachingadvice>({
			codename,
			depth: 0,
			preview,
		}),
		getSiteMappings(preview),
	])

	if (!response) {
		return redirectToHome()
	}

	const _advice = response.item

	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 2,
		containsFilter: {
			element: `elements.${contentTypes.syllabus.elements.syllabus.codename}`,
			value: _advice.elements.syllabus.value.map(byTaxoCodename),
		},
		elementsParameter: [
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.focusarea.elements.teachingadvice.codename,
		],
		preview,
	})

	const adviceSyllabus = syllabusResponse?.items?.[0]
	const syllabusCodename = adviceSyllabus?.system.codename
	const syllabusFocusAreas = getLinkedItems(
		adviceSyllabus.elements.focus_areas,
		syllabusResponse.linkedItems,
	).filter((fa) => isFocusarea(fa)) as Focusarea[]

	const adviceFocusArea = getSortedFocusAreasBySyllabusTypeItem(
		syllabusFocusAreas,
	).find((focusArea: Focusarea) => {
		return getLinkedItems(
			focusArea.elements.teachingadvice,
			syllabusResponse.linkedItems,
		).some((item: Teachingadvice) => item.system.id === _advice.system.id)
	})

	if (!adviceFocusArea || !adviceSyllabus) {
		return redirectToHome()
	}

	const advice: ExtendedTeachingAdvice = {
		..._advice,
		focusArea: adviceFocusArea,
		syllabus: adviceSyllabus,
	}

	// the mapping of the path is
	const pathname = getSyllabusUrlFromMappingBySyllabusCodename(
		mappings,
		syllabusCodename,
		true,
		true,
	)
	const isAdviceSyllabusLifeSkill = adviceSyllabus
		? isLifeSkillSyllabus(adviceSyllabus)
		: false
	const isAdviceFocusAreaLifeSkill = advice.focusArea
		? isLifeSkillFocusAreaOrOptionListOrOutcome(advice.focusArea)
		: false

	const adviceStages = advice.elements.stages__stages.value.length
		? advice.elements.stages__stages.value
		: advice.focusArea.elements.stages__stages.value

	const adviceYears = advice.elements.stages__stage_years.value.length
		? advice.elements.stages__stage_years.value
		: advice.focusArea.elements.stages__stage_years.value

	// Stage
	let stage = setStageOrYear(adviceStages, slugStage)

	// Year
	let year = slugYear ? setStageOrYear(adviceYears, slugYear, true) : ''

	// for life skills
	if (isAdviceSyllabusLifeSkill && isAdviceFocusAreaLifeSkill) {
		stage = 'life_skills'
		year = 'life_skills'
	}

	const queryStr = stringify({
		show: QS_SHOW.ADVICE,
	})

	const pathSlugs = [
		'content',
		year || stage,
		advice.focusArea.system.codename,
	].map(getSlugByCodename)

	const url =
		pathname + '/' + pathSlugs.join('/') + (queryStr ? `?${queryStr}` : '')

	return {
		props: {
			url,
		},
	}
}
