import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { WpStage } from '@/kontent/content-types/wp_stage'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies'
import { getAllItemsByType } from '@/lib/api'
import type { CommonPageProps } from '@/types'
import { convertProjectModelTaxonomiesToElementModelsTaxonomyTerm } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams } from '.'
import type { KontentCurriculumCommonResultData } from './../types/index'

async function buildData({
	result,
	pageResponse,
	preview = false,
}: DataBuilderBuildDataParams) {
	const pageResponseItem = pageResponse.item as Syllabus
	const _result: CommonPageProps<
		WpStage,
		KontentCurriculumCommonResultData<WpStage>
	> = {
		...result,
		data: {
			...result.data,
			syllabuses: null,
			keyLearningAreas: null,
			glossaries: null,
			stages: null,
			stageGroups: null,
			assets: null,
		},
		preview,
		previewData: null,
	}

	const pageStageStages = pageResponseItem.elements.stages__stages.value.map(
		(item) => item.codename,
	)

	const [syllabuses] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: 'syllabus',
			depth: 0,
			elementsParameter: [
				contentTypes.syllabus.elements.title.codename,
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.doredirect.codename,
				contentTypes.syllabus.elements.allowpreview.codename,
				contentTypes.syllabus.elements.relatedlifeskillssyllabus
					.codename,
				contentTypes.syllabus.elements.syllabus.codename,
				contentTypes.syllabus.elements.implementation_title.codename,
				contentTypes.syllabus.elements.implementation_info.codename,
				contentTypes.syllabus.elements.stages__stages.codename,
				contentTypes.syllabus.elements.syllabus_type__items.codename,
				contentTypes.syllabus.elements.redirecturl.codename,
				contentTypes.syllabus.elements.languages.codename,
			],
			containsFilter: {
				element: `elements.${contentTypes.syllabus.elements.stages__stages.codename}`,
				value: pageStageStages,
			},
			preview,
		}),
		// getAllItemsByType<Glossary>({
		// 	type: 'glossary',
		// 	preview,
		// 	depth: 0,
		// }),
	])
	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = syllabuses.items
	// _result.data.glossaries = excludeUnstagedSyllabusesTagsFromGlossaries(
	// 	excludeAceGlossaries(glossaries),
	// 	_result.data.syllabuses.items,
	// )
	_result.data.stages = [
		...(convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		) as ElementModels.TaxonomyTerm<TaxoStage>[]),
		TAXO_TERM_LIFE_SKILLS,
	]
	_result.data.stageGroups =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage_group,
		)
	_result.data.keyLearningAreas =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	// _result.data.assets = assets.filter((asset) => {
	// 	return (
	// 		asset.resource_type.length &&
	// 		asset.resource_type.every((tag) => !tag.codename.includes('ace_'))
	// 	)
	// })
	_result.rootLayoutClassName = 'max-w-none mx-0 px-0 !pt-0'

	return _result
}

const _ = {
	buildData,
}

export default _
