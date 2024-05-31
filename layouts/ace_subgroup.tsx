import Icon from '@/components/Icon'
import Link from '@/components/Link'
import RichText, { RichTextProps } from '@/components/RichText'
import { SyllabusHeader } from '@/components/SyllabusHeader'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import {
	AccordionRule,
	IconLink,
} from '@/components/ace/subgroup/AccordionRule'
import { Footnotes } from '@/components/ace/subgroup/Footnotes'
import { PrevNextButton } from '@/components/ace/subgroup/PrevNextButton'
import { AssetsProvider } from '@/components/contexts/AssetsProvider'
import { AceModal } from '@/components/modals/AceModal'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import {
	SideNav,
	SideNavWithCollapse,
	getStickySideNavStyle,
} from '@/components/nsw/side-nav/SideNav'
import { CopyToClipboardButton } from '@/components/ui/copy-to-clipboard/CopyToClipboardButton'
import { AceSubGroupResponseData } from '@/databuilders/ace_subgroup'
import { useToggle } from '@/hooks/useToggle'
import { AceFootnote, AceSubgroup } from '@/kontent/content-types'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import { CommonPageProps } from '@/types'
import { getLinkedItems, isRichtextElementEmpty } from '@/utils'
import { getAceSearchParamFromUrlHash } from '@/utils/ace'
import { css } from '@emotion/css'
import clsx from 'clsx'
import { compareDesc, format } from 'date-fns'
import { useRouter } from 'next/router'
import { Alert, Button, TagList } from 'nsw-ds-react'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { makeAceGroupsSideNavItems, useAceHeaderSideNavItem } from './ace_group'
import { GlobalAlertAce } from './wp_ace_landing'

