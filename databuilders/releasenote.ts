import type { Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType, getItemByCodename } from '@/lib/api'
import { CommonPageProps, KontentCurriculumResultBaseData } from '@/types'
import {
	filterPreviewableSyllabusesOnly,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import { Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'
import { CombinedReleaseNote } from './wp_dc_recentchanges'

export interface WpReleaseNoteResponseData
	extends KontentCurriculumResultBaseData<CombinedReleaseNote> {
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<CombinedReleaseNote>({
		codename,
		preview,
	})
}

async function buildData({
	result,
	pageResponse,
	preview,
}: DataBuilderBuildDataParams) {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const syllabusContentType = contentTypes.syllabus
	const syllabusElements = contentTypes.syllabus.elements
	const [syllabuses] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: syllabusContentType.codename,
			depth: 0,
			preview,
			elementsParameter: [
				syllabusElements.title.codename,
				syllabusElements.syllabus.codename,
				syllabusElements.key_learning_area__items.codename,
				syllabusElements.stages__stages.codename,
				syllabusElements.stages__stage_years.codename,
				syllabusElements.doredirect.codename,
				syllabusElements.redirecturl.codename,
			],
		}),
	])

	const _result: CommonPageProps<
		CombinedReleaseNote,
		WpReleaseNoteResponseData
	> = {
		...result,
		rootLayoutClassName: 'max-w-none mx-0 px-0 !pt-0',
		mappings: result.mappings,
		preview,
		previewData: null,
		data: {
			...result.data,
			pageResponse,
		},
	}

	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = _isAllowPreviewExternalSyllabus
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	return _result
}

const _ = {
	getPageResponse,
	buildData,
}

export default _
