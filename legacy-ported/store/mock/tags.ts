import { taxonomies } from '@/kontent/project/taxonomies'
import { convertProjectModelTaxonomiesToElementModelsTaxonomyTerm } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import camelCase from 'lodash.camelcase'
import type { ITag } from '../../utilities/backendTypes'

export interface ITagDetail {
	contentGroup: string
	description: string[]
}

export interface ITagList {
	klaId: string
	tagId: string
	tagList: ITagDetail[]
}

export const NullTag = 'NUL'

export const TagSource = {
	acara: 'ACARA',
	// nesa: 'NESA',
}

export type MainTagTypes = 'literacy' | 'numeracy'

export const MAIN_TAG_CODENAMES: MainTagTypes[] = ['literacy', 'numeracy']

export const TagCategory: Record<MainTagTypes, string> =
	MAIN_TAG_CODENAMES.reduce((acc, curr) => {
		return {
			...acc,
			[curr]: taxonomies[curr].codename,
		}
	}, {} as Record<MainTagTypes, string>)

const regexIsNameSubCategory = new RegExp(/^-+ /)
const taxonomiesFromLiteracy =
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
		taxonomies.literacy,
	)
const taxonomiesFromNumeracy =
	convertProjectModelTaxonomiesToElementModelsTaxonomyTerm(
		taxonomies.numeracy,
	)

export const getSubCategoriesFromElementsModelTaxonomyTerm = (
	taxos: ElementModels.TaxonomyTerm[],
	isSubSub = false,
) => {
	return taxos
		.filter((t) => regexIsNameSubCategory.test(t.name))
		.reduce<Record<string, string>>((acc, taxo) => {
			const [subCategoryName, subSubCategoryName] = taxo.name
				.replace(regexIsNameSubCategory, '')
				.split(' - ')
				.map((item) => item.trim())

			const categoryName = isSubSub ? subSubCategoryName : subCategoryName
			const key = camelCase(categoryName)
			return {
				...acc,
				[key]: categoryName,
			}
		}, {})
}

const subCategoriesFromLiteracy = getSubCategoriesFromElementsModelTaxonomyTerm(
	taxonomiesFromLiteracy,
)
const subCategoriesFromNumeracy = getSubCategoriesFromElementsModelTaxonomyTerm(
	taxonomiesFromNumeracy,
)
// const subSubCategoriesFromLiteracy = getSubCategoriesFromElementsModelTaxonomyTerm(taxonomiesFromLiteracy, true)
// const subSubCategoriesFromNumeracy = getSubCategoriesFromElementsModelTaxonomyTerm(taxonomiesFromNumeracy, true)

export const TagSubCat = {
	...subCategoriesFromLiteracy,
	...subCategoriesFromNumeracy,
	nul: NullTag,
}

export const TagSubSub = {
	listening: 'Listening',
	interacting: 'Interacting',
	speaking: 'Speaking',
	phonologicalAwareness: 'Phonological awareness',
	phonicKnowledge: 'Phonic knowledge and word recognition',
	fluency: 'Fluency',
	understanding: 'Understanding texts',
	creating: 'Creating texts',
	grammar: 'Grammar',
	punctuation: 'Punctuation',
	spelling: 'Spelling',
	handwriting: 'Handwriting and keyboarding',
	placeValue: 'Number and place value',
	counting: 'Counting process',
	additive: 'Additive strategies',
	multiplicative: 'Multiplicative strategies',
	fractions: 'Interpreting fractions',
	proportionalThinking: 'Proportional thinking',
	numberPatterns: 'Number patterns and algebraic thinking',
	money: 'Understanding money',
	unitsMeasurement: 'Understanding units of measurement',
	geometricProperties: 'Understanding geometric properties',
	positioning: 'Positioning and locating',
	time: 'Measuring time',
	chance: 'Understanding chance',
	interpretingData: 'Interpreting and representing data',
	aboriginalCulture:
		'Aboriginal and Torres Strait Islander histories and cultures',
	asianEngagement: 'Asia and Australia\'s engagement with Asia',
	sustainability: 'Sustainability',
	criticalThinking: 'Critical and creative thinking',
	ethics: 'Ethical understanding',
	digitalLiteracy: 'Digital literacy',
	interculturalUnderstanding: 'Intercultural understanding',
	literacy: 'Literacy',
	numeracy: 'Numeracy',
	personalCapability: 'Personal and social capability',
	work: 'Work and enterprise',
	diffDiversity: 'Difference and diversity',
	civics: 'Civics and citizenship',
	nul: NullTag,
} as const

