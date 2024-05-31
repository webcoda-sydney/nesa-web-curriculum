import { STAGE_YEARS } from '@/constants'
import { Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { TaxoStageYear } from '@/kontent/taxonomies'
import { getAllItemsByType, getItemByCodename } from '@/lib/api'
import { getStageOrYearFocusAreas } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]/[stage]/[...afterStageSlugs]'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import {
	getCodenameBySlug,
	getLinkedItems,
	getSlugByCodename,
	isAllowPreviewExternalSyllabus,
	isYes,
	redirectToHome,
} from '@/utils'
import { IContentItemsContainer, Responses } from '@kontent-ai/delivery-sdk'
import { GetStaticPropsContext } from 'next'
import { compareValueWithMultipleChoiceCodename } from '..'
import { isLifeSkillFocusAreaOrOptionListOrOutcome } from '../focusarea'
import { isFocusarea, isOptionList } from '../type_predicates'

export const isStage6Syllabus = (syllabus: Syllabus) =>
	syllabus.elements.stages__stages.value.some((s) => s.codename === 'stage_6')

export const isLifeSkillSyllabus = (syllabus: Syllabus) =>
	compareValueWithMultipleChoiceCodename(
		syllabus.elements.syllabus_type__items,
		'life_skills',
	)
export const hasLifeSkillFocusAreasOnSyllabus = (
	syllabus: Syllabus,
	linkedItems: IContentItemsContainer,
) => {
	const focusAreas = getLinkedItems(
		syllabus.elements.focus_areas,
		linkedItems,
	)
	const hasLifeSkillFocusArea = focusAreas
		?.filter(isFocusarea)
		?.some(isLifeSkillFocusAreaOrOptionListOrOutcome)
	return hasLifeSkillFocusArea
}

export const hasLifeSkillRelatedSyllabus = (syllabus: Syllabus) =>
	!!syllabus.elements?.relatedlifeskillssyllabus?.value?.length

export const getStageCodenameFromStageSlug = (
	syllabusResponse: Responses.IViewContentItemResponse<Syllabus>,
	slug: string,
): TaxoStageWithLifeSkill => {
	const { item: _syllabus, linkedItems } = syllabusResponse
	const isStage6Syl = isStage6Syllabus(_syllabus)
	const hasLifeSkillSyl = hasLifeSkillFocusAreasOnSyllabus(
		_syllabus,
		linkedItems,
	)
	const codename = getCodenameBySlug(slug)
	if (
		codename === 'life_skills' ||
		Object.values(STAGE_YEARS)
			.flatMap((y) => y)
			.includes(codename as TaxoStageYear)
	) {
		if (hasLifeSkillSyl || isStage6Syl) {
			return codename === 'life_skills' ? codename : 'stage_6'
		}
	}
	return codename as TaxoStageWithLifeSkill
}

export const getYearCodenameFromStageSlug = (
	syllabusResponse: Responses.IViewContentItemResponse<Syllabus>,
	slug: string,
): TaxoStageYearWithLifeSkill | '' => {
	const { item: _syllabus, linkedItems } = syllabusResponse
	const isStage6Syl = isStage6Syllabus(_syllabus)
	const hasLifeSkillSyl = hasLifeSkillFocusAreasOnSyllabus(
		_syllabus,
		linkedItems,
	)

	const codename = getCodenameBySlug(slug)
	if (hasLifeSkillSyl) {
		return codename === 'life_skills' ? codename : ''
	}
	if (isStage6Syl) {
		return codename as TaxoStageYearWithLifeSkill
	}
	return ''
}

export const getStageAndYearCodenamesFromStageOrYearSlug = (
	syllabusResponse: Responses.IViewContentItemResponse<Syllabus>,
	slug: string,
) => {
	return {
		stageCodename: getStageCodenameFromStageSlug(syllabusResponse, slug),
		yearCodename: getYearCodenameFromStageSlug(syllabusResponse, slug),
	}
}

const getFocusAreas = (
	syllabusResponse: Responses.IViewContentItemResponse<Syllabus>,
	yearCodename: TaxoStageYearWithLifeSkill | '',
) => {
	const { item: syllabus, linkedItems } = syllabusResponse
	const isStage6Syl = isStage6Syllabus(syllabus)
	const hasLifeSkillRelatedSyl = hasLifeSkillRelatedSyllabus(syllabus)

	if (isStage6Syl) {
		if (yearCodename === 'life_skills' && hasLifeSkillRelatedSyl) {
			const relatedLifeSkillSyllabus = getLinkedItems(
				syllabus.elements.relatedlifeskillssyllabus,
				linkedItems,
			)
			return relatedLifeSkillSyllabus.flatMap((syl) => {
				return getLinkedItems(syl.elements.focus_areas, linkedItems)
			})
		}
	}
	return getLinkedItems(syllabus.elements.focus_areas, linkedItems)
}

