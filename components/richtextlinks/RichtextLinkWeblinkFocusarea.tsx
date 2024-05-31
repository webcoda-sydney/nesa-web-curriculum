import { fetchPageApiWebLinkFocusarea } from '@/pages/page-api/web_link_focusarea/[codename]'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Loading } from '../Loading'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkWeblinkFocusareaProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
}

export const RichtextLinkWeblinkFocusarea = ({
	link,
	children,
}: RichtextLinkWeblinkFocusareaProps) => {
	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkWeblinkFocusarea', link.codename],
		queryFn: () =>
			fetchPageApiWebLinkFocusarea({ codename: link.codename }),
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
