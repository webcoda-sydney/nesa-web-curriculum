import RichText from '@/components/RichText'
import { Outcome } from '@/kontent/content-types'
import { IPropWithClassNameChildren } from '@/types'
import { compareValueWithMultipleChoiceCodename } from '@/utils'
import { getLifeSkillsForStageLabel } from '@/utils/focusarea'
import clsx from 'clsx'
import React from 'react'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../../contexts/KontentHomeConfigProvider'
import {
	ExtendedOutcome,
	useOutcomeContext,
} from '../../outcomes/KontentOutcomeWrapper'
import { Paper, PaperProps } from '../Paper'
import { OutcomePaperAlignedContent } from './OutcomePaperAlignedContent'

export interface OutcomePaperProps extends PaperProps {
	outcome: Outcome | ExtendedOutcome

	/**
	 * Callback fired when card is pressed
	 */
	onClick?: (
		_event:
			| React.MouseEvent<HTMLDivElement, MouseEvent>
			| React.KeyboardEvent<HTMLDivElement>,
	) => void

	showRelatedOutcome?: boolean
	showAlignedContent?: boolean
	featureLifeSkill?: boolean
	lazyAlignedContent?: boolean
}

interface OutcomePaperSectionProps extends IPropWithClassNameChildren {
	position: 'top' | 'bottom'
}

const OutcomePaperSection = ({
	position,
	className,
	children,
}: OutcomePaperSectionProps) => {
	return (
		<div
			className={clsx(
				'-mx-8 OutcomePaperSection',
				className,
				position === 'top' && '-mt-8 mb-8',
				position === 'bottom' && 'mt-8 -mb-8',
			)}
		>
			{children}
		</div>
	)
}

interface OutcomePaperRelatedOutcomesProps {
	relatedOutcomes: Outcome[]
	showRelatedOutcome: boolean
	showAlignedContent: boolean
	isLifeSkill?: boolean
	position?: OutcomePaperSectionProps['position']
}

const OutcomePaperRelatedOutcomes = ({
	relatedOutcomes,
	showRelatedOutcome,
	showAlignedContent,
	isLifeSkill = false,
	position = 'bottom',
}: OutcomePaperRelatedOutcomesProps) => {
	const { syllabusLinkedItems } = useOutcomeContext()
	const { pageResponseLinkedItems, mappings } = useKontentHomeConfig()

	const linkedItems = {
		...pageResponseLinkedItems,
		...syllabusLinkedItems,
	}

	if (!showRelatedOutcome) return null

	const PaperComp = isLifeSkill
		? MainstreamOutcomePaper
		: LifeSkillOutcomePaper

	return relatedOutcomes?.length ? (
		<OutcomePaperSection
			position={position}
			className={clsx(
				'divide-y divide-nsw-grey-03',
				position === 'top' ? '' : 'border-t',
			)}
		>
			{relatedOutcomes
				.filter((r) => !!r)
				.map((relatedOutcome) => {
					return (
						<PaperComp
							title={relatedOutcome.elements.code.value}
							pretitle={getLifeSkillsForStageLabel(
								relatedOutcome,
								'Related outcomes for Stage %s',
							)}
							key={relatedOutcome.system.id}
							outcome={relatedOutcome}
							showAlignedContent={showAlignedContent}
							className={clsx(
								'first:border-t-0 -mx-px -mb-px border-nsw-grey-03',
							)}
							square
						>
							{/* {isLifeSkill && (
								<TagList
									className="-mt-1 mb-2"
									tags={relatedOutcome.elements.syllabus.value.map(
										(s) => ({
											text: s.name,
										}),
									)}
								/>
							)} */}
							<RichText
								richTextElement={
									relatedOutcome.elements.description
								}
								linkedItems={linkedItems}
								mappings={mappings}
							/>
						</PaperComp>
					)
				})}
		</OutcomePaperSection>
	) : (
		<OutcomePaperSection
			position={position}
			className={clsx(
				'text-subtext px-8 py-3',
				!isLifeSkill ? 'bg-nsw-off-white' : 'bg-white',
			)}
		>
			{isLifeSkill
				? 'No related outcomes or content in this stage'
				: 'No Life Skills outcomes or content in this stage'}
		</OutcomePaperSection>
	)
}

