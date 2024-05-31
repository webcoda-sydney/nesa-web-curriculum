import { getLinkedItems } from '@/components/contexts/KontentHomeConfigProvider'
import Icon from '@/components/Icon'
import UiFocusAreaPaper from '@/components/ui/focusarea/UiFocusAreaPaper'
import {
	Focusarea,
	Focusareaoption,
	Optionslist,
	Syllabus,
} from '@/kontent/content-types'
import { getUrlFromFocusArea } from '@/legacy-ported/components/syllabus/ContentSideNav'
import {
	IPropWithClassName,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { compareValueWithMultipleChoiceCodename } from '@/utils'
import {
	convertToFocusareasOrOptionListOrFocusareaoptionsExtended,
	getLifeSkillsForStageLabel,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import { isFocusarea } from '@/utils/type_predicates'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { PaperProps } from '@mui/material/Paper/Paper'
import clsx from 'clsx'
import Link from 'next/link'
import { Fragment, MouseEvent } from 'react'

export interface FocusAreaRelatedPaperProps extends IPropWithClassName {
	syllabus: Syllabus
	mainFocusArea: Focusarea | Optionslist | Focusareaoption
	paperProps?: PaperProps

	/**
	 * current stage selected in Content tab
	 */
	currentStage: TaxoStageWithLifeSkill
	currentYear?: TaxoStageYearWithLifeSkill
	onTitleClick?: (
		_e: MouseEvent<HTMLAnchorElement>,
		_relatedFocusArea: Focusarea | Optionslist | Focusareaoption,
	) => void

	linkedItems: IContentItemsContainer
	qsOnUrl?: string[]
	selectedFocusAreaOptionCodename?: string
}

interface FocusAreaRelatedTitleProps {
	focusArea: Focusarea | Optionslist | Focusareaoption
	syllabus: Syllabus
	stage: FocusAreaRelatedPaperProps['currentStage']
	year: FocusAreaRelatedPaperProps['currentYear']
	qsOnUrl?: string[]
	onClick?: (_e: MouseEvent<HTMLAnchorElement>) => void
}

export const getStagePathForFocusAreaRelatedTitle = (
	focusArea: Focusarea | Optionslist | Focusareaoption,
	currentStage: TaxoStageWithLifeSkill,
): TaxoStageWithLifeSkill => {
	const isCurrentStageInFocusArea = compareValueWithMultipleChoiceCodename(
		focusArea.elements.stages__stages,
		currentStage,
	)

	if (isCurrentStageInFocusArea) {
		return currentStage
	}

	if (currentStage === 'life_skills') {
		const possibleStages = ['stage_4', 'stage_5']
		// if current stage is life skills, go to either stage 4/5
		let result = ''
		possibleStages.forEach((stage) => {
			if (
				focusArea.elements.stages__stages.value.some(
					(s) => s.codename === stage,
				) &&
				!result
			) {
				result = stage
			}
		})
		if (result) return result as TaxoStageWithLifeSkill
	}
	return focusArea.elements.stages__stages.value?.[0]?.codename
}
export const getYearPathForFocusAreaRelatedTitle = (
	focusArea: Focusarea | Optionslist | Focusareaoption,
	currentYear?: TaxoStageYearWithLifeSkill,
): TaxoStageYearWithLifeSkill | undefined => {
	if (!currentYear) return

	const isCurrentYearInFocusArea = compareValueWithMultipleChoiceCodename(
		focusArea.elements.stages__stage_years,
		currentYear,
	)

	if (isCurrentYearInFocusArea) {
		return currentYear
	}

	if (currentYear === 'life_skills') {
		const possibleYears: TaxoStageYearWithLifeSkill[] = ['n11', 'n12']
		// if current stage is life skills, go to either stage 4/5
		let result = ''
		possibleYears.forEach((year) => {
			if (
				focusArea.elements.stages__stage_years.value.some(
					(s) => s.codename === year,
				) &&
				!result
			) {
				result = year
			}
		})
		if (result) return result as TaxoStageYearWithLifeSkill
	}
	return focusArea.elements.stages__stage_years.value?.[0]?.codename
}

const FocusAreaRelatedTitle = ({
	focusArea,
	stage,
	year,
	syllabus,
	qsOnUrl,
	onClick,
}: FocusAreaRelatedTitleProps) => {
	const contentTabUrl = getUrlFromFocusArea(
		focusArea,
		syllabus.system.codename,
		stage,
		year,
		qsOnUrl,
	)

	const LinkComp = onClick ? Fragment : Link

	const _props = {
		href: onClick ? undefined : contentTabUrl,
		scroll: onClick ? undefined : false,
	}

	return (
		<LinkComp {..._props}>
			<a
				href={contentTabUrl}
				className="flex gap-3 nsw-h4 mb-3"
				onClick={onClick}
			>
				<div className="flex-1">{focusArea.elements.title.value}</div>
				<Icon
					icon="ic:chevron-right"
					width={30}
					height={30}
					className="flex-shrink-0"
				></Icon>
			</a>
		</LinkComp>
	)
}

const FocusAreaRelatedPaper = ({
	className,
	mainFocusArea,
	currentStage,
	currentYear,
	onTitleClick,
	linkedItems,
	syllabus,
	qsOnUrl,
}: FocusAreaRelatedPaperProps) => {
	const variant = isLifeSkillFocusAreaOrOptionListOrOutcome(mainFocusArea)
		? 'white'
		: 'default'
	if (!isFocusarea(mainFocusArea)) return null

	if (!mainFocusArea.elements.related_focusareas.value.length) {
		if (
			mainFocusArea.elements.syllabus_type__items.value.some(
				(sti) => sti.codename == 'life_skills',
			)
		) {
			return (
				<UiFocusAreaPaper variant={variant} className={clsx(className)}>
					No related{' '}
					{!isLifeSkillFocusAreaOrOptionListOrOutcome(mainFocusArea)
						? 'Life Skills'
						: ''}{' '}
					content for this focus area
				</UiFocusAreaPaper>
			)
		}
		return null
	}

	const relatedFocusAreas = getLinkedItems(
		mainFocusArea.elements.related_focusareas,
		linkedItems,
	)
		.filter((focusArea) => {
			const stagePath = getStagePathForFocusAreaRelatedTitle(
				focusArea,
				currentStage,
			)
			return currentStage === stagePath
		})
		.filter((focusArea) => {
			if (currentStage === 'stage_6' && currentYear) {
				return focusArea.elements.stages__stage_years.value.some(
					(year) => year.codename === currentYear,
				)
			}
			return true
		})
	const focusAreaRenderExtended =
		convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
			relatedFocusAreas,
			syllabus,
		)

	return (
		<>
			{focusAreaRenderExtended.length > 0 ? (
				<UiFocusAreaPaper
					variant={variant}
					className={clsx(className)}
					pretitle={getLifeSkillsForStageLabel(
						mainFocusArea,
						`Related ${
							!isLifeSkillFocusAreaOrOptionListOrOutcome(
								mainFocusArea,
							)
								? 'Life Skills'
								: ''
						} content for Stage %s`,
					)}
				>
					{focusAreaRenderExtended.map((focusArea) => {
						const onRelatedTitleClick = (e) => {
							if (onTitleClick) {
								e?.preventDefault()
								onTitleClick(e, focusArea)
							}
						}

						return (
							<FocusAreaRelatedTitle
								key={focusArea.system.codename}
								focusArea={focusArea}
								stage={currentStage}
								year={currentYear}
								syllabus={syllabus}
								qsOnUrl={qsOnUrl}
								onClick={
									onTitleClick
										? onRelatedTitleClick
										: undefined
								}
							/>
						)
					})}
				</UiFocusAreaPaper>
			) : (
				<UiFocusAreaPaper variant={variant} className={clsx(className)}>
					No related{' '}
					{!isLifeSkillFocusAreaOrOptionListOrOutcome(mainFocusArea)
						? 'Life Skills'
						: ''}{' '}
					content for this focus area
				</UiFocusAreaPaper>
			)}
		</>
	)
}

export default FocusAreaRelatedPaper
