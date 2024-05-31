import { fetchPageApiWebLinkTeachingadvice } from '@/pages/page-api/web_link_teachingadvice/[codename]'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Loading } from '../Loading'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkWeblinkTeachingadviceProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
}

export const RichtextLinkWeblinkTeachingadvice = ({
	link,
	children,
}: RichtextLinkWeblinkTeachingadviceProps) => {
	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkWeblinkTeachingadvice', link.codename],
		queryFn: () =>
			fetchPageApiWebLinkTeachingadvice({ codename: link.codename }),
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
