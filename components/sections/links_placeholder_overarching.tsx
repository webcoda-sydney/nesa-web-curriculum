import { LinksPlaceholderOverarching } from '@/kontent/content-types'
import { ContentOverarchingLinks } from '@/legacy-ported/components/syllabus/ContentOverarchingLinks'
import { fetchAllOverarchingLinks } from '@/pages/page-api/all-overarching-links'
import { useQuery } from '@tanstack/react-query'
import type { RichtextSectionProps } from '.'
import { Loading } from '../Loading'

export default function LinksPlaceholderOverarchingComp(
	props: RichtextSectionProps<LinksPlaceholderOverarching>,
) {
	const { linkedItem } = props
	const { data: allOverachingLinks, isFetched } = useQuery(
		['links_placeholder_overarching', linkedItem.system.codename],
		async () => {
			const json = await fetchAllOverarchingLinks()
			if (json.pageProps.links) {
				return json.pageProps.links
			}
			return []
		},
		{
			staleTime: Infinity,
		},
	)

	if (!isFetched) return <Loading />

	return (
		<ContentOverarchingLinks
			pretitle={linkedItem.elements.title.value}
			links={linkedItem.elements.links.value
				.map((link) => {
					const _link = allOverachingLinks.find(
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
		></ContentOverarchingLinks>
	)
}
