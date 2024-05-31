import { TagProps } from '@/../nsw-ds-react/dist/component/tags/tags'
import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import type { RichTextProps } from '@/components/RichText'
import RichText from '@/components/RichText'
import { AssessmentResourceSection } from '@/components/assessment/AssessmentResourceSection'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { STAGE_YEARS } from '@/constants'
import { STYLES } from '@/constants/styles'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { Syllabus, SyllabusAssessmentGroup } from '@/kontent/content-types'
import type { Assessment } from '@/kontent/content-types/assessment'
import type { SyllabusAssessmentStagecontent } from '@/kontent/content-types/syllabus_assessment_stagecontent'
import { contentTypes } from '@/kontent/project/contentTypes'
import { TaxoStageYear } from '@/kontent/taxonomies'
import { Mapping } from '@/types'
import { getLinkedItems, isRichtextElementEmpty } from '@/utils'
import { getStageFromYear } from '@/utils/stage_year'
import { ElementModels, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { InPageNavLinks, TagList } from 'nsw-ds-react'
import { InpageNavLinksItemProps } from 'nsw-ds-react/dist/component/in-page-navigation/inPageNavLinks'
import slugify from 'slugify'
import SyllabusContentSection from './SyllabusContentSection'

type AssessmentSection = Assessment | SyllabusAssessmentStagecontent

export interface CoursePerformanceProps
	extends Omit<RichTextProps, 'richTextElement'> {
	/**
	 * CMS sections
	 */
	info: Syllabus['elements']['assessments_info']
	sections: AssessmentSection[]
	suffixForHeading?: string
}

const isAssessmentStagecontent = (
	section: AssessmentSection,
): section is SyllabusAssessmentStagecontent => {
	return (
		section.system.type ===
		contentTypes.syllabus_assessment_stagecontent.codename
	)
}

const getRichTextElementForAssessmentSection = (section: AssessmentSection) => {
	if (isAssessmentStagecontent(section)) {
		return section.elements.content
	}
	return section.elements.introduction
}

interface AssessmentGradingProps {
	group: SyllabusAssessmentGroup
	linkedItems: IContentItemsContainer
	mappings: Mapping[]
}

const AssessmentGroup = ({
	group,
	linkedItems,
	mappings,
}: AssessmentGradingProps) => {
	const contentItems = getLinkedItems(
		group.elements.contentitems,
		linkedItems,
	)

	return (
		<div className="space-y-5">
			<h4>{group.elements.title.value}</h4>
			<div className="space-y-2">
				<RichText
					richTextElement={group.elements.content}
					linkedItems={linkedItems}
					mappings={mappings}
				></RichText>
				{!!contentItems?.length && (
					<div className="richtext">
						<ul>
							{contentItems?.map((contentItem) => (
								<li key={contentItem.system.id}>
									<RichText
										richTextElement={
											contentItem.elements.content
										}
										linkedItems={linkedItems}
										mappings={mappings}
									></RichText>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

interface AssessmentStagesTagListProps {
	stageYears: ElementModels.TaxonomyTerm<TaxoStageYear>[]
}

const AssessmentStagesTagList = ({
	stageYears,
}: AssessmentStagesTagListProps) => {
	// show year only when not all years chosen on a stage
	const stagesWithCompleteYears = Object.entries(STAGE_YEARS)
		.filter(([_, years]) => {
			return (
				years.length &&
				years.every((year) =>
					stageYears.some((sy) => sy.codename === year),
				)
			)
		})
		.map(([stageCodename]) => stageCodename)

	const stageTags: TagProps[] = stageYears
		.reduce((acc, year) => {
			const stage = getStageFromYear(year.codename)
			let alteredStage = stagesWithCompleteYears.includes(stage.codename)
				? stage.name
				: `${stage.name} - Year ${year.name}`

			if (!acc?.length) {
				return [alteredStage]
			}
			if (acc.includes(alteredStage)) return acc
			return [...acc, alteredStage]
		}, [])
		.filter((text) => !!text)
		.map((text: string) => {
			return {
				text,
			}
		})
	return <TagList tags={stageTags} />
}

const CoursePerformance = (props: CoursePerformanceProps): JSX.Element => {
	const {
		sections,
		linkedItems,
		mappings,
		info,
		suffixForHeading = '',
	} = props
	const currentPath = useCleanPathDefault()
	const inPageLinks: InpageNavLinksItemProps[] = sections
		?.map((section) => {
			if (isAssessmentStagecontent(section)) {
				const title = section.elements.title.value
				return {
					title,
					url: `#${
						slugify(title?.toLowerCase()) +
						(suffixForHeading ? `-${suffixForHeading}` : '')
					}`,
				}
			}
			return undefined
		})
		.filter((item) => !!item)

	return (
		<NonFullWidthWrapper>
			<div className="space-y-8 lg:space-y-12">
				{!isRichtextElementEmpty(info) && (
					<RichText
						richTextElement={info}
						mappings={mappings}
						linkedItems={linkedItems}
						data-kontent-element-codename="assessments_info"
						className="p-4 border-l-4 border-l-nsw-brand-dark"
					/>
				)}

				{!!inPageLinks?.length && (
					<InPageNavLinks title="On this page" links={inPageLinks} />
				)}

				{!!sections?.length && (
					<div className="divide-y space-y-8 lg:space-y-12">
						{sections?.map((section: AssessmentSection) => {
							const isSyllabusAssessmentStagecontent =
								isAssessmentStagecontent(section)

							if (!isSyllabusAssessmentStagecontent) return

							const richTextElement =
								getRichTextElementForAssessmentSection(section)
							const slugifiedTitle =
								isSyllabusAssessmentStagecontent
									? slugify(
											section.elements.title?.value.toLowerCase(),
									  )
									: ''

							const titleId =
								slugifiedTitle +
								(suffixForHeading ? `-${suffixForHeading}` : '')
							return (
								<div
									key={section.system.id}
									className="pt-8 lg:pt-12 first:pt-0 space-y-5"
									data-kontent-item-id={section.system.id}
									data-kontent-element-codename="assesment"
								>
									<CommonCopyUrlWrapper
										url={`${currentPath}#${titleId}`}
									>
										<h3
											id={titleId}
											css={
												STYLES.IS_PREVIEW_SCROLL_MARGIN_TOP
											}
										>
											{section.elements.title.value}
										</h3>
									</CommonCopyUrlWrapper>

									<AssessmentStagesTagList
										stageYears={
											section.elements.stages__stage_years
												.value
										}
									/>

									{!isRichtextElementEmpty(
										richTextElement,
									) && (
										<SyllabusContentSection
											richTextElement={richTextElement}
											linkedItems={linkedItems}
											mappings={mappings}
										/>
									)}

									{getLinkedItems(
										section.elements.gradingitems,
										linkedItems,
									).map((assessmentGroup) => {
										return (
											<AssessmentGroup
												key={
													assessmentGroup.system
														.codename
												}
												group={assessmentGroup}
												linkedItems={linkedItems}
												mappings={mappings}
											/>
										)
									})}

									<AssessmentResourceSection
										linkedItems={linkedItems}
										resources={section.elements.resources}
										otherResources={
											section.elements.resources_other
										}
									/>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</NonFullWidthWrapper>
	)
}

export default CoursePerformance
