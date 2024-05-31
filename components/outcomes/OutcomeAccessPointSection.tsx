import {
	Accesscontentgroup,
	Accesscontentitem,
	Contentrichtext as ContentrichtextModel,
} from '@/kontent/content-types'
import { OutcomeDetailCardProps } from '@/legacy-ported/components/card/OutcomeDetailCard'
import { TaxoStageWithLifeSkill } from '@/types'
import { isRichtextElementEmpty } from '@/utils'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'
import RichText from '../RichText'
import Contentrichtext from '../sections/contentrichtext'
import { OutcomeExample } from './OutcomeExample'

export interface OutcomeAccessPointSectionProps {
	accessPoints: Accesscontentgroup[]
	stage: TaxoStageWithLifeSkill
	linkedItems: OutcomeDetailCardProps['linkedItems']
	mappings: OutcomeDetailCardProps['mappings']
	showExamples?: boolean
	accessPointContent?: ContentrichtextModel[]
}

export const OutcomeAccessPointSection = ({
	accessPoints,
	mappings,
	linkedItems,
	showExamples = false,
	accessPointContent = null,
}: OutcomeAccessPointSectionProps) => {
	return (
		<div className="mb-8 p-4 bg-nsw-brand-dark/10">
			<div className="nsw-h4 mb-3">Access content points</div>
			{!!accessPointContent.length && (
				<div className="my-3 space-y-3">
					{accessPointContent.map((accessPointContentItem) => (
						<Contentrichtext
							key={accessPointContentItem.system.id}
							linkedItem={accessPointContentItem}
							linkedItems={linkedItems}
							mappings={mappings}
						/>
					))}
				</div>
			)}
			<div className="space-y-4">
				{accessPoints.map((acccessPoint: Accesscontentgroup) => (
					<div key={acccessPoint.system.id}>
						<div
							className="mb-4 bold"
							data-kontent-element-codename="title"
							data-kontent-item-id={acccessPoint.system.id}
						>
							<p>{acccessPoint.elements.title.value}</p>
						</div>

						<div>
							{getLinkedItems(
								acccessPoint.elements.access_content_items,
								linkedItems,
							).map((row: Accesscontentitem) => (
								<div
									key={row.system.id}
									data-kontent-element-id={row.system.id}
								>
									{!isRichtextElementEmpty(
										row.elements.title,
									) && (
										<ul className="list-disc space-y-0 pl-[1.1875rem]">
											<li
												data-kontent-element-codename="title"
												className="mt-0"
											>
												<RichText
													linkedItems={linkedItems}
													mappings={mappings}
													richTextElement={
														row.elements.title
													}
												/>
												{!isRichtextElementEmpty(
													row.elements.examples,
												) &&
													showExamples && (
														<OutcomeExample
															className="my-2"
															example={
																row.elements
																	.examples
															}
															linkedItems={
																linkedItems
															}
															mappings={mappings}
															css={{
																paddingRight:
																	'1rem',
															}}
														/>
													)}
											</li>
										</ul>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
