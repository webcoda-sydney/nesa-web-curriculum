import Link from '@/components/Link'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import {
	getLinkedItems,
	getUnbindedLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import {
	SideNav,
	getStickySideNavStyle,
} from '@/components/nsw/side-nav/SideNav'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WpResourcesResponseData } from '@/databuilders/wp_ace_contact'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import {
	AceContact,
	AceGroup,
	AceRule,
	WpAceContact as WpAceContactModel,
} from '@/kontent/content-types'
import SearchBar from '@/legacy-ported/components/base/SearchBar'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import { CommonPageProps } from '@/types'
import { sortAceGroupByTitleAndCode } from '@/utils/ace'
import getUrlFromMapping from '@/utils/getUrlFromMapping'
import { css } from '@emotion/react'
import { Elements, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { useRef, useState } from 'react'
import { buildSideNavPropsFromLeftNavigation } from './web_page'
import { GlobalAlertAce } from './wp_ace_landing'

const PAGE_SIZE = 12 as const

interface AceContactContact {
	codename: string
	content: Elements.RichTextElement
}
interface AceContactRule {
	id: string
	title: string
	contacts: AceContactContact[]
	systemCodename: string
}
interface AceContactSubgroup {
	id: string
	title: string
	rules: AceContactRule[]

	/** indicates that all the rules using the same contact */
	isUsingOneContact?: boolean
}
interface AceContactGroup {
	id: string
	title: string
	subgroups: AceContactSubgroup[]
}

const flattenAceGroups = (
	acegroups: AceGroup[],
	aceRules: AceRule[],
	aceContacts: AceContact[],
	linkedItems: IContentItemsContainer,
) => {
	const json = sortAceGroupByTitleAndCode(acegroups).map((item) => {
		return {
			id: item.system.id,
			title: item.elements.title.value,
			subgroups: getLinkedItems(item.elements.subgroups, linkedItems).map(
				(subgroup) => {
					const rules = getUnbindedLinkedItems<AceRule>(
						subgroup.elements.rules,
						aceRules,
					)

					const rulesContactsCodenames = rules.flatMap(
						(rule) => rule.elements.contact.value,
					)

					const isUsingOneContact = rulesContactsCodenames.every(
						(codename) => rulesContactsCodenames[0] === codename,
					)

					return {
						id: subgroup.system.id,
						title: subgroup.elements.title.value,
						rules: rules.map((rule) => {
							const contacts = getUnbindedLinkedItems(
								rule.elements.contact,
								aceContacts,
							).map((contact) => {
								return {
									codename: contact.system.codename,
									content: contact.elements.content,
								} as AceContactContact
							})

							return {
								id: rule.system.id,
								title: `${rule.elements.code.value} ${rule.elements.title.value}`.trim(),
								contacts,
								systemCodename: rule.system.codename,
							}
						}),
						isUsingOneContact,
					} as AceContactSubgroup
				},
			),
		} as AceContactGroup
	})
	return json
}

function WpAceContact(
	props: CommonPageProps<WpAceContactModel, WpResourcesResponseData>,
) {
	const currentUrl = useCleanPathDefault()
	const { mappings } = useKontentHomeConfig()
	const { pageResponse, aceContact, aceGroups, aceRule, config } = props.data
	const page = pageResponse.item

	const refTmpSearchText = useRef('')
	const [searchText, setSearchText] = useState('')

	const leftNavigation = getLinkedItems(
		page.elements.left_navigation,
		pageResponse.linkedItems,
	)

	const mapLeftNav = buildSideNavPropsFromLeftNavigation(
		leftNavigation,
		pageResponse,
		mappings,
	)

	const handleSearch = (text) => {
		setSearchText(text)
	}

	const filteredItems = flattenAceGroups(
		aceGroups.items,
		aceRule.items,
		aceContact.items,
		aceGroups.linkedItems,
	).filter((item) => {
		return (
			item.title.toLowerCase().includes(searchText.toLowerCase()) ||
			item.subgroups.some(
				(subItem) =>
					subItem.title
						.toLowerCase()
						.includes(searchText.toLowerCase()) ||
					subItem.rules.some(
						(aceRule) =>
							aceRule.title
								.toLowerCase()
								.includes(searchText.toLowerCase()) ||
							aceRule.contacts.some((aceContact) =>
								aceContact.content.value
									.toLowerCase()
									.includes(searchText.toLowerCase()),
							),
					),
			)
		)
	})

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	const hasAceGlobalAlert =
		config.item.elements.global_alert_ace.value.length > 0

	return (
		<>
			{
				// if the page codename starts with ace_, show global alert ace
				hasAceGlobalAlert && (
					<GlobalAlertAce config={config} mappings={mappings} />
				)
			}
			<div className="nsw-container lg:px-4 pt-8">
				{page.elements.title.value && (
					<CommonCopyUrlWrapper url={currentUrl} className="mb-8">
						<h1
							data-kontent-item-id={page.system.id}
							data-kontent-element-codename="title"
						>
							{page.elements.title.value}
						</h1>
					</CommonCopyUrlWrapper>
				)}
				<GridWrapper>
					<GridCol lg={4}>
						<WrapperWithInView>
							{(isSticky) => {
								return mapLeftNav.map((nav, iNav) => (
									<SideNav
										key={iNav}
										header={nav.header}
										className="sticky top-0"
										css={css(
											getStickySideNavStyle(isSticky),
											hasAceGlobalAlert &&
												css({
													'&&': {
														top: 'calc(var(--global-alert-ace-height) + 26px)',
													},
												}),
										)}
										items={nav.items}
									/>
								))
							}}
						</WrapperWithInView>
					</GridCol>
					<GridCol lg={8}>
						<div className="space-y-8">
							<RichText
								className="w-full"
								mappings={props.mappings}
								linkedItems={pageResponse.linkedItems}
								richTextElement={
									page.elements.web_content_rtb__content
								}
							/>
							<SearchBar
								onSearch={handleSearch}
								onSavingTempSearchText={(text) => {
									refTmpSearchText.current = text
								}}
							/>
						</div>
						<div className="mt-8">
							{filteredItems.map((group) => (
								<>
									<CustomAccordion
										key={group.id}
										expanded={searchText?.length > 0}
										title={group.title}
									>
										<div className="divide-y divide-nsw-grey-03">
											{group.subgroups.map((subgroup) => (
												<div
													key={subgroup.id}
													className="py-6"
												>
													<h3 className="pb-6">
														{subgroup.title}
													</h3>
													<div>
														{subgroup.isUsingOneContact &&
														subgroup.rules?.[0]
															?.contacts?.[0] ? (
															<RichText
																linkedItems={
																	aceGroups.linkedItems
																}
																mappings={
																	mappings
																}
																richTextElement={
																	subgroup
																		.rules[0]
																		.contacts[0]
																		.content
																}
															/>
														) : (
															<>
																{subgroup.rules.map(
																	(rule) => {
																		const ruleUrl =
																			getUrlFromMapping(
																				mappings,
																				rule.systemCodename,
																			)
																		return (
																			<div
																				key={
																					rule.id
																				}
																				className="pb-6"
																			>
																				<Link
																					href={
																						ruleUrl
																					}
																				>
																					{
																						rule.title
																					}
																				</Link>
																				{rule.contacts.map(
																					(
																						contact,
																					) => (
																						<RichText
																							key={
																								contact.codename
																							}
																							linkedItems={
																								aceGroups.linkedItems
																							}
																							mappings={
																								mappings
																							}
																							richTextElement={
																								contact.content
																							}
																						/>
																					),
																				)}
																			</div>
																		)
																	},
																)}
															</>
														)}
													</div>
												</div>
											))}
										</div>
									</CustomAccordion>
								</>
							))}
						</div>
					</GridCol>
				</GridWrapper>

				<div className="my-8">
					<Grid container className="!mt-0" spacing={4}>
						<Grid className="!pt-0" item xs={12} lg={3}></Grid>
						<Grid className="!pt-0" item xs={12} lg={9}></Grid>
					</Grid>
				</div>
			</div>
		</>
	)
}

export default WpAceContact
