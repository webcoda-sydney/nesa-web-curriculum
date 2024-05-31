import { contentTypes } from '@/kontent/project/contentTypes'
import { taxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoLanguage,
	TaxoResourceType,
	TaxoStageGroup,
	TaxoStageYear,
} from '@/kontent/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies/stage'
import type { FileTypeClassification, SyllabusTab } from '@/types'
import {
	ElementModels,
	IContentItemSystemAttributes,
} from '@kontent-ai/delivery-sdk'
import { TransitionOptions } from 'next-usequerystate'

const getAllFieldsOf = <T extends Record<string, { codename: string }>>(
	obj: T,
) => {
	return Object.values(obj).map((o) => o.codename)
}

/** For some reason, when it's empty, it has <p><br></p> as default */
export const EMPTY_KONTENT_RICHTEXT = '<p><br></p>'

export const BREAKPOINTS = {
	mobile: 0,
	tablet: 992,
}

export type KBreakpoints = keyof typeof BREAKPOINTS
export type TBreakpoint = {
	[_key in KBreakpoints]: string
}

export const MEDIA_QUERIES = Object.entries(BREAKPOINTS)
	.filter(([key]) => key !== 'mobile')
	.reduce((acc, curr) => {
		const [key, val] = curr
		if (acc) {
			return {
				...acc,
				[key]: `@media (min-width: ${val}px)`,
			}
		}
	}, {}) as TBreakpoint

/**
 * Just need to specify the file types that can't be retrieved
 * programatically
 */
export const FILE_TYPES: Record<string, FileTypeClassification> = {
	'application/msword': 'Word',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		'Word',
	'application/pdf': 'PDF',

	'text/csv': 'Excel',
	'application/vnd.ms-excel': 'Excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		'Excel',

	'application/vnd.ms-powerpoint': 'Powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		'Powerpoint',
}

export const STAGEGROUPS_STAGES: Record<TaxoStageGroup, TaxoStage[]> = {
	primary: [
		taxonomies.stage.terms.early_stage_1.codename as TaxoStage,
		taxonomies.stage.terms.stage_1.codename as TaxoStage,
		taxonomies.stage.terms.stage_2.codename as TaxoStage,
		taxonomies.stage.terms.stage_3.codename as TaxoStage,
	],
	secondary: [
		taxonomies.stage.terms.stage_4.codename as TaxoStage,
		taxonomies.stage.terms.stage_5.codename as TaxoStage,
	],
	senior: [taxonomies.stage.terms.stage_6.codename as TaxoStage],
}

export const STAGE_YEARS: Record<TaxoStage, TaxoStageYear[]> = {
	early_stage_1: [taxonomies.stage_year.terms.k.codename as TaxoStageYear],
	stage_1: [
		taxonomies.stage_year.terms.n1.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n2.codename as TaxoStageYear,
	],
	stage_2: [
		taxonomies.stage_year.terms.n3.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n4.codename as TaxoStageYear,
	],
	stage_3: [
		taxonomies.stage_year.terms.n5.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n6.codename as TaxoStageYear,
	],
	stage_4: [
		taxonomies.stage_year.terms.n7.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n8.codename as TaxoStageYear,
	],
	stage_5: [
		taxonomies.stage_year.terms.n9.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n10.codename as TaxoStageYear,
	],
	stage_6: [
		taxonomies.stage_year.terms.n11.codename as TaxoStageYear,
		taxonomies.stage_year.terms.n12.codename as TaxoStageYear,
	],
}

export const YEARS = Object.values(
	taxonomies.stage_year.terms,
) as ElementModels.TaxonomyTerm<TaxoStageYear>[]

export const STAGES_ORDER: TaxoStage[] = Object.values(
	STAGEGROUPS_STAGES,
).flatMap((t) => t)

export const STAGEGROUPS_YEARS: Record<TaxoStageGroup, TaxoStageYear[]> =
	Object.entries(STAGEGROUPS_STAGES).reduce((acc, [stageGroup, stages]) => {
		return {
			...acc,
			[stageGroup]: stages.flatMap((stage) => {
				return STAGE_YEARS[stage]
			}),
		}
	}, {} as any)

