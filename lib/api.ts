import { CURRICULUM_SLUGS } from '@/constants'
import {
	DataBuilder,
	dataBuilders,
	getDefaultPageResponse,
} from '@/databuilders/index'
import type {
	AceGroup,
	ReleasenoteAceKla,
	ReleasenoteAceSyllabus,
	ReleasenoteGeneral,
	ReleasenoteSyllabus,
	ReleasenoteSyllabusKla,
	ReleasenoteSyllabusMultiple,
	UiMenu,
	WebLinkSyllabus,
	Weblinkint,
} from '@/kontent/content-types'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { WpHomepage } from '@/kontent/content-types/wp_homepage'
import { contentTypes } from '@/kontent/project/contentTypes'
import type {
	AssetWithRawElements,
	IAssetResponseFromMAPI,
	KontentCurriculumResult,
	Mapping,
	MappingParams,
} from '@/types/index'
import { buildAceReleaseNotesMappings } from '@/utils/ace/buildAceReleaseNotesMappings'
import { buildAceUrlMappings } from '@/utils/ace/buildAceUrlMappings'
import { getMappingByCodename } from '@/utils/getUrlFromMapping'
import {
	filterPreviewableSyllabusesOnly,
	getFnFilterOnlyPublishedAssets,
	getSlugByCodename,
	isAllowPreviewExternalSyllabus,
	isShowPublished,
} from '@/utils/index'
import { retryHelper } from '@kontent-ai/core-sdk/dist/cjs/helpers/retry-helper'
import {
	Elements,
	IContentItem,
	IDeliveryClientConfig,
	MultipleItemsQuery,
	Responses,
	SingleItemQuery,
	SortOrder,
} from '@kontent-ai/delivery-sdk'
import { DeliveryClient } from '@kontent-ai/delivery-sdk/dist/cjs/client/delivery-client'

import { DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS } from '@/constants'
import { fetchPageApiAllAssets } from '@/utils/assets/fetchPageApiAllAssets'
import {
	optimiseAssetWithRawElementsJson,
	optimiseSystemJson,
} from '@/utils/optimise-json'
import type { SharedModels, TaxonomyModels } from '@kontent-ai/management-sdk'
import { createManagementClient } from '@kontent-ai/management-sdk/dist/cjs/client/index'
import type { PreviewData } from 'next/types'
import slugify from 'slugify'
import PUBLISHED_ASSETS_JSON from '../kontent/published-assets.json'
import SITEMAP_JSON from '../kontent/sitemap-mappings.json'
import WEBSITE_CONFIG_JSON from '../kontent/website-config.json'
import packageInfo from '../package.json'

/**
 * Notes
 * loadWebsiteConfig and getSiteMappings calls can't be combined
 * since there will depth parameters might be different
 *
 * loadWebsiteConfig depth is determined by how deep is the content that you want to get
 * getSiteMappings is determined by how deep is the the paths /a/b/c + 1 level for the content
 */

const sourceTrackingHeaderName = 'X-KC-SOURCE'

const DEFAULT_RETRY_STRATEGY = {
	...retryHelper.defaultRetryStrategy,
	maxAttempts: 20,
	deltaBackoffMs: 3000,
}

const fnReturnData = (result) => result.data

const client = getNonLinkedItemsClient()

const managementClient = createManagementClient({
	projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
	apiKey: process.env.KONTENT_MANAGEMENT_API_KEY,
	retryStrategy: DEFAULT_RETRY_STRATEGY,
})

let SITE_CONFIG = {
	preview: null,
	published: undefined,
}
let SITE_MAPPINGS = {
	preview: null,
	published: undefined,
}
export async function getCachedAssets(preview = false) {
	if (!PUBLISHED_ASSETS_JSON || preview) {
		const { pageProps } = await fetchPageApiAllAssets()
		return pageProps.assets.filter(getFnFilterOnlyPublishedAssets(preview))
	}
	return PUBLISHED_ASSETS_JSON as unknown as AssetWithRawElements[]
}

