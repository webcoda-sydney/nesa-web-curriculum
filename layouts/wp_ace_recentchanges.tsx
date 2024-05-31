import Layout from '@/components/Layout'
import UnknownComponent from '@/components/UnknownComponent'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import { NswResultBar } from '@/components/nsw/filters/NswResultBar'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import {
	SideNav,
	SideNavItem,
	SideNavProps,
	getStickySideNavStyle,
} from '@/components/nsw/side-nav/SideNav'
import {
	ITreeMultiSelectProps,
	TreeMultiSelect,
} from '@/components/tree-multi-select/TreeMultiSelect'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WpResourcesResponseData } from '@/databuilders/wp_ace_recentchanges'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import {
	AceGroup,
	WpAceRecentchanges as WpAceRecentchangesModel,
} from '@/kontent/content-types'
import SearchBar from '@/legacy-ported/components/base/SearchBar'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import { CommonPageProps } from '@/types'
import { getUrlFromMapping } from '@/utils'
import Pagination from '@mui/material/Pagination'
import { format } from 'date-fns'
import paginateArray from 'paginate-array'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'
import { GlobalAlertAce } from './wp_ace_landing'

const PAGE_SIZE = 10 as const

function WpAceRecentchanges(
	props: CommonPageProps<WpAceRecentchangesModel, WpResourcesResponseData>,
) {
	const { mappings } = useKontentHomeConfig()
	const { pageResponse, releaseNotes, aceGroups, config } = props.data
	const page = pageResponse.item

	const refTmpSearchText = useRef('')
	const [searchText, setSearchText] = useState('')
	const [currentPageNumber, setCurrentPageNumber] = useState(1)
	const [dateAscending, setDateAscending] = useState('descending')
	const [expandedAll, setExpandedAll] = useState(false)
	const [selectedAceCategories, setSelectedAceCategories] = useState<
		AceGroup[]
	>([])
	const [selectedAceSubgroup, setSelectedAceSubgroup] = useState('')
	const currentUrl = useCleanPathDefault()

	useEffect(() => {
		const params: any = new Proxy(
			new URLSearchParams(window.location.search),
			{
				get: (searchParams, prop: any) => searchParams.get(prop),
			},
		)
		params.search == null
			? setSelectedAceSubgroup('')
			: setSelectedAceSubgroup(decodeURI(params.search))
	}, [])

	const handleSearch = (text) => {
		setSearchText(text)
	}

	const handleReset = () => {
		setSearchText('')
		setSelectedAceSubgroup('')
		setCurrentPageNumber(1)
	}

	const filteredReleasenotes = () => {
		const filteredItems = releaseNotes.items.filter((releaseDetail) => {
			if (
				releaseDetail.system.name
					.toLowerCase()
					.includes(searchText.toLowerCase()) &&
				(!selectedAceSubgroup ||
					releaseDetail.elements.subgroup.value.some(
						(val) => val == selectedAceSubgroup,
					))
			) {
				return true
			}
		})
		if (dateAscending == 'ascending') {
			filteredItems.sort(
				(a, b) =>
					new Date(a.elements.releasedate.value).getTime() -
					new Date(b.elements.releasedate.value).getTime(),
			)
		} else {
			filteredItems.sort(
				(a, b) =>
					new Date(b.elements.releasedate.value).getTime() -
					new Date(a.elements.releasedate.value).getTime(),
			)
		}
		return filteredItems
	}

	const leftNavigation = getLinkedItems(
		page.elements.left_navigation,
		pageResponse.linkedItems,
	)

	const mapLeftNav = leftNavigation.map((navigation) => {
		const linkedNavItems = getLinkedItems(
			navigation.elements.subitems,
			pageResponse.linkedItems,
		)

		return {
			header: {
				text: navigation.elements.title.value,
			} as SideNavItem,
			items: linkedNavItems.map((linkedNavItem) => {
				const url = getUrlFromMapping(
					mappings,
					linkedNavItem.system.codename,
				)
				const nav = getLinkedItems(
					linkedNavItem.elements.item,
					pageResponse.linkedItems,
				)

				return {
					isActive: nav?.[0]?.system?.id == page.system.id,
					text: linkedNavItem.elements.title.value,
					href: url,
				}
			}) as SideNavItem[],
		}
	}) as SideNavProps[]

	const onChange: ITreeMultiSelectProps['onChange'] = (
		_currentNode,
		_selectedNodes,
		selectedChildNodes,
	) => {
		setSelectedAceSubgroup(selectedChildNodes?.[0]?.value)
	}

	const exampleTreeNodes = useMemo(() => {
		return aceGroups.items.map((item) => {
			return {
				label: item.elements.title.value,
				value: item.system.codename,
				expanded: true,
				className: 'pointer-events-none disabled',
				children: getLinkedItems(
					item.elements.subgroups,
					aceGroups.linkedItems,
				).map((subgroup) => {
					return {
						label: subgroup.elements.title.value,
						value: subgroup.system.codename,
						checked:
							selectedAceSubgroup == subgroup.system.codename,
						className: selectedAceSubgroup
							? 'pointer-events-none disabled'
							: '',
					}
				}),
			}
		}) as TreeNodeProps[]
	}, [selectedAceSubgroup])

	const { totalPages, data: filteredPaginatedItems } = paginateArray(
		filteredReleasenotes(),
		currentPageNumber,
		PAGE_SIZE,
	)

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	return (
		<Layout {...props} className="max-w-none mx-0 px-0 !pt-0 !lg:pt-8">
			<GlobalAlertAce config={config} mappings={mappings} />
			<div className="nsw-container lg:px-4 lg:pt-8">
				<GridWrapper>
					<GridCol lg={4}>
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
						<WrapperWithInView className="">
							{(isSticky) => {
								return mapLeftNav.map((nav, iNav) => (
									<SideNav
										key={iNav}
										header={nav.header}
										className="sticky top-0 mt-10 hover:[&_div>a]:!bg-transparent"
										css={getStickySideNavStyle(isSticky)}
										items={nav.items}
									/>
								))
							}}
						</WrapperWithInView>
					</GridCol>
					<GridCol className="mt-[135px] !pt-0" lg={8}>
						<SearchBar
							variant="with-icon"
							searchBarPlaceholder="Search"
							onSearch={handleSearch}
							value={searchText}
							onSavingTempSearchText={(text) => {
								refTmpSearchText.current = text
							}}
						/>
						<NswResultBar
							css={{
								'&&': {
									paddingTop: '1.5rem',
									marginTop: 0,
									alignItems: 'center',
									lineHeight: '1.75rem',
									display: 'flex',
								},
							}}
							page={currentPageNumber}
							pageSize={PAGE_SIZE}
							total={filteredReleasenotes().length}
						></NswResultBar>
						<div className="flex items-center justify-end font-normal border-b-[1px] border-nsw-grey-04 pb-3">
							<p className="bold mr-3">Filter by:</p>
							<TreeMultiSelect
								key={selectedAceSubgroup}
								data={exampleTreeNodes}
								onChange={onChange}
								className="min-w-[300px] max-w-[300px] [&_input]:!font-normal [&_span]:!whitespace-normal [&_span]:!inline-block [&_.node-label]:!text-[#22272B] [&_.root]:!max-h-[480px] [&_.root]:!overflow-auto [&_.node]:!mr-[10px]"
								placeholder="Please select"
							/>

							<label className="nsw-form__label ml-6 mr-3">
								Sort by:
							</label>
							<select
								className="nsw-form__select max-w-[200px]"
								onChange={(e) => {
									setDateAscending(e.target.value)
								}}
								value={dateAscending}
								autoComplete="off"
							>
								<option value="ascending">
									Date ascending
								</option>
								<option value="descending">
									Date descending
								</option>
							</select>
						</div>
						<div className="flex justify-end mb-4 mt-8">
							<button
								onClick={() => setExpandedAll(true)}
								className="underline bold nsw-text--brand-dark mr-3"
							>
								Expand all
							</button>
							<button
								onClick={() => setExpandedAll(false)}
								className="underline bold nsw-text--brand-dark ml-3"
							>
								Collapse all
							</button>
						</div>
						{filteredPaginatedItems.map((releaseDetails) => (
							<CustomAccordion
								key={releaseDetails.system.id}
								title={releaseDetails.system.name}
								subTitle={format(
									new Date(
										releaseDetails.elements.releasedate.value,
									),
									'dd MMM yyyy',
								)}
								expanded={expandedAll}
							>
								<div
									dangerouslySetInnerHTML={{
										__html: releaseDetails.elements.content
											.value,
									}}
								></div>
							</CustomAccordion>
						))}
						{!filteredPaginatedItems.length && (
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
						{totalPages > 1 && (
							<div className="mt-16">
								<Pagination
									page={currentPageNumber}
									count={totalPages}
									onChange={(_, pageNumber) =>
										setCurrentPageNumber(pageNumber)
									}
								></Pagination>
							</div>
						)}
					</GridCol>
				</GridWrapper>
			</div>
		</Layout>
	)
}

export default WpAceRecentchanges