export const SyllabusTabsToElement: Record<SyllabusTab, string[]> = {
	'course-overview': [
		contentTypes.syllabus.elements.web_content_rtb__content.codename,
	],
	rationale: [contentTypes.syllabus.elements.rationale.codename],
	aim: [contentTypes.syllabus.elements.aim.codename],
	outcomes: [
		contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename,
		contentTypes.syllabus.elements.focus_areas.codename,
		contentTypes.syllabus.elements.outcomesnotificationslist.codename,
		contentTypes.syllabus.elements.syllabus.codename,

		contentTypes.focusarea.elements.outcomes.codename,
		contentTypes.focusarea.elements.syllabus_type__items.codename,

		contentTypes.outcome.elements.code.codename,
		contentTypes.outcome.elements.title.codename,
		contentTypes.outcome.elements.description.codename,
		contentTypes.outcome.elements.syllabus_type__items.codename,
		contentTypes.outcome.elements.relatedlifeskillsoutcomes.codename,
		contentTypes.outcome.elements.isoverarching.codename,

		// content_outcomenotification
		...getAllFieldsOf(contentTypes.content_outcomenotification.elements),

		// optionstlist
		contentTypes.optionslist.elements.focus_area_options.codename,
	],
	content: Array.from(
		new Set([
			contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename,
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.syllabus.elements.has_examples.codename,
			contentTypes.syllabus.elements.has_examples_in.codename,
			contentTypes.syllabus.elements.languages.codename,
			contentTypes.syllabus.elements.pathways.codename,

			// focus area
			contentTypes.focusarea.elements.content.codename,
			contentTypes.focusarea.elements.contentgroups.codename,
			contentTypes.focusarea.elements.teachingadvice.codename,
			contentTypes.focusarea.elements.outcomes.codename,
			contentTypes.focusarea.elements.accesspointgroups.codename,
			contentTypes.focusarea.elements.resources.codename,
			contentTypes.focusarea.elements.syllabus_type__items.codename,
			contentTypes.focusarea.elements.related_focusareas.codename,
			contentTypes.syllabus.elements.lifeskills_info_focusareas.codename,
			contentTypes.focusarea.elements.content_staged.codename,
			contentTypes.contentrichtext.elements.stage_years.codename,
			contentTypes.contentrichtext.elements.stages.codename,
			contentTypes.syllabus.elements.outcomesnotificationslist.codename,
			contentTypes.focusarea.elements.accesspointcontent.codename,

			// content_outcomenotification
			...getAllFieldsOf(
				contentTypes.content_outcomenotification.elements,
			),

			// outcome
			contentTypes.outcome.elements.code.codename,
			contentTypes.outcome.elements.description.codename,
			contentTypes.outcome.elements.isoverarching.codename,

			// teaching advice
			contentTypes.teachingadvice.codename,
			contentTypes.teachingadvice.elements.content.codename,

			// content group
			...getAllFieldsOf(contentTypes.contentgroup.elements),

			// content item
			...getAllFieldsOf(contentTypes.contentitem.elements),
			contentTypes.content_langexample.elements.language.codename,

			// access content group
			...getAllFieldsOf(contentTypes.accesscontentgroup.elements),

			// access content item
			...getAllFieldsOf(contentTypes.accesscontentitem.elements),

			// access points
			contentTypes.syllabus.elements.focus_areas.codename,
			contentTypes.focusarea.elements.accesspointgroups.codename,
			contentTypes.contentgroup.elements.content_items.codename,
			contentTypes.contentitem.elements.pathway__pathway.codename,
			contentTypes.accesscontentitem.elements
				.learningprogression_tags__literacy.codename,
			contentTypes.accesscontentitem.elements
				.learningprogression_tags__numeracy.codename,

			// if optionslist
			contentTypes.optionslist.elements.focus_area_options.codename,

			// for links_placeholder_cc & links_placeholder_overarching
			contentTypes.links_placeholder_cc.elements.links.codename,
			contentTypes.links_placeholder_overarching.elements.links.codename,
		]),
	),
	assessment: [
		contentTypes.syllabus.elements.assessments.codename,
		contentTypes.syllabus.elements.assessments_info.codename,
		contentTypes.assessment.codename,
		contentTypes.assessment.elements.introduction.codename,

		// Course standards assessments
		contentTypes.syllabus.elements.cs_assessments.codename,
		contentTypes.syllabus.elements.cs_assessments_info.codename,

		// School-based asssessments
		contentTypes.syllabus.elements.sb_assessments.codename,
		contentTypes.syllabus.elements.sb_assessments_info.codename,

		// HSC examinations
		contentTypes.syllabus.elements.hsc_assessments.codename,
		contentTypes.syllabus.elements.hsc_assessments_info.codename,

		// Assessment Stage Content
		contentTypes.syllabus_assessment_stagecontent.codename,
		...getAllFieldsOf(
			contentTypes.syllabus_assessment_stagecontent.elements,
		),

		// Syllabus Assessment Group (Band or Grade)
		contentTypes.syllabus_assessment_group.codename,
		contentTypes.syllabus_assessment_group.elements.assessment_grades
			.codename,
		contentTypes.syllabus_assessment_group.elements.title.codename,
		contentTypes.syllabus_assessment_group.elements.content.codename,
		contentTypes.syllabus_assessment_group.elements.contentitems.codename,

		// Syllabus Assessment Content Item
		contentTypes.syllabus_assessment_item.elements.content.codename,
		contentTypes.syllabus_assessment_item.elements.code.codename,

		// Ui Video Tile
		...getAllFieldsOf(contentTypes.ui_video_tile.elements),

		// Web link Ext
		...getAllFieldsOf(contentTypes.weblinkext.elements),
	],
	glossary: [],
	'teaching-and-learning': [],
}

