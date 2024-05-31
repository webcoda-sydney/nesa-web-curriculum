import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import { CustomSyllabusTab, IPropWithClassName, Mapping } from '@/types'
import { getSlugByCodename } from '@/utils'
import { getSyllabusUrlFromMappingBySyllabusCodename } from '@/utils/getSyllabusUrlFromMapping'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { CommonCopyUrlWrapper } from '../copy-to-clipboard/CommonCopyUrlWrapper'

export interface SyllabusTabsTitleProps extends IPropWithClassName {
	tabId: CustomSyllabusTab
	mappings: Mapping[]
	syllabusCodename: string
}

export const SyllabusTabsTitle = ({
	tabId,
	mappings,
	syllabusCodename,
	className,
}: SyllabusTabsTitleProps) => {
	const { query } = useRouter()
	const slugKla = query['learningarea'] as string

	const syllabusMappings = mappings
		.filter((mapping) => mapping.params.navigationItem.type === 'syllabus')
		.filter((mapping) => {
			return mapping.params.slug
				.join('/')
				.includes(
					`learning-areas/${slugKla}/${getSlugByCodename(
						syllabusCodename,
					)}`,
				)
		})

	const syllabusTab = SYLLABUS_TABS.find((tab) => tab.id === tabId)
	const _tabId =
		syllabusTab.id === 'course-overview' ? 'overview' : syllabusTab.id
	return (
		<CommonCopyUrlWrapper
			url={
				getSyllabusUrlFromMappingBySyllabusCodename(
					syllabusMappings,
					syllabusCodename,
					false,
					true,
				) + `/${_tabId}`
			}
			className={clsx('mb-8', className)}
		>
			<h2>{syllabusTab.name}</h2>
		</CommonCopyUrlWrapper>
	)
}
