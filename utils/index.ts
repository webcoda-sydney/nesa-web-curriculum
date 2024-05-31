import {
	ALL_TAXO_GROUPS,
	CURRICULUM_SLUGS,
	EMPTY_KONTENT_RICHTEXT,
	FILE_TYPES,
	HOME_REDIRECTED_SLUGS,
	STAGES_ORDER,
	SyllabusTabsToElement,
} from '@/constants'
import {
	ContentOutcomenotification,
	Syllabus,
	Weblinkvideo,
	WpStage,
} from '@/kontent/content-types'
import type { Glossary } from '@/kontent/content-types/glossary'
import type { Weblinkext } from '@/kontent/content-types/weblinkext'
import { contentTypes } from '@/kontent/project/contentTypes'
import { TaxoStage } from '@/kontent/taxonomies'
import type { ISelectOption } from '@/legacy-ported/components/base/CustomSelect'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import type { IGlossary } from '@/legacy-ported/utilities/backendTypes'
import type { UrlLink } from '@/legacy-ported/utilities/frontendTypes'
import { customSyllabusQueryString } from '@/legacy-ported/utilities/functions'
import { getAllItemsByType } from '@/lib/api'
import type {
	AssetRawElementInner,
	AssetWithRawElements,
	CustomSyllabusTab,
	FileTypeClassification,
	KontentCurriculumCommonResultData,
	KontentCurriculumResult,
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import type {
	ElementModels,
	Elements,
	IContentItem,
	IContentItemsContainer,
	ITaxonomyTerms,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { AssetModels, TaxonomyModels } from '@kontent-ai/management-sdk'
import filesize from 'filesize'
import intersection from 'lodash.intersection'
import isEqual from 'lodash.isequal'
import { GetStaticPaths, PreviewData } from 'next'
import { TagProps } from 'nsw-ds-react/dist/component/tags/tags'
import { getSlugByCodename } from './getSlugByCodename'
import getUrlFromMapping, { getUrlFromSlugs } from './getUrlFromMapping'
import kontentImageLoader from './kontentImageLoader'
import srcIsKontentAsset from './srcIsKontentAsset'

export const noop = () => {}
export const fnExist = (item) => !!item
export const isIntersect = (...arrays) => intersection(...arrays).length > 0
export const negatePredicate = (predicate) =>
	function () {
		return !predicate.apply(null, arguments)
	}
export const byIContentItemCodename = (obj: IContentItem<any>) =>
	obj.system.codename
export const byTaxoCodename = <T extends string>(
	obj: ElementModels.TaxonomyTerm<T>,
) => obj.codename
export const byTaxoName = <T extends string>(
	obj: ElementModels.TaxonomyTerm<T>,
) => obj.name
export const byValue = (obj: { value: unknown }) => obj.value

export const convertGlossaryToIGlossary = (
	glossaries: Glossary[],
): IGlossary[] => {
	return glossaries.reduce((acc, glossary: Glossary) => {
		const section = glossary.elements.title.value.slice(0, 1).toLowerCase()
		const foundSection = acc.find((item) => item.section === section)
		if (foundSection) {
			foundSection.records = [...foundSection.records, glossary]
			return acc
		} else {
			return [
				...acc,
				{
					section,
					records: [glossary],
				},
			]
		}
	}, [])
}

// Get year text from years
export const getTagFromYears = (
	years: ElementModels.MultipleChoiceOption[] | ElementModels.TaxonomyTerm[],
) => {
	const yearRanges =
		years
			?.map((item) => item.name)
			.sort((a, b) => {
				if (Number.isNaN(parseInt(a))) return -1
				if (Number.isNaN(parseInt(b))) return 0
				return parseInt(a) - parseInt(b)
			}) || []
	let yearText = ''
	if (!yearRanges.length) return yearText
	if (yearRanges.length === 1) {
		yearText = yearRanges[0]
	} else {
		yearText = `${yearRanges[0]}–${yearRanges[yearRanges.length - 1]}`
	}
	return yearText.toUpperCase()
}

export const getSortedStageByTaxoTerms = (
	stageTerms: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
) => {
	return stageTerms.sort((a, b) => {
		const sortFn = getFnSortStagesOnTaxoStages()
		return sortFn(a.codename, b.codename)
	})
}

export const getStageTags = (
	stageElement: Elements.TaxonomyElement<TaxoStageWithLifeSkill>,
) => {
	return getStageTagsByTaxoTerms(stageElement.value)
}
export const getStageTagsByTaxoTerms = (
	stageTerms: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
) => {
	return getSortedStageByTaxoTerms(stageTerms).map<TagProps>((s) => ({
		text: s.name,
	}))
}

/**
 * Get sort function based on ElementModels.TaxonomyTerm<TaxoStage>[]
 * @param stageOrders the order of TaxoStage. Default is from STAGES_ORDER
 * @returns
 */
export const getFnSortStages =
	(stageOrders = STAGES_ORDER) =>
	(
		stageA: ElementModels.TaxonomyTerm<TaxoStage>,
		stageB: ElementModels.TaxonomyTerm<TaxoStage>,
	) => {
		return (
			stageOrders.findIndex((s) => s === stageA.codename) -
			stageOrders.findIndex((s) => s === stageB.codename)
		)
	}

/**
 * Get sort function based on ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[]
 * @returns
 */
export const getFnSortYears =
	() =>
	(
		a: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>,
		b: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>,
	) => {
		const isLifeSkillA = a.codename === 'life_skills'
		const isLifeSkillB = b.codename === 'life_skills'
		if (isLifeSkillA && !isLifeSkillB) {
			return 1
		}
		if (!isLifeSkillA && isLifeSkillB) {
			return -1
		}
		if (!isLifeSkillA && !isLifeSkillB) {
			if (Number.isNaN(parseInt(a.name))) return -1
			if (Number.isNaN(parseInt(b.name))) return 0
			return parseInt(a.name) - parseInt(b.name)
		}
		return 0
	}

/**
 * Get sort function based on TaxoStage[]
 * @param stageOrders the order of TaxoStage. Default is from STAGES_ORDER
 * @returns
 */
export const getFnSortStagesOnTaxoStages =
	(stageOrders = STAGES_ORDER) =>
	(stageA: TaxoStageWithLifeSkill, stageB: TaxoStageWithLifeSkill) => {
		const isStageALifeSkills = stageA === 'life_skills'
		const isStageBLifeSkills = stageB === 'life_skills'
		if (isStageALifeSkills && !isStageBLifeSkills) return 1
		if (!isStageALifeSkills && isStageBLifeSkills) return -1
		if (isStageALifeSkills && isStageBLifeSkills) return 0
		return (
			stageOrders.findIndex((s) => s === stageA) -
			stageOrders.findIndex((s) => s === stageB)
		)
	}

/**
 * Find all linkedItems that are used by a richtext element
 * @param richtextElement richtext element
 * @param linkedItems list of linkedItems that are possibly used by richtextElement
 */
export const getLinkElementUsedByRichtext = (
	richtextElement: Elements.RichTextElement,
	linkedItems: IContentItem[],
) => {
	return Object.keys(linkedItems).reduce((acc, curr) => {
		if (richtextElement.linkedItemCodenames.includes(curr)) {
			return {
				...acc,
				[curr]: linkedItems[curr],
			}
		}
		return acc
	}, {})
}

export const isNavItemExternalUrl = (navItem: IContentItem) => {
	if (!navItem) {
		console.error('navItem is undefined')
		return false
	}
	return navItem.system.type === 'weblinkext'
}

export const isRichtextEmpty = (richtextVal: string) => {
	return !richtextVal || richtextVal === EMPTY_KONTENT_RICHTEXT
}
export const isRichtextElementEmpty = (
	richtextEl: Elements.RichTextElement,
) => {
	return !richtextEl || (richtextEl && isRichtextEmpty(richtextEl?.value))
}

export const shouldSlugBeRedirected = (
	slug: string[],
	mustRedirectedSlugs = HOME_REDIRECTED_SLUGS,
) => {
	return Object.values(mustRedirectedSlugs).some((mustRedirectSlug) => {
		return isEqual(slug, mustRedirectSlug)
	})
}

export const redirectStagePage = (
	data: KontentCurriculumCommonResultData<IContentItem>,
) => {
	if (!data) return

	if (data.pageResponse.item.system.type === contentTypes.wp_stage.codename) {
		const _data = data as KontentCurriculumResult<
			WpStage,
			KontentCurriculumCommonResultData<WpStage>
		>['data']

		const queryStrings = customSyllabusQueryString({
			stageIds: getTaxoCodenames(
				_data.pageResponse.item.elements.stages__stages,
			),
			tabIds: SYLLABUS_TABS.map((t) => t.id),
			syllabusIds: [],
		})

		// build url
		const base = getUrlFromSlugs(CURRICULUM_SLUGS.CUSTOM_SYLLABUSES)
		return base + '/?' + queryStrings
	}
	return
}

export const getBreadcrumb = (
	slug: string[],
	mappings: Mapping[],
): UrlLink[] => {
	const slugsWithHome = ['', ...slug]

	const tmp = slugsWithHome
		.map((slugUrl: string, index) => {
			const _mapping = mappings.find((mapping) => {
				const mappingSlugLength = mapping.params.slug.length
				if (!mappingSlugLength && !slugUrl) {
					return true
				}

				if (
					mapping.params.navigationItem.type ===
					contentTypes.syllabus.codename
				) {
					// if the mapping is syllabus, then we need to check the second last slug
					// because the last slug is always /overview, which won't match with most of slugs
					// for syllabus
					return (
						mappingSlugLength &&
						mapping.params.slug[mappingSlugLength - 2] === slugUrl
					)
				}

				return (
					mappingSlugLength &&
					mapping.params.slug[mappingSlugLength - 1] === slugUrl
				)
			})

			if (!_mapping) return undefined

			const shouldBeRedirected = shouldSlugBeRedirected(
				_mapping.params.slug,
			)

			let url
			if (index !== slugsWithHome.length - 1) {
				if (!shouldBeRedirected) {
					url = getUrlFromMapping(
						mappings,
						_mapping.params.navigationItem?.codename,
					)
				}
			}

			return {
				title: _mapping.params.pageTitle,
				url,
			}
		})
		.filter(Boolean)

	return tmp.filter((item, index) => {
		if (index === 0 || index === tmp.length - 1) return true
		return !!item?.url
	})
}

export const getDataAttributesFromProps = (props) => {
	return {
		...Object.keys(props)
			.filter((key) => key.includes('data-'))
			.reduce((acc, key) => {
				return {
					...acc,
					[key]: props[key],
				}
			}, {}),
	}
}

export interface ITaxonomyWithTaxonomyGroup extends TaxonomyModels.Taxonomy {
	taxonomyGroup?: string
}

export const flattenTaxonomies = (
	taxonomies: ITaxonomyWithTaxonomyGroup[],
	taxonomyGroup = '',
): ITaxonomyWithTaxonomyGroup[] => {
	return taxonomies.flatMap((item) => {
		const { _raw, ...props } = item

		/** add taxonomy group codename to each of the children */
		props.taxonomyGroup = taxonomyGroup

		if (item.terms?.length) {
			return [
				props,
				...flattenTaxonomies(
					item.terms,
					taxonomyGroup || item.codename,
				),
			]
		}
		return props
	}) as ITaxonomyWithTaxonomyGroup[]
}

export const setTaxonomiesForAssets = (
	assets: AssetModels.Asset[],
	taxonomies: TaxonomyModels.Taxonomy[],
) => {
	const taxonomiesFromMAPI = flattenTaxonomies(taxonomies)
	const fnGetTaxonomy = (item: AssetRawElementInner) =>
		taxonomiesFromMAPI.find((tax) => tax.id == item.id)
	return assets.map((asset: AssetWithRawElements) => {
		/**
		 * Get only the taxonomy values. Since we can only determine the taxonomy group by the value
		 * of the elements.
		 * Each element in asset is a taxonomy group. Values of each element are taxonomy terms
		 *
		 */
		const taxonomiesWithValues = (asset.elements || asset._raw.elements)
			.filter((el) => el.value.length)
			.reduce((acc, el) => {
				const firstEl = el.value[0]
				/**
				 * Get the taxonomy first and make the taxonomy group codename as the key of the pair
				 */
				const { taxonomyGroup } = taxonomiesFromMAPI.find(
					(t) => t.id === firstEl.id,
				)
				return {
					...acc,
					[taxonomyGroup]: el.value.map(fnGetTaxonomy),
				}
			}, {})

		/**
		 * Elements/taxonomies without values will be set as empty array
		 */
		const taxonomiesWithoutValues = ALL_TAXO_GROUPS.filter(
			(taxoGroup) =>
				!Object.keys(taxonomiesWithValues).some((t) => t === taxoGroup),
		).reduce((acc, taxoGroup) => {
			return {
				...acc,
				[taxoGroup]: [],
			}
		}, {})

		return {
			...asset,
			...taxonomiesWithValues,
			...taxonomiesWithoutValues,
		}
	})
}

export const convertProjectModelTaxonomiesToElementModelsTaxonomyTerm = <
	TTerm extends string,
	TProjectConfigTaxo extends { terms: object },
>(
	taxonomy: TProjectConfigTaxo,
): ElementModels.TaxonomyTerm<TTerm>[] => {
	return Object.keys(taxonomy.terms).reduce((acc, key) => {
		const currentTaxonomyTerm = taxonomy.terms[key]
		return [
			...acc,
			{
				name: currentTaxonomyTerm.name,
				codename: currentTaxonomyTerm.codename,
				terms: convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
					currentTaxonomyTerm,
				),
			},
		]
	}, [])
}

export const getFileTypeClassification = (
	type: string,
): FileTypeClassification => {
	if (type.includes('image/')) return 'Image'
	if (type.includes('video/')) return 'Video'
	if (type.includes('audio/')) return 'Audio'
	return FILE_TYPES[type]
}

export const compareValueWithMultipleChoiceCodename = <T extends string>(
	multipleChoiceElement:
		| Elements.MultipleChoiceElement
		| Elements.TaxonomyElement<T>,
	value: T,
) => {
	return multipleChoiceElement?.value?.some((v) => v.codename === value)
}
export function isYes(multipleChoiceElement: Elements.MultipleChoiceElement) {
	return compareValueWithMultipleChoiceCodename(multipleChoiceElement, 'yes')
}
export function isNo(multipleChoiceElement: Elements.MultipleChoiceElement) {
	return compareValueWithMultipleChoiceCodename(multipleChoiceElement, 'no')
}

export function getTaxoCodenamesFromTaxoTerms<T extends string>(
	terms: ElementModels.TaxonomyTerm<T>[],
): T[] {
	return terms.map(byTaxoCodename)
}

export function getTaxoCodenames<T extends string>(
	taxonomyElement: Elements.TaxonomyElement<T>,
): T[] {
	return getTaxoCodenamesFromTaxoTerms(taxonomyElement?.value || [])
}

export const convertTaxonomyTermsIntoSelectOption = (
	taxonomyTerms: ITaxonomyTerms[],
): ISelectOption[] => {
	return taxonomyTerms.map((term) => {
		return {
			text: term.name,
			value: term.codename,
		}
	})
}

export const isShowPublished = (previewData: PreviewData) => {
	if (!previewData || typeof previewData === 'string') {
		return false
	}

	return 'showpublished' in previewData
}

export const getSyllabusElements = (tabs?: CustomSyllabusTab[]) => {
	return [
		//tabs related
		...Object.entries(SyllabusTabsToElement)
			.filter(
				([tab]) =>
					!tabs?.length || tabs.includes(tab as CustomSyllabusTab),
			)
			.flatMap(([_, elements]) => elements),

		// must-have on syllabus
		contentTypes.syllabus.elements.web_content_rtb__content.codename, //to check whether the syllabus has text or not
		contentTypes.syllabus.elements.title.codename,
		contentTypes.syllabus.elements.description.codename,
		contentTypes.syllabus.elements.syllabus.codename,
		contentTypes.syllabus.elements.stages__stages.codename,
		contentTypes.syllabus.elements.stages__stage_years.codename,
		contentTypes.syllabus.elements.key_learning_area__items.codename,
		contentTypes.syllabus.elements.key_learning_area_default.codename,
		contentTypes.syllabus.elements.doredirect.codename,
		contentTypes.syllabus.elements.redirecturl.codename,
		contentTypes.syllabus.elements.implementation_info.codename,
		contentTypes.syllabus.elements.implementation_title.codename,
		contentTypes.syllabus.elements.implementation_summary.codename,
		contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename,
		contentTypes.syllabus.elements.allowpreview.codename,
		contentTypes.syllabus.elements.syllabus_type__items.codename,

		// SEO description by tab
		...(tabs || [])?.map(
			(tab) =>
				contentTypes.syllabus.elements[
					getSeoDescriptionFieldKeyByTab(tab)
				]?.codename,
		),

		// For richtext elements
		contentTypes.contentrichtext.elements.content.codename,

		// Content Richtext can have UI media component inside its content
		...Object.values(contentTypes.ui_media.elements).map(
			(item) => item.codename,
		),
		...Object.values(contentTypes.ui_accordion.elements).map(
			(item) => item.codename,
		),
		...Object.values(contentTypes.weblinkint.elements).map(
			(item) => item.codename,
		),
		...Object.values(contentTypes.weblinkext.elements).map(
			(item) => item.codename,
		),
	]
}

export const getFnIsItemHasStage =
	<
		TItem extends {
			stages__stages: Elements.TaxonomyElement<TaxoStageWithLifeSkill>
		},
		T extends IContentItem<TItem>,
	>(
		stage: TaxoStageWithLifeSkill,
	) =>
	(item: T) =>
		item.elements.stages__stages.value.some(
			(s) => !stage || s.codename === stage,
		)

export const getFnIsItemHasYear =
	<
		TItem extends {
			stages__stage_years: Elements.TaxonomyElement<TaxoStageYearWithLifeSkill>
		},
		T extends IContentItem<TItem>,
	>(
		year: TaxoStageYearWithLifeSkill,
	) =>
	(item: T) =>
		item.elements.stages__stage_years.value.some(
			(y) => !year || y.codename === year,
		)

export const getFilesizeFormatter = (
	options = {
		base: 2,
		standard: 'jedec',
		roundingMethod: 'floor',
	},
) => {
	return filesize.partial(options as any)
}

export const getApiDataQuery = <TBody>(
	body: TBody | string | undefined,
): TBody => {
	if (typeof body === 'string') {
		return JSON.parse(body)
	}
	return body
}

export const getWebLinkWithoutAce = <T extends Weblinkvideo | Weblinkext>(
	webLinks: Responses.IListContentItemsResponse<T>,
): Responses.IListContentItemsResponse<T> => {
	return {
		...webLinks,
		items: webLinks.items.filter((link) => {
			//only get the ones that are tagged but not teaching advice
			return (
				link.elements.resource_type.value.length &&
				link.elements.resource_type.value.every(
					(tag) => !tag.codename.includes('ace_'),
				)
			)
		}),
	}
}

export const excludeAceGlossaries = (
	glossaries: Responses.IListContentItemsResponse<Glossary>,
) => {
	return {
		...glossaries,
		// exclude glossaries with type = ace
		items: glossaries.items.filter(
			(glossary) =>
				!glossary.elements.type.value?.some(
					(val) => val.codename === 'ace',
				),
		),
	}
}

export const sanitizeIdAttribute = (str) =>
	str?.trim()?.replace(/[^a-zA-Z0-9\-_:.]/g, '-')

export const isAllowPreviewExternalSyllabus = () => {
	return process.env.NEXT_PUBLIC_ALLOW_EXTERNAL_SYLLABUS_PREVIEW === 'true'
}

export const filterPreviewableSyllabusesOnly = (syllabus: Syllabus) => {
	if (isAllowPreviewExternalSyllabus()) {
		// only the ones that are not doredirect
		return (
			!isYes(syllabus.elements.doredirect) ||
			isYes(syllabus.elements.allowpreview)
		)
	}
	return true
}

export const getFnFilterOnlyPublishedAssets =
	(isPreview: boolean) => (asset: AssetWithRawElements) => {
		if (isPreview) {
			return !asset.workflow_step.some((s) => s.codename === 'archived')
		}
		return asset.workflow_step.some((s) => s.codename === 'published')
	}

// parse string into integer and default to 0 if error parsing
export const parseInteger = (str: string) => {
	const parsed = parseInt(str)
	return isNaN(parsed) ? 0 : parsed
}

/**
 *
 * @param glossaries initial glossaries response
 * @param stagedAndOrLiveSyllabuses array of syllabuses which are staged (do_redirect & allow preview -
 * 	depending on the NEXT_PUBLIC_ALLOW_EXTERNAL_SYLLABUS_PREVIEW environment variable) and live
 * @returns
 */
export const excludeUnstagedSyllabusesTagsFromGlossaries = (
	glossaries: Responses.IListContentItemsResponse<Glossary>,
	stagedAndOrLiveSyllabuses: Syllabus[],
): Responses.IListContentItemsResponse<Glossary> => {
	return {
		...glossaries,
		items: glossaries.items.map((item) => {
			return {
				...item,
				elements: {
					...item.elements,
					syllabus: {
						...item.elements.syllabus,
						value: item.elements.syllabus.value.filter((_syl) => {
							const _sylCodename = _syl.codename
							return stagedAndOrLiveSyllabuses
								.map(
									(syllabus) =>
										syllabus.elements.syllabus.value[0]
											?.codename,
								)
								.includes(_sylCodename)
						}),
					},
				},
			}
		}),
	}
}

/**
 *
 * @param glossaries initial glossaries response
 * @param stagedAndOrLiveSyllabuses array of syllabuses which are staged (do_redirect & allow preview -
 * 	depending on the NEXT_PUBLIC_ALLOW_EXTERNAL_SYLLABUS_PREVIEW environment variable) and live
 * @returns
 */
export const excludeGlossariesWhoseSyllabusIsNotLiveOrStaged = (
	glossaries: Responses.IListContentItemsResponse<Glossary>,
	stagedAndOrLiveSyllabuses: Syllabus[],
) => {
	const stagedAndOrLiveSyllabusesCodenames = stagedAndOrLiveSyllabuses.map(
		(syl) => syl.elements.syllabus.value[0]?.codename,
	)

	return {
		...glossaries,
		items: glossaries.items.filter((item) => {
			return (
				!item.elements.syllabus.value.length ||
				item.elements.syllabus.value.some((syl) => {
					const _sylCodename = syl.codename
					return stagedAndOrLiveSyllabusesCodenames.includes(
						_sylCodename,
					)
				})
			)
		}),
	}
}

export const getCodenameBySlug = (slug: string) => slug.replace(/-/g, '_')

export const getSyllabusPathsParams: GetStaticPaths = async () => {
	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 0,
		preview: false,
	})

	const fallback = false

	const paths = syllabusResponse.items.flatMap((syllabus) => {
		const { key_learning_area__items } = syllabus.elements

		return {
			params: {
				learningarea: getSlugByCodename(
					key_learning_area__items?.value?.[0]?.codename,
				),
				syllabus: getSlugByCodename(syllabus.system.codename),
			},
		}
	})

	return {
		paths,
		fallback,
	}
}

