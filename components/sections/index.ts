import { Syllabus } from '@/kontent/content-types'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import type {
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import type {
	ElementModels,
	IContentItemsContainer,
} from '@kontent-ai/delivery-sdk'
import { RichTextComponentProps } from '../RichTextComponent'
import ace_paragraph from './ace_paragraph'
import content_teachingadvice from './content_teachingadvice'
import contentrichtext from './contentrichtext'
import links_placeholder_cc from './links_placeholder_cc'
import links_placeholder_overarching from './links_placeholder_overarching'
import math_content from './math_content'
import ui_accordion from './ui_accordion'
import UiCards from './ui_cards'
import ui_collection from './ui_collection'
import ui_herobanner from './ui_herobanner'
import ui_homepage_tile_callout from './ui_homepage_tile_callout'
import ui_horizontal_line from './ui_horizontal_line'
import ui_link_list from './ui_link_list'
import ui_media from './ui_media'
import ui_menu from './ui_menu'
import ui_video_tile from './ui_video_tile'
import ui_video_tiles from './ui_video_tiles'
import WebLinkSyllabus from './web_link_syllabus'
import weblinkext from './weblinkext'
import weblinkint from './weblinkint'

export interface RichtextSectionProps<TKontentModel> {
	className?: string
	linkedItem: TKontentModel
	mappings?: Mapping[]
	linkedItems?: IContentItemsContainer
	currentPath?: string
	currentStage?: TaxoStageWithLifeSkill
	currentYear?: TaxoStageYearWithLifeSkill
	currentKeyLearningAreas?: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	currentSyllabus?: Syllabus
	isLifeSkillMode?: boolean
	resolveFootnotesLink?: RichTextComponentProps['resolveLink']
}

// all the names variable are matched to the linkedItem.system.type name
export const _ = {
	ace_paragraph,
	contentrichtext,
	content_teachingadvice,
	links_placeholder_cc,
	links_placeholder_overarching,
	math_content,
	ui_accordion,
	ui_menu,
	ui_herobanner,
	ui_homepage_tile_callout,
	ui_cards: UiCards,
	ui_collection,
	ui_horizontal_line,
	ui_link_list,
	ui_media,
	ui_video_tiles,
	ui_video_tile,
	web_link_syllabus: WebLinkSyllabus,
	weblinkint,
	weblinkext,
}

export default _
