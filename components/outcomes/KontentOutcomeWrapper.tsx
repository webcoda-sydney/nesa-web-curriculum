import {
	Focusarea,
	Focusareaoption,
	Optionslist,
	Outcome,
} from '@/kontent/content-types'
import { Mapping, TaxoStageWithLifeSkill } from '@/types'
import { byTaxoCodename, getSlugByCodename, getTaxoCodenames } from '@/utils'
import { isLifeSkillFocusAreaOrOptionListOrOutcome } from '@/utils/focusarea'
import { getSyllabusUrlFromMappingByTaxo } from '@/utils/getSyllabusUrlFromMapping'
import { isFocusarea } from '@/utils/type_predicates'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { ReactNode, createContext, useContext } from 'react'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'

export interface ExtendedFocusarea extends Focusarea {
	/**
	 * Link on content tab
	 */
	contentTabUrl: string
}

export interface ExtendedOutcome extends Outcome {
	alignedFocusAreas: ExtendedFocusarea[]
	relatedOutcomesAlignedFocusAreas?: Record<string, ExtendedFocusarea[]>
}

export interface ExtendedFocusareaoption extends Focusareaoption {
	optionList: Optionslist
}

export interface KontentOutcomeWrapperProps {
	/**
	 * Outcomes array
	 */
	outcomes: Outcome[]

	/**
	 * Focus areas array
	 */
	focusAreas: (Focusarea | Optionslist)[]

	/**
	 * Mappings array to generate links
	 */
	mappings: Mapping[]

	/**
	 * Linked items (from the page response, that contain related outcomes)
	 */
	linkedItems: IContentItemsContainer

	/**
	 * The render function
	 */
	children?: (_outcomes: ExtendedOutcome[]) => ReactNode
}

interface OutcomesProviderProps {
	outcomes: ExtendedOutcome[]
	focusAreas?: (Focusarea | Optionslist)[]
	syllabusLinkedItems: IContentItemsContainer
	children?: ReactNode
}

export const OutcomeContext = createContext<
	Omit<OutcomesProviderProps, 'children'>
>({
	outcomes: [],
	syllabusLinkedItems: null,
})

export const useOutcomeContext = () => useContext(OutcomeContext)

export const OutcomeProvider = ({
	outcomes,
	focusAreas = [],
	syllabusLinkedItems,
	children,
}: OutcomesProviderProps) => {
	const value = {
		outcomes,
		syllabusLinkedItems,
		focusAreas,
	}

	return (
		<OutcomeContext.Provider value={value}>
			{children}
		</OutcomeContext.Provider>
	)
}

const getStagePathForContentAlign = (
	outcome: Outcome,
): TaxoStageWithLifeSkill => {
	const isLifeSkillOutcome =
		isLifeSkillFocusAreaOrOptionListOrOutcome(outcome)

	if (isLifeSkillOutcome) {
		return 'life_skills'
	}

	return outcome.elements.stages__stages.value[0].codename
}

export const getAlignedFocusAreasOrFaOptions = (
	outcome: Outcome,
	focusAreaOrFaOptions: (Focusarea | ExtendedFocusareaoption)[],
	mappings: Mapping[],
) => {
	const _focusAreasThatHaveOutcome = focusAreaOrFaOptions.filter(
		(focusArea) => {
			return focusArea.elements.outcomes.value.includes(
				outcome.system?.codename,
			)
		},
	)

	return _focusAreasThatHaveOutcome.map((focusArea) => {
		// /learning-area/[kla]/[syllabus]/[content]/[stage/year]/[focusarea]

		const syllabusPath = getSyllabusUrlFromMappingByTaxo(
			mappings,
			outcome.elements.syllabus.value?.[0]?.codename,
			false,
			true,
		)

		let queryStrings = ['content']
		let contentTabUrl = `${syllabusPath}`

		// Stage/year slug
		const qStage = getStagePathForContentAlign(outcome)
		if (
			outcome.elements.stages__stages.value
				.map(byTaxoCodename)
				.some((stage) => stage === 'stage_6') &&
			qStage === 'stage_6'
		) {
			queryStrings.push(
				`${getTaxoCodenames(outcome.elements.stages__stage_years)[0]}`,
			)
		} else {
			queryStrings.push(qStage)
		}

		if (!isFocusarea(focusArea)) {
			// Focus area option slug
			queryStrings.push(focusArea.optionList.system.codename)
		}
		queryStrings.push(focusArea.system.codename)

		contentTabUrl = `${syllabusPath}/${queryStrings
			.map(getSlugByCodename)
			.join('/')}`

		return {
			...focusArea,
			contentTabUrl,
		} as ExtendedFocusarea
	})
}

/**
 * Wrapper component to solve the circular reference relatedlifeskilloutcomes issue
 */
export const KontentOutcomeWrapper = ({
	outcomes,
	focusAreas: focusAreasOrOptionlist,
	mappings,
	linkedItems,
	children,
}: KontentOutcomeWrapperProps) => {
	const focusAreaOrFaOptions = focusAreasOrOptionlist.flatMap<
		Focusarea | ExtendedFocusareaoption
	>((faOrOl) => {
		if (isFocusarea(faOrOl)) {
			return faOrOl
		}
		const focusAreaOptions = getLinkedItems(
			faOrOl.elements.focus_area_options,
			linkedItems,
		)
		return focusAreaOptions.map<ExtendedFocusareaoption>((faOption) => {
			return {
				...faOption,
				optionList: faOrOl,
			}
		})
	})

	const _outcomes = outcomes.map((outcome) => {
		const relatedLifeSkillOutcomes = getLinkedItems(
			outcome.elements.relatedlifeskillsoutcomes,
			linkedItems,
		)

		return {
			...outcome,
			alignedFocusAreas: getAlignedFocusAreasOrFaOptions(
				outcome,
				focusAreaOrFaOptions,
				mappings,
			),
			relatedOutcomesAlignedFocusAreas: relatedLifeSkillOutcomes.reduce(
				(acc, curr) => {
					return {
						...acc,
						[curr.system.codename]: getAlignedFocusAreasOrFaOptions(
							curr,
							focusAreaOrFaOptions,
							mappings,
						),
					}
				},
				{},
			),
		} as ExtendedOutcome
	})

	return <>{children ? children(_outcomes) : null}</>
}
