import { Syllabus, Weblinkext, Weblinkvideo } from '@/kontent/content-types'
import type { WpResources } from '@/kontent/content-types/wp_resources'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import { TaxoResourceType, TaxoSyllabus } from '@/kontent/taxonomies'
import type { TaxoKeyLearningArea } from '@/kontent/taxonomies/key_learning_area'
import type { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type { AssetWithRawElements, KontentCurriculumResult } from '@/types'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	filterPreviewableSyllabusesOnly,
	isAllowPreviewExternalSyllabus,
	isIntersect,
} from '@/utils'
import { isAssetWithRawElement } from '@/utils/type_predicates'
import type {
	ElementModels,
	IContentItem,
	Responses,
} from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'
import type { TaxoStage } from './../kontent/taxonomies/stage'
import type { KontentCurriculumResultBaseData } from './../types/index'

export interface WpResourcesResponseData
	extends KontentCurriculumResultBaseData<WpResources> {
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
	assets: AssetWithRawElements[]
	stages: ElementModels.TaxonomyTerm<TaxoStage>[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	webLinkVideos: Responses.IListContentItemsResponse<Weblinkvideo>
	webLinkExternals: Responses.IListContentItemsResponse<Weblinkext>
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpResources>({
		depth: 1,
		codename,
		preview,
		kontentClient: getNonLinkedItemsClient(),
	})
}

export const createAssetFilterBySyllabusTaxonomies =
	(
		resourceTypeFilter: (
			_tag: ElementModels.TaxonomyTerm<TaxoResourceType>,
		) => boolean,
		syllabusTaxonomies: TaxoSyllabus[],
	) =>
		(
			asset:
				| AssetWithRawElements
				| IContentItem<{
					resource_type: Weblinkext['elements']['resource_type']
					syllabus: Weblinkext['elements']['syllabus']
				}>,
		) => {
			if (isAssetWithRawElement(asset)) {
				return (
					asset.resource_type.length &&
					asset.resource_type.every(resourceTypeFilter) &&
					isIntersect(
						asset.syllabus.flatMap((item) => item.codename),
						syllabusTaxonomies,
					)
				)
			}
			return (
				asset.elements.resource_type.value.length &&
				asset.elements.resource_type.value.every(resourceTypeFilter) &&
				isIntersect(
					asset.elements.syllabus.value.flatMap((item) => item.codename),
					syllabusTaxonomies,
				)
			)
		}

export const filterResourceAssetByResourceType = (
	tag: ElementModels.TaxonomyTerm<TaxoResourceType>,
) =>
	tag.codename !== 'advice' &&
	tag.codename !== 'web_resource' &&
	!tag.codename.includes('ace_')

async function buildData({
	result,
	pageResponse,
	preview = false,
	assets,
}: DataBuilderBuildDataParams) {
	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()
	const _result: KontentCurriculumResult<
		WpResources,
		WpResourcesResponseData
	> = {
		...result,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const [syllabuses, webLinkVideos, webLinkExternals] = await Promise.all([
		getAllItemsByType<Syllabus>({
			type: projectContentTypes.syllabus.codename,
			depth: 0,
			preview,
			elementsParameter: [
				projectContentTypes.syllabus.elements.title.codename,
				projectContentTypes.syllabus.elements.key_learning_area__items
					.codename,
				projectContentTypes.syllabus.elements.syllabus.codename,
				projectContentTypes.syllabus.elements.code.codename,
				projectContentTypes.syllabus.elements.syllabus_type__items
					.codename,
				projectContentTypes.syllabus.elements.doredirect.codename,
				projectContentTypes.syllabus.elements.allowpreview.codename,
			],
			allFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
					element: `elements.${projectContentTypes.syllabus.elements.doredirect.codename}`,
					value: ['no'],
				},
		}),
		getAllItemsByType<Weblinkvideo>({
			type: projectContentTypes.weblinkvideo.codename,
			preview,
		}),
		getAllItemsByType<Weblinkext>({
			type: projectContentTypes.weblinkext.codename,
			preview,
		}),
	])

	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = _isAllowPreviewExternalSyllabus
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	const taxoSyllabusesForFilteringAssets =
		_result.data.syllabuses.items.flatMap((syllabus) =>
			syllabus.elements.syllabus.value.map((item) => item.codename),
		)

	const assetFilter = createAssetFilterBySyllabusTaxonomies(
		filterResourceAssetByResourceType,
		taxoSyllabusesForFilteringAssets,
	)

	_result.data.assets = assets?.filter(assetFilter)

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

	_result.data.webLinkVideos = {
		...webLinkVideos,
		items: webLinkVideos.items.filter(assetFilter),
	}
	_result.data.webLinkExternals = {
		...webLinkExternals,
		items: webLinkExternals.items.filter(assetFilter),
	}
	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _