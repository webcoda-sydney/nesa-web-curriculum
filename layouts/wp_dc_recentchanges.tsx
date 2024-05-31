import Icon from '@/components/Icon'
import UnknownComponent from '@/components/UnknownComponent'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import Pagination from '@/components/nsw/Pagination'
import { NswFilter } from '@/components/nsw/filters/NswFilter'
import { NswFilterCancel } from '@/components/nsw/filters/NswFilterCancel'
import { NswFilterItem } from '@/components/nsw/filters/NswFilterItem'
import { NswFilterList } from '@/components/nsw/filters/NswFilterList'
import { NswFormFieldset } from '@/components/nsw/filters/NswFormFieldset'
import { NswResultBar } from '@/components/nsw/filters/NswResultBar'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { ReleaseNoteAccordion } from '@/components/release-notes/ReleaseNoteAccordion'
import {
	TREE_MULTISELECT_OPTION_ALL_VALUE,
	TreeMultiSelect,
} from '@/components/tree-multi-select/TreeMultiSelect'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { DatepickerRange } from '@/components/ui/datepicker/DatepickerRange'
import {
	CombinedReleaseNote,
	WpDcRecentChangesResponseData,
} from '@/databuilders/wp_dc_recentchanges'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { useQueryStringByRouterOrWindow } from '@/hooks/useQueryStringByRouterOrWindow'
import { Syllabus, WpDcRecentchanges } from '@/kontent/content-types'
import {
	TaxoKeyLearningArea,
	TaxoStage,
	TaxoSyllabus,
} from '@/kontent/taxonomies'
import CustomModal from '@/legacy-ported/components/base/CustomModal'
import SearchBar from '@/legacy-ported/components/base/SearchBar'
import { makeLearningAreaTree } from '@/legacy-ported/components/custom/CustomSyllabusPicker'
import { TreeElement } from '@/legacy-ported/components/custom/treeUtils'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import { CommonPageProps, Mapping } from '@/types'
import {
	byTaxoCodename,
	byValue,
	fnExist,
	getTaxoCodenames,
	getUrlFromMapping,
	isIntersect,
	isYes,
} from '@/utils'
import { makeAceGroupOptions } from '@/utils/ace'
import { getReleaseNoteTitle } from '@/utils/ace/getReleaseNoteTitle'
import { downloadReleaseNotes } from '@/utils/downloadReleaseNotes'
import { getSyllabusUrlFromMappingByTaxo } from '@/utils/getSyllabusUrlFromMapping'
import {
	isReleasenoteAce,
	isReleasenoteAceKla,
	isReleasenoteAceSyllabus,
	isReleasenoteSyllabus,
	isReleasenoteSyllabusKla,
	isReleasenoteSyllabusMultiple,
} from '@/utils/type_predicates'
import { Responses } from '@kontent-ai/delivery-sdk'
import animateScrollTo from 'animated-scroll-to'
import { endOfDay, isAfter, isWithinInterval, startOfDay, sub } from 'date-fns'
import orderBy from 'lodash.orderby'
import { useRouter } from 'next/router'
import { Button } from 'nsw-ds-react'
import { NavItem } from 'nsw-ds-react/dist/component/main-nav/mainNav'
import paginateArray from 'paginate-array'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TreeNode, TreeNodeProps } from 'react-dropdown-tree-select'
import { makeStageGroupOptions } from './wp_teachingadvice'
const PAGE_SIZE = 10 as const

export const mapTreeElementToTreeNode = (
	treeElement: TreeElement,
	selectedValues: string[],
): TreeNode => {
	const hasChildren = treeElement.children?.length > 0
	const children = treeElement.children?.map((_treeElement) =>
		mapTreeElementToTreeNode(_treeElement, selectedValues),
	)
	return {
		label: treeElement.label,
		value: treeElement.id,
		children,
		expanded: hasChildren,
		className: hasChildren ? 'bold' : '',
		checked:
			selectedValues.includes(treeElement.id) ||
			(hasChildren && children?.every((c) => c.checked)),
	}
}

