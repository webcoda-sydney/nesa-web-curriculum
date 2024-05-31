import { fetchAllCurriculumConnectionLinks } from '@/pages/page-api/all-curriculum-connection-links'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Loading } from '../Loading'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkWeblinkCCProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
}

export const RichtextLinkWeblinkCC = ({
	link,
	children,
}: RichtextLinkWeblinkCCProps) => {
	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkWeblinkCC'],
		queryFn: () => fetchAllCurriculumConnectionLinks(),
		staleTime: Infinity,
	})

	if (!isFetched) {
		return <Loading />
	}

	if (isFetched && !data) {
		return null
	}

	// Find the link in the data
	const ccLink = data.pageProps.links.find(
		(_link) => _link.item.system.codename === link.codename,
	)

	return (
		<>
			{children({
				href: ccLink.url,
				scroll: true,
			})}
		</>
	)
}
