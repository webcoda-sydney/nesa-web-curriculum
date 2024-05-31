import { TaxoStage } from '@/kontent/taxonomies/stage'
import { TaxoStageWithLifeSkill } from '@/types'
import moment from 'moment'
import { ParsedQs, stringify } from 'qs'
import stripTags from 'striptags'
import type { IStage, ISyllabus, RowValue } from './backendTypes'
import type { ImageSize } from './frontendTypes'

export function copyTo<T>(from: Partial<T>, to: T) {
	return {
		...to,
		...from,
	}
}

export function patchList<T>(
	list: T[],
	update: Partial<T> | ((_item: T) => Partial<T>),
	place: number | ((_entry: T) => boolean),
	defaults: T,
) {
	const copy = [...list]

	// Find the index
	let index = -1
	if (typeof place === 'number' && place >= 0 && place < list.length) {
		index = place
	} else if (typeof place === 'function' && copy.find(place)) {
		index = copy.findIndex(place)
	}

	// Get the object to update
	let value: T = defaults
	if (index >= 0) {
		value = copy[index]
	}

	// Update the object
	let changed: T | undefined
	if (typeof update === 'function') {
		changed = copyTo(update(value), value)
	} else {
		changed = copyTo(update, value)
	}

	// Replace the original object with the changed one, or insert if no original
	if (index >= 0) {
		copy[index] = changed
	} else {
		copy.push(changed)
	}

	return copy
}

export function arrayDiff<T>(current: T[], upcoming: T[]) {
	const added: T[] = []
	const removed = current.slice()

	upcoming.forEach((service) => {
		const index = removed.indexOf(service)
		if (index >= 0) {
			removed.splice(index, 1)
		} else if (!added.includes(service)) {
			added.push(service)
		}
	})

	return {
		added,
		removed,
	}
}

export function toPlainArray<T>(rows: RowValue<T>[]) {
	return rows.reduce<T[]>((acc, val) => {
		acc[val.row] = val.value
		return acc
	}, [])
}

export function formatDate(date: Date) {
	const d = moment(date)
	return d.format('D MMM YYYY')
}

export function formatDateFromString(dateStr: string) {
	return formatDate(new Date(dateStr))
}

export function notEmpty<TValue>(
	value: TValue | null | undefined,
): value is TValue {
	return value !== null && value !== undefined
}

/**
 * Toggles the presence of an item in the array, i.e. adds it if it's not present, removes it if it
 * is present.
 * @param array The array of items
 * @param value the value to toggle
 * @return a new array containing the same elements, except with the provided value added or removed
 */
export function arrayToggle<TValue>(array: TValue[], value: TValue) {
	const index = array.indexOf(value)
	if (index >= 0) {
		// Was present, so remove
		const copy = [...array]
		copy.splice(index, 1)
		return copy
	}
	// Was not present, so add
	return [...array, value]
}

/**
 * Toggles the presence of multiple items in the array, i.e. adds any that were not present, and
 * removes any that were
 * @param array The array of items
 * @param values the value to toggle
 * @return a new array containing the same elements, except with the provided value added or removed
 */
export function arrayToggleMultiple<TValue>(array: TValue[], values: TValue[]) {
	return values.reduce(arrayToggle, array)
}

export interface StageWithSyllabusIds {
	stageId: TaxoStage
	syllabusIds: ISyllabus['id'][]
}

/**
 * Custom Syllabus state with Stage and LA passed as separate lists. The resulting selection is
 * the union of these two lists.
 */
export interface CustomSyllabusSplitState {
	stageIds: TaxoStage[] | TaxoStageWithLifeSkill[]
	syllabusIds: ISyllabus['id'][]
	tabIds?: string[]
	tagIds?: string[]
}

/**
 * Custom Syllabus state with Stage and LA passed explicitly as a tree.
 */
export interface CustomSyllabusTreeState {
	stageLearningAreas: StageWithSyllabusIds[]
	tabIds?: string[]
	tagIds?: string[]
}

function isTreeState(
	state: CustomSyllabusSplitState | CustomSyllabusTreeState,
): state is CustomSyllabusTreeState {
	return Object.prototype.hasOwnProperty.call(state, 'stageLearningAreas')
}

export const customSyllabusQueryString = (
	state: CustomSyllabusSplitState | CustomSyllabusTreeState,
) => {
	if (isTreeState(state)) {
		return stringify(state)
	}

	const { stageIds, syllabusIds, tabIds, tagIds } = state

	// const stageLearningAreas = stageIds.map<StageWithSyllabusIds>(
	// 	(stageId) => ({
	// 		stageId,
	// 		syllabusIds,
	// 	}),
	// )

	const queryString = stringify({
		stages: stageIds,
		syllabuses: syllabusIds,
		tabs: tabIds,
		tags: tagIds,
	})

	return queryString
}

export const yearRangeText = (stages: IStage[]) => {
	const startYear = stages[0].yearRange[0]
	const lastStage = stages[stages.length - 1]
	const endYear = lastStage.yearRange[lastStage.yearRange.length - 1]

	if (!startYear || !endYear) {
		return 'UNK'
	}

	if (startYear === endYear) {
		return startYear
	}

	return `${startYear}–${endYear}`
}

export const queryStringComponentAsArray = (
	qs: undefined | string | string[] | ParsedQs | ParsedQs[],
): string[] => {
	if (Array.isArray(qs)) {
		return qs as string[]
	}
	if (typeof qs === 'object') {
		return Object.values(qs) as string[]
	}
	if (qs) {
		return [qs]
	}
	return []
}

export const stripHtml = (value: string): string =>
	stripTags(value).replace(/&nbsp;/g, ' ')

const nonAlphaNumRegex = /[^a-zA-Z0-9]+/g
export const uriConvert = (value: string): string =>
	value.replace(nonAlphaNumRegex, '-').toLowerCase()

export const escapeRegExp = (text: string) =>
	text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Takes an html string and adds the crossorigin attribute to any images. This fixes a CORS issue
 * in the pdf/docx downloads.
 * @param html
 */
export const corsSafeImgs = (html: string): string =>
	html.replace(/img src/g, 'img crossorigin="anonymous" src')

export const resize = (actual: ImageSize, max: ImageSize): ImageSize => {
	const scaled = { ...actual }

	if (scaled.width > max.width) {
		scaled.width = max.width
		scaled.height = (max.width * actual.height) / actual.width
	}
	if (scaled.height > max.height) {
		scaled.width = (max.height * actual.width) / actual.height
		scaled.height = max.height
	}

	return scaled
}

export const stringCompare = (a: string | null, b: string | null): number => {
	if (a && b) {
		return a!.localeCompare(b!)
	}
	// TODO these may need swapping
	if (!a && b) {
		return 1
	}
	if (a && !b) {
		return -1
	}
	return 0
}