export const getDropdownTreeFilterHandlerListenerFn =
	(setStateFn) =>
	(
		_currentNode: TreeNodeProps,
		_selectedNodes: TreeNodeProps[],
		selectedChildNodes: TreeNodeProps[],
	) => {
		const isCurrentNodeSelectAll =
			_currentNode.value === TREE_MULTISELECT_OPTION_ALL_VALUE
		const selectedNodeValues = _selectedNodes.map(byValue)
		const childNodeValues = selectedChildNodes.map(byValue)

		// if select all is selected and the selectedNodes has select all, then set select all only
		if (
			isCurrentNodeSelectAll &&
			selectedNodeValues.includes(TREE_MULTISELECT_OPTION_ALL_VALUE)
		) {
			return setStateFn(
				selectedNodeValues.filter(
					(v) => v === TREE_MULTISELECT_OPTION_ALL_VALUE,
				),
			)
		}

		return setStateFn(childNodeValues)
	}

export const useSyllabusTaxoUrls = (
	mappings: Mapping[],
	syllabuses: Responses.IListContentItemsResponse<Syllabus>,
) => {
	return useMemo<Record<TaxoSyllabus, NavItem>>(() => {
		const syllabusesWithSyllabusTaxo = syllabuses.items.filter(
			(syllabus) => !!syllabus.elements.syllabus.value?.[0]?.codename,
		)
		const iterateeStage = (a: Syllabus) =>
			a.elements.stages__stages.value?.[0]?.codename

		const iterateeTitle = (a: Syllabus) =>
			a.elements.title.value.toLowerCase()

		return orderBy(syllabusesWithSyllabusTaxo, [
			iterateeStage,
			iterateeTitle,
		]).reduce((acc, syllabus) => {
			const taxoSyllabus: TaxoSyllabus =
				syllabus.elements.syllabus.value[0].codename
			const isExternal =
				isYes(syllabus.elements.doredirect) &&
				!!syllabus.elements.redirecturl.value
			const url = isExternal
				? syllabus.elements.redirecturl.value
				: getSyllabusUrlFromMappingByTaxo(mappings, taxoSyllabus, true)

			const navItem: NavItem = {
				url,
				text: syllabus.elements.title.value,
				target: isExternal ? '_blank' : undefined,
			}

			return {
				...acc,
				[taxoSyllabus]: navItem,
			}
		}, {} as Record<TaxoSyllabus, NavItem>)
	}, [mappings, syllabuses.items])
}

const sortReleaseNoteByDateDescFn = (
	a: CombinedReleaseNote,
	b: CombinedReleaseNote,
) =>
	new Date(b.elements.releasedate.value).getTime() -
	new Date(a.elements.releasedate.value).getTime()

