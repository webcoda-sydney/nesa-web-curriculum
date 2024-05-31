import Icon from '@/components/Icon'
import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { NswLinkList } from '@/components/nsw/NswLinkList'
import { NswFilter } from '@/components/nsw/filters/NswFilter'
import { NswFilterCancel } from '@/components/nsw/filters/NswFilterCancel'
import { NswFilterItem } from '@/components/nsw/filters/NswFilterItem'
import { NswFilterList } from '@/components/nsw/filters/NswFilterList'
import { NswFormFieldset } from '@/components/nsw/filters/NswFormFieldset'
import { NswResultBar } from '@/components/nsw/filters/NswResultBar'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WpResourcesResponseData } from '@/databuilders/wp_ace_landing'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import {
	AceGroup,
	WpAceLanding as WpAceLandingModel,
	WpHomepage,
} from '@/kontent/content-types'
import { TaxoAceCategory } from '@/kontent/taxonomies'
import TreePicker from '@/legacy-ported/components/custom/TreePicker'
import { arrayToggleMultiple } from '@/legacy-ported/utilities/functions'
import { CommonPageProps, IPropWithClassName, Mapping } from '@/types'
import {
	byTaxoCodename,
	getLinkedItems,
	getUrlFromMapping,
	isIntersect,
} from '@/utils'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { Responses } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import animateScrollTo from 'animated-scroll-to'
import clsx from 'clsx'
import Link from 'next/link'
import { Button, Card, GlobalAlert } from 'nsw-ds-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sortAceGroupByTitleAndCode } from '../utils/ace/sortAceGroupByTitleAndCode'
import { useTilesToggle } from './ace_group'

const PAGE_SIZE = 15 as const

interface ContactUsLinkProps {
	mappings: Mapping[]
	contactUsPageCodename?: string
}

const ContactUsLink = ({
	mappings,
	contactUsPageCodename = 'ace_contactus',
}: ContactUsLinkProps) => {
	const url = getUrlFromMapping(mappings, contactUsPageCodename)

	return (
		<p>
			Can&apos;t find what you need?{' '}
			<Link href={url}>
				<a>Find who to contact about ACE Rules</a>
			</Link>
		</p>
	)
}

interface GlobalAlertAceProps extends IPropWithClassName {
	config: Responses.IViewContentItemResponse<WpHomepage>
	mappings: Mapping[]
	preview?: boolean
}

export const GlobalAlertAce = ({
	className,
	config,
	mappings,
	preview = false,
}: GlobalAlertAceProps) => {
	const refRoot = useRef<HTMLDivElement>(null)
	const alerts = useMemo(
		() =>
			getLinkedItems(
				config.item.elements.global_alert_ace,
				config.linkedItems,
			),
		[config],
	)

	const alert = alerts[0]

	useEffect(() => {
		//detect if the refRoot.current change in size. if changes, update html tag with the height of the refRoot.current
		const observer = new ResizeObserver((entries) => {
			const { height } = entries[0].contentRect
			document.documentElement.style.setProperty(
				'--global-alert-ace-height',
				`${height + (preview ? 26 : 0)}px`,
			)
		})
		observer.observe(refRoot.current)
	}, [alert, preview])

	return (
		<div
			ref={refRoot}
			className={clsx(
				className,
				'lg:sticky z-20 GlobalAlertAce',
				preview ? 'top-[26px]' : 'top-0',
			)}
		>
			{alerts?.map((alertAce) => {
				return (
					<GlobalAlert
						key={alertAce.system.id}
						className="[&_.js-close-alert]:hidden"
						title={alertAce.elements.intro.value}
						as="light"
						content={
							<RichText
								className="mt-4"
								mappings={mappings}
								richTextElement={alertAce.elements.content}
								linkedItems={config.linkedItems}
							/>
						}
					/>
				)
			})}
		</div>
	)
}

