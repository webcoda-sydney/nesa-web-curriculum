import { Syllabus } from '@/kontent/content-types'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps } from '@/types'
import { useRouter } from 'next/router'
import InPageNav from '../InPageNav'
import NonFullWidthWrapper from '../NonFullWidthWrapper'
import RichText from '../RichText'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export const Overview = ({
	mappings,
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const router = useRouter()
	const { syllabus: syllabusResponse } = data
	const syllabus = syllabusResponse.item

	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="course-overview"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
				className="relative !mb-0"
			/>

			<div>
				<NonFullWidthWrapper>
					<RichText
						currentPath={router.asPath}
						mappings={mappings}
						data-kontent-item-id={syllabus.system.id}
						data-kontent-element-codename="web_content_rtb__content"
						linkedItems={syllabusResponse.linkedItems}
						className="cms-content-formatting"
						richTextElement={
							syllabus.elements.web_content_rtb__content
						}
						suffixForHeading={syllabus.system.codename}
						renderFnBefore={(nodes) => {
							return (
								<InPageNav
									richTextElements={nodes as JSX.Element[]}
								/>
							)
						}}
					/>
				</NonFullWidthWrapper>
			</div>
		</div>
	)
}

export default Overview
