//@ts-check

/**
 * This util file contains the constants and helper functions for the curriculum in javascript.
 * Please sync manually by matching the variable name on the typescript file.
 */
const {
	retryHelper,
} = require('@kontent-ai/core-sdk/dist/cjs/helpers/retry-helper')
const { DeliveryClient } = require('@kontent-ai/delivery-sdk')
const isEqual = require('lodash.isequal')
const packageInfo = require('../package.json')
const { isFocusarea, isFocusareaoption } = require('./typepredicates')

const fnReturnData = (response) => response.data
const sourceTrackingHeaderName = 'X-KC-SOURCE'
const DEFAULT_RETRY_STRATEGY = {
	...retryHelper.defaultRetryStrategy,
	maxAttempts: 20,
	deltaBackoffMs: 3000,
}

const SYLLABUS_TABS = [
	{
		id: 'course-overview',
		index: 0,
		name: 'Course overview',
	},
	{
		id: 'rationale',
		index: 1,
		name: 'Rationale',
	},
	{
		id: 'aim',
		index: 2,
		name: 'Aim',
	},
	{
		id: 'outcomes',
		index: 3,
		name: 'Outcomes',
	},
	{
		id: 'content',
		index: 4,
		name: 'Content',
	},
	{
		id: 'assessment',
		index: 5,
		name: 'Assessment',
	},
	{
		id: 'glossary',
		index: 6,
		name: 'Glossary',
	},
	{
		id: 'teaching-and-learning',
		index: 7,
		name: 'Teaching and learning support',
	},
]

const getDeliveryClient = () =>
	new DeliveryClient({
		projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID || '',
		previewApiKey: process.env.KONTENT_PREVIEW_API_KEY,
		globalHeaders: (_queryConfig) => [
			{
				header: sourceTrackingHeaderName,
				value: `${packageInfo.name};${packageInfo.version}`,
			},
		],
		assetsDomain: process.env.NEXT_PUBLIC_ASSETS_BASE_PATH,
		retryStrategy: DEFAULT_RETRY_STRATEGY,
		linkedItemsReferenceHandler: 'ignore',
	})