const LifeSkillOutcomePaper = ({
	className,
	outcome,
	children,
	showAlignedContent,
	showRelatedOutcome,
	featureLifeSkill,
	...props
}: OutcomePaperProps) => {
	const { syllabusLinkedItems } = useOutcomeContext()
	if (!outcome) return

	let relateds = getLinkedItems(
		outcome.elements.relatedlifeskillsoutcomes,
		syllabusLinkedItems,
	)

	if ('relatedOutcomesAlignedFocusAreas' in outcome) {
		relateds = relateds.map((related) => {
			return {
				...related,
				alignedFocusAreas:
					outcome.relatedOutcomesAlignedFocusAreas[
						related.system.codename
					],
			} as ExtendedOutcome
		})
	}

	return (
		<Paper
			{...props}
			className={clsx('flex-1 flex-col bg-nsw-brand-light', className)}
			pretitle={getLifeSkillsForStageLabel(outcome)}
			sx={{
				border: '1px solid var(--nsw-grey-04)',
				'.OutcomePaperSection > * + *': {
					borderTop: '1px solid var(--nsw-grey-03)',
				},
			}}
		>
			<div className="flex-1">
				{children}
				{showAlignedContent && (
					<OutcomePaperAlignedContent outcome={outcome} />
				)}
			</div>
			{showRelatedOutcome && (
				<div className="divide-y divide-nsw-grey-03">
					<OutcomePaperRelatedOutcomes
						relatedOutcomes={relateds}
						showRelatedOutcome={showRelatedOutcome}
						showAlignedContent={showAlignedContent}
						isLifeSkill
					/>
				</div>
			)}
		</Paper>
	)
}

const MainstreamOutcomePaper = ({
	className,
	outcome,
	children,
	showAlignedContent,
	showRelatedOutcome,
	featureLifeSkill,
	...props
}: OutcomePaperProps) => {
	const { syllabusLinkedItems } = useOutcomeContext()

	if (!outcome) return

	let relateds = getLinkedItems(
		outcome.elements.relatedlifeskillsoutcomes,
		syllabusLinkedItems,
	)

	if ('relatedOutcomesAlignedFocusAreas' in outcome) {
		relateds = relateds.map((related) => {
			return {
				...related,
				alignedFocusAreas:
					outcome.relatedOutcomesAlignedFocusAreas[
						related.system.codename
					],
			} as ExtendedOutcome
		})
	}

	return (
		<Paper
			{...props}
			className={clsx('flex-1 flex-col', className)}
			slotBefore={
				featureLifeSkill && (
					<OutcomePaperRelatedOutcomes
						relatedOutcomes={relateds}
						showRelatedOutcome={showRelatedOutcome}
						showAlignedContent={showAlignedContent}
						position="top"
					/>
				)
			}
		>
			<div className="flex-1">
				{children}
				{showAlignedContent && (
					<OutcomePaperAlignedContent outcome={outcome} />
				)}
			</div>
			{!featureLifeSkill && showRelatedOutcome && (
				<OutcomePaperRelatedOutcomes
					relatedOutcomes={relateds}
					showRelatedOutcome={showRelatedOutcome}
					showAlignedContent={showAlignedContent}
				/>
			)}
		</Paper>
	)
}

export default function OutcomePaper(props: OutcomePaperProps) {
	const { outcome } = props
	const { syllabusLinkedItems } = useOutcomeContext()
	const { mappings, pageResponseLinkedItems } = useKontentHomeConfig()

	const isLifeSkill = compareValueWithMultipleChoiceCodename(
		outcome.elements.syllabus_type__items,
		'life_skills',
	)

	const linkedItems = {
		...pageResponseLinkedItems,
		...syllabusLinkedItems,
	}

	const PaperComp = isLifeSkill
		? LifeSkillOutcomePaper
		: MainstreamOutcomePaper

	return (
		<PaperComp {...props}>
			{
				<RichText
					richTextElement={outcome.elements.description}
					linkedItems={linkedItems}
					mappings={mappings}
				/>
			}
		</PaperComp>
	)
}
