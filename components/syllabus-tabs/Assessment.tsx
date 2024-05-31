import { Syllabus } from '@/kontent/content-types'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps } from '@/types'
import { byTaxoCodename } from '@/utils'
import { SyllabusAssessment } from '../assessment/SyllabusAssessment'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export const Assessment = ({
	mappings,
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const { syllabus: syllabusResponse } = data
	const syllabus = syllabusResponse.item
	const currentStages =
		syllabus.elements.stages__stages.value.map(byTaxoCodename)
	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="assessment"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
			/>
			<SyllabusAssessment
				syllabus={syllabus}
				mappings={mappings}
				linkedItems={syllabusResponse.linkedItems}
				currentStages={currentStages}
				syllabusResponse={syllabusResponse}
				lazy={false}
			/>
		</div>
	)
}

export default Assessment
