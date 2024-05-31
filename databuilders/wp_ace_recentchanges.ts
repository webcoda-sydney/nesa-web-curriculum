import { AceGroup } from '@/kontent/content-types'
import type { ReleasenoteAceSyllabus } from '@/kontent/content-types/releasenote_ace_syllabus'
import type { WpAceRecentchanges } from '@/kontent/content-types/wp_ace_recentchanges'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import {
	getAllItemsByType,
	getItemByCodename,
	getNonLinkedItemsClient,
} from '@/lib/api'
import type { KontentCurriculumResult } from '@/types'
import type { KontentCurriculumResultBaseData } from '@/types/index'
import type { Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams, GetPageResponseParams } from '.'

export interface WpResourcesResponseData
	extends KontentCurriculumResultBaseData<WpAceRecentchanges> {
	releaseNotes: Responses.IListContentItemsResponse<ReleasenoteAceSyllabus>
	aceGroups: Responses.IListContentItemsResponse<AceGroup>
}

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpAceRecentchanges>({
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
	const _result: KontentCurriculumResult<
		WpAceRecentchanges,
		WpResourcesResponseData
	> = {
		...result,
		data: {
			...result.data,
			pageResponse,
		},
	}

	const releaseNotes = await getAllItemsByType<ReleasenoteAceSyllabus>({
		type: projectContentTypes.releasenote_ace_syllabus.codename,
		depth: 3,
		preview,
		elementsParameter: [
			projectContentTypes.releasenote_ace_syllabus.codename,
			projectContentTypes.releasenote_ace_syllabus.elements.subgroup
				.codename,
			projectContentTypes.releasenote_ace_syllabus.elements.content
				.codename,
			projectContentTypes.releasenote_ace_syllabus.elements.releasedate
				.codename,
		],
	})

	const aceGroups = await getAllItemsByType<AceGroup>({
		type: projectContentTypes.ace_group.codename,
		depth: 3,
		preview,
		elementsParameter: [
			projectContentTypes.ace_group.elements.title.codename,
			projectContentTypes.ace_group.elements.subgroups.codename,
			projectContentTypes.ace_subgroup.elements.rules.codename,
			projectContentTypes.ace_rule.elements.ace_category.codename,
		],
	})

	_result.data.releaseNotes = releaseNotes
	_result.data.aceGroups = aceGroups

	return _result
}

const _ = {
	buildData,
	getPageResponse,
}

export default _
