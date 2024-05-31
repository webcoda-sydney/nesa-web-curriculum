import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import type { WpCustomView } from '@/kontent/content-types'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import type { TaxoKeyLearningArea } from '@/kontent/taxonomies/key_learning_area'
import type { TaxoStage } from '@/kontent/taxonomies/stage'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type {
	KontentCurriculumResult,
	KontentCurriculumResultBaseData,
	TaxoStageWithLifeSkill,
} from '@/types'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	filterPreviewableSyllabusesOnly,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import type { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

export interface WpCustomViewResponseData
	extends KontentCurriculumResultBaseData<WpCustomView> {
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
}
function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpCustomView>({
		depth: 1,
		codename,
		preview,
		kontentClient: getNonLinkedItemsClient(),
	})
}

async function buildData({
	result,
	pageResponse,
	preview = false,
}: DataBuilderBuildDataParams) {
	const _result: KontentCurriculumResult<
		WpCustomView,
		WpCustomViewResponseData
	> = {
		...result,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const { elements: syllabusElements, codename: syllabusCodename } =
		projectContentTypes.syllabus

	const [syllabuses] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: syllabusCodename,
			depth: 0,
			preview,
			elementsParameter: [
				syllabusElements.title.codename,
				syllabusElements.key_learning_area__items.codename,
				syllabusElements.syllabus.codename,
				syllabusElements.code.codename,
				syllabusElements.doredirect.codename,
				syllabusElements.allowpreview.codename,
				syllabusElements.languages.codename,
			],
			allFilter: isAllowPreviewExternalSyllabus()
				? null
				: {
						element: `elements.${syllabusElements.doredirect.codename}`,
						value: ['no'],
				  },
		}),
	])

	_result.data.syllabuses = {
		...syllabuses,
		items: syllabuses.items.filter(filterPreviewableSyllabusesOnly),
	}
	_result.data.stages = [
		...(convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		) as ElementModels.TaxonomyTerm<TaxoStage>[]),
		TAXO_TERM_LIFE_SKILLS,
	]

	_result.data.keyLearningAreas =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
