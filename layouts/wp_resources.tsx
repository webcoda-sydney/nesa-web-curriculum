import Icon from '@/components/Icon'
import {
	ResourceSortSelect,
	ResourceSortSelectOption,
} from '@/components/ResourceListFilter'
import UnknownComponent from '@/components/UnknownComponent'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import { ButtonSimple } from '@/components/nsw/button/ButtonSimple'
import { NswFilter } from '@/components/nsw/filters/NswFilter'
import { NswFilterCancel } from '@/components/nsw/filters/NswFilterCancel'
import { NswFilterItem } from '@/components/nsw/filters/NswFilterItem'
import { NswFilterList } from '@/components/nsw/filters/NswFilterList'
import { NswFormFieldset } from '@/components/nsw/filters/NswFormFieldset'
import { NswResultBar } from '@/components/nsw/filters/NswResultBar'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { TagListTreeMultiSelectNode } from '@/components/tree-multi-select/TagListTreeMultiSelectNode'
import { TagListTreeMultiSelectWrapper } from '@/components/tree-multi-select/TagListTreeMultiSelectWrapper'
import {
	ITreeMultiSelectProps,
	TreeMultiSelect,
} from '@/components/tree-multi-select/TreeMultiSelect'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { DEFAULT_NUQS_TRANSITION_OPTIONS } from '@/constants'
import {
	WP_TA_RESOURCE_PAGE_SIZE,
	WP_TA_RESOURCE_SORT_MODEL,
} from '@/constants/teaching_advice_resource'
import { type WpResourcesResponseData } from '@/databuilders/wp_resources'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { useDownloadSelectedFiles } from '@/hooks/useDownloadSelectedFiles'
import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { useKlaTreeNodeProps } from '@/hooks/useKlaTreeNodeProps'
import { useResourceTypeTreeNodeProps } from '@/hooks/useResourceTypeTreeNodeProps'
import { useSetTreeNodeStateBasedOnQueryString } from '@/hooks/useSetTreeNodeStateBasedOnQueryString'
import { useStageTreeNodeProps } from '@/hooks/useStageTreeNodeProps'
import { useToggle } from '@/hooks/useToggle'
import {
	getCommonAdditionalFunctions,
	useTreeMultiSelectSelected,
} from '@/hooks/useTreeMultiSelectSelected'
import type { WpResources as WpResourcesModel } from '@/kontent/content-types/wp_resources'
import { TaxoResourceType, TaxoSyllabustype } from '@/kontent/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies/stage'
import { TaxoSyllabus } from '@/kontent/taxonomies/syllabus'
import CustomModal from '@/legacy-ported/components/base/CustomModal'
import type { ISelectOption } from '@/legacy-ported/components/base/CustomSelect'
import SearchBar from '@/legacy-ported/components/base/SearchBar'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import DownloadList, {
	DownloadListField,
} from '@/legacy-ported/components/syllabus/DownloadList'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import type { CommonPageProps, VideoLinkOrExtLinkOrAssetType } from '@/types'
import {
	byTaxoCodename,
	byTaxoName,
	getArrayLength,
	isIntersect,
} from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetHeadline,
	getVideoLinkOrExtLinkOrAssetLastModified,
	getVideoLinkOrExtLinkOrAssetSyllabusTaxoCodenames,
} from '@/utils/assets'
import { getSelectedNodesFromData } from '@/utils/tree-multi-select'
import {
	isAssetWithRawElement,
	isAssetWithRawElementsFocusareaTeachingadvice,
	isWebLinkVideo,
	isWebLinkext,
} from '@/utils/type_predicates'
import type { ElementModels } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import compareAsc from 'date-fns/compareAsc'
import { useQueryState } from 'next-usequerystate'
import { Alert, Button } from 'nsw-ds-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { TreeNode } from 'react-dropdown-tree-select'

export function convertTaxonomyTermsIntoSelectOption<TTerm extends string>(
	taxonomyTerms: ElementModels.TaxonomyTerm<TTerm>[],
): ISelectOption[] {
	return taxonomyTerms.map((term) => {
		return {
			text: term.name,
			value: term.codename,
		}
	})
}