function WpAceLanding(
	props: CommonPageProps<WpAceLandingModel, WpResourcesResponseData>,
) {
	const currentUrl = useCleanPathDefault()
	const refIsMounted = useRef(false)
	const { mappings, preview } = props
	const {
		pageResponse,
		aceGroups: aceGroupsResponse,
		aceTaxos,
		config,
	} = props.data
	const page = pageResponse.item

	const refTmpSearchText = useRef('')
	const refContent = useRef<HTMLDivElement>(null)
	const [_searchText, setSearchText] = useState('')
	const [selectedAceCategories, setSelectedAceCategories] = useState<
		TaxoAceCategory[]
	>([])
	const { isTileView, handleListViewClick, handleTileViewClick } =
		useTilesToggle(true)

	const handleSearch = () => {}
	const handleReset = () => {
		setSearchText('')
		setSelectedAceCategories([])
	}

	const filteredItems = sortAceGroupByTitleAndCode(
		aceGroupsResponse.items
			// filter by selected ACE Categories
			.filter((group) => {
				const subgroups = getLinkedItems(
					group.elements.subgroups,
					aceGroupsResponse.linkedItems,
				)

				return selectedAceCategories.length
					? subgroups.some((subgroup) => {
							const rules = getLinkedItems(
								subgroup.elements.rules,
								aceGroupsResponse.linkedItems,
							)
							return rules.some((rule) => {
								return isIntersect(
									rule.elements.ace_category.value.map(
										byTaxoCodename,
									),
									selectedAceCategories,
								)
							})
					  })
					: true
			}) || [],
	)

	useEffect(() => {
		if (refIsMounted.current) {
			const globaAlertAceHeight = parseInt(
				(
					window
						.getComputedStyle(document.body)
						.getPropertyValue('--global-alert-ace-height') || '0'
				).replace('px', ''),
			)
			animateScrollTo(refContent.current, {
				verticalOffset: -(globaAlertAceHeight + (preview ? 26 : 0)),
			})
		} else {
			refIsMounted.current = true
		}
	}, [selectedAceCategories, _searchText, preview])

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	return (
		<>
			<GlobalAlertAce
				config={config}
				mappings={mappings}
				preview={preview}
			/>
			<div ref={refContent} className="nsw-container lg:px-4 lg:pt-8">
				<NonFullWidthWrapper>
					<div className="space-y-8">
						{page.elements.title.value && (
							<CommonCopyUrlWrapper url={currentUrl}>
								<h1
									data-kontent-item-id={page.system.id}
									data-kontent-element-codename="title"
								>
									{page.elements.title.value}
								</h1>
							</CommonCopyUrlWrapper>
						)}
						<RichText
							className="w-full"
							mappings={props.mappings}
							linkedItems={pageResponse.linkedItems}
							richTextElement={
								page.elements.web_content_rtb__content
							}
						/>
						{/* TODO uncomment when Search is enabled */}
						{/* <SearchBar
							variant="with-inline-button"
							searchBarPlaceholder="Search within ACE"
							onSearch={handleSearch}
							onSavingTempSearchText={(text) => {
								refTmpSearchText.current = text
							}}
						/> */}

						{/* TODO uncomment when Search is enabled */}
						{/* <ContactUsLink mappings={mappings} /> */}
					</div>
				</NonFullWidthWrapper>

				<div className="my-8">
					<Grid container className="!mt-0" spacing={8}>
						<Grid className="!pt-0" item xs={12} lg={3}>
							<NswFilter
								title="Filter ACE Rules"
								css={{
									'& > .nsw-filters__controls': {
										borderBottom: 0,
										paddingTop: 0,
										paddingBottom: '2rem',
									},
									'& > .nsw-nsw-form__fieldset': {
										padding: 0,
									},
									'& .nsw-form__legend': {
										paddingBottom: 12,
									},
								}}
								totalItems={filteredItems.length}
							>
								<NswFilterList>
									<NswFilterItem>
										<NswFormFieldset
											title="Filter ACE Rules"
											css={{
												'@media (min-width: 992px)': {
													'& .nsw-form__legend': {
														display: 'none',
													},
												},
											}}
										>
											<TreePicker
												className=""
												rootElements={aceTaxos.map(
													(taxo) => ({
														id: taxo.codename,
														label: taxo.name,
													}),
												)}
												onChange={(ids) => {
													const updated =
														arrayToggleMultiple(
															selectedAceCategories,
															ids,
														)
													setSelectedAceCategories(
														updated as TaxoAceCategory[],
													)
												}}
												selected={selectedAceCategories}
											/>
										</NswFormFieldset>
									</NswFilterItem>
								</NswFilterList>
								<NswFilterCancel onReset={handleReset} />
							</NswFilter>
						</Grid>
						<Grid className="!pt-0" item xs={12} lg={9}>
							<NswResultBar
								css={{
									'&&': {
										paddingTop: '1.5rem',
										paddingBottom: '1.5rem',
										marginTop: 0,
										marginBottom: '2rem',
										alignItems: 'center',
										borderBottom:
											'.0625rem solid var(--nsw-grey-04)',
										lineHeight: '1.75rem',
										display: 'flex',
									},
								}}
								page={1}
								pageSize={filteredItems.length}
								total={filteredItems.length}
							></NswResultBar>

							<div className="flex gap-2 justify-end mb-8 top-[]">
								<Button
									className="inline-flex gap-2"
									style={isTileView ? 'dark' : 'dark-outline'}
									onClick={handleTileViewClick}
								>
									<Icon icon="ic:baseline-grid-view" />
									<span>Tiles View</span>
								</Button>
								<Button
									className="inline-flex gap-2"
									style={
										!isTileView ? 'dark' : 'dark-outline'
									}
									onClick={handleListViewClick}
								>
									<Icon icon="ic:sharp-list" />
									List View
								</Button>
							</div>

							{isTileView ? (
								<GridWrapper spacing={8}>
									{filteredItems.map((item: AceGroup) => {
										const { url, target, linkComponent } =
											getLinkFromLinkUI(
												item,
												mappings,
												pageResponse.linkedItems,
											)

										return (
											<GridCol
												key={item.system.id}
												sm={6}
												lg={4}
												className="flex flex-col"
											>
												<Card
													className="[&_.nsw-card\_\_tag]:mb-1
														[&_.nsw-card\_\_tag]:font-normal
														[&_.nsw-card\_\_title]:text-[1.125rem]
														[&_.nsw-card\_\_title]:leading-[1.33]
														lg:[&_.nsw-card\_\_title]:text-[1.25rem]
														lg:[&_.nsw-card\_\_title]:leading-[1.4]
													"
													tag={
														item.elements.code.value
													}
													headline={
														item.elements.title
															.value
													}
													link={url}
													linkComponent={
														linkComponent
													}
													linkTarget={target}
													data-kontent-item-id={
														item.system.id
													}
												></Card>
											</GridCol>
										)
									})}
									{!filteredItems.length && (
										<GridCol>
											<h4 className="text-center mt-20">
												{/* eslint-disable-next-line quotes */}
												{"We didn't find any results. "}
												<button
													type="reset"
													className="underline bold nsw-text--brand-dark"
													onClick={handleReset}
												>
													Clear all filters
												</button>
											</h4>
										</GridCol>
									)}
								</GridWrapper>
							) : (
								<NswLinkList
									className={String.raw`[&_a_span]:no-underline [&_.nsw-link-list\_\_item]:border-l [&_.nsw-link-list\_\_item]:border-r bg-white`}
									items={filteredItems.map((subgroup) => {
										const {
											url: link,
											target,
											linkComponent,
										} = getLinkFromLinkUI(
											subgroup,
											mappings,
											pageResponse.linkedItems,
										)
										return {
											text: (
												<span className="inline-flex items-center gap-1 text-nsw-grey-01">
													<span className="w-[50px] font-normal flex-shrink-0">
														{
															subgroup.elements
																.code.value
														}
													</span>
													<span className="nsw-h4">
														{
															subgroup.elements
																.title.value
														}
													</span>
												</span>
											),
											href: link || '',
											link,
											target,
											linkComponent,
										}
									})}
								/>
							)}
						</Grid>
						<GridCol>
							<ContactUsLink mappings={mappings} />
						</GridCol>
					</Grid>
				</div>
			</div>
		</>
	)
}

export default WpAceLanding
