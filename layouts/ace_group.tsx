import Icon from '@/components/Icon'
import Link from '@/components/Link'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { NswLinkList } from '@/components/nsw/NswLinkList'
import {
	getStickySideNavStyle,
	SideNav,
	SideNavItem,
	SideNavWithCollapse,
} from '@/components/nsw/side-nav/SideNav'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import { AceGroupResponseData } from '@/databuilders/ace_group'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { AceGroup, AceSubgroup } from '@/kontent/content-types'
import { CommonPageProps, Mapping, MappingParams } from '@/types'
import { getLinkedItems, getUrlFromMapping, isIntersect } from '@/utils'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { isAceGroup, isAceSubGroup } from '@/utils/type_predicates'
import { css } from '@emotion/css'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { Button, Card } from 'nsw-ds-react'
import { useMemo, useState } from 'react'
import { sortAceGroupByTitleAndCode } from '../utils/ace/sortAceGroupByTitleAndCode'
import { GlobalAlertAce } from './wp_ace_landing'

export const makeAceGroupsSideNavItems = (
	groups: AceGroup[] | AceSubgroup[],
	linkedItems: IContentItemsContainer,
	mappings: Mapping[],
	currentItem: AceGroup | AceSubgroup,
): SideNavItem[] => {
	const sortedGroups = isAceSubGroup(groups[0])
		? groups
		: sortAceGroupByTitleAndCode(groups as AceGroup[])
	return sortedGroups.map((group) => {
		const subgroups = isAceGroup(group)
			? getLinkedItems<AceSubgroup>(group.elements.subgroups, linkedItems)
			: null
		const { url } = getLinkFromLinkUI(group, mappings, linkedItems)
		return {
			text: `${group.elements.code.value}${
				group.elements.code.value && subgroups ? '.' : ''
			} ${group.elements.title.value}`,
			codename: group.system.codename,
			id: group.system.id,
			href: url,
			isActive: group.system.id === currentItem.system.id,
			subNav: subgroups?.length
				? makeAceGroupsSideNavItems(
						subgroups,
						linkedItems,
						mappings,
						currentItem,
				  )
				: [],
		} as SideNavItem
	})
}

export function useAceHeaderSideNavItem({
	params,
	mappings,
}: {
	params: MappingParams
	mappings: Mapping[]
}) {
	return useMemo<SideNavItem>(() => {
		const aceRuleSlug = params.slug.filter((_, index) => index === 0)
		const aceRuleMapping = mappings.find(
			(mapping) =>
				isIntersect(mapping.params.slug, aceRuleSlug) &&
				mapping.params.slug.length === aceRuleSlug.length,
		)

		return {
			text: aceRuleMapping.params.pageTitle,
			href: getUrlFromMapping(
				mappings,
				aceRuleMapping.params.navigationItem.codename,
			),
			tag: Link,
			onClick: undefined,
		}
	}, [params.slug, mappings])
}

export const useTilesToggle = (initialIsTileView = false) => {
	const [isTileView, setIsTileView] = useState(initialIsTileView)

	const handleTileViewClick = () => {
		setIsTileView(true)
	}
	const handleListViewClick = () => {
		setIsTileView(false)
	}

	return {
		isTileView,
		handleListViewClick,
		handleTileViewClick,
	}
}

export default function AceGroupPage(
	props: CommonPageProps<AceGroup, AceGroupResponseData>,
) {
	const currentUrl = useCleanPathDefault()
	const { mappings, data, params } = props
	const { pageResponse, aceGroups: allAceGroupsResponse, config } = data
	const subNavItems = makeAceGroupsSideNavItems(
		allAceGroupsResponse.items,
		allAceGroupsResponse.linkedItems,
		mappings,
		pageResponse.item,
	)
	const sideNavHeader = useAceHeaderSideNavItem({ params, mappings })
	const { isTileView, handleListViewClick, handleTileViewClick } =
		useTilesToggle(true)

	const subgroups =
		getLinkedItems(
			pageResponse.item.elements.subgroups,
			pageResponse.linkedItems,
		) || []

	return (
		<>
			<GlobalAlertAce config={config} mappings={mappings} />
			<div className="nsw-container lg:px-4 lg:pt-8">
				<SideNavWithCollapse
					header={sideNavHeader}
					parentClassName={clsx(
						'-mx-4 mb-8 lg:hidden',
						css({
							'.SideNavWithCollapse__toggle': {
								paddingLeft: '1rem',
								paddingRight: '1rem',
							},
						}),
					)}
					items={subNavItems}
					withToggle
				/>

				<CommonCopyUrlWrapper url={currentUrl} className="mb-12">
					<h1
						data-kontent-item-id={pageResponse.item.system.id}
						data-kontent-element-codename="title"
					>
						{pageResponse.item.elements.title.value}
					</h1>
				</CommonCopyUrlWrapper>

				<GridWrapper>
					<GridCol lg={4} className="hidden lg:block lg:pr-8">
						<WrapperWithInView>
							{(isSticky) => {
								return (
									<SideNav
										header={sideNavHeader}
										className="sticky top-0 [&>ul]:bg-white"
										css={getStickySideNavStyle(isSticky)}
										items={subNavItems}
										withToggle
									/>
								)
							}}
						</WrapperWithInView>
					</GridCol>
					<GridCol lg={8}>
						<div className="flex gap-2 justify-end mb-8">
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
								style={!isTileView ? 'dark' : 'dark-outline'}
								onClick={handleListViewClick}
							>
								<Icon icon="ic:sharp-list" />
								List View
							</Button>
						</div>
						{isTileView ? (
							<GridWrapper>
								{subgroups.map((subgroup) => {
									const { url, target, linkComponent } =
										getLinkFromLinkUI(
											subgroup,
											mappings,
											pageResponse.linkedItems,
										)
									const subgroupCode =
										subgroup.elements.code.value
									return (
										<GridCol
											key={subgroup.system.id}
											md={6}
										>
											<Card
												className="[&_.nsw-card\_\_tag]:mb-1
													[&_.nsw-card\_\_tag]:font-normal
													[&_.nsw-card\_\_title]:text-[1.125rem]
													[&_.nsw-card\_\_title]:leading-[1.33]
													lg:[&_.nsw-card\_\_title]:text-[1.25rem]
													lg:[&_.nsw-card\_\_title]:leading-[1.4]
												"
												tag={subgroupCode}
												headline={
													subgroup.elements.title
														.value
												}
												link={url}
												linkComponent={linkComponent}
												linkTarget={target}
												data-kontent-item-id={
													subgroup.system.id
												}
											></Card>
										</GridCol>
									)
								})}
							</GridWrapper>
						) : (
							<NswLinkList
								className={String.raw`[&_a_span]:no-underline [&_.nsw-link-list\_\_item]:border-l [&_.nsw-link-list\_\_item]:border-r bg-white`}
								items={subgroups.map((subgroup) => {
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
														subgroup.elements.code
															.value
													}
												</span>
												<span className="nsw-h4">
													{
														subgroup.elements.title
															.value
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
					</GridCol>
				</GridWrapper>
			</div>
		</>
	)
}