export const getSyllabusesResponsesToDetermineDefaultFocusArea = async (
	syllabusCodename: string,
	preview = false,
	stageOrYearSlug: string = '',
) => {
	const syllabusResponse = await getItemByCodename<Syllabus>({
		codename: syllabusCodename,
		preview,
		depth: 0,
	})
	const syllabus = syllabusResponse.item

	const syllabusesResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		inFilter: {
			element: 'system.codename',
			value: [
				syllabusCodename,
				...syllabus.elements.relatedlifeskillssyllabus.value,
			],
		},
		preview,
		depth: 2,
		elementsParameter: [
			// Syllabus
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.syllabus.elements.key_learning_area__items.codename,

			// Syllabus - Focus area
			contentTypes.focusarea.elements.title.codename,
			contentTypes.focusarea.elements.syllabus_type__items.codename,
			contentTypes.focusarea.elements.stages__stages.codename,
			contentTypes.focusarea.elements.stages__stage_years.codename,
			contentTypes.focusarea.elements.outcomes.codename,
			contentTypes.focusarea.elements.contentgroups.codename,
			contentTypes.focusarea.elements.syllabus.codename,
			contentTypes.optionslist.elements.focus_area_options.codename,

			// Syllabus - Focus area - Outcomes
			contentTypes.outcome.elements.code.codename,
			contentTypes.outcome.elements.description.codename,
			contentTypes.outcome.elements.isoverarching.codename,
		],
	})

	return {
		syllabusResponse,
		syllabusesResponse,
	}
}

export const getStaticPropsForRedirectToDefaultFocusArea = async (
	context: GetStaticPropsContext,
	syllabusResponses?: {
		syllabusResponse: Responses.IViewContentItemResponse<Syllabus>
		syllabusesResponse: Responses.IListContentItemsResponse<Syllabus>
	},
) => {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const { params, preview } = context
	const {
		learningarea: learningAreaSlug,
		syllabus: syllabusSlug,
		stage: stageOrYearSlug,
		focusarea: afterStageSlugs,
	} = params

	const [focusAreaSlug] = afterStageSlugs || []

	const syllabusCodename = getCodenameBySlug(syllabusSlug as string)

	const _syllabusResponses =
		syllabusResponses ||
		(await getSyllabusesResponsesToDetermineDefaultFocusArea(
			syllabusCodename,
			preview,
		))
	if (!_syllabusResponses.syllabusResponse.item) {
		return redirectToHome()
	}

	// get the syllabus
	const syllabus = _syllabusResponses.syllabusResponse.item

	const isStage6Syl = isStage6Syllabus(syllabus)
	if (_isAllowPreviewExternalSyllabus) {
		// if allow preview external syllabus, redirect to home if not allow preview and do redirect
		if (
			isYes(syllabus.elements.doredirect) &&
			!isYes(syllabus.elements.allowpreview)
		) {
			return redirectToHome()
		}
	} else {
		// if not allow preview external syllabus, redirect to home if do redirect
		if (isYes(syllabus.elements.doredirect)) {
			return redirectToHome()
		}
	}

	const { stageCodename, yearCodename } =
		getStageAndYearCodenamesFromStageOrYearSlug(
			_syllabusResponses.syllabusResponse,
			stageOrYearSlug as string,
		)

	const focusAreas = getStageOrYearFocusAreas(
		_syllabusResponses.syllabusesResponse.items,
		stageCodename,
		yearCodename,
		_syllabusResponses.syllabusesResponse.linkedItems,
		isStage6Syl,
	)

	const firstFocusArea = focusAreas[0]
	const firstFocusAreaSlug = getSlugByCodename(
		firstFocusArea?.system.codename || '',
	)

	let _focusAreaSlug = focusAreaSlug
	if (firstFocusArea) {
		// focus area slug should take from first focus area's code element or codename
		_focusAreaSlug = firstFocusAreaSlug
	}

	if (!_focusAreaSlug) {
		return redirectToHome()
	}

	let _focusAreaOptionSlug = ''
	if (isOptionList(firstFocusArea)) {
		const firstOptionCodename =
			firstFocusArea.elements.focus_area_options.value[0] || ''
		_focusAreaOptionSlug = `/${getSlugByCodename(firstOptionCodename)}`
	}

	return {
		redirect: {
			destination: `/learning-areas/${learningAreaSlug}/${syllabusSlug}/content/${stageOrYearSlug}/${_focusAreaSlug}${_focusAreaOptionSlug}`,
			permanent: false,
		},
	}
}