const CURRICULUM_SLUGS = {
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

const HOME_REDIRECTED_SLUGS = [
	CURRICULUM_SLUGS.SYLLABUSES,
	CURRICULUM_SLUGS.CUSTOM_SYLLABUSES,
	CURRICULUM_SLUGS.RESOURCES_GLOBAL_SUPPORT,
	CURRICULUM_SLUGS.RESOURCES_SYLLABUS_SUPPORT,
]

// sync this with layouts\index.ts
const SLUGGED_PAGE_LAYOUTS = [
	'web_page',
	'wp_glossary',
	'wp_homepage',
	'wp_learningarea',
	'wp_learningareas',
	'wp_resources',
	'wp_stage',
	'wp_stages',
	'wp_stagegroup',
	'wp_teachingadvice',
	'syllabus',
	'wp_custom_view',
	'wp_ace_landing',
	'ace_group',
	'ace_subgroup',
	'wp_ace_recentchanges',
	'wp_dc_recentchanges',
	'wp_ace_contact',
	'releasenote_general',
	'releasenote_ace_kla',
	'releasenote_ace_syllabus',
	'releasenote_syllabus',
	'releasenote_syllabus_kla',
	'releasenote_syllabus_multiple',
]

const shouldSlugBeRedirected = (
	slug,
	mustRedirectedSlugs = HOME_REDIRECTED_SLUGS,
) => {
	return Object.values(mustRedirectedSlugs).some((mustRedirectSlug) => {
		return isEqual(slug, mustRedirectSlug)
	})
}

/**
 * Retrieves all items of a specific type from the content using Kentico Kontent Delivery API.
 * @template T - The type of the content item.
 * @param {Object} options - The options for retrieving the items.
 * @param {string} options.type - The type of the content item.
 * @param {number} [options.depth=1] - The depth of the query.
 * @param {Object} [options.order=null] - The order of the items.
 * @param {string[] | null} [options.elementsParameter=null] - The elements to include in the response.
 * @param {Object} [options.containsFilter=null] - The contains filter parameters.
 * @param {Object} [options.allFilter=null] - The all filter parameters.
 * @param {Object} [options.anyFilter=null] - The any filter parameters.
 * @param {Object} [options.equalsFilter=null] - The equals filter parameters.
 * @param {Object} [options.notEmptyFilter=null] - The not empty filter parameters.
 * @param {Object} [options.notEqualsFilter=null] - The not equals filter parameters.
 * @param {Object} [options.inFilter=null] - The in filter parameters.
 * @param {boolean} options.preview - Indicates whether to use preview mode.
 * @param {import('@kontent-ai/delivery-sdk/dist/cjs/client/delivery-client').DeliveryClient} [options.kontentClient=client] - The Kentico Kontent Delivery client.
 * @returns {Promise<import('@kontent-ai/delivery-sdk').Responses.IListContentItemsResponse<T>>} - The promise that resolves to the list of content items.
 */
const getAllItemsByType = ({
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
	kontentClient = getDeliveryClient(),
}) => {
	let temp = kontentClient.items().type(type).depthParameter(depth)
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

const isAllowPreviewExternalSyllabus = () => {
	return process.env.NEXT_PUBLIC_ALLOW_EXTERNAL_SYLLABUS_PREVIEW === 'true'
}

/**
 * Filters previewable syllabuses only.
 * @param {import('../kontent/content-types/syllabus').Syllabus} syllabus - The syllabus object.
 * @returns {boolean} - Returns true if the syllabus is previewable, otherwise false.
 */
const filterPreviewableSyllabusesOnly = (syllabus) => {
	if (isAllowPreviewExternalSyllabus()) {
		// only the ones that are not doredirect
		return (
			!isYes(syllabus.elements.doredirect) ||
			isYes(syllabus.elements.allowpreview)
		)
	}
	return true
}

/**
 * Compares a value with a multiple choice codename.
 * @template T - The type of the multiple choice element.
 * @param {import('@kontent-ai/delivery-sdk').Elements.MultipleChoiceElement | import('@kontent-ai/delivery-sdk').Elements.TaxonomyElement<T>} multipleChoiceElement - The multiple choice element.
 * @param {T} value - The value to compare with.
 * @returns {boolean} - Returns true if the value matches any codename in the multiple choice element, otherwise false.
 */
const compareValueWithMultipleChoiceCodename = (
	multipleChoiceElement,
	value,
) => {
	return multipleChoiceElement?.value?.some((v) => v.codename === value)
}

/**
 * Checks if a multiple choice element has a value of 'yes'.
 * @param {import('@kontent-ai/delivery-sdk').Elements.MultipleChoiceElement} multipleChoiceElement - The multiple choice element.
 * @returns {boolean} - Returns true if the multiple choice element has a value of 'yes', otherwise false.
 */
const isYes = (multipleChoiceElement) => {
	return compareValueWithMultipleChoiceCodename(multipleChoiceElement, 'yes')
}

/**
 * Replaces underscores with hyphens in a codename to create a slug.
 * @param {string} codename - The codename to convert to a slug.
 * @returns {string} - The slug.
 */
const getSlugByCodename = (codename) => codename.replace(/_/g, '-')

const getLinkedItems = (linkedItemsElement, linkedItems) => {
	if (!linkedItemsElement || !linkedItems) return null
	return linkedItemsElement?.value
		?.map((item) => linkedItems[item])
		.filter((t) => !!t)
}
/**
 * Returns an array with unique values.
 * @template T - The type of the array elements.
 * @param {T[]} array - The array to remove duplicates from.
 * @returns {T[]} - The array with unique values.
 */
const uniquePrimitiveArray = (array) => {
	return [...new Set(array)]
}

const getCodenameBySlug = (slug) => {
	return slug.replace(/-/g, '_')
}

/**
 * Returns the codename of an IContentItem object.
 * @param {import('@kontent-ai/delivery-sdk').IContentItem<any>} obj - The IContentItem object.
 * @returns {string} - The codename of the object.
 */
const byIContentItemCodename = (obj) => obj.system.codename

/**
 * Returns the codename of a TaxonomyTerm object.
 * @param {import('@kontent-ai/delivery-sdk').ElementModels.TaxonomyTerm<any>} obj - The TaxonomyTerm object.
 * @returns {string} - The codename of the object.
 */
const byTaxoCodename = (obj) => obj.codename

/**
 * Returns the name of a TaxonomyTerm object.
 * @param {import('@kontent-ai/delivery-sdk').ElementModels.TaxonomyTerm<any>} obj - The TaxonomyTerm object.
 * @returns {string} - The name of the object.
 */
const byTaxoName = (obj) => obj.name

/**
 * Checks if a syllabus belongs to stage 6.
 * @param {import('../kontent/content-types/syllabus').Syllabus} syllabus - The syllabus object.
 * @returns {boolean} - Returns true if the syllabus belongs to stage 6, otherwise false.
 */
const isStage6Syllabus = (syllabus) =>
	syllabus.elements.stages__stages.value.some((s) => s.codename === 'stage_6')

/**
 * Checks if an item is a life skill focus area, option list, or outcome.
 * @param {import('../kontent').Focusarea | import('../kontent').Optionslist | import('../kontent').Focusareaoption | import('../kontent').Outcome} item - The item to check.
 * @returns {boolean} - Returns true if the item is a life skill focus area, option list, or outcome, otherwise false.
 */
const isLifeSkillFocusAreaOrOptionListOrOutcome = (item) => {
	if (!item) return false
	return compareValueWithMultipleChoiceCodename(
		item.elements?.syllabus_type__items,
		'life_skills',
	)
}

/**
 * Retrieves the life skill stages based on the provided object, syllabus, and linked items.
 * @param {import('../kontent').Focusarea | import('../kontent').Optionslist | import('../kontent').Focusareaoption} obj - The object representing a focus area, option list, or focus area option.
 * @param {import('../kontent').Syllabus} syllabus - The syllabus object.
 * @param {import('@kontent-ai/delivery-sdk').IContentItemsContainer} linkedItems - The container of linked items.
 * @returns {(import('../types').TaxoStageWithLifeSkill)[]} - The array of life skill stages.
 */
const getLifeSkillStages = (obj, syllabus, linkedItems) => {
	const isStage6Syl = isStage6Syllabus(syllabus)
	const isLifeSkillFA = isLifeSkillFocusAreaOrOptionListOrOutcome(obj)
	if (!isLifeSkillFA) {
		return syllabus.elements.stages__stages.value.flatMap(byTaxoCodename)
	}

	const relatedMainstreamFAs =
		(isFocusarea(obj) || isFocusareaoption(obj)) &&
		// @ts-ignore
		obj.elements?.related_focusareas?.value?.length
			? // @ts-ignore
			  getLinkedItems(obj.elements?.related_focusareas, linkedItems)
			: [obj]

	if (!isStage6Syl) {
		return ['stage_4', 'stage_5', 'life_skills']
	}

	return [
		'life_skills',
		...(relatedMainstreamFAs?.flatMap((fa) => {
			if (!fa.elements.stages__stage_years) {
				console.log(fa, 'no years or stages')
			}
			const faYearsOrStages = (
				isStage6Syl
					? fa.elements.stages__stage_years.value
					: fa.elements.stages__stages.value
			).flatMap(byTaxoCodename)

			return faYearsOrStages
		}) || []),
	]
}

module.exports = {
	getDeliveryClient,
	getAllItemsByType,
	isAllowPreviewExternalSyllabus,
	filterPreviewableSyllabusesOnly,
	compareValueWithMultipleChoiceCodename,
	isYes,
	shouldSlugBeRedirected,
	getSlugByCodename,
	getLinkedItems,
	uniquePrimitiveArray,
	getCodenameBySlug,
	isStage6Syllabus,
	getLifeSkillStages,
	byIContentItemCodename,
	byTaxoCodename,
	byTaxoName,
	SLUGGED_PAGE_LAYOUTS,
	SYLLABUS_TABS,
	CURRICULUM_SLUGS,
	HOME_REDIRECTED_SLUGS,
	sourceTrackingHeaderName,
	DEFAULT_RETRY_STRATEGY,
}