export const getSyllabusPaths = async () => {
	const { paths } = await getSyllabusPathsParams(null)
	return paths.map((path) => {
		if (typeof path !== 'string') {
			const { params } = path
			const { syllabus, learningarea } = params
			return `/learning-areas/${learningarea}/${syllabus}`
		}
		return ''
	})
}

export const redirectToHome = () => {
	return {
		redirect: {
			destination: '/',
			permanent: false,
		},
	}
}

export const getSeoDescriptionFieldKeyByTab = (tab: CustomSyllabusTab) => {
	let syllabusTabIdMatchedWithParam: string = tab
	if (tab === 'course-overview') {
		syllabusTabIdMatchedWithParam = 'overview'
	}
	if (tab === 'teaching-and-learning') {
		syllabusTabIdMatchedWithParam = 'support'
	}
	return `seo_description_${syllabusTabIdMatchedWithParam}`
}

export const uniquePrimitiveArray = <T>(array: T[]): T[] => {
	return [...new Set(array)]
}

export const getLinkedItems = <T extends IContentItem>(
	linkedItemsElement: Elements.LinkedItemsElement<T>,
	linkedItems: IContentItemsContainer,
) => {
	if (!linkedItemsElement || !linkedItems) return null
	return linkedItemsElement?.value
		?.map((item) => linkedItems[item])
		.filter((t) => !!t) as T[]
}

export const getUnbindedLinkedItems = <T extends IContentItem>(
	linkedItemsElement: Elements.LinkedItemsElement<T>,
	linkedItems: IContentItem[],
) => {
	if (!linkedItemsElement || !linkedItems) return null
	return linkedItemsElement?.value.map((ruleName) => {
		return linkedItems.find((i) => i.system.codename == ruleName) as T
	})
}

export const sleep = async (timeout = 1000) => {
	return new Promise((resolve) => setTimeout(resolve, timeout))
}

export const getArrayLength = (array: unknown[]) => array?.length || 0

export const filterOnlyWebOutcomeNotifications = (
	outcomeNotification: ContentOutcomenotification,
) => {
	const display = outcomeNotification.elements.display.value
	if (!display.length) return true
	return display.some((d) => d.codename.includes('website'))
}

export const delay = async (timeout = 0) =>
	await new Promise((resolve) => setTimeout(resolve, timeout))

export {
	getSlugByCodename,
	getUrlFromMapping,
	kontentImageLoader,
	srcIsKontentAsset,
}