export function getDeliveryClient(options?: Partial<IDeliveryClientConfig>) {
	return new DeliveryClient({
		projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
		previewApiKey: process.env.KONTENT_PREVIEW_API_KEY,
		globalHeaders: (_queryConfig) => [
			{
				header: sourceTrackingHeaderName,
				value: `${packageInfo.name};${packageInfo.version}`,
			},
		],
		assetsDomain: process.env.NEXT_PUBLIC_ASSETS_BASE_PATH,
		retryStrategy: DEFAULT_RETRY_STRATEGY,
		...(options || {}),
	})
}

export function getNonLinkedItemsClient() {
	return getDeliveryClient({ linkedItemsReferenceHandler: 'ignore' })
}

export async function getAllAssets(): Promise<IAssetResponseFromMAPI> {
	return await managementClient.listAssets().toAllPromise().then(fnReturnData)
}

export async function getAllTaxonomies(): Promise<{
	items: TaxonomyModels.Taxonomy[]
	pagination: SharedModels.Pagination
}> {
	return await managementClient
		.listTaxonomies()
		.toAllPromise()
		.then(fnReturnData)
}

export async function loadWebsiteConfig(
	preview = false,
	noCache = false,
): Promise<Responses.IViewContentItemResponse<WpHomepage>> {
	const key = preview ? 'preview' : 'published'
	if (preview || noCache) {
		if (SITE_CONFIG[key]) {
			return SITE_CONFIG[key]
		}

		const result = await getItemByCodename<WpHomepage>({
			codename: 'homepage',
			depth: 5,
			elementsParameter: [
				// Page tab
				contentTypes.wp_homepage.elements.title.codename,
				contentTypes.wp_homepage.elements.subtitle.codename,

				// Site config
				contentTypes.wp_homepage.elements.site_prefix.codename,
				contentTypes.wp_homepage.elements.favicon.codename,
				contentTypes.wp_homepage.elements.descriptor.codename,
				contentTypes.wp_homepage.elements.palette.codename,
				contentTypes.wp_homepage.elements.disabled_stages.codename,
				contentTypes.wp_homepage.elements.disabled_key_learning_areas
					.codename,

				contentTypes.contentrichtext.elements.content.codename,

				// Site config - global alert and global info
				contentTypes.wp_homepage.elements.global_alert.codename,
				contentTypes.wp_homepage.elements.global_info.codename,
				contentTypes.wp_homepage.elements.global_alert_ace.codename,
				contentTypes.ui_globalalert.elements.intro.codename,
				contentTypes.ui_globalalert.elements.content.codename,
				contentTypes.ui_globalalert.elements.btn_primary_text.codename,
				contentTypes.ui_globalalert.elements.btn_primary_url.codename,
				contentTypes.ui_globalalert.elements.btn_secondary_text
					.codename,
				contentTypes.ui_globalalert.elements.btn_secondary_url.codename,
				contentTypes.ui_globalalert.elements.type.codename,

				// Header tab items
				contentTypes.wp_homepage.elements.logo_main.codename,
				contentTypes.wp_homepage.elements.main_menu.codename,

				// Header/Footer - main menu (collection, e.g. Main Menu links - Footer menu links)
				contentTypes.collection_weblink.elements.items.codename,

				// Header / Footer - main menu - children
				contentTypes.ui_menu.elements.item.codename,
				contentTypes.ui_menu.elements.subitems.codename,
				contentTypes.ui_menu.elements.subtitle.codename,
				contentTypes.ui_menu.elements.title.codename,
				contentTypes.ui_menu.elements.titlelong.codename,
				contentTypes.weblinkint.elements.title.codename,
				contentTypes.weblinkint.elements.anchorlink.codename,
				contentTypes.weblinkint.elements.item.codename,
				contentTypes.weblinkint.elements.subtitle.codename,
				contentTypes.weblinkext.elements.title.codename,
				contentTypes.weblinkext.elements.subtitle.codename,
				contentTypes.weblinkext.elements.link_url.codename,

				// Depth 4 because of this
				// Header tab items - main menu children - item - slug
				contentTypes.web_page.elements.slug.codename,

				// Depth 5
				contentTypes.wp_stage.elements.stages__stages.codename,

				// Footer tab elements
				contentTypes.wp_homepage.elements.footer_top_content.codename,
				contentTypes.wp_homepage.elements.social_links.codename,
				contentTypes.wp_homepage.elements.footer_menu_links.codename,
				contentTypes.wp_homepage.elements.acknowledgement.codename,
				contentTypes.wp_homepage.elements.secondary_links.codename,
				contentTypes.wp_homepage.elements.copyright_link.codename,

				//Tooltips
				contentTypes.wp_homepage.elements
					.syllabusoutcomes_alignedcontent.codename,
				contentTypes.wp_homepage.elements
					.syllabusoutcomes_relatedoutomes.codename,
				contentTypes.wp_homepage.elements
					.syllabussenioroutcomes_relatedoutomes.codename,

				// Message
				contentTypes.wp_homepage.elements.glossary_intro.codename, // glossary intro
				contentTypes.wp_homepage.elements.nocontent_teachingadvice
					.codename,
				contentTypes.wp_homepage.elements.externallink_popup_message
					.codename,
				contentTypes.wp_homepage.elements.overarchingoutcome_message
					.codename,
			],
			preview,
		})
		SITE_CONFIG[key] = result
		return result
	}

	return WEBSITE_CONFIG_JSON as unknown as Responses.IViewContentItemResponse<WpHomepage>
}

