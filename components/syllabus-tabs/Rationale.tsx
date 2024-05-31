import { Syllabus } from '@/kontent/content-types'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps } from '@/types'
import { useRouter } from 'next/router'
import NonFullWidthWrapper from '../NonFullWidthWrapper'
import RichText from '../RichText'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export const Rationale = ({
	mappings,
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const router = useRouter()
	const { syllabus: syllabusResponse } = data
	const syllabus = syllabusResponse.item

	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="rationale"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
			/>
			<NonFullWidthWrapper className="-mt-4">
				<RichText
					currentPath={router.asPath}
					mappings={mappings}
					data-kontent-item-id={syllabus.system.id}
					data-kontent-element-codename="rationale"
					linkedItems={syllabusResponse.linkedItems}
					className="cms-content-formatting"
					richTextElement={syllabus.elements.rationale}
				/>
			</NonFullWidthWrapper>
		</div>
	)
}

export default Rationale
