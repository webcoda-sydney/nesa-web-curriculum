import { AceGroup } from '@/kontent/content-types'
import { contentTypes as projectContentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType } from '@/lib/api'
import type { CommonPageProps } from '@/types'
import type { KontentCurriculumResultBaseData } from '@/types/index'
import type { Responses } from '@kontent-ai/delivery-sdk'
import type { DataBuilderBuildDataParams } from '.'

export interface AceGroupResponseData
	extends KontentCurriculumResultBaseData<AceGroup> {
	aceGroups: Responses.IListContentItemsResponse<AceGroup>
}

async function buildData({
	result,
	pageResponse,
	preview = false,
}: DataBuilderBuildDataParams) {
	const _result: CommonPageProps<AceGroup, AceGroupResponseData> = {
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
			projectContentTypes.ace_rule.elements.ace_category.codename,
		],
	})

	_result.data.aceGroups = aceGroups
	_result.rootLayoutClassName =
		'max-w-none mx-0 px-0 !pt-0 !lg:pt-8 bg-[#fbfbfb]'

	return _result
}

const _ = {
	buildData,
}

export default _
