import { fetchPageApiWebLinkExt } from '@/pages/page-api/weblinkext/[codename]'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Loading } from '../Loading'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkWeblinkExternalProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
}

export const RichtextLinkWeblinkExternal = ({
	link,
	children,
}: RichtextLinkWeblinkExternalProps) => {
	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkWeblinkExternal', link.codename],
		queryFn: () => fetchPageApiWebLinkExt({ codename: link.codename }),
		staleTime: Infinity,
	})

	if (!isFetched) {
		return <Loading />
	}

	return (
		<>
			{children({
				href: data.pageProps.url,
				target: '_blank',
			})}
		</>
	)
}
