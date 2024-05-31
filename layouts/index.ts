import { contentTypes } from '@/kontent/project/contentTypes'
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

const _ = {
	web_page,
	wp_glossary,
	wp_homepage,
	wp_learningarea,
	wp_learningareas,
	wp_resources,
	wp_stage,
	wp_stages,
	wp_stagegroup,
	wp_teachingadvice,
	syllabus,
	wp_custom_view,
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

export default _
