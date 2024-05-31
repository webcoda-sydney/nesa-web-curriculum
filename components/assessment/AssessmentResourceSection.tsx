import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { UiVideoTile, Weblinkext } from '@/kontent/content-types'
import DownloadList, {
	DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	DownloadListField,
} from '@/legacy-ported/components/syllabus/DownloadList'
import { fnExist } from '@/utils'
import { Elements, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { useMemo } from 'react'
import { useAssetsFromAssetsElement } from '../contexts/AssetsProvider'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'

export interface AssessmentResourceSectionProps {
	linkedItems: IContentItemsContainer
	resources: Elements.AssetsElement
	otherResources: Elements.LinkedItemsElement<UiVideoTile | Weblinkext>
}

export const ASSESSMENT_RESOURCE_SECTION_HIDDEN_FIELDS: DownloadListField[] = [
	...DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	'stage',
	'resourceType',
	'year',
]

const useCombinedResourceAndOtherResources = (
	resources: Elements.AssetsElement,
	otherResources: Elements.LinkedItemsElement<UiVideoTile | Weblinkext>,
	linkedItems: IContentItemsContainer,
) => {
	const assets = useAssetsFromAssetsElement(resources)
	const _otherResources = getLinkedItems(otherResources, linkedItems)
	return [...assets, ...(_otherResources || [])].filter(fnExist)
}

export const AssessmentResourceSection = (
	props: AssessmentResourceSectionProps,
) => {
	const isScreenDownMd = useIsScreenDown('md')
	const { linkedItems, resources, otherResources } = props

	const files = useCombinedResourceAndOtherResources(
		resources,
		otherResources,
		linkedItems,
	)

	const downloadListHiddenFields = useMemo<DownloadListField[]>(() => {
		if (isScreenDownMd) {
			return [
				...ASSESSMENT_RESOURCE_SECTION_HIDDEN_FIELDS,
				'fileSize',
				'fileType',
			]
		}
		return ASSESSMENT_RESOURCE_SECTION_HIDDEN_FIELDS
	}, [isScreenDownMd])

	if (!files?.length) return

	return (
		<DownloadList
			files={files}
			hiddenFields={downloadListHiddenFields}
			hideCheckbox
		></DownloadList>
	)
}
