import {
	fetchFocusareaAndOptionListByTaxoSyllabuses,
	fetchOutcomesBySyllabus,
} from '@/fetchers'
import { Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import Outcomes from '@/legacy-ported/components/syllabus/Outcomes'
import {
	byTaxoCodename,
	compareValueWithMultipleChoiceCodename,
	filterOnlyWebOutcomeNotifications,
	getFnSortStagesOnTaxoStages,
	getSyllabusElements,
	isYes,
} from '@/utils'
import { isLifeSkillFocusAreaOrOptionListOrOutcome } from '@/utils/focusarea'
import { getAllFieldsOf } from '@/utils/getAllFieldsOf'
import { isLifeSkillSyllabus, isStage6Syllabus } from '@/utils/syllabus'
import { Responses } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { Loading } from '../Loading'
import { SyllabusViewProps } from '../SyllabusView'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import {
	KontentOutcomeWrapper,
	OutcomeProvider,
} from '../outcomes/KontentOutcomeWrapper'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

interface SyllabusSectionOutcomeProps {
	syllabus: Syllabus
	currentStages: SyllabusViewProps['currentStages']
	allStages: SyllabusViewProps['allStages']
	allStageGroups: SyllabusViewProps['allStageGroups']
	isInitialLifeSkillBasedOnSelectedStage?: boolean
	syllabusResponse?: Responses.IViewContentItemResponse<Syllabus>
	lazyAlignedContent?: boolean
}

export const SyllabusSectionOutcome = ({
	syllabus,
	currentStages,
	allStages,
	allStageGroups,
	isInitialLifeSkillBasedOnSelectedStage = false,
	syllabusResponse,
	lazyAlignedContent = true,
}: SyllabusSectionOutcomeProps) => {
	const { mappings, pageResponseLinkedItems } = useKontentHomeConfig()

	const relatedLifeSkillsSyllabuses =
		getLinkedItems(
			syllabus.elements.relatedlifeskillssyllabus,
			pageResponseLinkedItems,
		) || []

	const taxoSyllabus = [
		...syllabus.elements.syllabus.value.map(byTaxoCodename),
		...relatedLifeSkillsSyllabuses.flatMap((relatedSyllabus) =>
			relatedSyllabus.elements.syllabus.value.map(byTaxoCodename),
		),
	].join(',')

	const outcomesElements = [
		contentTypes.syllabus.elements.outcomes.codename,
		contentTypes.syllabus.elements.relatedlifeskillssyllabus.codename,
		contentTypes.syllabus.elements.outcomesnotificationslist.codename,
		contentTypes.outcome.elements.title.codename,
		contentTypes.outcome.elements.description.codename,
		contentTypes.outcome.elements.code.codename,
		contentTypes.outcome.elements.stages__stages.codename,
		contentTypes.outcome.elements.stages__stage_years.codename,
		contentTypes.outcome.elements.syllabus.codename,
		contentTypes.outcome.elements.syllabus_type__items.codename,
		contentTypes.outcome.elements.isoverarching.codename,
		contentTypes.outcome.elements.relatedlifeskillsoutcomes.codename,

		...getAllFieldsOf(contentTypes.content_outcomenotification.elements),
	]

	const { data: outcomesResponse, isFetched: isFetchedOutcomes } = useQuery(
		[
			`outcomes_${syllabus.system.codename}`,
			syllabus.system.codename + currentStages.join(','),
		],
		() =>
			fetchOutcomesBySyllabus(
				syllabus.system.codename,
				currentStages,
				true,
				outcomesElements,
			),
		{
			staleTime: Infinity,
		},
	)
	const { data: focusAreaResponse, isFetched: isFetchedFocusArea } = useQuery(
		[`focusareasOrOptions_${taxoSyllabus}`, taxoSyllabus],
		() => {
			return fetchFocusareaAndOptionListByTaxoSyllabuses(
				taxoSyllabus,
				0,
				getSyllabusElements(['outcomes']),
			)
		},
		{
			staleTime: Infinity,
		},
	)

	if (!(isFetchedFocusArea && isFetchedOutcomes) && !syllabusResponse) {
		return <Loading />
	}

	const linkedItems = syllabusResponse
		? syllabusResponse.linkedItems
		: {
				...outcomesResponse.linkedItems,
				...focusAreaResponse.linkedItems,
		  }

	const isStage6Syl = isStage6Syllabus(syllabus)
	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)
	const focusAreas = syllabusResponse
		? getLinkedItems(
				syllabusResponse.item.elements.focus_areas,
				syllabusResponse.linkedItems,
		  )
		: focusAreaResponse.items

	const outcomes = syllabusResponse
		? getLinkedItems(
				syllabusResponse.item.elements.outcomes,
				syllabusResponse.linkedItems,
		  )
		: outcomesResponse.items

	const uniqueOutcomes =
		outcomes
			?.filter((outcome) => {
				// if it's a mainstream syllabus and the outcome is life skill, it's always true
				if (
					!isLifeSkillsSyl &&
					isLifeSkillFocusAreaOrOptionListOrOutcome(outcome)
				) {
					return true
				}
				// for others, only show outcomes that are in the syllabus's `Outcomes` field
				return syllabus.elements.outcomes.value.some(
					(so) => so === outcome.system.codename,
				)
			})
			?.filter((outcome) => {
				return (
					outcome.elements.stages__stages.value.some((t) =>
						currentStages.includes(t.codename),
					) ||
					(currentStages.includes('life_skills') &&
						compareValueWithMultipleChoiceCodename(
							outcome.elements.syllabus_type__items,
							'life_skills',
						))
				)
			})
			.sort((a, b) => {
				const outcomeAIndex =
					syllabus.elements.outcomes.value.findIndex(
						(outcomeCodename) =>
							a.system.codename === outcomeCodename,
					)
				const outcomeBIndex =
					syllabus.elements.outcomes.value.findIndex(
						(outcomeCodename) =>
							b.system.codename === outcomeCodename,
					)

				// if A found in syllabus.elements, but not B, stay
				if (outcomeAIndex >= 0 && outcomeBIndex < 0) {
					return 0
				}
				// if B found in syllabus.elements, but not A, move to left
				if (outcomeAIndex < 0 && outcomeBIndex >= 0) {
					return -1
				}
				// otherwise compare both index
				return outcomeAIndex - outcomeBIndex
			})
			.sort((a, b) => {
				// sort outcome by overarching or not
				const isYesA = isYes(a.elements.isoverarching)
				const isYesB = isYes(b.elements.isoverarching)

				if (isYesA && !isYesB) {
					return 1
				}
				if (!isYesA && isYesB) {
					return -1
				}
				return 0
			}) || []

	const filteredAndSortedCurrentStages = currentStages
		.filter((stage) => {
			if (isLifeSkillsSyl) {
				return stage === 'life_skills'
			}
			return allStages.some((_s) => _s.codename === stage)
		})
		.sort(getFnSortStagesOnTaxoStages())

	return (
		<>
			<SyllabusTabsTitle
				tabId="outcomes"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
			/>
			{uniqueOutcomes?.length ? (
				<KontentOutcomeWrapper
					outcomes={uniqueOutcomes}
					focusAreas={focusAreas}
					mappings={mappings}
					linkedItems={linkedItems}
				>
					{(outcomes) => (
						<OutcomeProvider
							outcomes={outcomes}
							focusAreas={focusAreas}
							syllabusLinkedItems={linkedItems}
						>
							<Outcomes
								syllabus={syllabus}
								outcomesNotificationsList={getLinkedItems(
									syllabus.elements.outcomesnotificationslist,
									linkedItems,
								)?.filter(filterOnlyWebOutcomeNotifications)}
								stages={allStages.filter((s) => {
									return filteredAndSortedCurrentStages.includes(
										s.codename,
									)
								})}
								stageGroups={allStageGroups}
								outcomes={outcomes}
								isGroupedByYear={isStage6Syl}
								showCompareOutcomes={
									!isLifeSkillsSyl &&
									(filteredAndSortedCurrentStages.length >
										1 ||
										isStage6Syl)
								}
								isInitialLifeSkillBasedOnSelectedStage={
									isInitialLifeSkillBasedOnSelectedStage
								}
								lazyAlignedContent={lazyAlignedContent}
							/>
						</OutcomeProvider>
					)}
				</KontentOutcomeWrapper>
			) : (
				<p>No outcomes for selected stage(s)</p>
			)}
		</>
	)
}
