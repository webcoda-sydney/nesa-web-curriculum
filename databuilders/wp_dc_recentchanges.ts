import {
	AceGroup,
	ReleasenoteAceKla,
	ReleasenoteAceSyllabus,
	ReleasenoteGeneral,
	ReleasenoteSyllabus,
	ReleasenoteSyllabusKla,
	ReleasenoteSyllabusMultiple,
	Syllabus,
} from '@/kontent/content-types'
import type { WpDcRecentchanges } from '@/kontent/content-types/wp_dc_recentchanges'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { taxonomies as projectTaxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoKeyLearningArea,
	TaxoStage,
	TaxoStageGroup,
} from '@/kontent/taxonomies'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type { CommonPageProps } from '@/types'
import type { KontentCurriculumResultBaseData } from '@/types/index'
import {
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm,
	filterPreviewableSyllabusesOnly,
	getTaxoCodenames,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import type { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

export type CombinedReleaseNote =
	| ReleasenoteSyllabus
	| ReleasenoteSyllabusKla
	| ReleasenoteSyllabusMultiple
	| ReleasenoteAceSyllabus
	| ReleasenoteAceKla
	| ReleasenoteGeneral
export interface WpDcRecentChangesResponseData
	extends KontentCurriculumResultBaseData<WpDcRecentchanges> {
	releaseNotes: Responses.IListContentItemsResponse<CombinedReleaseNote>
	aceGroups: Responses.IListContentItemsResponse<AceGroup>
	syllabuses: Responses.IListContentItemsResponse<Syllabus>
	stages: ElementModels.TaxonomyTerm<TaxoStage>[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpDcRecentchanges>({
		depth: 3,
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
	const _result: CommonPageProps<
		WpDcRecentchanges,
		WpDcRecentChangesResponseData
	> = {
		...result,
		mappings: result.mappings,
		preview,
		previewData: null,
		data: {
			...result.data,
			pageResponse,
		},
	}
	const syllabusContentType = projectContentTypes.syllabus
	const syllabusElements = projectContentTypes.syllabus.elements
	const syllabusReleaseNoteContentType =
		projectContentTypes.releasenote_syllabus
	const syllabusKlaReleaseNoteContentType =
		projectContentTypes.releasenote_syllabus_kla
	const syllabusMultipleReleaseNoteContentType =
		projectContentTypes.releasenote_syllabus_multiple
	const aceSyllabusReleaseNoteContentType =
		projectContentTypes.releasenote_ace_syllabus
	const aceKlaReleaseNoteContentType = projectContentTypes.releasenote_ace_kla
	const generalReleaseNoteContentType =
		projectContentTypes.releasenote_general

	const _isAllowPreviewExternalSyllabus = isAllowPreviewExternalSyllabus()

	const [
		syllabusReleaseNotes,
		syllabusKlaReleaseNotes,
		syllabusMultipleReleaseNotes,
		aceSyllabusReleaseNotes,
		aceKlaReleaseNotes,
		generalReleaseNotes,
		syllabuses,
		aceGroups,
	] = await Promise.all([
		getAllItemsByType<ReleasenoteSyllabus>({
			type: syllabusReleaseNoteContentType.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteSyllabusKla>({
			type: syllabusKlaReleaseNoteContentType.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteSyllabusMultiple>({
			type: syllabusMultipleReleaseNoteContentType.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteAceSyllabus>({
			type: aceSyllabusReleaseNoteContentType.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteAceSyllabus>({
			type: aceKlaReleaseNoteContentType.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteGeneral>({
			type: generalReleaseNoteContentType.codename,
			preview,
		}),
		// all syllabus, including external, since some of the release notes have external syllabus links
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
				syllabusElements.allowpreview.codename,
			],
			allFilter: _isAllowPreviewExternalSyllabus
				? null
				: {
					element: `elements.${syllabusElements.doredirect.codename}`,
					value: ['no'],
				},
		}),
		getAllItemsByType<AceGroup>({
			type: projectContentTypes.ace_group.codename,
			depth: 2,
			preview,
			elementsParameter: [
				projectContentTypes.ace_group.elements.title.codename,
				projectContentTypes.ace_group.elements.subgroups.codename,
				projectContentTypes.ace_group.elements.code.codename,
				projectContentTypes.ace_subgroup.elements.title.codename,
				projectContentTypes.ace_subgroup.elements.rules.codename,
				projectContentTypes.ace_subgroup.elements.code.codename,
				projectContentTypes.ace_rule.elements.title.codename,
			],
		}),
	])
	_result.data.releaseNotes = {
		items: [],
		linkedItems: {},
		pagination: null,
	}
	_result.data.releaseNotes.items = [
		...syllabusReleaseNotes.items,
		...syllabusKlaReleaseNotes.items,
		...syllabusMultipleReleaseNotes.items,
		...aceSyllabusReleaseNotes.items,
		...aceKlaReleaseNotes.items,
		...generalReleaseNotes.items,
	]
	_result.data.releaseNotes.linkedItems = {
		...syllabusReleaseNotes.linkedItems,
		...syllabusKlaReleaseNotes.linkedItems,
		...syllabusMultipleReleaseNotes.linkedItems,
		...aceSyllabusReleaseNotes.linkedItems,
		...aceKlaReleaseNotes.linkedItems,
		...generalReleaseNotes.linkedItems,
	}
	_result.data.aceGroups = aceGroups
	_result.data.stageGroups =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage_group,
		)

	const tmpStages: ElementModels.TaxonomyTerm<TaxoStage>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.stage,
		)
	_result.data.stages = tmpStages.filter(
		(item) =>
			!getTaxoCodenames(
				_result.data.config.item.elements.disabled_stages,
			).includes(item.codename),
	)

	const tmpKlas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[] =
		convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
			projectTaxonomies.key_learning_area,
		)
	_result.data.keyLearningAreas = tmpKlas

	_result.data.syllabuses = syllabuses
	_result.data.syllabuses.items = _isAllowPreviewExternalSyllabus
		? syllabuses.items.filter(filterPreviewableSyllabusesOnly)
		: syllabuses.items

	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
