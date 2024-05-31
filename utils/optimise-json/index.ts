import { AssetWithRawElements } from '@/types'
import { IContentItemSystemAttributes } from '@kontent-ai/delivery-sdk'

// This function removes the properties that are not needed immutably
export const removeProperties = <T = object>(
	obj: T,
	removedProperties: (keyof T)[],
) => {
	const newObj = { ...obj }
	removedProperties.forEach((property) => {
		delete newObj[property]
	})
	return newObj as T
}

// The default value of the removedProperties is an array of strings
// The strings are the keys of the IContentItemSystemAttributes
export const optimiseSystemJson = (
	item: IContentItemSystemAttributes,
	removedProperties: (keyof IContentItemSystemAttributes)[] = [
		'language',
		'sitemapLocations',
		'workflowStep',
		'collection',
	],
) => {
	// Remove the properties that are not needed
	return removeProperties(item, removedProperties)
}

export const optimiseAssetWithRawElementsJson = (
	item: AssetWithRawElements,
) => {
	const propertiesToBeOptimised = [
		'resource_type',
		'language',
		'stage_group',
		'stage',
		'stage_year',
		'key_learning_area',
		'syllabus',
		'curriculum_wide',
		'assetpublishedyear',
		'assetpublishedmonth',
		'workflow_step',
		'syllabustype',
	]
	return Object.entries(item).reduce((acc, [key, value]) => {
		if (propertiesToBeOptimised.includes(key)) {
			return {
				...acc,
				[key]: value.map((item) => {
					return {
						name: item.name,
						codename: item.codename,
					}
				}),
			}
		}
		return {
			...acc,
			[key]: value,
		}
	}, {} as typeof item)
}