export const CURRICULUM_SLUGS = {
	SYLLABUSES: ['syllabuses'],
	CUSTOM_SYLLABUSES: ['syllabuses-custom'],

	// watch for changes in the content
	LEARNING_AREAS: ['learning-areas'],
	STAGES: ['stages'],
	TEACHING_AND_LEARNING: ['teaching-and-learning'],
	RESOURCES: ['resources'],
	RESOURCES_GLOBAL_SUPPORT: ['resources', 'global-support'],
	RESOURCES_SYLLABUS_SUPPORT: ['resources', 'syllabus-support'],

	EARLY_STAGE_1: ['stages', 'primary', 'early-stage-1'],
	STAGE_1: ['stages', 'primary', 'stage-1'],
	STAGE_2: ['stages', 'primary', 'stage-2'],
	STAGE_3: ['stages', 'primary', 'stage-3'],
	STAGE_4: ['stages', 'secondary', 'stage-4'],
	STAGE_5: ['stages', 'secondary', 'stage-5'],
	STAGE_6: ['stages', 'senior', 'stage-6'],
}

export const HOME_REDIRECTED_SLUGS = [
	CURRICULUM_SLUGS.SYLLABUSES,
	CURRICULUM_SLUGS.CUSTOM_SYLLABUSES,
	CURRICULUM_SLUGS.RESOURCES_GLOBAL_SUPPORT,
	CURRICULUM_SLUGS.RESOURCES_SYLLABUS_SUPPORT,
]

export const TAXO_TERM_LIFE_SKILLS = {
	codename: 'life_skills',
	name: 'Life Skills',
} as const

export const RESOURCE_TYPES_STAGE_6: TaxoResourceType[] = [
	'hscpapers',
	'standardsmaterials',
	'ssas',
	'sunit',
	'sampleassessschedules',
	'sampleassesstasks',
]

export const ALL_TAXO_GROUPS = Object.keys(taxonomies)

export const STAGES_WITH_LIFESKILLS = ['stage_4', 'stage_5', 'stage_6'] as const

export const DELAY_POPUP_CLOSE = 3000

export const RTL_LANGUAGES: TaxoLanguage[] = [
	'arabic',
	'classical_hebrew',
	'modern_hebrew',
	'persian',
]

export const DEFAULT_NUQS_TRANSITION_OPTIONS: TransitionOptions = {
	scroll: false,
	shallow: true,
}

export const DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS: (keyof IContentItemSystemAttributes)[] =
	[
		'language',
		'sitemapLocations',
		'workflowStep',
		'collection',
		'name',
		'lastModified',
	]
