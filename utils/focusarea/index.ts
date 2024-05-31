import { STAGES_WITH_LIFESKILLS } from '@/constants'
import {
	Contentrichtext,
	Focusarea,
	Focusareaoption,
	Optionslist,
	Outcome,
	Syllabus,
} from '@/kontent/content-types'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import { byTaxoCodename, getLinkedItems } from '@/utils'
import { Elements, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import intersection from 'lodash.intersection'
import { vsprintf } from 'sprintf-js'
import {
	compareValueWithMultipleChoiceCodename,
	getSortedStageByTaxoTerms,
	isIntersect,
} from '..'
import { isOptionList } from '../type_predicates'

export const isLifeSkillFocusAreaOrOptionListOrOutcome = (
	item?: Focusarea | Optionslist | Focusareaoption | Outcome,
) => {
	if (!item) return false
	return compareValueWithMultipleChoiceCodename(
		item.elements?.syllabus_type__items,
		'life_skills',
	)
}

export const fnSortFocusAreaFocusAreaBySyllabusTypeItem = (
	a: Focusarea,
	b: Focusarea,
) => {
	const isALifeSkill = compareValueWithMultipleChoiceCodename(
		a.elements.syllabus_type__items,
		'life_skills',
	)
	const isBLifeSkill = compareValueWithMultipleChoiceCodename(
		b.elements.syllabus_type__items,
		'life_skills',
	)
	if (isALifeSkill && !isBLifeSkill) return 1
	if (!isALifeSkill && isBLifeSkill) return -1
	return 0
}

export const getSortedFocusAreasBySyllabusTypeItem = (
	focusAreas: Focusarea[],
) => {
	return focusAreas.sort(fnSortFocusAreaFocusAreaBySyllabusTypeItem)
}

export const getLifeSkillsForStageLabel = (
	object: Focusarea | Outcome | Optionslist | Focusareaoption,
	prefix = 'Life Skills for Stage %s',
	linkedItems?: IContentItemsContainer,
	selectedFocusAreaOptionCodename?: string,
) => {
	const _isOptionList = isOptionList(object)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption = linkedItems[
			selectedFocusAreaOptionCodename
		] as Focusareaoption

		return getLifeSkillsForStageLabel(focusAreaOption, prefix, linkedItems)
	}

	const sortedStages = getSortedStageByTaxoTerms(
		object.elements.stages__stages.value,
	)
	if (sortedStages.length) {
		const highestStage = sortedStages[sortedStages.length - 1].codename
		let stageStr = highestStage.replace(/stage_/, '')
		const stage4AndOr5 = intersection(
			['stage_4', 'stage_5'],
			sortedStages.map(byTaxoCodename),
		)
		if (stage4AndOr5.length) {
			stageStr = stage4AndOr5
				.map((s) => s.replace(/stage_/, ''))
				.join('/')
		}

		return vsprintf(prefix, [stageStr])
	}
	return ''
}

export const getStagedContentBased = (
	obj: Elements.LinkedItemsElement<Contentrichtext>,
	linkedItems: IContentItemsContainer,
	currentStage: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
) => {
	return (
		getLinkedItems(obj, linkedItems)?.filter((stagedContent) => {
			if (currentYear && currentYear !== 'life_skills') {
				return compareValueWithMultipleChoiceCodename(
					stagedContent.elements.stage_years,
					currentYear,
				)
			}
			if (currentStage !== 'life_skills') {
				return compareValueWithMultipleChoiceCodename(
					stagedContent.elements.stages,
					currentStage,
				)
			}
			return isIntersect(
				STAGES_WITH_LIFESKILLS,
				stagedContent.elements.stage_years,
			)
		}) || []
	)
}

export const convertToFocusareasOrOptionListOrFocusareaoptionsExtended = (
	focusAreasOrOptionsList: (Focusarea | Optionslist | Focusareaoption)[],
	syllabus: Syllabus,
) => {
	return focusAreasOrOptionsList.map((fa) => {
		return {
			...fa,
			elements: {
				...fa.elements,
				key_learning_area__items:
					syllabus.elements.key_learning_area__items,
			},
		} as FocusareaOrOptionListOrFocusareoptionExtended
	})
}