async function getSubPaths(data, pagesCodenames, parentSlug, preview = false) {
	const paths = []

	for (const pageCodename of pagesCodenames) {
		const currentItem = data.linkedItems[pageCodename]
		if (!currentItem) continue
		const pageSlug = parentSlug.concat(currentItem.elements.slug.value)

		paths.push({
			params: {
				pageTitle: currentItem.elements.title.value,
				slug: pageSlug,
				navigationItem: optimiseSystemJson(
					currentItem.system,
					DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
				), // will be ignored by next in getContentPaths
				excludeInSitemap: false,
			},
		})

		if (currentItem.elements?.subpages?.value) {
			const subPaths = await getSubPaths(
				data,
				currentItem.elements['subpages'].value,
				pageSlug,
				preview,
			)
			paths.push(...subPaths)
		}
	}

	return paths
}

export async function getAllOtherPotentialLinks(
	mappings: Mapping[],
	preview,
): Promise<Mapping[]> {
	const [weblinkints, weblinkSyllabus, uimenus] = await Promise.all([
		getAllItemsByType<Weblinkint>({
			type: contentTypes.weblinkint.codename,
			preview,
		}),
		getAllItemsByType<WebLinkSyllabus>({
			type: contentTypes.web_link_syllabus.codename,
			preview,
		}),
		getAllItemsByType<UiMenu>({
			type: contentTypes.ui_menu.codename,
			preview,
		}),
	])

	const filterFn = <
		TItem extends { item: Elements.LinkedItemsElement },
		T extends IContentItem<TItem>,
	>(
		item: T,
	) => {
		return item.elements.item.value?.[0]
	}

	const weblinkIntMappings = weblinkints.items
		.filter(filterFn)
		.map((_weblinkint) => {
			return {
				params: {
					slug: [],
					...getMappingByCodename(
						mappings,
						_weblinkint.elements.item.value[0],
					)?.params,
					navigationItem: optimiseSystemJson(
						_weblinkint.system,
						DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
					),
					additional: `${
						_weblinkint.elements.querystring.value
							? `?${_weblinkint.elements.querystring.value}`
							: ''
					}${
						_weblinkint.elements.anchorlink.value
							? `#${_weblinkint.elements.anchorlink.value}`
							: ''
					}`,
					excludeInSitemap: true,
				},
			} as Mapping
		})

	const weblinkSyllabusMappings = weblinkSyllabus.items
		.filter(filterFn)
		.map((_weblinkSyllabus) => {
			let tab =
				getSlugByCodename(
					_weblinkSyllabus.elements.tab?.value?.[0]?.codename,
				) || 'overview'
			if (tab === 'course-overview') tab = 'overview'

			// by default, the syllabus mapping will have /overview
			const _params =
				getMappingByCodename(
					mappings,
					_weblinkSyllabus.elements.item.value[0],
				)?.params || ({} as MappingParams)

			return {
				params: {
					..._params,
					slug: _params.slug
						? _params.slug.filter((s, index, _slugs) => {
								// remove the last slug if it's overview
								if (index === _slugs.length - 1) {
									return s !== 'overview'
								}
								return true
						  })
						: [],
					navigationItem: optimiseSystemJson(
						_weblinkSyllabus.system,
						DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
					),
					additional: `/${tab}`,
					excludeInSitemap: true,
				},
			} as Mapping
		})

	// combined them all first so that the uimenus that use the weblinks, can be searched
	const combinedWeblinkMappings = [
		...weblinkIntMappings,
		...weblinkSyllabusMappings,
	]

	return [
		...combinedWeblinkMappings,
		...uimenus.items.filter(filterFn).map((_uiMenu) => {
			return {
				params: {
					slug: [],
					...getMappingByCodename(
						[...combinedWeblinkMappings, ...mappings],
						_uiMenu.elements.item.value[0],
					)?.params,
					navigationItem: optimiseSystemJson(
						_uiMenu.system,
						DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
					),
					excludeInSitemap: true,
				},
			} as Mapping
		}),
	]
}

export async function getSiteMappings(
	preview = false,
	noCache = false,
	excludedContentTypes = [],
): Promise<Mapping[]> {
	const key = preview ? 'preview' : 'published'

	const fnExcludeContentTypes = (mapping) => {
		if (!excludedContentTypes.length) return true
		return !excludedContentTypes.includes(
			mapping.params.navigationItem.type,
		)
	}

	if (preview || noCache) {
		if (SITE_MAPPINGS[key]) {
			return SITE_MAPPINGS[key]
		}
		const [data, syllabusMappings, aceGroupMappings] = await Promise.all([
			getItemByCodename<WpHomepage>({
				codename: 'homepage',
				depth: 3 + 1,
				elementsParameter: [
					'subpages',
					'slug',
					'title',
					'web_content_rtb__content',
				],
				preview,
			}),

			// there's no subpages specified for syllabus, that's why we created the paths
			// based on the syllabus list
			getAllSyllabusMappings(preview),
			getAllAceMappings(preview),
		])

		const rootSlug = []
		const pathsFromKontent: Mapping[] = [
			{
				params: {
					pageTitle: data.item.elements.title.value,
					slug: rootSlug,
					navigationItem: optimiseSystemJson(
						data.item.system,
						DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
					), // will be ignored by next in getContentPaths
					excludeInSitemap: false,
					isCanonical: true,
				},
			},
		]

		const subPaths = await getSubPaths(
			data,
			data.item.elements['subpages'].value,
			rootSlug,
			preview,
		)

		const tmpMappings = pathsFromKontent.concat(
			...subPaths,
			...syllabusMappings,
			...aceGroupMappings,
		)
		const allOtherPaths = await getAllOtherPotentialLinks(
			tmpMappings,
			preview,
		)
		const result = [...tmpMappings, ...allOtherPaths]
		SITE_MAPPINGS[key] = result
		return result.filter(fnExcludeContentTypes)
	}
	return (SITEMAP_JSON && Array.isArray(SITEMAP_JSON)
		? SITEMAP_JSON.filter(fnExcludeContentTypes)
		: SITEMAP_JSON) as unknown as Mapping[]
}
interface FilterParams {
	element: string
	value: string[]
}

export interface IGetItemByCodenameParams {
	codename: string
	depth?: number
	elementsParameter?: string[]
	preview?: boolean
	kontentClient?: DeliveryClient
}

export async function getItemByCodename<T extends IContentItem>({
	codename,
	depth = 1,
	elementsParameter,
	preview,
	kontentClient = client,
}: IGetItemByCodenameParams): Promise<
	Responses.IViewContentItemResponse<T> | undefined
> {
	let temp = kontentClient.item<T>(codename).depthParameter(depth)
	if (elementsParameter) {
		temp = temp.elementsParameter(elementsParameter)
	}
	let response

	try {
		response = await temp
			.queryConfig({ usePreviewMode: preview })
			.toPromise()
		return client.mappingService.viewContentItemResponse<T>(
			response.response.data,
		)
	} catch {
		return
	}
}

export function getAllItemsByType<T extends IContentItem>({
	type,
	depth = 1,
	order = null,
	elementsParameter = null,
	containsFilter = null,
	allFilter = null,
	anyFilter = null,
	equalsFilter = null,
	notEmptyFilter = null,
	notEqualsFilter = null,
	inFilter = null,
	preview,
	kontentClient = client,
}: {
	type: string
	depth?: number
	order?: { element: string; sortOrder: SortOrder }
	elementsParameter?: string[]
	containsFilter?: FilterParams
	allFilter?: FilterParams
	anyFilter?: FilterParams
	equalsFilter?: { element: string; value: string }
	notEmptyFilter?: { element: string }
	notEqualsFilter?: { element: string; value: string }
	inFilter?: FilterParams
	preview: boolean
	kontentClient?: DeliveryClient
}): Promise<Responses.IListContentItemsResponse<T>> {
	let temp = kontentClient.items<T>().type(type).depthParameter(depth)
	if (order) {
		temp = temp.orderParameter(order.element, order.sortOrder)
	}
	if (elementsParameter) {
		temp = temp.elementsParameter(elementsParameter)
	}
	if (containsFilter) {
		temp = temp.containsFilter(containsFilter.element, containsFilter.value)
	}
	if (allFilter) {
		temp = temp.allFilter(allFilter.element, allFilter.value)
	}
	if (anyFilter) {
		temp = temp.anyFilter(anyFilter.element, anyFilter.value)
	}
	if (equalsFilter) {
		temp.equalsFilter(equalsFilter.element, equalsFilter.value)
	}
	if (notEmptyFilter) {
		temp.notEmptyFilter(notEmptyFilter.element)
	}
	if (notEqualsFilter) {
		temp.notEqualsFilter(notEqualsFilter.element, notEqualsFilter.value)
	}
	if (inFilter) {
		temp.inFilter(inFilter.element, inFilter.value)
	}
	return temp
		.queryConfig({ usePreviewMode: preview })
		.toPromise()
		.then(fnReturnData)
}

export async function getItemsFeed<T extends IContentItem>({
	type,
	order = null,
	elementsParameter = null,
	containsFilter = null,
	allFilter = null,
	anyFilter = null,
	equalsFilter = null,
	notEmptyFilter = null,
	notEqualsFilter = null,
	inFilter = null,
	limitParameter = null,
	preview,
	kontentClient = client,
}: {
	type: string
	depth?: number
	order?: { element: string; sortOrder: SortOrder }
	elementsParameter?: string[]
	containsFilter?: FilterParams
	allFilter?: FilterParams
	anyFilter?: FilterParams
	equalsFilter?: { element: string; value: string }
	notEmptyFilter?: { element: string }
	notEqualsFilter?: { element: string; value: string }
	inFilter?: FilterParams
	limitParameter?: number
	preview: boolean
	kontentClient?: DeliveryClient
}) {
	let temp = kontentClient.itemsFeed<T>().type(type)

	if (order) {
		temp = temp.orderParameter(order.element, order.sortOrder)
	}
	if (elementsParameter) {
		temp = temp.elementsParameter(elementsParameter)
	}
	if (containsFilter) {
		temp = temp.containsFilter(containsFilter.element, containsFilter.value)
	}
	if (allFilter) {
		temp = temp.allFilter(allFilter.element, allFilter.value)
	}
	if (anyFilter) {
		temp = temp.anyFilter(anyFilter.element, anyFilter.value)
	}
	if (equalsFilter) {
		temp.equalsFilter(equalsFilter.element, equalsFilter.value)
	}
	if (notEmptyFilter) {
		temp.notEmptyFilter(notEmptyFilter.element)
	}
	if (notEqualsFilter) {
		temp.notEqualsFilter(notEqualsFilter.element, notEqualsFilter.value)
	}
	if (inFilter) {
		temp.inFilter(inFilter.element, inFilter.value)
	}
	if (limitParameter) {
		temp.limitParameter(limitParameter)
	}

	const result = await temp
		.queryConfig({ usePreviewMode: preview })
		.toAllPromise()
		.then(fnReturnData)

	return result
}

type TCommonGetItemParams<
	T extends IContentItem,
	TQueryType extends SingleItemQuery<T> | MultipleItemsQuery<T>,
> = {
	preview: boolean
	depth?: number
	moreQueryFn?: (_query: TQueryType) => TQueryType
	kontentClient?: DeliveryClient
}

export function getItemByCodenameV2<T extends IContentItem>({
	codename,
	depth = 1,
	preview,
	moreQueryFn,
	kontentClient = client,
}: TCommonGetItemParams<T, SingleItemQuery<T>> & {
	codename: string
}): Promise<Responses.IViewContentItemResponse<T>> {
	const firstQuery = kontentClient.item<T>(codename).depthParameter(depth)
	const query = moreQueryFn ? moreQueryFn(firstQuery) : firstQuery

	return query
		.queryConfig({ usePreviewMode: preview })
		.toPromise()
		.then(fnReturnData)
}

export function getAllItemsByTypeV2<T extends IContentItem>({
	type,
	preview,
	depth = 0,
	moreQueryFn,
	kontentClient = client,
}: TCommonGetItemParams<T, MultipleItemsQuery<T>> & {
	type: string
}): Promise<Responses.IListContentItemsResponse<T>> {
	const firstQuery = kontentClient.items<T>().type(type).depthParameter(depth)
	const query = moreQueryFn ? moreQueryFn(firstQuery) : firstQuery
	return query
		.queryConfig({ usePreviewMode: preview })
		.toPromise()
		.then(fnReturnData)
}

export function getTaxonomy(
	taxonomyGroup: string,
): Promise<Responses.IViewTaxonomyResponse> {
	return client.taxonomy(taxonomyGroup).toPromise().then(fnReturnData)
}

async function getAllSyllabusMappings(preview): Promise<Mapping[]> {
	const ctSyllabus = contentTypes.syllabus
	// This should be filtered by whether it's doing redirect or not
	const data = await getAllItemsByType<Syllabus>({
		type: ctSyllabus.codename,
		depth: 0,
		preview,
		elementsParameter: [
			ctSyllabus.elements.title.codename,
			ctSyllabus.elements.key_learning_area__items.codename,
			ctSyllabus.elements.key_learning_area_default.codename,
			ctSyllabus.elements.syllabus.codename,
			ctSyllabus.elements.doredirect.codename,
			ctSyllabus.elements.allowpreview.codename,
		],
		containsFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: `elements.${ctSyllabus.elements.doredirect.codename}`,
					value: ['no'],
			  },
	})

	const previewableSyllabusesOnly = data.items.filter(
		filterPreviewableSyllabusesOnly,
	)

	return [
		// /learning-areas/[kla-codename]/[syllabus-codename]
		...previewableSyllabusesOnly.flatMap((_syllabus) => {
			const {
				title,
				key_learning_area__items,
				key_learning_area_default,
			} = _syllabus.elements

			const keyLearningAreaDefaultCodename =
				key_learning_area_default?.value?.[0]?.codename ||
				key_learning_area__items?.value?.[0]?.codename

			return key_learning_area__items?.value.map((keyLearningArea) => {
				return {
					params: {
						pageTitle: title.value,
						slug: [
							...CURRICULUM_SLUGS.LEARNING_AREAS,
							slugify(
								keyLearningArea.codename.replace(/_/g, '-') ||
									'',
							),
							slugify(
								_syllabus.system.codename.replace(/_/g, '-') ||
									'',
							),
							'overview',
						].filter((item) => !!item),
						navigationItem: optimiseSystemJson(
							_syllabus.system,
							DEFAULT_EXCLUDED_FIELDS_FROM_MAPPINGS,
						),
						excludeInSitemap: false,
						taxoSyllabus:
							_syllabus.elements.syllabus.value?.[0]?.codename,
						isCanonical:
							keyLearningAreaDefaultCodename ===
							keyLearningArea.codename,
					},
				} as Mapping
			})
		}),
	]
}
async function getAllAceMappings(preview): Promise<Mapping[]> {
	const ctAceGroup = contentTypes.ace_group
	// This should be filtered by whether it's doing redirect or not
	const [
		aceGroupsForMapping,
		rnSyllabus,
		rnSyllabusKla,
		rnSyllabusMultiple,
		rnAceSyllabus,
		rnAceKla,
		rnGeneral,
	] = await Promise.all([
		getAllItemsByType<AceGroup>({
			type: ctAceGroup.codename,
			depth: 3,
			preview,
		}),
		getAllItemsByType<ReleasenoteSyllabus>({
			type: contentTypes.releasenote_syllabus.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteSyllabusKla>({
			type: contentTypes.releasenote_syllabus_kla.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteSyllabusMultiple>({
			type: contentTypes.releasenote_syllabus_multiple.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteAceSyllabus>({
			type: contentTypes.releasenote_ace_syllabus.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteAceKla>({
			type: contentTypes.releasenote_ace_kla.codename,
			preview,
		}),
		getAllItemsByType<ReleasenoteGeneral>({
			type: contentTypes.releasenote_general.codename,
			preview,
		}),
	])

	return [
		...buildAceReleaseNotesMappings(rnSyllabus),
		...buildAceReleaseNotesMappings(rnSyllabusKla),
		...buildAceReleaseNotesMappings(rnSyllabusMultiple),
		...buildAceReleaseNotesMappings(rnAceSyllabus),
		...buildAceReleaseNotesMappings(rnAceKla),
		...buildAceReleaseNotesMappings(rnGeneral),
		...buildAceUrlMappings(aceGroupsForMapping),
	]
}

export async function getPageStaticPropsForPath(
	params,
	preview = false,
	previewData?: PreviewData,
): Promise<KontentCurriculumResult<IContentItem>> {
	const isGetPreviewContent = !isShowPublished(previewData) && preview

	let [config, mappings] = await Promise.all([
		loadWebsiteConfig(isGetPreviewContent), // TODO could be cached
		getSiteMappings(isGetPreviewContent), // TODO could be cached
	])
	const slugValue = params && params.slug ? params.slug : []

	const pathMapping = mappings.find(
		(path) => path?.params?.slug?.join('#') === slugValue?.join('#'),
	) // condition works for array of basic values

	const navigationItemSystemInfo =
		pathMapping && pathMapping.params.navigationItem

	if (!navigationItemSystemInfo?.codename) {
		return undefined
	}

	// Loading content data
	const { getPageResponse, buildData } = (dataBuilders[
		navigationItemSystemInfo.type
	] || {}) as DataBuilder

	const { type, codename } = navigationItemSystemInfo

	const pageResponse = await (getPageResponse
		? getPageResponse({ codename, preview: isGetPreviewContent })
		: getDefaultPageResponse({
				codename,
				type,
				preview: isGetPreviewContent,
		  }))

	const result = {
		mappings,
		data: {
			config,
			pageResponse,
		},
	}

	if (buildData) {
		const assets = await getCachedAssets(isGetPreviewContent)
		return buildData({
			result,
			preview: isGetPreviewContent,
			pageResponse,
			assets: assets.map(optimiseAssetWithRawElementsJson),
		})
	}
	return result
}