function WpDcRecentchangesLayout(
	props: CommonPageProps<WpDcRecentchanges, WpDcRecentChangesResponseData>,
) {
	const router = useRouter()
	const { state: qSyllabus } = useQueryStringByRouterOrWindow(
		'syllabus',
		'',
		true,
	)
	const currentUrl = useCleanPathDefault()
	const refAbortController = useRef<AbortController>(null)
	const { mappings } = useKontentHomeConfig()
	const {
		pageResponse,
		releaseNotes,
		aceGroups,
		stages,
		stageGroups,
		keyLearningAreas,
		syllabuses,
		config,
	} = props.data
	const page = pageResponse.item

	// States
	const refTmpSearchText = useRef('')
	const refRightCol = useRef<HTMLDivElement>(null)
	const [searchText, setSearchText] = useState('')
	const [currentPageNumber, setCurrentPageNumber] = useState(1)
	const [selectedSort, setSort] = useState('date-desc')
	const [selectedAceSubgroups, setSelectedAceSubgroups] = useState<string[]>(
		[],
	)
	const [selectedStages, setSelectedStages] = useState<TaxoStage[]>([])
	const [selectedSyllabuses, setSelectedSyllabuses] = useState<
		TaxoSyllabus[]
	>((qSyllabus?.split(',') as TaxoSyllabus[])?.filter(Boolean) || [])
	const [isDownloading, setIsDownloading] = useState(false)
	const [errorPopupMessage, setErrorPopupMessage] = useState('')

	const releaseNotesSortedByTimeDesc = releaseNotes.items.sort(
		sortReleaseNoteByDateDescFn,
	)

	const today = new Date()
	const sixMonthsBackFromToday = sub(today, { months: 6 })
	const [selectedStartDate, setSelectedStartDate] = useState(
		sixMonthsBackFromToday,
	)

	const [selectedEndDate, setSelectedEndDate] = useState(today)
	const isAfterStartAfterEndDate = isAfter(selectedStartDate, selectedEndDate)

	const selectedKLAs = useMemo(() => {
		return selectedSyllabuses.reduce((acc, sylTaxo) => {
			const syllabus = syllabuses.items.find((s) =>
				s.elements.syllabus.value.map(byTaxoCodename).includes(sylTaxo),
			)
			const taxoKLA =
				syllabus?.elements.key_learning_area__items.value?.[0].codename
			return [
				...acc.filter((_taxoKLA) => _taxoKLA !== taxoKLA),
				taxoKLA,
			].filter(Boolean)
		}, [] as TaxoKeyLearningArea[])
	}, [selectedSyllabuses, syllabuses.items])

	const filteredReleasenotes = releaseNotesSortedByTimeDesc
		.filter((releaseNote) => {
			// if there's qSyllabus, exclude DC KLA and ACE
			if (qSyllabus) {
				if (
					isReleasenoteAce(releaseNote) ||
					isReleasenoteAceKla(releaseNote) ||
					isReleasenoteAceSyllabus(releaseNote) ||
					isReleasenoteSyllabusKla(releaseNote)
				) {
					return false
				}
			}
			return true
		})
		.filter((releaseNote) => {
			// Filter by Syllabus taxos and (selectedKLAs)
			if (selectedSyllabuses.length || selectedKLAs.length) {
				if (isReleasenoteSyllabusMultiple(releaseNote)) {
					return isIntersect(
						releaseNote.elements.syllabuses.value.map(
							byTaxoCodename,
						),
						selectedSyllabuses,
					)
				}
				if (
					isReleasenoteSyllabusKla(releaseNote) ||
					isReleasenoteAceKla(releaseNote) ||
					isReleasenoteAceSyllabus(releaseNote)
				) {
					return isIntersect(
						releaseNote.elements.key_learning_area__items?.value.map(
							byTaxoCodename,
						),
						selectedKLAs,
					)
				}
				if (isReleasenoteSyllabus(releaseNote)) {
					return isIntersect(
						releaseNote.elements.syllabus.value.map(byTaxoCodename),
						selectedSyllabuses,
					)
				}
				return false
			}
			return true
		})
		.filter((releaseNote) => {
			// Filter by Stages
			if (selectedStages.length) {
				return isIntersect(
					releaseNote.elements.stages__stages.value.map(
						byTaxoCodename,
					),
					selectedStages,
				)
			}
			return true
		})
		.filter((releaseNote) => {
			// Filter by Selected ACE Rules (subgroups)
			if (selectedAceSubgroups.length) {
				if (
					isReleasenoteAceSyllabus(releaseNote) ||
					isReleasenoteAceKla(releaseNote)
				) {
					if (
						selectedAceSubgroups.includes(
							TREE_MULTISELECT_OPTION_ALL_VALUE,
						)
					) {
						return true
					}

					return isIntersect(
						releaseNote.elements.subgroup.value,
						selectedAceSubgroups,
					)
				}
				return false
			}
			return true
		})
		.filter((releaseNote) => {
			// Filter by Selected Date
			if (selectedStartDate && selectedEndDate) {
				return isWithinInterval(
					new Date(releaseNote.elements.releasedate.value),
					{
						start: startOfDay(selectedStartDate),
						end: endOfDay(
							isAfterStartAfterEndDate
								? selectedStartDate
								: selectedEndDate,
						),
					},
				)
			}
			return true
		})
		.filter((releaseNote) => {
			// Search
			if (!searchText) {
				return true
			}

			let arrTexts = [
				// content
				releaseNote.elements.content.value,

				// title
				getReleaseNoteTitle(releaseNote, releaseNotes.linkedItems),
			]

			if (isReleasenoteAce(releaseNote)) {
				arrTexts.push(
					getLinkedItems(
						releaseNote.elements.subgroup,
						releaseNotes.linkedItems,
					)?.[0]?.elements.title.value,
				)
			}

			return arrTexts
				.filter(fnExist)
				.map((s) => s.toLocaleLowerCase())
				.join('')
				.includes(searchText.toLowerCase())
		})
		.sort((a, b) => {
			if (selectedSort == 'alpha') {
				return stringCompare(
					getReleaseNoteTitle(
						a,
						releaseNotes.linkedItems,
					)?.toLowerCase() || '',
					getReleaseNoteTitle(
						b,
						releaseNotes.linkedItems,
					)?.toLowerCase() || '',
				)
			}
			return sortReleaseNoteByDateDescFn(a, b)
		})

	const aceRulesOptionTreeNodes = useMemo<TreeNodeProps[]>(() => {
		return makeAceGroupOptions(
			aceGroups.items,
			aceGroups.linkedItems,
			true,
		).map((treeElement) =>
			mapTreeElementToTreeNode(treeElement, selectedAceSubgroups),
		)
	}, [aceGroups.items, aceGroups.linkedItems, selectedAceSubgroups])

	const { totalPages, data: filteredPaginatedItems } = paginateArray(
		filteredReleasenotes,
		currentPageNumber,
		PAGE_SIZE,
	)
	const stageOptions = useMemo<TreeNodeProps[]>(
		() =>
			makeStageGroupOptions(stageGroups, stages).map((treeElement) =>
				mapTreeElementToTreeNode(treeElement, selectedStages),
			),
		[stageGroups, stages, selectedStages],
	)
	const klaOptions = useMemo<TreeNodeProps[]>(
		() =>
			makeLearningAreaTree(
				syllabuses.items,
				keyLearningAreas,
				true,
				getTaxoCodenames(
					config.item.elements.disabled_key_learning_areas,
				),
			)
				.filter((option) => !!option.children?.length)
				.map((treeElement) =>
					mapTreeElementToTreeNode(treeElement, selectedSyllabuses),
				),
		[
			config.item.elements.disabled_key_learning_areas,
			keyLearningAreas,
			syllabuses.items,
			selectedSyllabuses,
		],
	)

	const syllabusTaxoSyllabusUrls = useSyllabusTaxoUrls(mappings, syllabuses)

	// Event listeners
	const resetQsSyllabus = () => {
		if (router.asPath != currentUrl) {
			router.replace(currentUrl, undefined, { shallow: false })
		}
	}

	const handleSearch = (text) => {
		setSearchText(text)
	}

	const handleReset = () => {
		setSearchText('')
		setSelectedSyllabuses([])
		setSelectedStages([])
		setSelectedAceSubgroups([])
		setSelectedStartDate(sixMonthsBackFromToday)
		setSelectedEndDate(today)
		setCurrentPageNumber(1)
		scrollToTopOfRightCol()
		resetQsSyllabus()
	}

	const handleAceRulesFilterChange = getDropdownTreeFilterHandlerListenerFn(
		(state) => {
			setSelectedAceSubgroups(state)
			scrollToTopOfRightCol()
			resetQsSyllabus()
		},
	)
	const handleStagesFilterChange = getDropdownTreeFilterHandlerListenerFn(
		(state) => {
			setSelectedStages(state)
			scrollToTopOfRightCol()
			resetQsSyllabus()
		},
	)
	const handleSyllabusesFilterChange = getDropdownTreeFilterHandlerListenerFn(
		(state) => {
			setSelectedSyllabuses(state)
			scrollToTopOfRightCol()
			resetQsSyllabus()
		},
	)

	const handleDownload = async () => {
		refAbortController.current = new AbortController()
		setIsDownloading(true)

		const [_, errorMessage] = await downloadReleaseNotes(
			{
				fromDate: selectedStartDate,
				toDate: selectedEndDate,
				keylearningareas: selectedKLAs,
				syllabuses: selectedSyllabuses,
				stages: selectedStages,
				ace_subgroups: selectedAceSubgroups,
				isPreviewMode: props.preview,
			},
			refAbortController.current.signal,
		)
		if (refAbortController.current?.signal?.aborted) return
		if (errorMessage) {
			setErrorPopupMessage(errorMessage)
		}

		setIsDownloading(false)
	}

	const handleCancelDownload = () => {
		refAbortController.current.abort()
		refAbortController.current = null
		setIsDownloading(false)
	}

	// Effects
	useEffect(() => {
		const params: any = new Proxy(
			new URLSearchParams(window.location.search),
			{
				get: (searchParams, prop: any) => searchParams.get(prop),
			},
		)
		params.ace == null
			? setSelectedAceSubgroups([])
			: setSelectedAceSubgroups([decodeURI(params.ace)])
	}, [])

	const scrollToTopOfRightCol = () => {
		if (refRightCol.current) {
			animateScrollTo(refRightCol.current, {
				speed: 0,
				verticalOffset: -24,
			})
		}
	}

	// Reset number when any filters selected
	useEffect(() => {
		setCurrentPageNumber(1)
	}, [
		searchText,
		selectedSyllabuses,
		selectedStages,
		selectedAceSubgroups,
		selectedStartDate,
		selectedEndDate,
		router,
		currentUrl,
	])

	// Set End Date to Start Date if Start Date set beyond End Date
	useEffect(() => {
		if (isAfterStartAfterEndDate) {
			setSelectedEndDate(selectedStartDate)
		}
	}, [selectedStartDate, selectedEndDate, isAfterStartAfterEndDate])

	useEffect(() => {
		if (qSyllabus) {
			setSelectedSyllabuses(
				(qSyllabus?.split(',') as TaxoSyllabus[]) || [],
			)
		}
	}, [qSyllabus])

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}
	return (
		<>
			<GridWrapper>
				<GridCol className="flex flex-wrap gap-2 items-center">
					{page.elements.title.value && (
						<CommonCopyUrlWrapper
							url={currentUrl}
							className="flex-auto flex-shrink-0"
						>
							<h1
								data-kontent-item-id={page.system.id}
								data-kontent-element-codename="title"
							>
								{page.elements.title.value}
							</h1>
						</CommonCopyUrlWrapper>
					)}
					<Button
						className="flex items-center gap-2"
						onClick={handleDownload}
						disabled={!filteredPaginatedItems.length}
					>
						<span>Download</span>
						<Icon icon="bxs:download" />
					</Button>
				</GridCol>
				<GridCol lg={4}>
					<div
						className="lg:sticky top-0 pr-8"
						css={{
							'.is-preview &': {
								top: 26,
							},
						}}
					>
						<NswFilter
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
							totalItems={filteredReleasenotes.length}
						>
							<NswFilterList>
								<NswFilterItem>
									<NswFormFieldset title="Learning areas and syllabuses">
										<TreeMultiSelect
											key={klaOptions.join(',')}
											data={klaOptions}
											onChange={
												handleSyllabusesFilterChange
											}
											placeholder="Select syllabuses"
										/>
									</NswFormFieldset>
								</NswFilterItem>
								<NswFilterItem>
									<NswFormFieldset title="Stages">
										<TreeMultiSelect
											key={stageOptions.join(',')}
											data={stageOptions}
											onChange={handleStagesFilterChange}
											placeholder="Select stages"
										/>
									</NswFormFieldset>
								</NswFilterItem>
								<NswFilterItem>
									<NswFormFieldset title="ACE Rules">
										<TreeMultiSelect
											key={aceRulesOptionTreeNodes.join(
												',',
											)}
											data={aceRulesOptionTreeNodes}
											onChange={
												handleAceRulesFilterChange
											}
											placeholder="Select ACE Rules"
										/>
									</NswFormFieldset>
								</NswFilterItem>
							</NswFilterList>
							<NswFilterItem>
								<NswFormFieldset title="Date range">
									<DatepickerRange
										className="space-y-3"
										selectedStartDate={selectedStartDate}
										selectedEndDate={selectedEndDate}
										onChangeStart={(date) =>
											setSelectedStartDate(date)
										}
										onChangeEnd={(date) =>
											setSelectedEndDate(date)
										}
									/>
								</NswFormFieldset>
							</NswFilterItem>
							<NswFilterCancel onReset={handleReset} />
						</NswFilter>
					</div>
				</GridCol>
				<GridCol lg={8}>
					<div ref={refRightCol} />
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
						className="flex-wrap gap-3"
						css={{
							'&&': {
								paddingTop: '1.5rem',
								marginTop: 0,
								alignItems: 'center',
								lineHeight: '1.75rem',
								display: 'flex',
								gap: 12,
							},
							'.nsw-results-bar__info': {
								flex: '1 0 auto',
							},
							'.nsw-results-bar__sorting': {
								paddingTop: 0,
							},
						}}
						page={currentPageNumber}
						pageSize={PAGE_SIZE}
						total={filteredReleasenotes.length}
						slotBarSorting={
							<label className="flex items-center gap-3 !mr-0">
								<span className="flex-shrink-0 nsw-form__label">
									Sort by:
								</span>
								<select
									className="nsw-form__select max-w-[200px]"
									onChange={(e) => {
										setSort(e.target.value)
									}}
									value={selectedSort}
									autoComplete="off"
								>
									<option value="date-desc">
										Date descending
									</option>
									<option value="alpha">Title A-Z</option>
								</select>
							</label>
						}
					></NswResultBar>
					{filteredPaginatedItems.map(
						(releaseNote: CombinedReleaseNote) => {
							const url = getUrlFromMapping(
								mappings,
								releaseNote.system.codename,
							)
							const title = getReleaseNoteTitle(
								releaseNote,
								releaseNotes.linkedItems,
							)
							return (
								<ReleaseNoteAccordion
									key={releaseNote.system.id}
									releaseNote={releaseNote}
									mappings={mappings}
									linkedItems={releaseNotes.linkedItems}
									syllabusTaxoSyllabusUrls={
										syllabusTaxoSyllabusUrls
									}
									slotBeforeBodyContent={
										!!title && (
											<CommonCopyUrlWrapper
												className="nsw-h4"
												url={url}
											>
												{title}
											</CommonCopyUrlWrapper>
										)
									}
								/>
							)
						},
					)}
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
				</GridCol>
				<GridCol>
					{totalPages > 1 && (
						<div className="mt-16">
							<Pagination
								page={currentPageNumber}
								count={totalPages}
								onChange={(_, pageNumber) => {
									scrollToTopOfRightCol()
									setCurrentPageNumber(pageNumber)
								}}
							></Pagination>
						</div>
					)}
				</GridCol>
			</GridWrapper>
			<GeneratingOverlayCommon
				modalStatus={isDownloading}
				handleCancel={handleCancelDownload}
			></GeneratingOverlayCommon>
			{errorPopupMessage && (
				<CustomModal
					title="Error"
					modalStatus={!!errorPopupMessage}
					handleCancel={() => setErrorPopupMessage('')}
					hideConfirmButton
				>
					<p>{errorPopupMessage}</p>
				</CustomModal>
			)}
		</>
	)
}

export default WpDcRecentchangesLayout
