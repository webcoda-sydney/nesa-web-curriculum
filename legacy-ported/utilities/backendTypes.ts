import type { ElementModels, Elements } from '@kontent-ai/delivery-sdk'
/* eslint-disable camelcase */

import type { Glossary } from '@/kontent/content-types/glossary'
import type { IFile } from './frontendTypes'

export interface KeyValue<K, V> {
	key: K
	value: V
}

export type KeyValueStrings = KeyValue<string, string>

export interface MiddlewareResponse<T> {
	Count: number
	Items: T[]
}

export type IStageRaw = KeyValueStrings & { available?: boolean }

export interface IStage {
	id: string
	code: string
	label: string
	yearRange: [string] | [string, string]
	available: boolean
}

export interface ILearningArea {
	id: string
	title: string
	description: string
	available: boolean // TODO remove after MVP
}

export interface ISyllabusGradeRaw {
	description: string | null
	grade: string | null
}

export interface ISyllabusRaw {
	code: string
	kla_id: string
	stage_id: IStageRaw[]
	stage_values: string
	syllabus_id: string
	syllabus_type: string[]
	website_publication_status: string[]
	course_type: string
	course_numbers: string[]
	aim: string
	rationale: string
	course_overview: string
	grades: ISyllabusGradeRaw[]
	version: number
	edit_date: string
	redirectUrl?: string // TODO remove after MVP
}

export interface ISyllabusGrade {
	description: string
	grade: string
}

export interface ISyllabus
	extends Omit<
		ISyllabusRaw,
		| 'stage_id'
		| 'syllabus_id'
		| 'syllabus_type'
		| 'grades'
		| 'website_publication_status'
	> {
	id: string
	stageIds: IStage['id'][]
	grades: ISyllabusGrade[]
	syllabusName: string
	mandatory: boolean
	available: boolean
}

export interface ISyllabusFull extends ISyllabus {
	glossaryTerms?: IGlossary[]
	outcomes?: IOutcome[]
	files?: IResource[]
	contents?: IContents[]
}

export interface ISyllabusDoc {
	code?: string
	kla_id?: string
	stage_id?: IStageRaw[]
	syllabus_id?: string
	syllabus_type?: string[]
	syllabusName?: string
	course_type?: string
	course_numbers?: string[]
	aim?: string
	rationale?: string
	course_overview?: string
	grades?: ISyllabusGrade[]
	version?: number
	available?: boolean // TODO remove after MVP
	redirectUrl?: string // TODO remove after MVP
	glossaryTerms?: IGlossary[]
	outcomes?: IOutcome[]
	files?: IFile[]
	contents?: IContents[]
}

export interface ITag {
	id: string
	source: string
	category: string
	sub_category: string
	sub_sub_category: string
	tag: string
	code: string
}

export interface IResourceAttachment {
	src: string
	filename: string
}

/**
 * This is the resource object exactly as we are expecting it to come from the middleware
 */
export interface IResourceRaw {
	code: string
	syllabus_id: string
	kla_id: string
	stage_id: IStageRaw[]
	data: {
		code: string
		syllabus_id: string
		kla_id: string
		stage_id: IStageRaw[]
		stage_values: string
		title: string
		summary: string | null
		resource_type: string
		file_type: string
		file_size: string | null
		url: string | null
		attachment: IResourceAttachment[]
		last_updated: string
		edit_date: string
		version: number
	}
}

/**
 * This is the resource object ready to use
 */
export type IResource = Omit<IResourceRaw, 'stage_id' | 'data'> &
	IResourceRaw['data'] & {
		stageIds: IStage['id'][]
	}

export interface ITeachingAdviceRaw {
	code: string
	kla_id: string
	syllabus_id: string
	stage_id: IStageRaw[]
	content_organiser: string
	teaching_advice: string | null
}

export interface ITeachingAdvice extends Omit<ITeachingAdviceRaw, 'stage_id'> {
	stageIds: IStage['id'][]
}

export interface TagCollection {
	selectedValues: KeyValue<string | null, null>[]
}

export interface RowValue<V> {
	row: number
	value: V
}

interface IAccessPointGroupRaw {
	access_point_group_name: string
	access_point_description: RowValue<string>[]
	access_point_example: RowValue<string | null>[] | null
}

interface IContentGroupRaw {
	content_group: string | null
	description: RowValue<string | null>[]
	examples: RowValue<string | null>[] | null
	tags: RowValue<TagCollection | null>[] | null
}

export interface IContentsRaw {
	code: string
	syllabus_id: string
	kla_id: string
	stage_id: IStageRaw[]
	data: {
		access_point: IAccessPointGroupRaw[]
		code: string
		stage_id: IStageRaw[]
		kla_id: string
		content_sequence: number
		version: number
		stage_values: string
		outcomes: KeyValueStrings[]
		content_group: IContentGroupRaw[]
		teaching_advice: string | null
		supporting_materials: string | null
		content_organiser: string
		syllabus_id: string
		edit_date: string
		access_point_sections: string | null
	}
}

export interface IContentsRow {
	description: string
	example: string | null
	tags: string[]
}

export interface IContentsGroup {
	content_group: string
	rows: IContentsRow[]
}

// flatten the 'data' property into the root object
export interface IContents
	extends Omit<IContentsRaw, 'stage_id' | 'data'>,
		Omit<IContentsRaw['data'], 'access_point' | 'content_group'> {
	stageIds: IStage['id'][]
	groups: IContentsGroup[]
	accessPoints: IContentsGroup[]
}

export interface IOutcomeRaw {
	code: string
	kla_id: string
	syllabus_id: string
	stage_id: IStageRaw[]
	content_organiser: string
	content_sequence: number
	outcomes: KeyValueStrings[]
}

export interface IOutcome extends Omit<IOutcomeRaw, 'stage_id'> {
	stageIds: IStage['id'][]
}

export interface IGlossaryRecordRaw {
	alias: string
	description: Elements.RichTextElement
	syllabus: string | null
	term: string
}

export interface IGlossaryRaw {
	section: string
	data: {
		section: string
		syllabus_values: string
		edit_date: string
		records: IGlossaryRecordRaw[]
	}
}

export interface IGlossaryRecord extends IGlossaryRecordRaw {
	syllabuses: ElementModels.TaxonomyTerm[]
}

export interface IGlossary {
	section: string
	records: Glossary[]
}

export interface IWebpageSectionRaw {
	heading: string | null
	body: string | null
}

export interface IWebpageRaw {
	code: string
	title: string
	summary: string | null
	page_url: string
	sections: IWebpageSectionRaw[]
	page_section_count: string
	page_metadata: string | null
	version: number
}

export interface IWebpageSection {
	heading: string
	body: string
}

export interface IWebpage extends Omit<IWebpageRaw, 'page_metadata'> {
	sections: IWebpageSection[]
	sectionCode: string
	sequence: number
	page_metadata: string
}

// This needs to be kept in sync with the actual document content layout
export const SyllabusOptionOrder = [
	'courseOverview',
	'rationale',
	'aim',
	'outcomes',
	'content',
	'accessPoints',
	'examples',
	'support',
	'assessment',
	'glossary',
] as const

export type SyllabusOptionsType = typeof SyllabusOptionOrder[number]

export type SyllabusOptions = {
	// eslint-disable-next-line no-unused-vars
	[key in SyllabusOptionsType]: boolean
}
