import Icon from '@/components/Icon'
import { OutcomeSlider } from '@/components/OutcomeSlider'
import RichText from '@/components/RichText'
import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import Checkbox from '@/components/nsw/Checkbox'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { useOutcomeContext } from '@/components/outcomes/KontentOutcomeWrapper'
import { Tooltip } from '@/components/tooltip/Tooltip'
import { TAXO_TERM_LIFE_SKILLS } from '@/constants'
import { useToggle } from '@/hooks/useToggle'
import {
	ContentOutcomenotification,
	Focusarea,
	Syllabus,
} from '@/kontent/content-types'
import type { Outcome } from '@/kontent/content-types/outcome'
import type { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { byTaxoCodename, isRichtextElementEmpty } from '@/utils'
import { isLifeSkillFocusAreaOrOptionListOrOutcome } from '@/utils/focusarea'
import type { ElementModels } from '@kontent-ai/delivery-sdk'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import useTheme from '@mui/material/styles/useTheme'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useRouter } from 'next/router'
import { Alert, Button } from 'nsw-ds-react'
import React, { useEffect, useId, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { isMobile, withOrientationChange } from 'react-device-detect'
import SYLLABUS from '../../constants/syllabusConstants'
import StageSelectOverlay from './StageSelectOverlay'
import { YearSelectOverlay } from './YearSelectOverlay'
export interface OutcomesProps {
	/**
	 * Scroll offset for navigating
	 */
	scrollOffset?: number
	isLandscape?: boolean
	outcomes: Outcome[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	isGroupedByYear?: boolean
	showCompareOutcomes?: boolean
	outcomesNotificationsList?: ContentOutcomenotification[]
	isInitialLifeSkillBasedOnSelectedStage?: boolean

	/**
	 * Focus areas. By default, it's empty, since we lazy load the align content
	 */
	focusAreas?: Focusarea[]

	/**
	 * Lazy align content. Default: true
	 */
	lazyAlignedContent?: boolean
	syllabus: Syllabus
}

type TOutcomesFilterCookie = {
	showRelatedOutcome?: boolean
	showAlignedContent?: boolean
	showLifeSkillFeatured?: boolean
	activeStageCodenames?: TaxoStageWithLifeSkill[]
	activeYearCodenames?: TaxoStageYearWithLifeSkill[]
}

export const useOutcomesFilter = ({
	initialFilterRelatedOutcome = false,
	initialFilterShowAlignedContent = false,
	initialFilterFeatureLifeSkill = false,
} = {}) => {
	const [selectedFilterRelatedOutcome, toggleSelectedFilterRelatedOutcome] =
		useToggle(initialFilterRelatedOutcome ?? false)
	const [
		selectedFilterShowAlignedContent,
		toggleSelectedFilterShowAlignedContent,
	] = useToggle(initialFilterShowAlignedContent ?? false)
	const [selectedFilterFeatureLifeSkill, setSelectedFilterFeatureLifeSkill] =
		useState(initialFilterFeatureLifeSkill ?? false)

	const toggleSelectedFilterFeatureLifeSkill = () => {
		setSelectedFilterFeatureLifeSkill((prevState) => !prevState)
	}

	useEffect(() => {
		if (!selectedFilterRelatedOutcome) {
			setSelectedFilterFeatureLifeSkill(false)
		}
	}, [selectedFilterRelatedOutcome])

	return {
		selectedFilterRelatedOutcome,
		selectedFilterShowAlignedContent,
		selectedFilterFeatureLifeSkill,
		toggleSelectedFilterRelatedOutcome,
		toggleSelectedFilterShowAlignedContent,
		toggleSelectedFilterFeatureLifeSkill,
	}
}

const getInitialFilteredActiveYears = (
	yearsThatAreUsedInOutcomes: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[],
	isInitialLifeSkillBasedOnSelectedStage = false,
) => {
	return yearsThatAreUsedInOutcomes
		.filter((year) => {
			if (
				yearsThatAreUsedInOutcomes.length > 1 &&
				!isInitialLifeSkillBasedOnSelectedStage
			) {
				return year.codename !== 'life_skills'
			}
			return true
		})
		.map(byTaxoCodename)
}

/**
 * Need to check syllabus's stage tags to show hide the stages options
 * @param props
 * @returns
 */
const Outcomes = (props: OutcomesProps) => {
	const {
		scrollOffset = SYLLABUS.COMPARE_OUTCOME_SCROLL_OFFSET.LEARNING_AREA,
		outcomes,
		stages: allStages,
		stageGroups: allStagesGroups,
		isGroupedByYear = false,
		showCompareOutcomes = false,
		outcomesNotificationsList,
		isInitialLifeSkillBasedOnSelectedStage,
		lazyAlignedContent,
		syllabus,
	} = props
	const { route } = useRouter()
	const isSyllabusCustom = route === '/syllabuses-custom'
	let cookie: { outcomesFilter?: TOutcomesFilterCookie } = {}
	let [_cookie, setCookie] = useCookies(['outcomesFilter'])
	if (!isSyllabusCustom) {
		cookie = _cookie
	}

	const syllabusCodename = syllabus.system.codename

	const cookieOutcomesFilter: TOutcomesFilterCookie =
		cookie.outcomesFilter?.[syllabusCodename]
	const cookieOutcomesFilterActiveStageCodenames =
		cookieOutcomesFilter?.activeStageCodenames
	const cookieOutcomesFilterActiveYearCodenames =
		cookieOutcomesFilter?.activeYearCodenames
	const cookieOutcomesFilterShowAlignedContent =
		cookieOutcomesFilter?.showAlignedContent
	const cookieOutcomesFilterShowLifeSkillFeatured =
		cookieOutcomesFilter?.showLifeSkillFeatured
	const cookieOutcomesFilterShowRelatedOutcome =
		cookieOutcomesFilter?.showRelatedOutcome

	const { config, pageResponseLinkedItems, mappings } = useKontentHomeConfig()
	const { syllabusLinkedItems } = useOutcomeContext()
	const linkedItems = {
		...pageResponseLinkedItems,
		...syllabusLinkedItems,
	}

	/**
	 * Stages that are supposed to show on the compare stage outcomes are stages that are intersection between:
	 * 1. are assigned on the syllabuses
	 * 2. are assigned on the outcomes
	 */
	const codenamesOfStagesThatAreUsedInOutcomes = useMemo(
		() =>
			[
				...new Set(
					outcomes.flatMap(
						(outcome) =>
							outcome.elements.stages__stages?.value.map(
								(s) => s.codename,
							) || [],
					),
				),
				outcomes.some((outcome) =>
					outcome.elements.syllabus_type__items?.value.some(
						(v) => v.codename === 'life_skills',
					),
				)
					? 'life_skills'
					: '',
			].filter((t) => !!t && allStages.some((s) => s.codename === t)),
		[allStages, outcomes],
	)

	const stagesThatAreUsedInOutcomes = useMemo(
		() =>
			allStages.filter((s) =>
				codenamesOfStagesThatAreUsedInOutcomes.includes(s.codename),
			),
		[allStages, codenamesOfStagesThatAreUsedInOutcomes],
	)

	const yearsThatAreUsedInOutcomes: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[] =
		useMemo(
			() =>
				outcomes
					.flatMap((outcome) => {
						if (
							isLifeSkillFocusAreaOrOptionListOrOutcome(outcome)
						) {
							return [TAXO_TERM_LIFE_SKILLS]
						}
						return outcome.elements.stages__stage_years
							.value as ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[]
					})
					.reduce<
						ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>[]
					>((acc, year) => {
						const accHasYear = acc.some(
							(
								y: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>,
							) => y.codename === year.codename,
						)
						if (accHasYear) {
							return acc
						}
						return [...acc, year]
					}, [])
					.filter((year) => {
						if (year.codename === 'life_skills') {
							return allStages.some(
								(s) => s.codename === 'life_skills',
							)
						}
						return true
					}),
			[allStages, outcomes],
		)

	/** It is Stage 6 Syllabus if there is stage 6 outcome */
	const isStage6Syl = outcomes.some((o) =>
		o.elements.stages__stages.value.some((s) => s.codename === 'stage_6'),
	)

	const hasLifeSkillsRelatedOutcomes = outcomes
		.flatMap((o) =>
			getLinkedItems(o.elements.relatedlifeskillsoutcomes, linkedItems),
		)
		.some((o) => isLifeSkillFocusAreaOrOptionListOrOutcome(o))

	const [displayModal, setDisplayModal] = useState(false)
	const [nextCounter, setNextCounter] = useState(0)
	const {
		selectedFilterFeatureLifeSkill,
		selectedFilterRelatedOutcome,
		selectedFilterShowAlignedContent,
		toggleSelectedFilterShowAlignedContent,
		toggleSelectedFilterFeatureLifeSkill,
		toggleSelectedFilterRelatedOutcome,
	} = useOutcomesFilter({
		initialFilterFeatureLifeSkill:
			cookieOutcomesFilterShowLifeSkillFeatured,
		initialFilterRelatedOutcome: cookieOutcomesFilterShowRelatedOutcome,
		initialFilterShowAlignedContent: cookieOutcomesFilterShowAlignedContent,
	})

	const divRef = React.useRef<HTMLDivElement>(null)

	const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement>()

	const [activeStageCodenames, setActiveStageCodenames] = useState(
		cookieOutcomesFilterActiveStageCodenames ||
			stagesThatAreUsedInOutcomes.map((s) => s.codename),
	)

	const [activeYearCodenames, setActiveYearCodenames] = useState(
		cookieOutcomesFilterActiveYearCodenames ||
			getInitialFilteredActiveYears(
				yearsThatAreUsedInOutcomes,
				isInitialLifeSkillBasedOnSelectedStage,
			),
	)

	const theme = useTheme()
	const isQueryMobile = useMediaQuery(theme.breakpoints.down('md'))
	const isQueryTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'))

	// Computed
	// selected stages
	let selectedStages = useMemo(
		() =>
			stagesThatAreUsedInOutcomes.filter((stage) =>
				activeStageCodenames.includes(stage.codename),
			),
		[activeStageCodenames, stagesThatAreUsedInOutcomes],
	)
	let selectedYears = useMemo(
		() =>
			yearsThatAreUsedInOutcomes.filter((year) =>
				activeYearCodenames.includes(year.codename),
			),
		[activeYearCodenames, yearsThatAreUsedInOutcomes],
	)

	// Methods
	const getPageSizeForSlider = (stages: any[]) => {
		if (stages.length === 1) return 1
		if (isQueryMobile) return 1
		if (isQueryTablet) return 2
		return 3
	}

	const handleStageOrYearSelection = (
		stageCodenames: (TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill)[],
	) => {
		// Reset outcomes position
		if (divRef && divRef.current && !isMobile) {
			divRef.current.scrollLeft -= scrollOffset * nextCounter
			setNextCounter(0)
		}
		if (isGroupedByYear) {
			setActiveYearCodenames(
				stageCodenames as React.SetStateAction<
					TaxoStageYearWithLifeSkill[]
				>,
			)
		} else {
			setActiveStageCodenames(stageCodenames as TaxoStageWithLifeSkill[])
		}

		setDisplayModal(false)
	}

	const handleStageOverlayClose = () => {
		setDisplayModal(false)
	}

	const handleStageOverlayToggle = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		setDisplayModal(!displayModal)
		setPopoverAnchor(event.currentTarget)
	}

	const lifeSkillCheckboxId = useId(),
		relatedOutcomesCheckboxId = useId(),
		alignedContentCheckboxId = useId()

	useEffect(() => {
		if (!cookieOutcomesFilterActiveStageCodenames) {
			setActiveStageCodenames(
				stagesThatAreUsedInOutcomes.map(byTaxoCodename),
			)
		}
	}, [cookieOutcomesFilterActiveStageCodenames, stagesThatAreUsedInOutcomes])
	useEffect(() => {
		if (!cookieOutcomesFilterActiveYearCodenames) {
			setActiveYearCodenames(
				getInitialFilteredActiveYears(
					yearsThatAreUsedInOutcomes,
					isInitialLifeSkillBasedOnSelectedStage,
				),
			)
		}
	}, [
		cookieOutcomesFilterActiveYearCodenames,
		yearsThatAreUsedInOutcomes,
		isInitialLifeSkillBasedOnSelectedStage,
	])

	// set cookies based on selection
	useEffect(() => {
		if (!isSyllabusCustom) {
			const _outcomesFilter = cookie.outcomesFilter || {}
			_outcomesFilter[syllabusCodename] = {
				showRelatedOutcome: selectedFilterRelatedOutcome,
				showAlignedContent: selectedFilterShowAlignedContent,
				showLifeSkillFeatured: selectedFilterFeatureLifeSkill,
				activeStageCodenames,
				activeYearCodenames,
			}
			setCookie('outcomesFilter', JSON.stringify(_outcomesFilter), {
				path: '/',
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		selectedFilterFeatureLifeSkill,
		selectedFilterRelatedOutcome,
		selectedFilterShowAlignedContent,
		activeStageCodenames,
		activeYearCodenames,
		isSyllabusCustom,
	])

	return (
		<Grid className="outcomes" container item xs={12}>
			<GridCol
				container
				rowGap={4}
				columnGap={8}
				wrap="wrap"
				justifyContent={{ lg: 'space-between' }}
			>
				<GridCol lg={'auto'} flexGrow={1}>
					{
						//show on
						showCompareOutcomes && (
							<Button
								style="dark-outline"
								className="w-full lg:w-auto"
								onClick={handleStageOverlayToggle}
							>
								<span className="mr-2">Compare outcomes</span>
								<Icon icon="ic:baseline-expand-more" />
							</Button>
						)
					}
				</GridCol>
				<GridCol
					display="flex"
					flexGrow={1}
					flexBasis="auto"
					flexDirection={{ xs: 'column', md: 'row' }}
					justifyContent={{ md: 'flex-end' }}
					lg="auto"
					container
					rowGap={4}
					columnGap={8}
				>
					{selectedFilterRelatedOutcome &&
						hasLifeSkillsRelatedOutcomes && (
							<FormControlLabel
								htmlFor={lifeSkillCheckboxId}
								className="mx-0"
								checked={selectedFilterFeatureLifeSkill}
								control={<Checkbox id={lifeSkillCheckboxId} />}
								label="Feature Life Skills"
								onChange={toggleSelectedFilterFeatureLifeSkill}
							/>
						)}
					<FormControlLabel
						htmlFor={relatedOutcomesCheckboxId}
						className="mx-0"
						checked={selectedFilterRelatedOutcome}
						control={<Checkbox id={relatedOutcomesCheckboxId} />}
						label={
							<>
								Show related outcomes&nbsp;
								{!isRichtextElementEmpty(
									config.item.elements
										.syllabusoutcomes_relatedoutomes,
								) && (
									<Tooltip
										text={
											<SanitisedHTMLContainer>
												{isStage6Syl
													? config.item.elements
															.syllabussenioroutcomes_relatedoutomes
															.value
													: config.item.elements
															.syllabusoutcomes_relatedoutomes
															.value}
											</SanitisedHTMLContainer>
										}
									/>
								)}
							</>
						}
						onChange={toggleSelectedFilterRelatedOutcome}
					/>
					<FormControlLabel
						htmlFor={alignedContentCheckboxId}
						className="mx-0"
						checked={selectedFilterShowAlignedContent}
						control={<Checkbox id={alignedContentCheckboxId} />}
						label={
							<>
								Show aligned content&nbsp;
								{!isRichtextElementEmpty(
									config.item.elements
										.syllabusoutcomes_alignedcontent,
								) && (
									<Tooltip
										text={
											<SanitisedHTMLContainer>
												{
													config.item.elements
														.syllabusoutcomes_alignedcontent
														.value
												}
											</SanitisedHTMLContainer>
										}
									/>
								)}
							</>
						}
						onChange={toggleSelectedFilterShowAlignedContent}
					/>
				</GridCol>
			</GridCol>

			{!!outcomesNotificationsList?.length && (
				<GridCol container className="mt-8">
					<GridCol>
						<Alert as="info">
							<div className="richtext">
								{outcomesNotificationsList.map((notif) => {
									return (
										<RichText
											key={notif.system.id}
											richTextElement={
												notif.elements.content
											}
											mappings={mappings}
											linkedItems={linkedItems}
										/>
									)
								})}
							</div>
						</Alert>
					</GridCol>
				</GridCol>
			)}

			{/* New Grid */}
			{(selectedStages || selectedYears) && (
				<OutcomeSlider
					key={selectedStages.join()}
					className="mt-8"
					pageSize={getPageSizeForSlider(
						isGroupedByYear ? selectedYears : selectedStages,
					)}
					stages={selectedStages}
					years={selectedYears}
					outcomes={outcomes}
					showRelatedOutcome={selectedFilterRelatedOutcome}
					showAlignedContent={selectedFilterShowAlignedContent}
					featureLifeSkill={selectedFilterFeatureLifeSkill}
					isGroupedByYear={isGroupedByYear}
					lazyAlignedContent={lazyAlignedContent}
				/>
			)}

			{displayModal && !isGroupedByYear && (
				<StageSelectOverlay
					stages={stagesThatAreUsedInOutcomes}
					stageGroups={allStagesGroups}
					selected={activeStageCodenames}
					disabledStages={allStages.filter(
						(stage) =>
							!codenamesOfStagesThatAreUsedInOutcomes.includes(
								stage.codename,
							),
					)}
					popoverStatus={displayModal}
					popoverAnchor={popoverAnchor}
					onConfirm={handleStageOrYearSelection}
					onCancel={handleStageOverlayClose}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				/>
			)}
			{displayModal && isGroupedByYear && (
				<YearSelectOverlay
					stages={stagesThatAreUsedInOutcomes}
					stageGroups={allStagesGroups}
					selected={activeYearCodenames}
					popoverStatus={displayModal}
					popoverAnchor={popoverAnchor}
					onConfirm={handleStageOrYearSelection}
					onCancel={handleStageOverlayClose}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				/>
			)}
		</Grid>
	)
}

export default withOrientationChange(Outcomes)
