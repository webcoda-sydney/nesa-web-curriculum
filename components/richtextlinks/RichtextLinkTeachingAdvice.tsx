import { Syllabus } from '@/kontent/content-types'
import { fetchPageApiTeachingAdviceLink } from '@/pages/page-api/teaching-advice-link/[...slug]'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { ILink } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { LinkProps } from 'next/link'
import { ReactNode } from 'react'
import { Loading } from '../Loading'

interface RichtextLinkTeachingAdviceProps {
	link: ILink
	currentSyllabus: Syllabus
	currentStage: TaxoStageWithLifeSkill
	currentYear: TaxoStageYearWithLifeSkill
	children: (_: LinkProps) => ReactNode
}

export const RichtextLinkTeachingAdvice = ({
	link,
	children,
	currentStage,
	currentYear,
}: RichtextLinkTeachingAdviceProps) => {
	const { data, isFetched } = useQuery({
		queryKey: [
			'RichtextLinkAdvice__teachingAdvice',
			link.codename + currentStage + currentYear,
		],
		queryFn: () =>
			fetchPageApiTeachingAdviceLink({
				codename: link.codename,
				stage: currentStage,
				year: currentYear,
			}),
		staleTime: Infinity,
	})

	if (!isFetched) {
		return <Loading />
	}

	if (data) {
		const { pageProps } = data

		return (
			<>
				{children({
					href: pageProps.url,
					scroll: false,
				})}
			</>
		)
	}
}