export const createFootnotesLinkResolver =
	(
		footnotes: AceFootnote[],
		fnGetUrl: (_footnoteOrderNumber) => string,
	): RichTextProps['resolveFootnotesLink'] =>
	(link, _mappings, domNode, domToReact): ReactNode => {
		const indexFootnote = footnotes.findIndex(
			(f) => f.system.codename === link.codename,
		)
		const footnoteOrderNumber = indexFootnote + 1
		const url = fnGetUrl(footnoteOrderNumber)
		return (
			<>
				{domToReact(domNode.children)}
				<a
					href={url}
					className={clsx(
						'font-bold relative ml-[.25rem] bottom-[.375rem] no-underline',
						'scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+24px)] [.is-preview_&]:scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+50px)]',
					)}
				>
					<span
						className="inline-flex gap-[0.5] align-middle items-center"
						css={{
							fontSize: '.5625rem',
							lineHeight: '1.33',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="4"
							height="14"
							viewBox="0 0 4 14"
							fill="none"
						>
							<path d="M4 1L1 1L1 13L4 13" stroke="#002664" />
						</svg>
						<span className="text-[.625rem] leading-[initial]">
							{footnoteOrderNumber}
						</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="4"
							height="14"
							viewBox="0 0 4 14"
							fill="none"
						>
							<path
								d="M7.86808e-07 13L3 13L3 1L-5.24537e-07 1"
								stroke="#002664"
							/>
						</svg>
					</span>
				</a>
			</>
		)
	}

export default function AceSubGroupComponent(
	props: CommonPageProps<AceSubgroup, AceSubGroupResponseData>,
) {
	const { mappings, data, preview, params } = props
	const {
		pageResponse,
		aceGroups: allAceGroupsResponse,
		allAssets,
		releaseNotes,
		config,
	} = data
	const router = useRouter()
	const [subGroupUrl, setSubGroupUrl] = useState('')
	const [accordionIdStartOpen, setAccordionIdStartOpen] = useState('')

	const sideNavHeader = useAceHeaderSideNavItem({ mappings, params })

	// Download View
	const [showDownloadOverlay, setShowDownloadOverlay] = useToggle(false)

	//Computed
	// the subgroup
	const page = pageResponse.item
	const sideNavItems = makeAceGroupsSideNavItems(
		allAceGroupsResponse.items,
		allAceGroupsResponse.linkedItems,
		mappings,
		page,
	)

	const allSubgroups = allAceGroupsResponse.items.flatMap((group) => {
		return getLinkedItems(
			group.elements.subgroups,
			allAceGroupsResponse.linkedItems,
		)
	})

	const currentParentSubGroup = sideNavItems.find((group) => {
		// Check child not first
		return group.subNav.find((subGroup) => {
			return subGroup.isActive
		})
	})

	const currentSubGroupIndex = currentParentSubGroup.subNav.findIndex(
		(subGroup) => {
			return subGroup.isActive
		},
	)

	const rules = useMemo(() => {
		return getLinkedItems(page.elements.rules, pageResponse.linkedItems)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page.system.codename])

	const glossaries = useMemo(() => {
		return getLinkedItems(page.elements.glossary, pageResponse.linkedItems)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page.system.codename])

	// Footnotes
	const footnotes = getLinkedItems(
		page.elements.footnotes,
		pageResponse.linkedItems,
	)

	const scrollToRule = useCallback(() => {
		if (accordionIdStartOpen) {
			const { hash } = new URL(document.location.href)
			const hashNew = hash.replace('#', '')
			setTimeout(() => {
				const el = document.querySelector(`[id="${hashNew}"]`)
				el?.scrollIntoView({ behavior: 'smooth' })
			}, 1000)
		}
	}, [accordionIdStartOpen])

	const downloadOptions = useMemo(() => {
		return [
			...rules.map((rule) => {
				return {
					id: rule.system.codename,
					label: rule.elements.title.value,
				}
			}),
			{
				id: 'glossary',
				label: 'Glossary',
			},
		]
	}, [rules])

	const resolveFootnotesLink = useMemo(
		() =>
			createFootnotesLinkResolver(footnotes, (footnoteOrderNumber) => {
				return `#preamble_footnotes_${footnoteOrderNumber}`
			}),
		[footnotes],
	)

	const subgroupPageReleaseNotes = releaseNotes?.items
		?.filter((releaseNote) => {
			return releaseNote?.elements?.subgroup?.value?.some(
				(codename) => codename == pageResponse?.item?.system?.codename,
			)
		})
		.sort((a, b) => {
			return compareDesc(
				new Date(a.elements.releasedate.value),
				new Date(b.elements.releasedate.value),
			)
		})

	const latestReleaseNote = subgroupPageReleaseNotes?.[0]

	const handleAceModalCancel = () => {
		setShowDownloadOverlay(false)
	}

	const showRulesNavigation =
		currentSubGroupIndex !== 0 ||
		currentParentSubGroup.subNav[currentSubGroupIndex + 1]

	useEffect(() => {
		const fakeOrigin = 'https://xyz.xyz/'

		const fullUrl = fakeOrigin + router.asPath
		const aceRuleId = getAceSearchParamFromUrlHash(fullUrl, 'acerule')

		setAccordionIdStartOpen(aceRuleId)
	}, [router.asPath])

	// Scroll to #id that equals to query.rule
	useEffect(() => {
		scrollToRule()
	}, [scrollToRule])

	useEffect(() => {
		setSubGroupUrl(window.location.origin + window.location.pathname)
	}, [page.system.codename])

	useEffect(() => {
		// add variable for ace rules navigation
		document.documentElement.style.setProperty(
			'--ace-rules-prevnext-height',
			`${showRulesNavigation ? '3.8125rem' : '0px'}`,
		)
	}, [showRulesNavigation])

	return (
		<>
			<GlobalAlertAce
				config={config}
				mappings={mappings}
				preview={preview}
			/>
			<SideNavWithCollapse
				header={sideNavHeader}
				parentClassName={clsx(
					'lg:hidden',
					css({
						'.SideNavWithCollapse__toggle': {
							paddingLeft: '1rem',
							paddingRight: '1rem',
						},
					}),
				)}
				items={sideNavItems}
			/>
			<SyllabusHeader
				title={page.elements.title.value}
				slotAfterTitle={
					page.elements.lastupdateddate.value && (
						<div className="mt-2 text-nsw-brand-light">
							Last updated:{' '}
							<time
								dateTime={page.elements.lastupdateddate.value}
							>
								{format(
									new Date(
										page.elements.lastupdateddate.value,
									),
									'dd MMMM yyyy',
								)}
							</time>
						</div>
					)
				}
				slotAfterButtons={
					<>
						<CopyToClipboardButton textToCopy={subGroupUrl}>
							<span>Copy link to rule</span>
							<IconLink />
						</CopyToClipboardButton>
						<Button
							className="flex justify-center"
							style="white"
							onClick={() => setShowDownloadOverlay(true)}
							css={{
								'& > *': {
									flexShrink: 0,
								},
							}}
						>
							<span className="mr-2">Download rule</span>
							<Icon icon="bxs:download" />
						</Button>
					</>
				}
			/>
			<div className="nsw-container lg:px-4 pt-8">
				<GridWrapper>
					<GridCol lg={4} className="hidden lg:block md:pr-8">
						<WrapperWithInView>
							{(isSticky) => {
								return (
									<SideNav
										header={sideNavHeader}
										className="sticky top-0"
										css={getStickySideNavStyle(isSticky)}
										items={sideNavItems}
										withToggle
									/>
								)
							}}
						</WrapperWithInView>
					</GridCol>
					<GridCol lg={8} className="space-y-12">
						{/* Navigation */}
						{showRulesNavigation && (
							<WrapperWithInView>
								{(inView) => {
									return (
										<div
											className={clsx(
												'flex justify-between sticky top-0 border-b z-10 bg-white  py-[1.125rem] !-mt-[1.125rem]',
												inView && 'border-transparent',
												preview && 'top-[1.625rem]',
												'lg:top-[var(--global-alert-ace-height)]',
											)}
										>
											{currentSubGroupIndex !== 0 ? (
												<PrevNextButton
													type="Previous"
													contentItem={
														currentParentSubGroup
															.subNav[
															currentSubGroupIndex -
																1
														]
													}
												/>
											) : (
												<div />
											)}
											{currentParentSubGroup.subNav[
												currentSubGroupIndex + 1
											] ? (
												<PrevNextButton
													type="Next"
													contentItem={
														currentParentSubGroup
															.subNav[
															currentSubGroupIndex +
																1
														]
													}
												/>
											) : (
												<div />
											)}
										</div>
									)
								}}
							</WrapperWithInView>
						)}

						{latestReleaseNote && (
							<div>
								<Alert
									title={`Updated ${format(
										new Date(
											latestReleaseNote.elements.releasedate.value,
										),
										'dd MMM yyyy',
									)}`}
									as="info"
								>
									<RichText
										richTextElement={
											latestReleaseNote.elements.content
										}
										mappings={mappings}
										linkedItems={pageResponse.linkedItems}
									/>
									<Link
										href={`/resources/record-of-changes?ace=${encodeURIComponent(
											page?.system?.codename,
										)}`}
									>
										View all changes
									</Link>
								</Alert>
							</div>
						)}
						{/* Legislative */}
						{!isRichtextElementEmpty(
							page?.elements?.legislativebasis,
						) && (
							<RichText
								className="p-8 border rounded-lg"
								mappings={mappings}
								linkedItems={pageResponse.linkedItems}
								richTextElement={page.elements.legislativebasis}
							/>
						)}

						<div>
							{!!page.elements.preamble_title.value && (
								<h2 className="mb-5">
									{page.elements.preamble_title.value}
								</h2>
							)}
							<div className="space-y-8">
								{/* Preamble */}
								{!isRichtextElementEmpty(
									page.elements.preamble_content,
								) && (
									<RichText
										mappings={mappings}
										linkedItems={pageResponse.linkedItems}
										richTextElement={
											page.elements.preamble_content
										}
										resolveFootnotesLink={
											resolveFootnotesLink
										}
									/>
								)}

								{!!footnotes?.length && (
									<div>
										<h3 className="mb-5">Footnotes</h3>
										<Footnotes
											idPrefix="preamble_footnotes_"
											footnotes={footnotes}
										></Footnotes>
									</div>
								)}
							</div>
						</div>

						{/* Rule accordions */}
						<div className="space-y-2">
							<AssetsProvider assets={allAssets}>
								{rules.map((rule) => {
									return (
										<AccordionRule
											key={rule.system.id}
											rule={rule}
											allAceSubgroups={allSubgroups}
											startOpen={
												accordionIdStartOpen ===
												rule.system.codename
											}
											mappings={mappings}
											linkedItems={
												pageResponse.linkedItems
											}
										/>
									)
								})}
							</AssetsProvider>
							{!!glossaries?.length && (
								<CustomAccordion title="Glossary">
									<div className="divide-y">
										{glossaries
											.sort((a, b) =>
												stringCompare(
													a.elements.title.value,
													b.elements.title.value,
												),
											)
											.map((glossary) => {
												const tags =
													glossary.elements.ace_category.value.map(
														(aceCategory) => {
															return {
																text: aceCategory.name,
															}
														},
													)
												return (
													<div
														key={glossary.system.id}
														className="space-y-4 py-6 first:pt-0"
													>
														<div className="bold">
															{
																glossary
																	.elements
																	.title.value
															}
														</div>
														<RichText
															richTextElement={
																glossary
																	.elements
																	.description
															}
															mappings={mappings}
															linkedItems={
																pageResponse.linkedItems
															}
															disableCopyUrl
														/>
														{!!tags?.length && (
															<TagList
																className="mt-6"
																tags={tags}
															/>
														)}
													</div>
												)
											})}
									</div>
								</CustomAccordion>
							)}
						</div>
					</GridCol>
				</GridWrapper>
			</div>
			<AceModal
				subgroup={page.system.codename}
				modalStatus={showDownloadOverlay}
				onCancel={handleAceModalCancel}
				onConfirm={() => {}}
				downloadOptions={downloadOptions}
				isPreviewMode={preview}
			/>
		</>
	)
}
