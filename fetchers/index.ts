import {
	getFocusAreasWithRelatedSyllabusFocusAreas,
	getOutcomesWithRelatedSyllabusOutcomes,
} from '@/components/SyllabusView'
import {
	Focusarea,
	Optionslist,
	Outcome,
	Syllabus,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { TaxoStageWithLifeSkill } from '@/types'
import {
	byIContentItemCodename,
	getLinkedItems,
	getSyllabusElements,
} from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { IContentItem, Responses } from '@kontent-ai/delivery-sdk'

const commonFetcher = async <TResponse>(url) => {
	const { json, ok } = await commonFetch<TResponse, any>(url, undefined, {
		method: 'GET',
	})

	if (!ok) {
		throw new Error('Network error')
	}

	return json
}

export const fetchOutcomesByTaxoSyllabuses = (
	taxonomySyllabusesCommaSeparated: string,
) =>
	commonFetcher<Responses.IListContentItemsResponse<Outcome>>(
		`/api/items?type=${contentTypes.outcome.codename}&any.element=elements.syllabus&any.value=${taxonomySyllabusesCommaSeparated}&depth=1`,
	)

export const fetchOutcomesBySyllabus = async (
	syllabusCodename: string,
	currentStages?: TaxoStageWithLifeSkill[],
	includeRelatedSyllabusOutcomes = false,
	elements = [...getSyllabusElements(['outcomes'])],
	depth = 2,
) => {
	const json = await commonFetcher<
		Responses.IViewContentItemResponse<Syllabus>
	>(
		`/api/item?codename=${syllabusCodename}&fields=${elements}&depth=${depth}`,
	)

	const { item, linkedItems } = json

	const outcomes = includeRelatedSyllabusOutcomes
		? getOutcomesWithRelatedSyllabusOutcomes(
				item,
				currentStages,
				linkedItems,
		  )
		: getLinkedItems(item.elements.outcomes, linkedItems)

	return {
		items: outcomes,
		linkedItems,
	} as Responses.IListContentItemsResponse<Outcome>
}

export const fetchFocusareaAndOptionListByTaxoSyllabuses = async (
	taxonomySyllabusesCommaSeparated: string,
	depth = 0,
	elements = getSyllabusElements(['content']),
) => {
	const focusAreas = await commonFetcher<
		Responses.IListContentItemsResponse<Focusarea>
	>(
		`/api/items?type=${contentTypes.focusarea.codename}&fields=${elements}&any.element=elements.syllabus&any.value=${taxonomySyllabusesCommaSeparated}&depth=${depth}`,
	)

	const optionList = await commonFetcher<
		Responses.IListContentItemsResponse<Optionslist>
	>(
		`/api/items?type=${contentTypes.optionslist.codename}&any.element=elements.syllabus&any.value=${taxonomySyllabusesCommaSeparated}&depth=${depth}`,
	)

	return {
		items: [...focusAreas.items, ...optionList.items],
		linkedItems: {
			...focusAreas.linkedItems,
			...optionList.linkedItems,
		},
	} as Responses.IListContentItemsResponse<Focusarea>
}

export const fetchFocusareasBySyllabus = async (
	syllabusCodename: string,
	includeRelatedSyllabusFocusareas = false,
	elements = [...getSyllabusElements(['content'])],
	depth = 2,
) => {
	const [json, json2] = await Promise.all([
		commonFetcher<Responses.IViewContentItemResponse<Syllabus>>(
			`/api/item?codename=${syllabusCodename}&fields=${elements}&depth=${depth}`,
		),
		commonFetcher<Responses.IListContentItemsResponse<Syllabus>>(
			`/api/items?type=syllabus&fields=${elements}&any.element=elements.relatedlifeskillssyllabus&any.value=${syllabusCodename}&depth=2`,
		),
	])

	let { item, linkedItems } = json

	if (
		includeRelatedSyllabusFocusareas &&
		!item.elements.relatedlifeskillssyllabus.value.length
	) {
		// added related (not-skill syllabus) into releatedlifeskillssyllabus, for LS syllabus to have reference of its MS syllabus
		item.elements.relatedlifeskillssyllabus.value = json2.items.map(
			byIContentItemCodename,
		)
		linkedItems = {
			...json2.items.reduce((acc, curr) => {
				return {
					...acc,
					[curr.system.codename]: curr,
				}
			}, {}),
			...json2.linkedItems,
			...linkedItems,
		}
	}

	const focusAreas = includeRelatedSyllabusFocusareas
		? getFocusAreasWithRelatedSyllabusFocusAreas(item, linkedItems)
		: getLinkedItems(item.elements.focus_areas, linkedItems)

	return {
		items: focusAreas,
		linkedItems,
	} as Responses.IListContentItemsResponse<Focusarea>
}

export const fetchFocusareaOrOptionslist = async (
	focusareaOroptionlistCodename: string,
	depth = 3,
	elements = [...getSyllabusElements(['content'])],
) => {
	if (!focusareaOroptionlistCodename) {
		return null
	}
	const [focusAreaResponse] = await Promise.all([
		commonFetcher<
			Responses.IViewContentItemResponse<Focusarea | Optionslist>
		>(
			`/api/item?codename=${focusareaOroptionlistCodename}&fields=${elements}&depth=${depth}`,
		),
	])

	return focusAreaResponse
}

export const fetchSyllabus = (
	syllabusCodename: string,
	elements,
	depth = 3,
) => {
	if (!syllabusCodename) {
		return null
	}
	return commonFetcher<Responses.IViewContentItemResponse<Syllabus>>(
		`/api/item?codename=${syllabusCodename}&fields=${elements}&depth=${depth}`,
	)
}
export const fetchItemByCodename = <T extends IContentItem>(
	codename,
	elements = '',
	depth = 0,
) => {
	if (!codename) return null
	return commonFetcher<Responses.IViewContentItemResponse<T>>(
		`/api/item?codename=${codename}${
			elements ? `&fields=${elements}` : ''
		}&depth=${depth}`,
	)
}
export const fetchItemsByTaxoSyllabuses = <T extends IContentItem>(
	type: string,
	taxoSyllabuses: string,
	elements = '',
	depth = 0,
) => {
	if (!type || !taxoSyllabuses) return null
	return commonFetcher<Responses.IListContentItemsResponse<T>>(
		`/api/items?type=${type}${
			elements ? `&fields=${elements}` : ''
		}&any.element=elements.syllabus&any.value=${taxoSyllabuses}&depth=${depth}`,
	)
}
