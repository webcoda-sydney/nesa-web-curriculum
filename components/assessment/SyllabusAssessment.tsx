import { fetchSyllabus } from '@/fetchers'
import {
	Syllabus,
	SyllabusAssessmentStagecontent,
} from '@/kontent/content-types'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import CoursePerformance from '@/legacy-ported/components/syllabus/CoursePerformance'
import { Mapping, TaxoStageWithLifeSkill } from '@/types'
import { getSyllabusElements } from '@/utils'
import {
	Elements,
	IContentItemsContainer,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { Fragment } from 'react'
import { Loading } from '../Loading'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'

export interface SyllabusAssessmentProps {
	syllabus: Syllabus
	linkedItems: IContentItemsContainer
	mappings: Mapping[]
	currentStages: TaxoStageWithLifeSkill[]
	syllabusResponse?: Responses.IViewContentItemResponse<Syllabus>
	lazy?: boolean
}

type AssessmentSetType =
	| 'Course standards'
	| 'School-based assessment'
	| 'HSC examinations'

interface AssessmentSet {
	assessmentsInfo: Elements.RichTextElement
	assessmentStageContents?: Elements.LinkedItemsElement<SyllabusAssessmentStagecontent>
	type?: AssessmentSetType
}

const getAssessmentContents = (syllabus: Syllabus) => {
	const assessmentSets: AssessmentSet[] = [
		{
			assessmentsInfo: syllabus.elements.assessments_info,
			assessmentStageContents: syllabus.elements.assessments,
		},
		{
			assessmentsInfo: syllabus.elements.cs_assessments_info,
			assessmentStageContents: syllabus.elements.cs_assessments,
			type: 'Course standards',
		},
		{
			assessmentsInfo: syllabus.elements.sb_assessments_info,
			assessmentStageContents: syllabus.elements.sb_assessments,
			type: 'School-based assessment',
		},
		{
			assessmentsInfo: syllabus.elements.hsc_assessments_info,
			assessmentStageContents: syllabus.elements.hsc_assessments,
			type: 'HSC examinations',
		},
	]
	return assessmentSets
}

const getStageContentFromAssessmentSet = (
	assessmentSet: AssessmentSet,
	currentStages: TaxoStageWithLifeSkill[],
	linkedItems: IContentItemsContainer,
) =>
	getLinkedItems(assessmentSet.assessmentStageContents, linkedItems)?.filter(
		(assessment) => {
			return assessment.elements.stages__stages.value?.some((stage) =>
				currentStages.includes(stage.codename),
			)
		},
	) || []

export const SyllabusAssessment = ({
	syllabus,
	linkedItems,
	mappings,
	currentStages,
	syllabusResponse: _syllabusResponse,
	lazy = true,
}: SyllabusAssessmentProps) => {
	const router = useRouter()
	const hasHash = router.asPath.includes('#')
	const syllabusCodename = syllabus.system.codename

	const { data: syllabusResponse, isFetched } = useQuery(
		[
			`SyllabusAssessment${syllabusCodename + lazy ? 'lazy' : ''}`,
			syllabusCodename,
		],
		() => {
			return lazy
				? fetchSyllabus(
						syllabusCodename,
						getSyllabusElements(['assessment']),
						5,
				  )
				: _syllabusResponse
		},
		{
			staleTime: Infinity,
		},
	)

	if (!isFetched) return <Loading />

	const assessmentSets = getAssessmentContents(syllabus)
	const _linkedItems = {
		...linkedItems,
		...syllabusResponse.linkedItems,
	}

	return (
		<>
			{assessmentSets.map((assessmentSet) => {
				const sections = getStageContentFromAssessmentSet(
					assessmentSet,
					currentStages,
					_linkedItems,
				)

				const isAccordion = assessmentSet.type && sections.length

				const Component = isAccordion ? CustomAccordion : Fragment

				return (
					<Component
						key={assessmentSet.type}
						title={assessmentSet.type}
						expanded={isAccordion && hasHash ? hasHash : undefined}
					>
						<CoursePerformance
							info={assessmentSet.assessmentsInfo}
							sections={sections}
							mappings={mappings}
							linkedItems={_linkedItems}
							suffixForHeading={syllabus.system.codename}
						/>
					</Component>
				)
			})}
		</>
	)
}
