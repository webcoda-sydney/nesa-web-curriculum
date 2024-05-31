import type { Focusarea } from '@/kontent/content-types/focusarea'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { Teachingadvice } from '@/kontent/content-types/teachingadvice'
import type { WpTeachingadvice } from '@/kontent/content-types/wp_teachingadvice'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoResourceType, TaxoStageGroup } from '@/kontent/taxonomies'
import type { TaxoKeyLearningArea } from '@/kontent/taxonomies/key_learning_area'
import type { TaxoStage } from '@/kontent/taxonomies/stage'
import { getAllItemsByType } from '@/lib/api'
import type {
	AssetWithRawElements,
	KontentCurriculumResult,
	KontentCurriculumResultBaseData,
} from '@/types'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	filterPreviewableSyllabusesOnly,
	getFileTypeClassification,
	getLinkedItems,
	getTaxoCodenames,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	uniquePrimitiveArray,
} from '@/utils'
import { isFocusarea } from '@/utils/type_predicates'
import type { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams } from '.'
import { createAssetFilterBySyllabusTaxonomies } from './wp_resources'

export interface WpTeachingdviceResponseData
	extends KontentCurriculumResultBaseData<WpTeachingadvice> {
	teachingAdvices: Responses.IListContentItemsResponse<Teachingadvice>
	focusAreas: Responses.IListContentItemsResponse<Focusarea>
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
	stages: ElementModels.TaxonomyTerm<TaxoStage>[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	assets: AssetWithRawElements[]
}

const filterTeachingAdviceAssetByResourceType = (
	tag: ElementModels.TaxonomyTerm<TaxoResourceType>,
) => tag.codename === 'advice' && !tag.codename.includes('ace_')

async function buildData({
	result,
	pageResponse,
	preview = false,
	assets,
}: DataBuilderBuildDataParams) {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const _result: KontentCurriculumResult<
		WpTeachingadvice,
		WpTeachingdviceResponseData
	> = {
		...result,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const { elements: focusAreaElements } = projectContentTypes.focusarea
	const { codename: teachingAdviceCodename } =
		projectContentTypes.teachingadvice
	const { elements: syllabusElements, codename: syllabusCodename } =
		projectContentTypes.syllabus

	const teachingAdvices = await getAllItemsByType<Teachingadvice>({
		type: teachingAdviceCodename,
		depth: 0,
		preview,
		elementsParameter: [
			projectContentTypes.teachingadvice.elements.title.codename,
			projectContentTypes.teachingadvice.elements.syllabus.codename,
			projectContentTypes.teachingadvice.elements.stages__stages.codename,
			projectContentTypes.teachingadvice.elements.stages__stage_years
				.codename,
			projectContentTypes.teachingadvice.elements.syllabus.codename,
			projectContentTypes.teachingadvice.elements.syllabus_type__items
				.codename,
			projectContentTypes.teachingadvice.elements.updated.codename,
		],
	})

	const syllabusesInTeachingAdvices = uniquePrimitiveArray(
		teachingAdvices.items.flatMap((teachingAdvice: Teachingadvice) => {
			return getTaxoCodenames(teachingAdvice.elements.syllabus)
		}),
	)

	const [focusAreasResponse, syllabuses] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: syllabusCodename,
			depth: 2,
			preview,
			elementsParameter: [
				syllabusElements.focus_areas.codename,
				focusAreaElements.title.codename,
				focusAreaElements.stages__stages.codename,
				focusAreaElements.syllabus.codename,
				focusAreaElements.teachingadvice.codename,
				focusAreaElements.syllabus_type__items.codename,
			],
			allFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
						element: `elements.${syllabusElements.doredirect.codename}`,
						value: ['no'],
				  },
			anyFilter: {
				element: `elements.${syllabusElements.syllabus.codename}`,
				value: syllabusesInTeachingAdvices,
			},
		}),
		getAllItemsByType<Syllabus>({
			type: syllabusCodename,
			depth: 0,
			preview,
			elementsParameter: [
				syllabusElements.title.codename,
				syllabusElements.key_learning_area__items.codename,
				syllabusElements.syllabus.codename,
				syllabusElements.code.codename,
				syllabusElements.syllabus_type__items.codename,
				syllabusElements.doredirect.codename,
				syllabusElements.allowpreview.codename,
			],
			allFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
						element: `elements.${syllabusElements.doredirect.codename}`,
						value: ['no'],
				  },
		}),
	])

	const focusAreas =
		focusAreasResponse.items
			?.flatMap((syllabus) => {
				return getLinkedItems(
					syllabus.elements.focus_areas,
					focusAreasResponse.linkedItems,
				)
			})
			?.filter(isFocusarea) || []

	// Don't use the pagination, since it's not truly Responses.IListContentItemsResponse<Focusarea>
	_result.data.focusAreas = {
		...focusAreasResponse,
		items: focusAreas,
	}

	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = _isAllowPreviewExternalSyllabus
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	const taxoSyllabusesForFilteringTeachingAdvices =
		_result.data.syllabuses.items.flatMap((syllabus) =>
			syllabus.elements.syllabus.value.map((item) => item.codename),
		)

	_result.data.teachingAdvices = teachingAdvices
	_result.data.teachingAdvices.items = _isAllowPreviewExternalSyllabus
		? teachingAdvices.items.filter((teachingAdvice) => {
				return isIntersect(
					teachingAdvice.elements.syllabus.value.map(
						(item) => item.codename,
					),
					taxoSyllabusesForFilteringTeachingAdvices,
				)
		  })
		: teachingAdvices.items

	_result.data.stageGroups =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage_group,
		)
	const tmpStages: ElementModels.TaxonomyTerm<TaxoStage>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		)

	_result.data.stages = tmpStages

	const tmpKlas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	_result.data.keyLearningAreas = tmpKlas
	_result.data.assets = assets
		.filter(
			createAssetFilterBySyllabusTaxonomies(
				filterTeachingAdviceAssetByResourceType,
				taxoSyllabusesForFilteringTeachingAdvices,
			),
		)
		.filter((asset) => {
			return getFileTypeClassification(asset.type) !== 'Image'
		})

	return _result
}

const _ = {
	buildData,
}

export default _
