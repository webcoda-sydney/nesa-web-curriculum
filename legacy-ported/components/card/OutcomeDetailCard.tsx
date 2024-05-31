import RichText from '@/components/RichText'
import {
	OutcomeAccessPointSection,
	OutcomeAccessPointSectionProps,
} from '@/components/outcomes/OutcomeAccessPointSection'
import { OutcomeExample } from '@/components/outcomes/OutcomeExample'
import {
	OutcomeExampleLang,
	getActiveExampleLangs,
} from '@/components/outcomes/OutcomeExampleLang'
import { OutcomeIncluding } from '@/components/outcomes/OutcomeIncluding'
import Contentrichtext from '@/components/sections/contentrichtext'
import LinksPlaceholderCcComp from '@/components/sections/links_placeholder_cc'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import type { Accesscontentgroup } from '@/kontent/content-types/accesscontentgroup'
import type { Contentgroup } from '@/kontent/content-types/contentgroup'
import type { Contentitem } from '@/kontent/content-types/contentitem'
import {
	TaxoLanguage,
	TaxoLiteracy,
	TaxoNumeracy,
	TaxoPathways,
} from '@/kontent/taxonomies'
import {
	IPropWithClassName,
	IPropWithClassNameChildren,
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	getDataAttributesFromProps,
	getFnIsItemHasStage,
	getFnIsItemHasYear,
	getLinkedItems,
	isRichtextElementEmpty,
} from '@/utils'
import { getStagedContentBased } from '@/utils/focusarea'
import { TOverarchingLinkProps } from '@/utils/getLinksFromOverarchingLinks'
import {
	ElementModels,
	ElementType,
	Elements,
	IContentItemsContainer,
} from '@kontent-ai/delivery-sdk'
import Paper from '@mui/material/Paper'
import clsx from 'clsx'
import { TagList } from 'nsw-ds-react'
import {
	ReactNode,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react'
import { IntersectionOptions, useInView } from 'react-intersection-observer'
// import { findTag } from '../../store/mock/tags';

export interface OutcomeDetailCardProps extends IPropWithClassName {
	/**
	 * Card title
	 */
	title?: ReactNode

	/**
	 * Syllabus Content
	 */
	groups: Contentgroup[]

	/**
	 * Syllabus Access Point
	 */
	accessPoints?: Accesscontentgroup[]

	/**
	 * Whether show the access point content
	 */
	showAccessPoints?: boolean
	/**
	 * What tags to show.
	 */
	showTags?: string[]
	/**
	 * Whether show the examples
	 */
	showExamples?: boolean
	/**
	 * Whether set default background color
	 */
	defaultBackgroundColor?: boolean

	/**
	 * To show only the access points and content items that are tagged with this TaxoStage.
	 * If not specified, it will show all the contents of the groups and the access points
	 */
	stage?: TaxoStageWithLifeSkill

	/**
	 * To show only the access points and content items that are tagged with this TaxoStageYear.
	 * If not specified, it will show all the contents of the groups and the access points
	 */
	year?: TaxoStageYearWithLifeSkill
	linkedItems: IContentItemsContainer
	mappings: Mapping[]

	slotBeforeContentGroups?: ReactNode
	slotAfterContentGroups?: ReactNode
	slotBeforeTitle?: ReactNode
	accessPointContent?: OutcomeAccessPointSectionProps['accessPointContent']
	focusAreaOrFocusAreaOptionPath?: string
	allOverarchingLinks?: Record<string, TOverarchingLinkProps>

	/**
	 * css variable(s) for total height. if multiple specified, it'll be added up
	 */
	cssVariablesForODTTotalHeight?: string[]
	selectedLanguages?: TaxoLanguage[]
	selectedPathways?: ElementModels.TaxonomyTerm<TaxoPathways>[]
}

export interface OutcomeDetailCardTitleProps
	extends IPropWithClassNameChildren {
	variant?: 'brand-dark' | 'brand-light'
	whenStickyClassNames?: string
	useInViewOptions?: IntersectionOptions
	indicatorClassName?: string
	cssVariableForHeight?: string
}

export const setCssVariableOnRoot = (cssVariable: string, value: string) => {
	document.querySelector('html').style.setProperty(cssVariable, value)
}

export const OutcomeDetailCardTitle = forwardRef<
	HTMLDivElement,
	OutcomeDetailCardTitleProps
>(
	(
		{
			className,
			children,
			variant = 'brand-dark',
			whenStickyClassNames = '',
			useInViewOptions,
			indicatorClassName,
			cssVariableForHeight = '--outcome-detailcard-title-height',
		},
		ref,
	) => {
		const innerRef = useRef<HTMLDivElement>(null)

		const { ref: refIndicator, inView } = useInView(useInViewOptions)
		const isSticky = !inView

		useImperativeHandle(ref, () => innerRef.current!, [])

		useEffect(() => {
			// watch for ref if it is resized and set the height of the ref as css variable on the root
			if (!innerRef.current) return

			// set the css variable first
			setCssVariableOnRoot(
				cssVariableForHeight,
				`${innerRef.current.clientHeight}px`,
			)

			// then watch for resize
			const observer = new ResizeObserver((entries) => {
				for (let entry of entries) {
					const height = entry.borderBoxSize?.[0]?.blockSize
					setCssVariableOnRoot(cssVariableForHeight, `${height}px`)
				}
			})
			observer.observe(innerRef.current)
			return () => {
				observer.disconnect()
			}
		}, [cssVariableForHeight])

		return (
			<>
				<div
					ref={refIndicator}
					css={{
						'&&:not(:first-child) + *': {
							marginTop: 0,
						},
					}}
					className={indicatorClassName}
				></div>
				<div
					ref={innerRef}
					className={clsx(
						'nsw-h3 -mx-8 -mt-2 px-8 pb-4 sticky z-[1] top-0 border-b-2 transition-all duration-150',
						'border-t-8 border-t-transparent pt-6',
						isSticky && 'border-b-nsw-grey-01 bg-white',
						!isSticky && 'rounded-t-[.25rem] border-b-transparent',
						isSticky &&
							variant === 'brand-dark' &&
							'[&.sticky]:border-t-nsw-brand-dark',
						isSticky &&
							variant === 'brand-light' &&
							'[&.sticky]:border-t-nsw-brand-light',
						className,
						isSticky && whenStickyClassNames,
					)}
					data-kontent-element-codename="title"
					css={{
						'&&': {
							marginTop: '-2rem',
						},
						'.is-preview &': {
							top: 26,
						},
					}}
				>
					{children}
				</div>
			</>
		)
	},
)

const getTagFilter = (shownTags: (TaxoLiteracy | TaxoNumeracy)[]) => (t) =>
	shownTags.some((st) => st === t.codename)
const fnMapTag = (tag) => ({
	text: tag.name,
})
export default function OutcomeDetailCard(props: OutcomeDetailCardProps) {
	const {
		className,
		title,
		groups,
		accessPoints,
		showAccessPoints,
		showTags,
		showExamples,
		defaultBackgroundColor,
		linkedItems,
		mappings,
		stage,
		year,
		slotBeforeContentGroups,
		slotBeforeTitle,
		slotAfterContentGroups,
		accessPointContent = null,
		focusAreaOrFocusAreaOptionPath = '',
		allOverarchingLinks,
		cssVariablesForODTTotalHeight = ['--outcome-detailcard-title-height'],
		selectedLanguages,
		selectedPathways = [],
		...rest
	} = props
	const dataAttributes = getDataAttributesFromProps(rest)

	const renderTagList = (
		tags: Elements.TaxonomyElement<TaxoLiteracy | TaxoNumeracy>,
		codename: string,
	) => {
		const tagItems =
			tags.value
				.filter(
					getTagFilter(showTags as (TaxoLiteracy | TaxoNumeracy)[]),
				)
				.map(fnMapTag) || []

		if (!tagItems.length) return

		return (
			<TagList data-kontent-element-codename={codename} tags={tagItems} />
		)
	}

	const syllabusHasNoPathways = useMemo(() => {
		return (
			selectedPathways.length === 1 &&
			selectedPathways[0].codename === ('' as TaxoPathways)
		)
	}, [selectedPathways])

	return (
		<Paper
			{...dataAttributes}
			elevation={0}
			className={clsx('border pt-6 pb-8 px-8 relative', className)}
		>
			{slotBeforeTitle}
			{title}

			{accessPoints?.length > 0 && showAccessPoints && (
				<OutcomeAccessPointSection
					accessPoints={accessPoints}
					accessPointContent={accessPointContent}
					linkedItems={linkedItems}
					mappings={mappings}
					showExamples={showExamples}
					stage={stage}
				/>
			)}
			{/* Do not remove search-tag class, Used for site search360 */}
			<div className="space-y-4 lg:space-y-8 search-tag">
				{slotBeforeContentGroups}

				{groups?.map((group) => {
					const groupContentItems = getLinkedItems(
						group.elements.content_items,
						linkedItems,
					)
					const stagedContents = getStagedContentBased(
						group.elements.content_staged,
						linkedItems,
						stage,
						year,
					)

					const chpsLinks = group.elements.chps_links.value

					const groupContentItemsByPathway = selectedPathways
						.map((pathway) => {
							/**
							 * if pathway has empty codename, it means it's the "all" option
							 */
							return {
								pathway,
								contentItems: groupContentItems
									.filter((contentItem) => {
										if (stage === 'life_skills') return true
										const filter =
											getFnIsItemHasStage(stage)
										return filter(contentItem)
									})
									.filter(getFnIsItemHasYear(year))
									.filter((contentItem) => {
										return (
											!pathway.codename ||
											contentItem.elements.pathway__pathway.value.some(
												(p) =>
													p.codename ===
													pathway.codename,
											)
										)
									}),
							}
						})
						.filter(({ contentItems }) => contentItems.length > 0)

					const criteriaToShowGroup = [
						// show if there's content
						!isRichtextElementEmpty(group.elements.content),

						// show if there's staged content
						!!stagedContents.length,

						// show if there's overarching links
						!!chpsLinks?.length,

						// show if there's content items
						!!groupContentItemsByPathway.length,
					]
					if (!syllabusHasNoPathways) {
						if (!groupContentItemsByPathway.length) {
							// if there's any pathway selected, but there's no content items, don't show
							return null
						}
					} else {
						// if there's no pathway selected, but no criteria to show the group, don't show
						if (!criteriaToShowGroup.some(Boolean)) return null
					}

					return (
						<div key={group.system.id}>
							{!!group.elements.title.value && (
								<CommonCopyUrlWrapper
									url={`${focusAreaOrFocusAreaOptionPath}#cg-${group.system.id}`}
									className="nsw-h4"
									id={`cg-${group.system.id}`}
									data-kontent-item-id={group.system.id}
									data-kontent-element-codename="title"
									css={{
										scrollMarginTop: `calc(${cssVariablesForODTTotalHeight
											.map((c) => `var(${c}, 0px)`)
											.join(' + ')} + 1.5rem)`,
									}}
								>
									{group.elements.title.value}
								</CommonCopyUrlWrapper>
							)}

							{!isRichtextElementEmpty(
								group.elements.content,
							) && (
								<RichText
									className="mt-2"
									richTextElement={group.elements.content}
									linkedItems={linkedItems}
									mappings={mappings}
								/>
							)}

							{!!stagedContents.length && (
								<div className="space-y-3">
									{stagedContents.map((stagedContent) => (
										<Contentrichtext
											key={stagedContent.system.id}
											linkedItem={stagedContent}
											linkedItems={linkedItems}
										/>
									))}
								</div>
							)}

							{!!groupContentItemsByPathway.length && (
								<div className="mt-3 space-y-4">
									{groupContentItemsByPathway.map(
										({ pathway, contentItems }) => {
											return (
												<div key={pathway?.codename}>
													{!!pathway.name && (
														<div className="font-bold mb-1">
															{pathway?.name}
														</div>
													)}
													<ul className="list-disc mt-0 space-y-0 pl-[1.1875rem]">
														{contentItems.map(
															(
																row: Contentitem,
															) => {
																const activeExampleLangs =
																	getActiveExampleLangs(
																		row
																			.elements
																			.examples_lang,
																		linkedItems,
																		selectedLanguages,
																	)?.filter(
																		Boolean,
																	)

																const hasExamplesContent =
																	!isRichtextElementEmpty(
																		row
																			.elements
																			.examples,
																	)

																return (
																	<li
																		key={
																			row
																				.system
																				.id
																		}
																		data-kontent-item-id={
																			row
																				.system
																				.id
																		}
																	>
																		<RichText
																			richTextElement={
																				row
																					.elements
																					.title
																			}
																			linkedItems={
																				linkedItems
																			}
																			mappings={
																				mappings
																			}
																			data-kontent-element-codename="title"
																			css={{
																				'&& ul':
																					{
																						listStyle:
																							'circle',
																						ul: {
																							listStyle:
																								'square',
																							ul: {
																								listStyle:
																									'circle',
																							},
																						},
																					},

																				'&& > * + *, && li':
																					{
																						marginTop: 0,
																					},
																				'&&  ul, && ol':
																					{
																						paddingLeft:
																							'1.1875rem',
																					},
																			}}
																		></RichText>
																		{row
																			.elements
																			.including_statements
																			.value &&
																			!isRichtextElementEmpty(
																				row
																					.elements
																					.including_statements,
																			) && (
																				<OutcomeIncluding
																					includingStatement={
																						row
																							.elements
																							.including_statements
																					}
																					linkedItems={
																						linkedItems
																					}
																					mappings={
																						mappings
																					}
																				/>
																			)}
																		{(hasExamplesContent ||
																			activeExampleLangs.length >
																				0) &&
																			showExamples && (
																				<OutcomeExample
																					className="my-2"
																					example={
																						row
																							.elements
																							.examples
																					}
																					linkedItems={
																						linkedItems
																					}
																					mappings={
																						mappings
																					}
																				>
																					<OutcomeExampleLang
																						className={clsx(
																							'mt-2 pl-5 space-y-2',
																						)}
																						examplesLang={
																							row
																								.elements
																								.examples_lang
																						}
																						activeLanguages={
																							selectedLanguages
																						}
																						linkedItems={
																							linkedItems
																						}
																						mappings={
																							mappings
																						}
																					/>
																				</OutcomeExample>
																			)}

																		{showTags &&
																			row
																				.elements
																				.learningprogression_tags__numeracy
																				.value
																				.length >
																				0 &&
																			renderTagList(
																				row
																					.elements
																					.learningprogression_tags__numeracy,
																				'learningprogression_tags__numeracy',
																			)}
																		{showTags &&
																			row
																				.elements
																				.learningprogression_tags__literacy
																				.value
																				.length >
																				0 &&
																			renderTagList(
																				row
																					.elements
																					.learningprogression_tags__literacy,
																				'learningprogression_tags__literacy',
																			)}
																	</li>
																)
															},
														)}
													</ul>
												</div>
											)
										},
									)}
								</div>
							)}

							{!!chpsLinks?.length && (
								<LinksPlaceholderCcComp
									className="mt-4"
									linkedItem={{
										elements: {
											title: {
												name: 'title',
												type: ElementType.Text,
												value: 'These are the suggested curriculum connections:',
											},
											links: group.elements.chps_links,
										},
										system: {
											codename:
												'chps_links__' +
												group.system.codename,
										} as any,
									}}
								/>
							)}
						</div>
					)
				})}

				{slotAfterContentGroups}
			</div>
		</Paper>
	)
}