const getTagSummaries = (
	taxos: ElementModels.TaxonomyTerm[],
	category: string,
) => {
	let tmpCategory: Pick<ITag, 'sub_category' | 'sub_sub_category'> = null
	const fnReduce = (
		acc: Omit<ITag, 'id' | 'source'>[],
		item: ElementModels.TaxonomyTerm,
	) => {
		if (regexIsNameSubCategory.test(item.name)) {
			const [sub_category, sub_sub_category] = item.name
				.replace(regexIsNameSubCategory, '')
				.split(' - ')
				.map((item) => item.trim())
			tmpCategory = {
				sub_category,
				sub_sub_category,
			}
		} else {
			return [
				...acc,
				{
					...tmpCategory,
					category,
					tag: item.name,
					code: item.codename,
				},
			]
		}
		return acc
	}

	return taxos.reduce(fnReduce, [] as Omit<ITag, 'id' | 'source'>[])
}

const AllTagSummary: Omit<ITag, 'id' | 'source'>[] = [
	...getTagSummaries(taxonomiesFromLiteracy, taxonomies.literacy.name),
	...getTagSummaries(taxonomiesFromNumeracy, taxonomies.numeracy.name),
]

export const AllTags: ITag[] = AllTagSummary.map((summ, index) => ({
	...summ,
	source: '',
	id: `T${(index + 1).toString().padStart(3, '0')}`,
	// code: `${TagCategoryCodes[summ.category]}-${TagSubCatCodes[summ.sub_category]
	// 	}-${TagSubSubCodes[summ.sub_sub_category]}-${summ.tag}`,
}))

/**
 * tags match based on everything up to first dot in code
 * @param code
 */
export const findTag = (code: ITag['code']): ITag =>
	AllTags.find((t) => t.code === code.replace(/\..*/, '')) ?? {
		id: NullTag,
		source: NullTag,
		category: NullTag,
		sub_category: NullTag,
		sub_sub_category: NullTag,
		tag: NullTag,
		code: NullTag,
	}

export const getBestTagLabel = (tag: ITag) =>
	[tag.tag, tag.sub_sub_category, tag.sub_category, tag.category].filter(
		(s) => s !== NullTag,
	)[0] ?? 'Unknown'

// export const getAllTagContents = (contents: IContents[]) => {
// 	const allTags: ITagList[] = []

// 	contents.forEach((content) => {
// 		const tags: ITagList[] = []
// 		content.groups.forEach((group) => {
// 			group.rows.forEach((row) => {
// 				row.tags.forEach((tag) => {
// 					const newTag = findTag(tag)
// 					tags.push({
// 						klaId: content.kla_id,
// 						tagId: newTag.tag,
// 						tagList: [
// 							{
// 								contentGroup: group.content_group,
// 								description: [row.description],
// 							},
// 						],
// 					})
// 				})
// 			})
// 		})
// 		allTags.push(...tags)
// 	})

// 	const tagsWithDuplicateContentGroup = allTags.reduce(
// 		(result: ITagList[], tagDescription: ITagList) => {
// 			const { tagId, tagList } = tagDescription

// 			const index = result.findIndex((item) => item.tagId === tagId)
// 			if (index === -1) {
// 				result.push(tagDescription)
// 			} else {
// 				result[index].tagList.push(tagList[0])
// 			}

// 			return result
// 		},
// 		[],
// 	)

// 	const finalTags = tagsWithDuplicateContentGroup.map((tag) => {
// 		const tagList = tag.tagList.reduce(
// 			(finalTagList: ITagDetail[], tagDetail: ITagDetail) => {
// 				const { contentGroup, description } = tagDetail
// 				const index = finalTagList.findIndex(
// 					(item) => item.contentGroup === contentGroup,
// 				)
// 				if (index === -1) {
// 					finalTagList.push(tagDetail)
// 				} else {
// 					finalTagList[index].description.push(description[0])
// 				}
// 				return finalTagList
// 			},
// 			[],
// 		)
// 		tag.tagList = tagList
// 		return tag
// 	})

// 	return finalTags
// }
