import { contentTypes } from '@/kontent/project/contentTypes'
import { getItemByCodename } from '@/lib/api'
import type { AssetWithRawElements, KontentCurriculumResult } from '@/types'
import type {
	IContentItem,
	IContentItemElements,
	Responses,
} from '@kontent-ai/delivery-sdk'
import ace_group from './ace_group'
import ace_subgroup from './ace_subgroup'
import releasenote from './releasenote'
import syllabus from './syllabus'
import web_page from './web_page'
import wp_ace_contact from './wp_ace_contact'
import wp_ace_landing from './wp_ace_landing'
import wp_ace_recentchanges from './wp_ace_recentchanges'
import wp_custom_view from './wp_custom_view'
import wp_dc_recentchanges from './wp_dc_recentchanges'
import wp_glossary from './wp_glossary'
import wp_homepage from './wp_homepage'
import wp_learningarea from './wp_learningarea'
import wp_learningareas from './wp_learningareas'
import wp_resources from './wp_resources'
import wp_stage from './wp_stage'
import wp_stagegroup from './wp_stagegroup'
import wp_stages from './wp_stages'
import wp_teachingadvice from './wp_teachingadvice'

export interface DataBuilderBuildDataParams {
	result: KontentCurriculumResult<IContentItem, any>
	pageResponse: Responses.IViewContentItemResponse<IContentItem>
	preview: boolean
	assets?: AssetWithRawElements[]
}

export interface DefaultPageResponseParams {
	codename: string
	type: string
	preview: boolean
}

export type GetPageResponseParams = Omit<DefaultPageResponseParams, 'type'>

export interface DataBuilder {
	getPageResponse?: (
		_params: GetPageResponseParams,
	) => Promise<Responses.IViewContentItemResponse<IContentItem>>
	buildData: (
		_params: DataBuilderBuildDataParams,
	) => Promise<KontentCurriculumResult<IContentItem, any>>
}

export const PAGE_RESPONSE_DEPTH = {
	wp_homepage: 3,
	wp_stagegroup: 2,
	wp_learningarea: 2,
	wp_learningareas: 3,
	wp_stage: 0,
	wp_stages: 3,
	syllabus: 3,
	wp_resources: 0,
	ace_subgroup: 4,
	wp_recent_changes: 4,
}

export const dataBuilders = {
	web_page,
	wp_homepage,
	wp_stage,
	syllabus,
	wp_teachingadvice,
	wp_resources,
	wp_glossary,
	wp_custom_view,
	wp_learningareas,
	wp_learningarea,
	wp_stages,
	wp_stagegroup,
	wp_ace_landing,
	ace_group,
	ace_subgroup,
	wp_ace_recentchanges,
	wp_dc_recentchanges,
	wp_ace_contact,
	[contentTypes.releasenote_general.codename]: releasenote,
	[contentTypes.releasenote_ace_kla.codename]: releasenote,
	[contentTypes.releasenote_ace_syllabus.codename]: releasenote,
	[contentTypes.releasenote_syllabus.codename]: releasenote,
	[contentTypes.releasenote_syllabus_kla.codename]: releasenote,
	[contentTypes.releasenote_syllabus_multiple.codename]: releasenote,
}

export async function getDefaultPageResponse({
	codename,
	type,
	preview,
}: DefaultPageResponseParams): Promise<
	Responses.IViewContentItemResponse<IContentItem<IContentItemElements>>
> {
	let depth = PAGE_RESPONSE_DEPTH[type]
	depth = depth == undefined ? 1 : depth
	return await getItemByCodename({
		codename,
		depth,
		preview,
	})
}
