import { Focusarea, Teachingadvice } from '@/kontent/content-types'
import type { Glossary } from '@/kontent/content-types/glossary'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { UiMenu } from '@/kontent/content-types/ui_menu'
import type { Weblinkext } from '@/kontent/content-types/weblinkext'
import type { Weblinkint } from '@/kontent/content-types/weblinkint'
import type { Weblinkvideo } from '@/kontent/content-types/weblinkvideo'
import type { WpHomepage } from '@/kontent/content-types/wp_homepage'
import type * as TaxonomyTypes from '@/kontent/taxonomies'
import { TaxoStage, TaxoStageYear, TaxoSyllabus } from '@/kontent/taxonomies'
import type {
	ElementModels,
	Elements,
	IContentItem,
	IContentItemElements,
	IContentItemSystemAttributes,
	Responses,
} from '@kontent-ai/delivery-sdk'
import type {
	AssetContracts,
	AssetModels,
	AssetResponses,
} from '@kontent-ai/management-sdk'
import type { PreviewData } from 'next/types'
import type { ReactNode } from 'react'
import { WebLinkTeachingadviceExtended } from './customKontentTypes'

export interface IPropWithClassName {
	className?: string
}
export interface IPropWithClassNameChildren extends IPropWithClassName {
	children?: ReactNode
}

export type LinkType = UiMenu | Weblinkint | Weblinkext
export type VideoLinkOrExtLinkOrAssetType =
	| Weblinkvideo
	| Weblinkext
	| AssetWithRawElements
	| WebLinkTeachingadviceExtended

export interface AssetRawElementInner {
	id: string
}

export interface IAssetResponseFromMAPI {
	items: AssetModels.Asset[]
	responses: AssetResponses.AssetsListResponse[]
}

export interface AssetRawElement {
	element: AssetRawElementInner
	value: AssetRawElementInner[]
}

export interface AssetRaw extends AssetContracts.IAssetModelContract {
	elements: AssetRawElement[]
}

export type AssetTaxo = {
	resource_type: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoResourceType>[]
	language: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoLanguage>[]
	stage_group: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoStageGroup>[]
	stage: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoStage>[]
	stage_year: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoStageYear>[]
	key_learning_area: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoKeyLearningArea>[]
	syllabus: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoSyllabus>[]
	curriculum_wide: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoCurriculumWide>[]
	assetpublishedyear: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoAssetpublishedyear>[]
	assetpublishedmonth: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoAssetpublishedmonth>[]
	workflow_step: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoWorkflowStep>[]
	syllabustype: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoSyllabustype>[]
}

export type AssetWithRawElements = AssetModels.Asset &
	AssetTaxo & {
		_raw: AssetRaw

		// only exist when using Management REST API
		elements?: AssetRawElement[]
	}

export type AssetWithRawElementsFocusareaTeachingadvice =
	AssetWithRawElements & {
		focusareas?: Focusarea[]
		teachingadvices?: Teachingadvice[]
	}

export interface MappingParams {
	pageTitle: string
	slug: string[]
	// to check whether it's canonical or not
	isCanonical: boolean

	// for query strings and anchor
	additional?: string
	navigationItem?: IContentItemSystemAttributes
	contentItem?: Elements.RichTextElement
	taxoSyllabus?: TaxoSyllabus
	excludeInSitemap?: boolean
}

export interface Mapping {
	params: MappingParams
}

export interface Seo {
	title?: string
	description?: string
	keywords?: string
	canonicalUrl?: string
	noIndex?: string
}

export interface KontentCurriculumResultBaseData<
	TKontentModel extends IContentItem<IContentItemElements>,
> {
	config: Responses.IViewContentItemResponse<WpHomepage>
	pageResponse: Responses.IViewContentItemResponse<TKontentModel>
}

export interface KontentCurriculumCommonResultData<
	TKontentModel extends IContentItem<IContentItemElements>,
> {
	config: Responses.IViewContentItemResponse<WpHomepage>
	pageResponse: Responses.IViewContentItemResponse<TKontentModel>
	syllabuses?: Responses.IListContentItemsResponse<Syllabus>
	glossaries?: Responses.IListContentItemsResponse<Glossary>
	stages?: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	stageGroups?: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoStageGroup>[]
	keyLearningAreas?: ElementModels.TaxonomyTerm<TaxonomyTypes.TaxoKeyLearningArea>[]
	assets?: AssetWithRawElements[]
}

export interface KontentCurriculumResult<
	TKontentModel extends IContentItem<IContentItemElements>,
	TResultData = KontentCurriculumResultBaseData<TKontentModel>,
> {
	mappings: Mapping[]
	data: TResultData
}

export interface CommonPageProps<
	TKontentModel extends IContentItem<IContentItemElements>,
	TResultData = KontentCurriculumResultBaseData<TKontentModel>,
	TMappingParams = MappingParams,
> extends KontentCurriculumResult<TKontentModel, TResultData> {
	className?: string
	rootLayoutClassName?: string
	errorCode?: number
	params?: TMappingParams
	preview: boolean
	previewData: PreviewData
	children?: ReactNode
}

export type SyllabusTab =
	| 'course-overview'
	| 'rationale'
	| 'aim'
	| 'outcomes'
	| 'content'
	| 'assessment'
	| 'glossary'
	| 'teaching-and-learning'

export type ContentOption =
	| 'access-points'
	| 'curriculum-connections'
	| 'examples'
	| 'teaching-advice'
	| 'tags'

export type CustomSyllabusTab = ContentOption | SyllabusTab | undefined

export type FileTypeClassification =
	| 'Image'
	| 'Video'
	| 'PDF'
	| 'Word'
	| 'Audio'
	| 'Excel'
	| 'Powerpoint'

export type TaxoStageWithLifeSkill = TaxoStage | 'life_skills'
export type TaxoStageYearWithLifeSkill = TaxoStageYear | 'life_skills'
