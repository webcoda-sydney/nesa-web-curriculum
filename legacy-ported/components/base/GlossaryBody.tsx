import RichText from '@/components/RichText'
import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import type { Glossary } from '@/kontent/content-types/glossary'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import { sanitizeIdAttribute } from '@/utils'
import type { IContentItemSystemAttributes } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import animateScrollTo from 'animated-scroll-to'
import { Accordion, AccordionGroup, TagList } from 'nsw-ds-react'
import { useEffect } from 'react'
import slugify from 'slugify'
import type { IGlossaryRecord } from '../../utilities/backendTypes'
import type { GlossaryProps } from './Glossary'

type GlossaryDefinition = Pick<IGlossaryRecord, 'description' | 'syllabuses'> &
	Pick<IContentItemSystemAttributes, 'id'>

interface GlossaryTerm {
	term: IGlossaryRecord['term']
	key: IGlossaryRecord['alias']
	definitions: GlossaryDefinition[]
}

export type GlossaryBodyProps = Pick<
	GlossaryProps,
	'sections' | 'glossaryLinkedItems'
> & {
	selectedTerm?: string
}

export const getUniqueTermsFromSections = (
	sections: GlossaryBodyProps['sections'],
) => {
	return sections
		.flatMap((s) => s.records)
		.reduce<GlossaryTerm[]>((acc, currentGlosssary: Glossary) => {
			const found = acc.find(
				(r) => r.key === currentGlosssary.elements.title.value,
			)
			const syllabussesOfCurrentGlossary =
				currentGlosssary.elements.syllabus.value
			const description = currentGlosssary.elements.description

			if (found) {
				found.definitions.push({
					id: currentGlosssary.system.id,
					description,
					syllabuses: syllabussesOfCurrentGlossary,
				})
			} else {
				acc.push({
					term: currentGlosssary.elements.title.value,
					key: currentGlosssary.elements.title.value,
					definitions: [
						{
							id: currentGlosssary.system.id,
							syllabuses: syllabussesOfCurrentGlossary,
							description,
						},
					],
				})
			}

			return acc
		}, [])
}

const GlossaryBody = ({
	sections,
	glossaryLinkedItems,
	selectedTerm,
}: GlossaryBodyProps): JSX.Element => {
	const { mappings } = useKontentHomeConfig()
	const terms = getUniqueTermsFromSections(sections)

	useEffect(() => {
		if (selectedTerm) {
			animateScrollTo(
				document.querySelector(
					`#accordion-term-${sanitizeIdAttribute(
						slugify(selectedTerm.toLowerCase()),
					)}`,
				),
				{ speed: 0 },
			)
		}
	}, [selectedTerm])

	return (
		<div className="glossary-body">
			<AccordionGroup>
				{terms
					.sort((a, b) => stringCompare(a.term, b.term))
					.map((t) => {
						const closed = selectedTerm
							? !(
									selectedTerm.toLowerCase() ===
									t.term.toLowerCase()
							  )
							: true
						return (
							<div
								key={t.key}
								id={`accordion-term-${sanitizeIdAttribute(
									slugify(t.term.toLowerCase()),
								)}`}
							>
								<Accordion
									header={t.term}
									body={
										<>
											{t.definitions.map((d) => (
												<div
													key={d.id}
													className="glossary-body__definition"
													data-kontent-item-id={d.id}
												>
													<RichText
														richTextElement={
															d.description
														}
														linkedItems={
															glossaryLinkedItems
														}
														mappings={mappings}
														data-kontent-element-codename="description"
													/>
													{t.definitions.length >=
														1 &&
														d.syllabuses.length >
															0 && (
															<TagList
																className="mt-6"
																tags={d.syllabuses.map(
																	(
																		syllabus,
																	) => {
																		return {
																			text: syllabus.name,
																		}
																	},
																)}
																data-kontent-element-codename="syllabus"
															/>
														)}
												</div>
											))}
										</>
									}
									closed={closed}
								/>
							</div>
						)
					})}
			</AccordionGroup>
			{terms.length === 0 && (
				<Grid container justifyContent="center">
					<div className="mt-4 font-bold">No results found</div>
				</Grid>
			)}
		</div>
	)
}

export default GlossaryBody
