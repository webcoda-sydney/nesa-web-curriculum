import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import { Weblinkext } from '@/kontent/content-types'
import type { Glossary } from '@/kontent/content-types/glossary'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { Weblinkvideo } from '@/kontent/content-types/weblinkvideo'
import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type {
	KontentCurriculumCommonResultData,
	KontentCurriculumResult,
} from '@/types'
import {
	byTaxoCodename,
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	excludeAceGlossaries,
	excludeGlossariesWhoseSyllabusIsNotLiveOrStaged,
	excludeUnstagedSyllabusesTagsFromGlossaries,
	filterPreviewableSyllabusesOnly,
	getLinkedItems,
	getSyllabusElements,
	getWebLinkWithoutAce,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import type {
	ElementModels,
	IContentItem,
	Responses,
} from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

export interface SyllabusResponseData
	extends KontentCurriculumCommonResultData<Syllabus> {
	webLinkVideos: Responses.IListContentItemsResponse<Weblinkvideo>
	webLinkExternals: Responses.IListContentItemsResponse<Weblinkext>
}

async function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return await getItemByCodename<Syllabus>({
		depth: 1,
		codename,
		preview,
		elementsParameter: getSyllabusElements(),
		kontentClient: getNonLinkedItemsClient(),
	})
}
async function buildData({
	result,
	pageResponse,
	preview = false,
	assets,
}: DataBuilderBuildDataParams) {
	const pageResponseItem = pageResponse.item as Syllabus
	const relatedLifeSkillSyllabuses = getLinkedItems(
		pageResponseItem.elements.relatedlifeskillssyllabus,
		pageResponse.linkedItems,
	)
	const taxoSyllabusesOfSyllabusAndRelatedSyllabuses = [
		...pageResponseItem.elements.syllabus.value.map(byTaxoCodename),
		...(relatedLifeSkillSyllabuses?.flatMap((relatedSyllabus) =>
			relatedSyllabus.elements.syllabus.value.map(byTaxoCodename),
		) || []),
	]

	const _result: KontentCurriculumResult<IContentItem, SyllabusResponseData> =
		{
			...result,
			data: {
				...result.data,
				pageResponse,
				syllabuses: null,
				keyLearningAreas: null,
				glossaries: null,
				stages: null,
				stageGroups: null,
				assets: null,
			},
		}

	const [syllabuses, glossaries, webLinkVideos, webLinkExternals] =
		await Promise.all([
			getAllItemsByType<Syllabus>({
				type: 'syllabus',
				depth: 0,
				allFilter: isAllowPreviewExternalSyllabus()
					? null
					: {
							element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
							value: ['no'],
					  },
				preview,
			}),
			getAllItemsByType<Glossary>({
				type: 'glossary',
				preview,
				depth: 0,
			}),
			getAllItemsByType<Weblinkvideo>({
				type: contentTypes.weblinkvideo.codename,
				preview,
				containsFilter: {
					element: `elements.${contentTypes.weblinkvideo.elements.syllabus.codename}`,
					value: pageResponseItem.elements.syllabus.value.map(
						byTaxoCodename,
					),
				},
			}),
			getAllItemsByType<Weblinkext>({
				type: contentTypes.weblinkext.codename,
				preview,
				containsFilter: {
					element: `elements.${contentTypes.weblinkext.elements.syllabus.codename}`,
					value: pageResponseItem.elements.syllabus.value.map(
						byTaxoCodename,
					),
				},
			}),
		])

	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = isAllowPreviewExternalSyllabus()
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	let _glossaries = excludeAceGlossaries(glossaries)
	_glossaries = excludeGlossariesWhoseSyllabusIsNotLiveOrStaged(
		_glossaries,
		_result.data.syllabuses.items,
	)
	_glossaries = excludeUnstagedSyllabusesTagsFromGlossaries(
		_glossaries,
		_result.data.syllabuses.items,
	)
	_result.data.glossaries = _glossaries

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
	_result.data.assets = assets.filter((asset) => {
		return (
			asset.syllabus.some((taxoSyl) => {
				return taxoSyllabusesOfSyllabusAndRelatedSyllabuses.includes(
					taxoSyl.codename,
				)
			}) &&
			asset.resource_type.length &&
			asset.resource_type.every((rt) => !rt.codename.includes('ace_'))
		)
	})
	_result.data.webLinkVideos = getWebLinkWithoutAce(webLinkVideos)
	_result.data.webLinkExternals = getWebLinkWithoutAce(webLinkExternals)
	return _result
}

const _ = {
	getPageResponse,
	buildData,
}

export default _
