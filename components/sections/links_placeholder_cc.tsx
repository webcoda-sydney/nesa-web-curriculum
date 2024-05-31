import { LinksPlaceholderOverarching } from '@/kontent/content-types'
import { ContentCurriculumConnectionLinks } from '@/legacy-ported/components/syllabus/ContentCurriculumConnectionLinks'
import { fetchAllCurriculumConnectionLinks } from '@/pages/page-api/all-curriculum-connection-links'
import { useQuery } from '@tanstack/react-query'
import type { RichtextSectionProps } from '.'
import { Loading } from '../Loading'

export default function LinksPlaceholderCcComp(
	props: RichtextSectionProps<LinksPlaceholderOverarching>,
) {
	const { linkedItem, className } = props
	const { data: links, isFetched } = useQuery(
		['links_placeholder_cc'],
		async () => {
			const json = await fetchAllCurriculumConnectionLinks()
			if (json.pageProps.links) {
				return json.pageProps.links
			}
			return []
		},
		{
			staleTime: Infinity,
		},
	)

	// If there are no links, return null
	if (linkedItem.elements.links.value.length === 0) return null

	if (!isFetched)
		return (
			<span className="LinksPlaceholderCc">
				<Loading />
			</span>
		)

	return (
		<ContentCurriculumConnectionLinks
			className={className}
			pretitle={linkedItem.elements.title.value}
			links={linkedItem.elements.links.value
				.map((link) => {
					const _link = links.find(
						(_l) => _l.item.system.codename === link,
					)
					return _link
						? {
								overarchingLinkItem: _link.item,
								href: _link.url,
						  }
						: null
				})
				.filter(Boolean)}
		></ContentCurriculumConnectionLinks>
	)
}
