import type { Glossary, Syllabus } from '@/kontent/content-types'
import type { WpGlossary } from '@/kontent/content-types/wp_glossary'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies/key_learning_area'

import { TaxoAceCategory, TaxoStage } from '@/kontent/taxonomies'

import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type { KontentCurriculumResult } from '@/types'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	filterPreviewableSyllabusesOnly,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import type { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'
import type { KontentCurriculumResultBaseData } from './../types/index'

export interface WpGlossaryResponseData
	extends KontentCurriculumResultBaseData<WpGlossary> {
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
	glossaries: Responses.IListContentItemsResponse<Glossary>
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	// aceGroups: Responses.IListContentItemsResponse<AceGroup>
	aceTaxos: ElementModels.TaxonomyTerm<TaxoAceCategory>[]
	stages: ElementModels.TaxonomyTerm<TaxoStage>[]
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpGlossary>({
		depth: 1,
		codename,
		preview,
		kontentClient: getNonLinkedItemsClient(),
	})
}

async function buildData({
	result,
	pageResponse,
	preview,
}: DataBuilderBuildDataParams) {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const _result: KontentCurriculumResult<WpGlossary, WpGlossaryResponseData> =
		{
			...result,
			data: {
				...result.data,
				pageResponse,
			},
		}

	const [syllabuses, glossaries] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: 'syllabus',
			depth: 0,
			elementsParameter: [
				contentTypes.syllabus.elements.title.codename,
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.syllabus.codename,
				contentTypes.syllabus.elements.doredirect.codename,
				contentTypes.syllabus.elements.allowpreview.codename,
			],
			notEmptyFilter: {
				element: `elements.${contentTypes.syllabus.elements.syllabus.codename}`,
			},
			containsFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
						element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
						value: ['no'],
				  },
			preview,
		}),
		getAllItemsByType<Glossary>({
			type: 'glossary',
			depth: 0,
			elementsParameter: [
				contentTypes.glossary.elements.title.codename,
				contentTypes.glossary.elements.description.codename,
				contentTypes.glossary.elements.syllabus.codename,
				contentTypes.glossary.elements.type.codename,
				contentTypes.glossary.elements.ace_category.codename,
			],
			preview,
		}),
	])

	// const aceGroups = await getAllItemsByType<AceGroup>({
	// 	type: projectContentTypes.ace_group.codename,
	// 	depth: 1,
	// 	preview,
	// 	elementsParameter: [
	// 		projectContentTypes.ace_group.elements.title.codename,
	// 		projectContentTypes.ace_group.elements.subgroups.codename,
	// 		projectContentTypes.ace_subgroup.elements.title.codename,
	// 		projectContentTypes.ace_subgroup.elements.glossary.codename,
	// 		projectContentTypes.ace_subgroup.elements.glossary.id,
	// 		projectContentTypes.ace_rule.elements.ace_category.codename,
	// 	],
	// })

	// const aceTaxos: ElementModels.TaxonomyTerm<TaxoAceCategory>[] =
	// 	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
	// 		projectTaxonomies.ace_category,
	// 	)

	const tmpKlas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	_result.data.keyLearningAreas = tmpKlas
	const tmpStages: ElementModels.TaxonomyTerm<TaxoStage>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		)

	_result.data.stages = tmpStages

	// _result.data.aceGroups = aceGroups
	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = _isAllowPreviewExternalSyllabus
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	/**
	 * On prod site
	 * =============
	 * (i.e. Staging feature is turned off) - show only glossary items that are not linked to any syllabuses or at least one LIVE syllabus
	 * if linked to 1+ live syllabus and other Staged or External syllabuses do not display staged or External syllabus tags
	 *
	 * Case 1: No syllabus links
	 * Show glossary items with no tags
	 *
	 * Case 2: Link to 1+ live syllabuses
	 * Show glossary items with tags to all syllabuses
	 *
	 * Case 3: Link to 1+ live syllabuses and 1+ staged or external syllabuses
	 * Show glossary items with tags to all syllabuses. Do not show tags to Staged or External syllabuses
	 *
	 *
	 * On staging site (staging feature is turned on)
	 * ================
	 * Case 1: No syllabus links
	 * Show glossary items with no tags
	 *
	 * Case 2: Link to 1+ live syllabuses
	 * Show glossary items with tags to all syllabuses
	 *
	 * Case 3: Link to 1+ live syllabuses and 1+ staged or external syllabuses
	 * Show glossary items with tags to all Live and Staged syllabuses. Do not show tags to External syllabuses
	 */

	// let _glossaries = glossaries
	// _glossaries = excludeGlossariesWhoseSyllabusIsNotLiveOrStaged(
	// 	_glossaries,
	// 	_result.data.syllabuses.items,
	// )
	// _glossaries = excludeUnstagedSyllabusesTagsFromGlossaries(
	// 	_glossaries,
	// 	_result.data.syllabuses.items,
	// )
	// _result.data.glossaries = _glossaries

	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
