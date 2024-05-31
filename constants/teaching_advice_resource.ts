import { DownloadListProps } from '@/legacy-ported/components/syllabus/DownloadList'

export const WP_TA_RESOURCE_PAGE_SIZE = 20 as const
export const WP_TA_RESOURCE_SORT_MODEL: DownloadListProps['initialSortModel'] =
	[
		{
			field: 'date',
			sort: 'desc',
		},
	]
