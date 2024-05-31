import { fetchPageApiWebLinkContentgroup } from '@/pages/page-api/web_link_contentgroup/[codename]'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Loading } from '../Loading'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkWeblinkContentgroupProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
}

export const RichtextLinkWeblinkContentgroup = ({
	link,
	children,
}: RichtextLinkWeblinkContentgroupProps) => {
	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkWeblinkContengroup', link.codename],
		queryFn: () =>
			fetchPageApiWebLinkContentgroup({ codename: link.codename }),
		staleTime: Infinity,
	})

	if (!isFetched) {
		return <Loading />
	}

	return (
		<>
			{children({
				href: data.pageProps.url,
				scroll: true,
			})}
		</>
	)
}
