import { AssetWithRawElements, VideoLinkOrExtLinkOrAssetType } from '@/types'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { AssetModels, TaxonomyModels } from '@kontent-ai/management-sdk'
import format from 'date-fns/format'
import {
	getStageTagsByTaxoTerms,
	getTaxoCodenamesFromTaxoTerms,
	setTaxonomiesForAssets,
} from '..'
import {
	isWebLinkTeachingadviceExtended,
	isWebLinkVideo,
	isWebLinkVideoOrExtOrTeachingAdviceExtended,
	isWebLinkext,
} from '../type_predicates'

export const getVideoLinkOrExtLinkOrAssetHeadline = (obj) => {
	return (
		(isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
			? obj.elements.title.value
			: obj.title || obj.fileName) || ''
	).trim()
}

export const getVideoLinkOrExtLinkOrAssetSyllabusLabels = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	const syllabuses = isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
		? obj.elements.syllabus.value
		: obj.syllabus
	return syllabuses.length > 1 ? 'Multiple syllabuses' : syllabuses?.[0]?.name
}

export const getVideoLinkOrExtLinkOrAssetSyllabusTaxoCodenames = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	const syllabus = isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
		? obj.elements.syllabus.value
		: obj.syllabus
	return getTaxoCodenamesFromTaxoTerms(syllabus)
}
export const getVideoLinkOrExtLinkOrAssetStageTaxoCodenames = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	const taxos = isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
		? obj.elements.stages__stages.value
		: obj.stage
	return getTaxoCodenamesFromTaxoTerms(taxos)
}
export const getVideoLinkOrExtLinkOrAssetStageYearTaxoCodenames = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	const taxos = isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
		? obj.elements.stages__stage_years.value
		: obj.stage_year
	return getTaxoCodenamesFromTaxoTerms(taxos)
}
export const getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	if (isWebLinkTeachingadviceExtended(obj)) return []
	const taxos =
		isWebLinkVideo(obj) || isWebLinkext(obj)
			? obj.elements.resource_type.value
			: obj.resource_type
	return getTaxoCodenamesFromTaxoTerms(taxos)
}

export const getVideoLinkOrExtLinkOrAssetStageTags = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	const stages = isWebLinkVideoOrExtOrTeachingAdviceExtended(obj)
		? obj.elements.stages__stages.value
		: obj.stage
	return getStageTagsByTaxoTerms(stages)
}

export const getVideoLinkOrExtLinkOrAssetLastModified = (
	obj: VideoLinkOrExtLinkOrAssetType,
): string => {
	let lastModified: string = ''

	if (isWebLinkVideo(obj)) {
		lastModified = obj.elements.date.value || obj.system.lastModified
	} else if (isWebLinkTeachingadviceExtended(obj) || isWebLinkext(obj)) {
		lastModified = obj.elements.updated.value || obj.system.lastModified
	} else {
		if (obj.assetpublishedmonth.length && obj.assetpublishedyear.length) {
			return new Date(
				parseInt(obj.assetpublishedyear[0].name),
				parseInt(obj.assetpublishedmonth[0].name) - 1,
				1,
			).toISOString()
		}
		lastModified = (obj.lastModified.toString() as string) || ''
	}
	return lastModified
}

export const getVideoLinkOrExtLinkOrAssetUrl = (
	obj: VideoLinkOrExtLinkOrAssetType,
) => {
	let url = ''
	if (isWebLinkVideo(obj)) {
		url = obj.elements.video_url.value
	} else if (isWebLinkext(obj)) {
		url = obj.elements.link_url.value
	} else if (isWebLinkTeachingadviceExtended(obj)) {
		url = obj.link
	} else {
		url = obj.url
	}
	return url
}
export const matchFilesWithResourceAssets = (
	file: AssetWithRawElements,
	resource: ElementModels.AssetModel,
) => {
	const urlFile = new URL(file.url)
	const urlResource = new URL(resource.url)
	return urlFile.pathname === urlResource.pathname
}

export const getAllAssetsWithTaxo = (
	assetItems: AssetModels.Asset[],
	taxonomyItems: TaxonomyModels.Taxonomy[],
) => {
	const assetsWithTaxonomies = setTaxonomiesForAssets(
		assetItems,
		taxonomyItems,
	)
	return (
		assetsWithTaxonomies?.map((item) => {
			const {
				fileReference,
				imageHeight,
				imageWidth,
				folder,
				_raw,
				...rest
			} = item
			return rest as AssetWithRawElements
		}) || []
	)
}

export const getAssetUpdatedDate = (asset: AssetWithRawElements) => {
	const lastModified = getVideoLinkOrExtLinkOrAssetLastModified(asset)
	return format(new Date(lastModified), 'MMM yyyy')
}
