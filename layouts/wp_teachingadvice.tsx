import Icon from '@/components/Icon'
import {
	ResourceSortSelect,
	ResourceSortSelectOption,
} from '@/components/ResourceListFilter'
import UnknownComponent from '@/components/UnknownComponent'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import { CardAsset } from '@/components/cards/CardAsset'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
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
import NextMuiLink, { NextMuiLinkProps } from '@/components/ui/NextMuiLink'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import {
	DEFAULT_NUQS_TRANSITION_OPTIONS,
	STAGEGROUPS_STAGES,
} from '@/constants'
import {
	WP_TA_RESOURCE_PAGE_SIZE,
	WP_TA_RESOURCE_SORT_MODEL,
} from '@/constants/teaching_advice_resource'
import type { WpTeachingdviceResponseData } from '@/databuilders/wp_teachingadvice'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { useDownloadSelectedFiles } from '@/hooks/useDownloadSelectedFiles'
import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { useKlaTreeNodeProps } from '@/hooks/useKlaTreeNodeProps'
import { useSetTreeNodeStateBasedOnQueryString } from '@/hooks/useSetTreeNodeStateBasedOnQueryString'
import { useStageTreeNodeProps } from '@/hooks/useStageTreeNodeProps'
import { useToggle } from '@/hooks/useToggle'
import {
	getCommonAdditionalFunctions,
	useTreeMultiSelectSelected,
} from '@/hooks/useTreeMultiSelectSelected'
import type { Focusarea } from '@/kontent/content-types/focusarea'
import type { Syllabus } from '@/kontent/content-types/syllabus'
import type { Teachingadvice } from '@/kontent/content-types/teachingadvice'
import type { WpTeachingadvice as WpTeachingadviceModel } from '@/kontent/content-types/wp_teachingadvice'
import { TaxoStage, TaxoStageGroup, TaxoSyllabus } from '@/kontent/taxonomies'
import CustomModal from '@/legacy-ported/components/base/CustomModal'
import SearchBar from '@/legacy-ported/components/base/SearchBar'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import DownloadList, {
	DownloadListField,
} from '@/legacy-ported/components/syllabus/DownloadList'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import { QS_SHOW } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]/[stage]/[...afterStageSlugs]'
import type {
	AssetWithRawElements,
	CommonPageProps,
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	ExtendedTeachingAdvice,
	WebLinkTeachingadviceExtended,
} from '@/types/customKontentTypes'
import {
	byTaxoCodename,
	byTaxoName,
	getArrayLength,
	getSlugByCodename,
	getSortedStageByTaxoTerms,
	getStageTags,
	getTaxoCodenames,
	getTaxoCodenamesFromTaxoTerms,
	isIntersect,
} from '@/utils'
import {
	getSortedFocusAreasBySyllabusTypeItem,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import { getSyllabusUrlFromMappingBySyllabusCodename } from '@/utils/getSyllabusUrlFromMapping'
import { isLifeSkillSyllabus } from '@/utils/syllabus'
import { getSelectedNodesFromData } from '@/utils/tree-multi-select'
import { isAssetWithRawElement } from '@/utils/type_predicates'
import type { ElementModels } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import clsx from 'clsx'
import { compareAsc, format } from 'date-fns'
import { useQueryState } from 'next-usequerystate'
import { Alert, Button, Card, TagList } from 'nsw-ds-react'
import { stringify } from 'qs'
import { MouseEvent, useCallback, useMemo, useRef, useState } from 'react'
import { TreeNode } from 'react-dropdown-tree-select'
import { filterAssetSelectedStages } from './wp_resources'

type TeachingAdvicePageItem =
	| WebLinkTeachingadviceExtended
	| AssetWithRawElements

const getLastModified = (item: TeachingAdvicePageItem) => {
	if ('lastModified' in item) {
		return new Date(item.lastModified)
	}
	return new Date(item.system.lastModified)
}

const getSortFn =
	(sort: ResourceSortSelectOption) =>
	(a: TeachingAdvicePageItem, b: TeachingAdvicePageItem) => {
		switch (sort) {
			case 'date':
				return compareAsc(getLastModified(a), getLastModified(b))
			case 'title':
				return stringCompare(
					getTitleOrFilename(a),
					getTitleOrFilename(b),
				)
		}
		return 0
	}
const matchesSearch =
	(text: string) => (advice: WebLinkTeachingadviceExtended) =>
		[
			advice.elements.title.value,
			...advice.elements.syllabus.value.map(byTaxoName),
		]
			.join()
			.toLowerCase()
			.includes(text.toLowerCase())

function getTitleOrFilename(item: TeachingAdvicePageItem) {
	if ('size' in item && 'url' in item) {
		return item.title || item.fileName
	}
	return item?.elements?.title?.value
}

interface ColAdviceProps {
	advice: ExtendedTeachingAdvice
	onClick?: (
		// eslint-disable-next-line no-unused-vars
		e: MouseEvent<HTMLButtonElement>,
		// eslint-disable-next-line no-unused-vars
		advice: ExtendedTeachingAdvice,
	) => void
}

export const styleCardTagListOnHover = {
	'&:hover .nsw-tag, &:focus .nsw-tag': {
		borderColor: '#fff',
		color: '#fff',
	},
}

const getLink = (advice: ExtendedTeachingAdvice, mappings: Mapping[]) => {
	// get codename of syllabus
	const syllabusCodename = advice.syllabus.system.codename
	// the mapping of the path is
	const pathname = getSyllabusUrlFromMappingBySyllabusCodename(
		mappings,
		syllabusCodename,
		true,
		true,
	)
	const isAdviceSyllabusLifeSkill = advice.syllabus
		? isLifeSkillSyllabus(advice.syllabus)
		: false
	const isAdviceFocusAreaLifeSkill = advice.focusArea
		? isLifeSkillFocusAreaOrOptionListOrOutcome(advice.focusArea)
		: false

	const adviceStages = advice.elements.stages__stages.value.length
		? advice.elements.stages__stages.value
		: advice.focusArea.elements.stages__stages.value

	// Stage
	let stage: TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill =
		getSortedStageByTaxoTerms(adviceStages)?.[0]?.codename

	// for life skills
	if (isAdviceSyllabusLifeSkill && isAdviceFocusAreaLifeSkill) {
		stage = 'life_skills'
	} else {
		if (stage === 'stage_6') {
			stage = advice.elements.stages__stage_years.value?.[0]?.codename
		}
	}

	const queryStr = stringify({
		show: QS_SHOW.ADVICE,
	})

	// return pathname + (queryStr ? `?${queryStr}` : '')
	const pathSlugs = ['content', stage, advice.focusArea.system.codename].map(
		getSlugByCodename,
	)

	return (
		pathname + '/' + pathSlugs.join('/') + (queryStr ? `?${queryStr}` : '')
	)
}

const LinkAdvice = (props: NextMuiLinkProps) => {
	return <NextMuiLink {...props} scroll={false} />
}

const ColAdvice = (props: ColAdviceProps) => {
	const { mappings } = useKontentHomeConfig()
	const { advice } = props
	const tags = getStageTags(advice.elements?.stages__stages)

	const link = getLink(advice, mappings)
	return (
		<GridCol sm={6} lg={4} className="flex flex-col">
			<Card
				tag={advice.elements.syllabus.value?.[0]?.name}
				className="flex-1"
				headline={
					advice.elements.title.value ||
					advice.focusArea?.elements?.title?.value
				}
				css={styleCardTagListOnHover}
				link={link}
				linkComponent={LinkAdvice}
			>
				<div className="mt-4">
					<TagList tags={tags} />
				</div>
				<small className="mt-4">
					Updated:{' '}
					{format(
						new Date(
							advice.elements.updated.value ||
								advice.system.lastModified,
						),
						'MMM yyyy',
					)}
				</small>
			</Card>
		</GridCol>
	)
}

interface ColAssetProps {
	asset: AssetWithRawElements
	onClick?: (
		// eslint-disable-next-line no-unused-vars
		e: MouseEvent<HTMLAnchorElement>,
		// eslint-disable-next-line no-unused-vars
		assetUrl: string,
	) => void
}

const ColAsset = (props: ColAssetProps) => {
	const { asset, onClick } = props

	const handleClick = (ev) => {
		onClick(ev, asset.url)
	}

	return (
		<Grid
			item
			xs={12}
			sm={6}
			lg={4}
			className="flex flex-col"
			key={asset.id}
		>
			<CardAsset asset={asset} onClick={handleClick} />
		</Grid>
	)
}

export const makeStageGroupOptions = (
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[],
	stages: ElementModels.TaxonomyTerm<TaxoStage>[],
	withLifeSkillsOnSecondaryAndSenior = false,
) => {
	const secondaryAndSenior: TaxoStageGroup[] = ['secondary', 'senior']
	return stageGroups.map((stageGroup) => {
		const shouldIncludeLifeSkills =
			withLifeSkillsOnSecondaryAndSenior &&
			secondaryAndSenior.includes(stageGroup.codename)
		const children = STAGEGROUPS_STAGES[stageGroup.codename]
			.map((stageCodename) => {
				const stage = stages.find((s) => {
					return s.codename === stageCodename
				})
				if (!stage) return undefined
				return {
					id: stage.codename,
					label: stage.name,
				}
			})
			.filter((item) => !!item)

		return {
			id: stageGroup.codename,
			label: stageGroup.name,
			children: [
				...children,
				shouldIncludeLifeSkills && {
					id: `life_skills@${children.map((s) => s.id).join('___')}`,
					label: `Life Skills (${stageGroup.name.split(' ')[0]})`,
				},
			].filter(Boolean),
		}
	})
}

function WpTeachingadvice(
	props: CommonPageProps<WpTeachingadviceModel, WpTeachingdviceResponseData>,
) {
	const isScreenDownLg = useIsScreenDown('lg')
	const { preview, mappings } = props
	const {
		pageResponse,
		stages,
		keyLearningAreas,
		teachingAdvices,
		focusAreas,
		syllabuses,
		stageGroups,
		assets,
		config,
	} = props.data

	const [qSearch, setQSearch] = useQueryState('q')
	const [qPage, setQPage] = useQueryState('page')
	const [qSyllabus, setQSyllabus] = useQueryState('syllabus')
	const [qStage, setQStage] = useQueryState('stage')

	const currentUrl = useCleanPathDefault()
	const qPageInt = qPage ? parseInt(qPage) : 1
	const searchText = qSearch || ''
	const page = pageResponse.item
	const refScrollHereAfterFilter = useRef<HTMLDivElement>(null)
	const extendedWeblinkTeachingAdvices = teachingAdvices.items
		.flatMap<ExtendedTeachingAdvice>((teachingAdvice: Teachingadvice) => {
			const _focusAreas = getSortedFocusAreasBySyllabusTypeItem(
				focusAreas.items,
			).filter((focusArea: Focusarea) => {
				return getLinkedItems(
					focusArea.elements.teachingadvice,
					focusAreas.linkedItems,
				).some(
					(item: Teachingadvice) =>
						item.system.id === teachingAdvice.system.id,
				)
			})

			return {
				...teachingAdvice,
				focusArea: _focusAreas?.[0],
				syllabus: syllabuses.items.find(
					(syl: Syllabus) =>
						syl.elements.syllabus.value?.[0]?.codename ===
						teachingAdvice.elements.syllabus.value?.[0]?.codename,
				),
			}
		})
		.filter((item) => !!item.focusArea && !!item.syllabus)
		.map((item) => {
			const link = getLink(item, mappings)

			// make WebLinkTeachingadviceExtended from teaching advice
			return {
				elements: {
					...item.elements,
					updated: item.elements.updated,
					item: {
						linkedItems: focusAreas.linkedItems,
						name: item.system.name,
						type: item.system.type,
						value: [item.system.codename],
					},
				},
				system: item.system,
				extendedTeachingAdvice: item,
				link,
			} as unknown as WebLinkTeachingadviceExtended
		})

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

	const [isFilterShown, toggleIsFilterShown] = useToggle(true)

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

	const selectedFilterTagsSyllabus = useMemo(() => {
		return getSelectedNodesFromData(klaOptions)
	}, [klaOptions])
	const selectedFilterTagsStage = useMemo(() => {
		return getSelectedNodesFromData(stageOptions)
	}, [stageOptions])

	const filteredAdvice = useMemo(() => {
		return extendedWeblinkTeachingAdvices
			.filter(matchesSearch(searchText || ''))
			.filter((advice) => {
				// Filter by stage
				if (!selectedFilterStages.length) return true

				const taxoStages =
					advice.elements.stages__stages.value.map(byTaxoCodename)
				const taxoSyllabusType =
					advice.elements.syllabus_type__items.value.map(
						byTaxoCodename,
					) || []

				return filterAssetSelectedStages(
					selectedFilterStages,
					taxoStages,
					taxoSyllabusType,
				)
			})
			.filter((advice) => {
				// Filter by syllabus
				return selectedFilterSyllabus?.length > 0
					? isIntersect(
							getTaxoCodenames(advice.elements.syllabus),
							selectedFilterSyllabus,
					  )
					: true
			})
	}, [
		extendedWeblinkTeachingAdvices,
		searchText,
		selectedFilterStages,
		selectedFilterSyllabus,
	])

	const filteredAssets = useMemo(() => {
		return assets
			.filter((asset) => {
				if (!searchText) return true
				// Filter by search text
				return [
					asset.title,
					asset.fileName,
					...asset.descriptions.map((d) => d.description),
					...asset.syllabus.map(byTaxoName),
				]
					.join()
					.toLowerCase()
					.includes(searchText.toLowerCase())
			})
			.filter((asset) => {
				// Filter by stage
				if (!selectedFilterStages.length) return true

				const taxoStages = asset.stage.map(byTaxoCodename)
				const taxoSyllabusType =
					asset.syllabustype?.map(byTaxoCodename) || []

				return filterAssetSelectedStages(
					selectedFilterStages,
					taxoStages,
					taxoSyllabusType,
				)
			})
			.filter((asset) => {
				// Filter by Syllabus

				return selectedFilterSyllabus?.length > 0
					? isIntersect(
							getTaxoCodenamesFromTaxoTerms(asset.syllabus),
							selectedFilterSyllabus,
					  )
					: true
			})
	}, [assets, searchText, selectedFilterStages, selectedFilterSyllabus])

	const combinedFilteredItems = useMemo<TeachingAdvicePageItem[]>(() => {
		return [...filteredAdvice, ...filteredAssets]
	}, [filteredAdvice, filteredAssets])

	const paginatedCombinedFilteredItems = useMemo(() => {
		return combinedFilteredItems.slice(
			(qPageInt - 1) * WP_TA_RESOURCE_PAGE_SIZE,
			qPageInt * WP_TA_RESOURCE_PAGE_SIZE,
		)
	}, [combinedFilteredItems, qPageInt])

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
		files: combinedFilteredItems
			.filter(isAssetWithRawElement)
			.map((resource) => {
				return {
					id: resource.id,
					size: resource.size,
				}
			}),
		downloadCustomResourceSyllabusName: 'teaching advice',
		syllabuses: selectedFilterSyllabus,
		stages: selectedFilterStages,
	})

	const hiddenFields = useMemo<DownloadListField[]>(() => {
		const defaultHiddens: DownloadListField[] = [
			'fileType',
			'resourceType',
			'year',
			'fileSize',
		]
		if (isScreenDownLg) {
			return [...defaultHiddens, 'syllabus', 'stage', 'date']
		}
		return isFilterShown
			? [...defaultHiddens, 'stage', 'date']
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

	const resetSelectionAndPage = useCallback(async () => {
		await resetPageAndScroll()
	}, [resetPageAndScroll])

	const getFnForHandleDropdown = useCallback(
		(handler: ITreeMultiSelectProps['onChange']) => {
			return async (
				currentNode: TreeNode,
				selectedNodes: TreeNode[],
				selectedChildNodes: TreeNode[],
			) => {
				handler(currentNode, selectedNodes, selectedChildNodes)
				await resetSelectionAndPage()
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

			<div ref={refScrollHereAfterFilter} className="my-8">
				<GridWrapper>
					<GridCol md={8}>
						<SearchBar
							initialSearchText={searchText || ''}
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
							totalItems={combinedFilteredItems.length}
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
							total={combinedFilteredItems.length}
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
							{(selectedFilterTagsSyllabus.length > 0 ||
								selectedFilterTagsStage.length > 0) && (
								<div>
									<TagListTreeMultiSelectWrapper
										showClearButton={
											getArrayLength(
												selectedFilterTagsStage,
											) +
												getArrayLength(
													selectedFilterTagsSyllabus,
												) >
											1
										}
										onClearClick={handleReset}
									>
										{selectedFilterTagsStage.length > 0 && (
											<TagListTreeMultiSelectNode
												list={selectedFilterTagsStage}
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
										{selectedFilterTagsSyllabus.length >
											0 && (
											<TagListTreeMultiSelectNode
												list={
													selectedFilterTagsSyllabus
												}
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
							files={paginatedCombinedFilteredItems}
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
							rowCount={combinedFilteredItems.length}
							paginationMode="server"
							showSelectAllCheckbox
							keepNonExistentRowsSelected
						/>
						{!combinedFilteredItems.length && (
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

export default WpTeachingadvice
