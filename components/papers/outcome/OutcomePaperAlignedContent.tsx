import { ExtendedOutcome } from '@/components/outcomes/KontentOutcomeWrapper'
import { Outcome } from '@/kontent/content-types'
import { isYes } from '@/utils'
import Link from 'next/link'
import { OutcomePaperOverarchingOutcomeWarning } from './OutcomePaperOverarchingOutcomeWarning'

export interface OutcomePaperAlignedContentProps {
	outcome: Outcome | ExtendedOutcome
}

export const OutcomePaperAlignedContent = ({
	outcome,
}: OutcomePaperAlignedContentProps) => {
	const alignedFocusAreas =
		'alignedFocusAreas' in outcome ? outcome.alignedFocusAreas : undefined

	const isOverarching = isYes(outcome.elements.isoverarching)

	// if alignedFocusAreas is empty
	if (!alignedFocusAreas?.length && !isOverarching) return

	return (
		<div className="mt-3 pt-3 border-t">
			<p className="mb-0 text-subtext">
				{isOverarching ? (
					<OutcomePaperOverarchingOutcomeWarning />
				) : (
					'Content aligned to outcome'
				)}
			</p>
			{!isOverarching && (
				<ul className="nsw-small list-disc pl-[18px] mt-0 space-y-0">
					{alignedFocusAreas.map((focusArea) => {
						return (
							<li key={focusArea.system.id}>
								<Link
									href={focusArea.contentTabUrl}
									scroll={false}
								>
									<a>{focusArea.elements.title.value}</a>
								</Link>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
