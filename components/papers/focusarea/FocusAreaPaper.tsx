import Icon from '@/components/Icon'
import RichText from '@/components/RichText'
import { RichTextComponentProps } from '@/components/RichTextComponent'
import UiFocusAreaPaper from '@/components/ui/focusarea/UiFocusAreaPaper'
import { useToggle } from '@/hooks/useToggle'
import {
	Focusarea,
	Focusareaoption,
	Optionslist,
	Outcome,
} from '@/kontent/content-types'
import { TaxoStageWithLifeSkill } from '@/types'
import { getLifeSkillsForStageLabel } from '@/utils/focusarea'
import { isFocusarea } from '@/utils/type_predicates'

import { PaperProps } from '@mui/material/Paper/Paper'
import { Dispatch, ReactNode, SetStateAction } from 'react'

export interface FocusAreaPaperProps extends PaperProps {
	focusAreaOrOptionlistOrFocusareaoption:
		| Focusarea
		| Optionslist
		| Focusareaoption
	outcomes: Outcome[]
	linkedItems: RichTextComponentProps['linkedItems']
	mappings: RichTextComponentProps['mappings']
	selected?: boolean
	isLifeSkill?: boolean
	currentStage?: TaxoStageWithLifeSkill
	slotBeforeOutcomes?: ReactNode
}

interface FocusAreaOutcomeWrapperProps {
	initialState?: boolean
	children: (
		_open: boolean,
		_setState: Dispatch<SetStateAction<boolean>>,
	) => ReactNode
}

const FocusAreaOutcomeWrapper = ({
	initialState = false,
	children,
}: FocusAreaOutcomeWrapperProps) => {
	const [open, setState] = useToggle(initialState)

	return <>{children(open, setState)}</>
}

export const FocusAreaPaper = ({
	focusAreaOrOptionlistOrFocusareaoption: focusAreaOrOptionlist,
	outcomes,
	linkedItems,
	mappings,
	selected,
	isLifeSkill,
	currentStage,
	slotBeforeOutcomes,
	...props
}: FocusAreaPaperProps) => {
	const _isFocusarea = isFocusarea(focusAreaOrOptionlist)
	const needOutcomeToggle = outcomes.length > 3
	return (
		<UiFocusAreaPaper
			{...props}
			variant={isLifeSkill ? 'brand-light' : 'brand-dark'}
			pretitle={
				isLifeSkill && getLifeSkillsForStageLabel(focusAreaOrOptionlist)
			}
			title={focusAreaOrOptionlist.elements.title.value}
		>
			{slotBeforeOutcomes}
			<FocusAreaOutcomeWrapper>
				{(open, setState) => {
					return (
						<>
							{needOutcomeToggle && (
								<button
									type="button"
									onClick={() => setState(!open)}
									className="bold underline"
								>
									{!open ? 'Show' : 'Hide'} outcomes
									<Icon
										icon={
											open
												? 'mdi:chevron-up'
												: 'mdi:chevron-down'
										}
									/>
								</button>
							)}
							{(open || !needOutcomeToggle) &&
								!!outcomes?.length && (
									<ul className="divide-y divide-current space-y-3">
										{outcomes.map((outcome) => {
											return (
												<li
													key={outcome.system.id}
													className="space-y-3 pt-3 first:pt-0"
												>
													<div className="bold">
														{
															outcome.elements
																.code.value
														}
													</div>
													<RichText
														linkedItems={
															linkedItems
														}
														mappings={mappings}
														richTextElement={
															outcome.elements
																.description
														}
													/>
												</li>
											)
										})}
									</ul>
								)}
						</>
					)
				}}
			</FocusAreaOutcomeWrapper>
		</UiFocusAreaPaper>
	)
}
