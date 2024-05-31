import {
	AceGroup,
	AceSubgroup,
	ReleasenoteAceKla,
	ReleasenoteAceSyllabus,
} from '@/kontent/content-types'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType } from '@/lib/api'
import type { AssetWithRawElements, CommonPageProps } from '@/types'
import type { KontentCurriculumResultBaseData } from '@/types/index'
import { getLinkedItems } from '@/utils'
import { matchFilesWithResourceAssets } from '@/utils/assets'
import type { Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams } from '.'

export interface AceSubGroupResponseData
	extends KontentCurriculumResultBaseData<AceSubgroup> {
	aceGroups: Responses.IListContentItemsResponse<AceGroup>
	allAssets: AssetWithRawElements[]
	releaseNotes: Responses.IListContentItemsResponse<
		ReleasenoteAceSyllabus | ReleasenoteAceKla
	>
}

async function buildData({
	result,
	pageResponse,
	preview = false,
	assets,
}: DataBuilderBuildDataParams) {
	const _result: CommonPageProps<AceSubgroup, AceSubGroupResponseData> = {
		...result,
		mappings: result.mappings,
		preview,
		previewData: null,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const aceGroups = await getAllItemsByType<AceGroup>({
		type: projectContentTypes.ace_group.codename,
		depth: 2,
		preview,
		elementsParameter: [
			projectContentTypes.ace_group.elements.title.codename,
			projectContentTypes.ace_group.elements.code.codename,
			projectContentTypes.ace_group.elements.subgroups.codename,
			projectContentTypes.ace_subgroup.elements.rules.codename,
			projectContentTypes.ace_subgroup.elements.title.id,
			projectContentTypes.ace_rule.elements.ace_category.codename,
		],
	})

	const [releaseNotesAceKLA, releaseNotesAceSyllabus] = await Promise.all([
		getAllItemsByType<ReleasenoteAceSyllabus>({
			type: projectContentTypes.releasenote_ace_kla.codename,
			depth: 3,
			preview,
			elementsParameter: [
				projectContentTypes.releasenote_ace_syllabus.codename,
				projectContentTypes.releasenote_ace_syllabus.elements.subgroup
					.codename,
				projectContentTypes.releasenote_ace_syllabus.elements.content
					.codename,
				projectContentTypes.releasenote_ace_syllabus.elements
					.releasedate.codename,
			],
		}),
		getAllItemsByType<ReleasenoteAceSyllabus>({
			type: projectContentTypes.releasenote_ace_syllabus.codename,
			depth: 3,
			preview,
			elementsParameter: [
				projectContentTypes.releasenote_ace_syllabus.codename,
				projectContentTypes.releasenote_ace_syllabus.elements.subgroup
					.codename,
				projectContentTypes.releasenote_ace_syllabus.elements.content
					.codename,
				projectContentTypes.releasenote_ace_syllabus.elements
					.releasedate.codename,
			],
		}),
	])

	_result.data.releaseNotes = {
		items: releaseNotesAceKLA.items.concat(releaseNotesAceSyllabus.items),
		linkedItems: {
			...releaseNotesAceKLA.linkedItems,
			...releaseNotesAceSyllabus.linkedItems,
		},
		pagination: {
			...releaseNotesAceKLA.pagination,
			...releaseNotesAceSyllabus.pagination,
		},
	}
	_result.data.aceGroups = aceGroups

	const rules = getLinkedItems(
		_result.data.pageResponse.item.elements.rules,
		_result.data.pageResponse.linkedItems,
	)

	const assetsInRules = rules.map((rule) => rule.elements.resources)

	_result.data.allAssets = assets.filter((asset) => {
		return assetsInRules.some((air) =>
			air.value.some((r) => {
				return matchFilesWithResourceAssets(asset, r)
			}),
		)
	})
	_result.rootLayoutClassName = 'max-w-none mx-0 px-0 !pt-0 !lg:pt-8'
	return _result
}

const _ = {
	buildData,
}

export default _