/**
 * Search resources
 */
const matchesSearch =
	(text: string) => (resource: VideoLinkOrExtLinkOrAssetType) => {
		let titles: string[] = []
		const _isAssetWithFaTa =
			isAssetWithRawElementsFocusareaTeachingadvice(resource)
		if (isAssetWithRawElement(resource) || _isAssetWithFaTa) {
			titles = [
				resource.fileName,
				resource.title,
				...resource.descriptions.map((d) => d.description),
				...(resource.syllabus?.map(byTaxoName) || []),
				...(resource.resource_type.map(byTaxoName) || []),
			]

			if (_isAssetWithFaTa) {
				titles = [
					...titles,
					...(resource.focusareas?.map(
						(fa) => fa.elements.title.value,
					) || []),
				]
			}
		} else {
			let _titles = [
				resource.elements.title.value,
				...resource.elements.syllabus.value.map(byTaxoName),
			]
			if (isWebLinkVideo(resource) || isWebLinkext(resource)) {
				_titles = [
					..._titles,
					...resource.elements.resource_type.value.map(byTaxoName),
				]
			}
			titles = _titles
		}

		return titles.join().toLowerCase().includes(text.toLowerCase())
	}

const getSortFn =
	(sort: ResourceSortSelectOption) =>
	(a: VideoLinkOrExtLinkOrAssetType, b: VideoLinkOrExtLinkOrAssetType) => {
		switch (sort) {
			case 'date':
				return compareAsc(
					new Date(getVideoLinkOrExtLinkOrAssetLastModified(a)),
					new Date(getVideoLinkOrExtLinkOrAssetLastModified(b)),
				)
			case 'title':
				return stringCompare(
					getVideoLinkOrExtLinkOrAssetHeadline(a),
					getVideoLinkOrExtLinkOrAssetHeadline(b),
				)
		}
		return 0
	}

export const filterAssetSelectedStages = (
	selectedFilterStages: TaxoStage[],
	_taxoStages: TaxoStage[],
	_taxoSyllabusType: TaxoSyllabustype[],
) => {
	return selectedFilterStages.some((stage) => {
		// if stage is life skills, check if syllabus type is life skills
		if (stage.includes('life_skills@')) {
			const _stages = stage.replace('life_skills@', '').split('___')
			return (
				isIntersect(_stages, _taxoStages) &&
				_taxoSyllabusType.includes('life_skills')
			)
		}
		return _taxoStages.includes(stage)
	})
}

