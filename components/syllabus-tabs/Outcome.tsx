import { Syllabus } from '@/kontent/content-types'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps } from '@/types'
import { byTaxoCodename } from '@/utils'
import { SyllabusSectionOutcome } from '../syllabus-sections/SyllabusSectionOutcome'

export const Outcome = ({
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const {
		syllabus: syllabusResponse,
		stageGroups: allStageGroups,
		stages: allStages,
	} = data
	const syllabus = syllabusResponse.item
	return (
		<div className="px-4 pt-8">
			<SyllabusSectionOutcome
				syllabus={syllabus}
				syllabusResponse={syllabusResponse}
				currentStages={allStages
					.filter((stage) => {
						if (stage.codename === 'life_skills') {
							return true
						}
						return syllabus.elements.stages__stages.value
							.map(byTaxoCodename)
							.includes(stage.codename)
					})
					.map(byTaxoCodename)}
				allStageGroups={allStageGroups}
				allStages={allStages}
				lazyAlignedContent={false}
			></SyllabusSectionOutcome>
		</div>
	)
}

export default Outcome