function WpResources(
	props: CommonPageProps<WpResourcesModel, WpResourcesResponseData>,
) {
	const isScreenDownLg = useIsScreenDown('lg')
	const { preview } = props
	const {
		config,
		pageResponse,
		assets,
		keyLearningAreas,
		stages,
		stageGroups,
		syllabuses,
		webLinkVideos,
		webLinkExternals,
	} = props.data

	const [qSearch, setQSearch] = useQueryState('q')
	const [qPage, setQPage] = useQueryState('page')
	const [qSyllabus, setQSyllabus] = useQueryState('syllabus')
	const [qStage, setQStage] = useQueryState('stage')
	const [qResource, setQResource] = useQueryState('resource')

	const currentUrl = useCleanPathDefault()
	const qPageInt = qPage ? parseInt(qPage) : 1
	const searchText = qSearch || ''
	const page = pageResponse.item
	const refScrollHereAfterFilter = useRef<HTMLDivElement>(null)
	// States
	const refTmpSearchText = useRef('')
	const [selectedSort, setSelectedSort] =
		useState<ResourceSortSelectOption>('relevance')

	const {
		selectedChildNodesValues: selectedFilterSyllabus,
		handleDrodpownChange: handleSyllabusesFilterChange,
		handleRemoveNode: handleRemoveNodeSyllabus,
		handleReset: handleResetSelectedFilterSyllabus,
		setSelectedChildNodes: setSelectedFilterSyllabus,
	} = useTreeMultiSelectSelected<TaxoSyllabus>(
		getCommonAdditionalFunctions(setQSyllabus),
	)

	const {
		selectedChildNodesValues: selectedFilterStages,
		handleDrodpownChange: handleStagesFilterChange,
		handleRemoveNode: handleRemoveNodeStage,
		handleReset: handleResetSelectedFilterStage,
		setSelectedChildNodes: setSelectedFilterStages,
	} = useTreeMultiSelectSelected<TaxoStage>(
		getCommonAdditionalFunctions(setQStage),
	)

	const {
		selectedNodesValues: selectedFilterResourceTypes,
		handleDrodpownChange: handleResourceTypesFilterChange,
		handleRemoveNode: handleRemoveNodeResourceType,
		handleReset: handleResetSelectedFilterResourceType,
		setSelectedNodes: setSelectedFilterResourceTypes,
	} = useTreeMultiSelectSelected<TaxoResourceType>(
		getCommonAdditionalFunctions(setQResource, true),
	)

	const [isFilterShown, toggleIsFilterShown] = useToggle(true)

	const combinedResources = useMemo(() => {
		return [...assets, ...webLinkVideos.items, ...webLinkExternals.items]
	}, [assets, webLinkVideos.items, webLinkExternals.items])

	const resources = combinedResources.sort((a, b) =>
		stringCompare(
			getVideoLinkOrExtLinkOrAssetHeadline(a),
			getVideoLinkOrExtLinkOrAssetHeadline(b),
		),
	)

	const klaOptions = useKlaTreeNodeProps({
		disabledKlas: config.item.elements.disabled_key_learning_areas,
		keyLearningAreas,
		syllabuses: syllabuses.items,
		selectedSyllabus: selectedFilterSyllabus,
	})

	const stageOptions = useStageTreeNodeProps({
		stageGroups,
		stages,
		selectedStages: selectedFilterStages,
		withLifeSkillsOnSecondaryAndSenior: true,
	})

	const resourceTypeOptions = useResourceTypeTreeNodeProps({
		selectedResourceTypes: selectedFilterResourceTypes,
		excludeResourceTypes: ['advice'],
	})

	const selectedFilterTagSyllabus = useMemo(() => {
		return getSelectedNodesFromData(klaOptions)
	}, [klaOptions])
	const selectedFilterTagStage = useMemo(() => {
		return getSelectedNodesFromData(stageOptions)
	}, [stageOptions])
	const selectedFilterTagResourceType = useMemo(() => {
		return getSelectedNodesFromData(resourceTypeOptions)
	}, [resourceTypeOptions])

	const filteredResources = useMemo(
		() =>
			resources
				.filter(matchesSearch(searchText))
				.filter((resource) => {
					if (selectedFilterStages.length === 0) return true
					if (isWebLinkVideo(resource) || isWebLinkext(resource)) {
						const taxoStages =
							resource.elements.stages__stages.value.map(
								byTaxoCodename,
							)
						const taxoSyllabusType =
							resource.elements.syllabus_type.value.map(
								byTaxoCodename,
							)

						return filterAssetSelectedStages(
							selectedFilterStages,
							taxoStages,
							taxoSyllabusType,
						)
					}
					if (isAssetWithRawElement(resource)) {
						const taxoStages = resource.stage.map(byTaxoCodename)
						const taxoSyllabusType =
							resource.syllabustype?.map(byTaxoCodename) || []

						return filterAssetSelectedStages(
							selectedFilterStages,
							taxoStages,
							taxoSyllabusType,
						)
					}
				})
				.filter((resource) => {
					return selectedFilterSyllabus?.length > 0
						? isIntersect(
								getVideoLinkOrExtLinkOrAssetSyllabusTaxoCodenames(
									resource,
								),
								selectedFilterSyllabus,
						  )
						: true
				})
				.filter((resource) => {
					if (selectedFilterResourceTypes.length === 0) return true
					if (isWebLinkVideo(resource) || isWebLinkext(resource))
						return isIntersect(
							resource.elements.resource_type.value.map(
								byTaxoCodename,
							),
							selectedFilterResourceTypes,
						)
					return isIntersect(
						selectedFilterResourceTypes,
						resource.resource_type.map(byTaxoCodename),
					)
				})
				.sort(getSortFn(selectedSort)),
		[
			resources,
			searchText,
			selectedFilterStages,
			selectedFilterSyllabus,
			selectedFilterResourceTypes,
			selectedSort,
		],
	)

	const paginatedFilteredResources = useMemo(() => {
		return filteredResources.slice(
			(qPageInt - 1) * WP_TA_RESOURCE_PAGE_SIZE,
			qPageInt * WP_TA_RESOURCE_PAGE_SIZE,
		)
	}, [filteredResources, qPageInt])

	const {
		errorMessageOnDownload,
		selectedAssetIds,
		isDownloading,
		maxFileReached,
		maxFileSizeInMB,
		setSelectedAssetIds,
		setErrorMessageOnDownload,
		handleDownloadSelected,
		handleCancelDownloadSelected,
	} = useDownloadSelectedFiles({
		alertEl: refScrollHereAfterFilter.current,
		files: filteredResources
			.filter(isAssetWithRawElement)
			.map((resource) => {
				return {
					id: resource.id,
					size: resource.size,
				}
			})
			.filter(Boolean),
		downloadCustomResourceSyllabusName: 'resources',
		syllabuses: selectedFilterSyllabus,
		stages: selectedFilterStages,
	})

	const hiddenFields = useMemo<DownloadListField[]>(() => {
		const defaultHiddens: DownloadListField[] = [
			'fileType',
			'year',
			'fileSize',
		]
		if (isScreenDownLg) {
			return [
				...defaultHiddens,
				'syllabus',
				'resourceType',
				'stage',
				'date',
			]
		}

		return isFilterShown
			? [...defaultHiddens, 'resourceType', 'stage', 'date']
			: [...defaultHiddens, 'info']
	}, [isFilterShown, isScreenDownLg])

	const resetPageAndScroll = useCallback(
		async (pageNumber = 0) => {
			// the `pageNumber` is 0-based
			refScrollHereAfterFilter.current?.scrollIntoView()
			setQPage(
				pageNumber ? `${pageNumber + 1}` : null,
				DEFAULT_NUQS_TRANSITION_OPTIONS,
			)
		},
		[setQPage],
	)

	const resetSelectionAndPage = useCallback(() => {
		resetPageAndScroll()
	}, [resetPageAndScroll])

	const getFnForHandleDropdown = useCallback(
		(handler: ITreeMultiSelectProps['onChange']) => {
			return (
				currentNode: TreeNode,
				selectedNodes: TreeNode[],
				selectedChildNodes: TreeNode[],
			) => {
				handler(currentNode, selectedNodes, selectedChildNodes)
				resetSelectionAndPage()
			}
		},
		[resetSelectionAndPage],
	)

	// Methods
	const handleSearch = async (text: string) => {
		await resetSelectionAndPage()
		await setQSearch(text || null, DEFAULT_NUQS_TRANSITION_OPTIONS)
	}

	const handleResetFilterDropdowns = () => {
		handleResetSelectedFilterSyllabus()
		handleResetSelectedFilterStage()
		handleResetSelectedFilterResourceType()
		resetSelectionAndPage()
	}

	const handleReset = () => {
		handleResetFilterDropdowns()
		handleSearch('')
	}

	useSetTreeNodeStateBasedOnQueryString(
		qSyllabus || '',
		klaOptions,
		setSelectedFilterSyllabus,
	)
	useSetTreeNodeStateBasedOnQueryString(
		qStage || '',
		stageOptions,
		setSelectedFilterStages,
	)
	useSetTreeNodeStateBasedOnQueryString(
		qResource || '',
		resourceTypeOptions,
		setSelectedFilterResourceTypes,
	)

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	return (
		<>
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

			{/* search input */}
			<div ref={refScrollHereAfterFilter} className="my-8">
				<GridWrapper>
					<GridCol md={8}>
						<SearchBar
							initialSearchText={searchText}
							onSearch={handleSearch}
							onSavingTempSearchText={(text) => {
								refTmpSearchText.current = text
							}}
						/>
					</GridCol>
				</GridWrapper>
			</div>

			<div className="my-8">
				<GridWrapper className="!mt-0">
					<GridCol
						lg={3}
						className={clsx('!pt-0', {
							'lg:hidden': !isFilterShown,
						})}
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
							totalItems={filteredResources.length}
							mobileToggleFilterLabel="Show filters"
							title={
								<ButtonSimple
									onClick={toggleIsFilterShown}
									slotBeforeChildren={
										<Icon
											icon="ic:baseline-close"
											width={24}
											height={24}
											className="block p-0.5 bg-nsw-brand-dark text-white rounded-[4px]"
										/>
									}
								>
									Hide filters
								</ButtonSimple>
							}
						>
							<NswFilterList>
								<NswFilterItem>
									<NswFormFieldset title="Stages">
										<TreeMultiSelect
											key={stageOptions
												.map((r) => r.value)
												.join(',')}
											data={stageOptions}
											onChange={getFnForHandleDropdown(
												handleStagesFilterChange,
											)}
											placeholder="Select stages"
											hideTagsSelected
										/>
									</NswFormFieldset>
								</NswFilterItem>
								<NswFilterItem>
									<NswFormFieldset title="Learning areas and syllabuses">
										<TreeMultiSelect
											key={klaOptions
												.map((r) => r.value)
												.join(',')}
											data={klaOptions}
											onChange={getFnForHandleDropdown(
												handleSyllabusesFilterChange,
											)}
											placeholder="Select syllabuses"
											hideTagsSelected
										/>
									</NswFormFieldset>
								</NswFilterItem>
								<NswFilterItem>
									<NswFormFieldset title="Syllabus support materials">
										<TreeMultiSelect
											key={resourceTypeOptions
												.map((r) => r.value)
												.join(',')}
											data={resourceTypeOptions}
											onChange={getFnForHandleDropdown(
												handleResourceTypesFilterChange,
											)}
											placeholder="Select resource type"
											hideTagsSelected
										/>
									</NswFormFieldset>
								</NswFilterItem>
							</NswFilterList>
							<NswFilterCancel onReset={handleReset} />
						</NswFilter>
					</GridCol>
					<GridCol lg={isFilterShown ? 9 : 12} className="!pt-0">
						<NswResultBar
							css={{
								'&&': {
									paddingTop: '.875rem',
									paddingBottom: '.875rem',
									marginTop: 0,
									marginBottom: '2rem',
									alignItems: 'center',
									borderBottom:
										'.0625rem solid var(--nsw-grey-04)',
								},
								'.NswResultBar__result': {
									display: 'flex',
									gap: '1rem',
								},
								'.nsw-results-bar__sorting': {
									paddingTop: 0,
									width: 1,
									overflow: 'hidden',
								},
							}}
							page={qPageInt}
							pageSize={WP_TA_RESOURCE_PAGE_SIZE}
							total={filteredResources.length}
							slotBarSorting={
								<span
									className="flex opacity-0 pointer-events-none"
									tabIndex={-1}
									aria-hidden="true"
								>
									<ResourceSortSelect
										onChange={(e) =>
											setSelectedSort(
												e.target
													.value as ResourceSortSelectOption,
											)
										}
									></ResourceSortSelect>
								</span>
							}
							slotShowingResultsNumberBefore={
								!isFilterShown && (
									<ButtonSimple
										className="border-r border-r-nsw-grey-03 pr-4"
										onClick={toggleIsFilterShown}
										slotBeforeChildren={
											<Icon
												icon="mdi:tune"
												width={24}
												height={24}
												className="block p-0.5 bg-nsw-brand-dark text-white rounded-[4px]"
											/>
										}
									>
										Show filters
									</ButtonSimple>
								)
							}
						></NswResultBar>

						<div className="flex gap-3 align-top justify-between mb-4 flex-wrap md:flex-nowrap">
							{(selectedFilterTagStage.length > 0 ||
								selectedFilterTagSyllabus.length > 0 ||
								selectedFilterTagResourceType.length > 0) && (
								<div>
									<TagListTreeMultiSelectWrapper
										showClearButton={
											getArrayLength(
												selectedFilterTagStage,
											) +
												getArrayLength(
													selectedFilterTagSyllabus,
												) +
												getArrayLength(
													selectedFilterTagResourceType,
												) >
											1
										}
										onClearClick={handleReset}
									>
										{selectedFilterTagStage.length > 0 && (
											<TagListTreeMultiSelectNode
												list={selectedFilterTagStage}
												onRemoveClick={(
													_e,
													removedNode,
												) => {
													resetSelectionAndPage()
													handleRemoveNodeStage(
														removedNode,
													)
												}}
											/>
										)}
										{selectedFilterTagSyllabus.length >
											0 && (
											<TagListTreeMultiSelectNode
												list={selectedFilterTagSyllabus}
												onRemoveClick={(
													_e,
													removedNode,
												) => {
													resetSelectionAndPage()
													handleRemoveNodeSyllabus(
														removedNode,
													)
												}}
											/>
										)}
										{selectedFilterTagResourceType.length >
											0 && (
											<TagListTreeMultiSelectNode
												list={
													selectedFilterTagResourceType
												}
												onRemoveClick={(
													_e,
													removedNode,
												) => {
													resetSelectionAndPage()
													handleRemoveNodeResourceType(
														removedNode,
													)
												}}
											/>
										)}
									</TagListTreeMultiSelectWrapper>
								</div>
							)}

							<WrapperWithInView>
								{(inView) => (
									<>
										<div className="flex-shrink-0 md:ml-auto">
											<Button
												onClick={handleDownloadSelected}
												disabled={
													!selectedAssetIds.length ||
													isDownloading ||
													maxFileReached
												}
											>
												<span className="mr-2">
													Download selected
												</span>
												<Icon icon="bxs:download" />
											</Button>
										</div>
										<div
											className={clsx(
												'fixed top-0 left-0 bg-white z-10 py-3 w-full shadow-[0_4px_12px_0_rgba(0,0,0,.3)] transition duration-300',
												{
													'pointer-events-none opacity-0':
														inView ||
														!selectedAssetIds.length,
													'top-[26px]': preview,
												},
											)}
											aria-hidden={
												inView ||
												!selectedAssetIds.length
													? 'true'
													: 'false'
											}
										>
											<div className="nsw-container flex justify-end">
												<Button
													onClick={
														handleDownloadSelected
													}
													disabled={
														!selectedAssetIds.length ||
														isDownloading ||
														maxFileReached
													}
												>
													<span className="mr-2">
														Download selected
													</span>
													<Icon icon="bxs:download" />
												</Button>
											</div>
										</div>
									</>
								)}
							</WrapperWithInView>
						</div>

						{maxFileReached && (
							<Alert
								title="Warning"
								as="warning"
								className="mb-3"
							>
								<p>Maximum of {maxFileSizeInMB} MB reached</p>
							</Alert>
						)}

						<DownloadList
							page={qPageInt - 1}
							pageSize={WP_TA_RESOURCE_PAGE_SIZE}
							files={paginatedFilteredResources}
							hiddenFields={hiddenFields}
							onSelectedFiles={setSelectedAssetIds}
							onPageChange={resetPageAndScroll}
							isIncludeCopyUrlOnTitle
							showNextToTitleTooltip={
								isScreenDownLg || isFilterShown
							}
							showFileSizeUnderTitle
							initialSortModel={WP_TA_RESOURCE_SORT_MODEL}
							selectionModel={selectedAssetIds}
							paginationMode="server"
							rowCount={filteredResources.length}
							showSelectAllCheckbox
							keepNonExistentRowsSelected
						/>

						{!filteredResources.length && (
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
				</GridWrapper>
			</div>
			<GeneratingOverlayCommon
				modalStatus={isDownloading}
				handleCancel={handleCancelDownloadSelected}
			/>
			{errorMessageOnDownload && (
				<CustomModal
					title="Error"
					modalStatus={!!errorMessageOnDownload}
					handleCancel={() => setErrorMessageOnDownload('')}
					hideConfirmButton
				>
					<p>{errorMessageOnDownload}</p>
				</CustomModal>
			)}
		</>
	)
}
export default WpResources
