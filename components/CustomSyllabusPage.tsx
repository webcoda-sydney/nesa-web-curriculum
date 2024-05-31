import { DownloadViewModal } from '@/components/modals/DownloadViewModal'
import {
	EditViewModal,
	useEditViewModal,
	ViewSelection,
} from '@/components/modals/EditViewModal'
import { CURRICULUM_SLUGS } from '@/constants'
import useDisabledLearningAreasAndStages from '@/hooks/useDisabledLearningAreasAndStages'
import { useToggle } from '@/hooks/useToggle'
import { Syllabus } from '@/kontent/content-types'
import { TaxoStage } from '@/kontent/taxonomies'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import { ISyllabusTab } from '@/legacy-ported/types'
import {
	customSyllabusQueryString,
	stringCompare,
} from '@/legacy-ported/utilities/functions'
import {
	CommonPageProps,
	CustomSyllabusTab,
	KontentCurriculumCommonResultData,
	TaxoStageWithLifeSkill,
} from '@/types'
import {
	byIContentItemCodename,
	byTaxoCodename,
	filterPreviewableSyllabusesOnly,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	isRichtextElementEmpty,
	isYes,
} from '@/utils'
import { getUrlFromSlugs } from '@/utils/getUrlFromMapping'
import { isLifeSkillSyllabus } from '@/utils/syllabus'
import { ElementModels, Responses } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { NextRouter, useRouter } from 'next/router'
import { Alert } from 'nsw-ds-react'
import { parse, ParsedQs } from 'qs'
import { useEffect, useMemo, useState } from 'react'
import { AsyncSyllabusView } from './AsyncSyllabusView'
import { getLinkedItems } from './contexts/KontentHomeConfigProvider'
import RichText from './RichText'
import { SyllabusHeader } from './SyllabusHeader'
import { StagesChips } from './ui/stage/StageChips'

export interface CustomSyllabusPageProps
	extends CommonPageProps<any, KontentCurriculumCommonResultData<any>> {
	initialSelectedStages?: TaxoStageWithLifeSkill[]
	initialSelectedTabs?: CustomSyllabusTab[]
}

export const TAGS_TAB: ISyllabusTab = {
	id: 'tags',
	index: SYLLABUS_TABS.length,
	name: 'Tags',
}

export type StageWithSyllabuses = ElementModels.TaxonomyTerm<TaxoStage> & {
	syllabuses: Syllabus[]
}

export const getQueryOnlyFromRouter = (router: NextRouter): string => {
	const regexRootPath = new RegExp(`^${router.pathname}`, '')
	return router.asPath.replace(regexRootPath, '')
}

export const getQueriesAsCommaSeparatedStr = (query: string | object) => {
	let result = ''
	if (Array.isArray(query)) {
		result = query.join(',')
	}
	if (typeof query === 'object') {
		result = Object.values(query).join(',')
	}
	return result
}

export const getSyllabusTabForTabsQueryString = (
	tabIdsFromQueryString: CustomSyllabusTab[],
) => {
	return SYLLABUS_TABS.find((t) => tabIdsFromQueryString.includes(t.id))?.id
}

const getSyllabusAccordionItemStatus = (
	syllabus: Syllabus,
	currentStages: TaxoStageWithLifeSkill[],
) => {
	/**
	 * 1. If MS S6 syllabus is selected, we ensure S6 and LS are selected
	 * 2. If LS S6 syllabus is selected we ensure S6 is selected
	 * 3. If K-10 syllabus is slected we ensure ES1, S1, S2, S3, S4 or S5 is selected
	 */
	let message = ''
	let disabled = false

	const isExternalSyllabus = isYes(syllabus.elements.doredirect)
	const isLifeSkillSyl = isLifeSkillSyllabus(syllabus)
	const isPreviewableSyllabus = filterPreviewableSyllabusesOnly(syllabus)
	if (
		isExternalSyllabus &&
		(!isAllowPreviewExternalSyllabus() || !isPreviewableSyllabus)
	) {
		return {
			message: 'Coming soon',
			disabled: true,
		}
	}

	if (isLifeSkillSyl) {
		disabled = !(
			['stage_6', 'life_skills'] as TaxoStageWithLifeSkill[]
		).every((stage) => currentStages.includes(stage))
		if (disabled) {
			message =
				'Edit view to select "Stage 6" and "Life Skills" to view the Stage 6 Life Skills syllabuses'
		}
	} else {
		disabled = !isIntersect(
			syllabus.elements.stages__stages.value.map(byTaxoCodename),
			currentStages,
		)
		if (disabled) {
			message = 'No content available for this selection'
		}
	}

	return {
		message,
		disabled,
	}
}

export const CustomSyllabusPage = (props: CustomSyllabusPageProps) => {
	const {
		data,
		mappings,
		initialSelectedStages,
		initialSelectedTabs,
		preview,
	} = props
	const {
		stageGroups: allStageGroups,
		stages: allStages,
		assets: allAssets,
		glossaries: allGlossaries,
		syllabuses: allSyllabuses,
		keyLearningAreas: allKeyLearningAreas,
		config,
	} = data
	const router = useRouter()
	const query = getQueryOnlyFromRouter(router)
	const parsedQuery = parse(query, { ignoreQueryPrefix: true })
	const syllabusesIds = (parsedQuery.syllabuses as string[]) ?? []
	const tabIds = ((initialSelectedTabs || parsedQuery.tabs) ??
		[]) as CustomSyllabusTab[]
	const tabIdsStr = Array.isArray(tabIds)
		? tabIds.join(',')
		: (tabIds as string)
	const currentStages =
		(initialSelectedStages ||
			(parsedQuery.stages as TaxoStage[] | undefined)) ??
		[]

	// add Content tab if access-points or examples tabs are added
	if (
		!tabIds.includes('content') &&
		(tabIds.includes('access-points') ||
			tabIds.includes('examples') ||
			tabIds.includes('teaching-advice') ||
			tabIds.includes('tags'))
	) {
		tabIds.push('content')
	}

	const currentTabs = SYLLABUS_TABS.filter((t) =>
		tabIds.includes(t.id as CustomSyllabusTab),
	)
	const [tabValue, setTabValue] = useState(
		getSyllabusTabForTabsQueryString(tabIds),
	)
	const [options] = useState<ParsedQs>()

	// Modals
	const {
		displayEditViewModal,
		toggleEditOverlay,
		setDisplayEditViewModal,
		handleCancel,
	} = useEditViewModal(false)

	// Download View
	const [showDownloadOverlay, toggleDownloadOverlay] = useToggle(false)

	// Computed
	const _isAllowPreviewExternalSyllabusInSetting =
		isAllowPreviewExternalSyllabus()

	const { disabledStages, disabledLearningAreas } =
		useDisabledLearningAreasAndStages(config)

	const syllabuses: Responses.IListContentItemsResponse<Syllabus> = {
		...allSyllabuses,
		items: allSyllabuses.items
			.filter(
				(s) =>
					!isIntersect(
						disabledLearningAreas,
						s.elements.key_learning_area__items.value.map(
							byTaxoCodename,
						),
					),
			)
			.filter((s) => {
				// filter by syllabus selections
				if (!syllabusesIds.length) return true
				return (
					syllabusesIds?.length &&
					syllabusesIds.includes(s.system.codename)
				)
			})
			.filter((s) => {
				if (syllabusesIds.length || !currentStages.length) return true
				return isIntersect(
					currentStages,
					s.elements.stages__stages.value.map(byTaxoCodename),
				)
			}),
	}

	const allSyllabusesWithPreview = useMemo(() => {
		return _isAllowPreviewExternalSyllabusInSetting
			? allSyllabuses.items.filter(filterPreviewableSyllabusesOnly)
			: allSyllabuses.items
	}, [_isAllowPreviewExternalSyllabusInSetting, allSyllabuses.items])

	const handleEditViewModalConfirm = (selectedItems: ViewSelection) => {
		router.push({
			pathname: getUrlFromSlugs(CURRICULUM_SLUGS.CUSTOM_SYLLABUSES),
			search: customSyllabusQueryString({
				stageIds: selectedItems.stages,
				tabIds: selectedItems.tabs,
				tagIds: selectedItems.tags,
				syllabusIds: selectedItems.syllabuses,
			}),
		})
		setDisplayEditViewModal(false)
		// If current tab is now hidden, select first visible tab
		if (!selectedItems.tabs.some((t) => t === tabValue)) {
			setTabValue(selectedItems.tabs[0])
		}
	}

	const internalSyllabuses =
		syllabuses?.items?.filter((syl) => {
			if (_isAllowPreviewExternalSyllabusInSetting) {
				const isPreviewable = filterPreviewableSyllabusesOnly(syl)
				return isPreviewable
			}
			return !isYes(syl.elements.doredirect)
		}) || []
	const internalSyllabusesCodenames = internalSyllabuses.map(
		byIContentItemCodename,
	)

	useEffect(() => {
		const _tabIds = tabIdsStr.split(',') as CustomSyllabusTab[]
		if (tabIdsStr) {
			setTabValue(getSyllabusTabForTabsQueryString(_tabIds))
		}
	}, [tabIdsStr])

	const renderAccordionContent =
		(syllabus: Syllabus) => (expandStatus: boolean) => {
			const relatedLifeSkillSyllabuses = getLinkedItems(
				syllabus.elements.relatedlifeskillssyllabus,
				syllabuses.linkedItems,
			)
			const taxoSyllabusesOfSyllabusAndRelatedSyllabuses = [
				...syllabus.elements.syllabus.value.map(byTaxoCodename),
				...(relatedLifeSkillSyllabuses?.flatMap((relatedSyllabus) =>
					relatedSyllabus.elements.syllabus.value.map(byTaxoCodename),
				) || []),
			]

			const assets = allAssets.filter((asset) => {
				return (
					asset.syllabus.some((taxoSyl) => {
						return taxoSyllabusesOfSyllabusAndRelatedSyllabuses.includes(
							taxoSyl.codename,
						)
					}) &&
					asset.resource_type.length &&
					asset.resource_type.every(
						(rt) => !rt.codename.includes('ace_'),
					)
				)
			})

			return (
				<>
					{expandStatus && (
						<AsyncSyllabusView
							syllabusCodename={syllabus.system.codename}
							allAssets={assets}
							allGlossaries={allGlossaries}
							allStageGroups={allStageGroups}
							allStages={allStages}
							currentOptions={options}
							currentStages={currentStages}
							currentTabs={currentTabs}
							initialTab={tabValue}
							enableContentCurrentlyViewing
							slotBefore={
								<>
									{syllabus.elements.implementation_title
										.value &&
										!isRichtextElementEmpty(
											syllabus.elements
												.implementation_info,
										) && (
											<Alert
												className="mb-8"
												title={
													syllabus.elements
														.implementation_title
														.value
												}
												as="info"
												css={{
													h4: {
														fontSize: '1rem',
													},
												}}
											>
												<div className="mt-3">
													<RichText
														richTextElement={
															syllabus.elements
																.implementation_info
														}
														linkedItems={
															syllabuses.linkedItems
														}
														mappings={mappings}
													/>
												</div>
											</Alert>
										)}
								</>
							}
						/>
					)}
				</>
			)
		}

	return (
		<>
			<noscript>
				<h1 className="sr-only">Custom syllabuses</h1>
			</noscript>

			{query && syllabuses?.items?.length > 0 ? (
				<>
					<SyllabusHeader
						title="Custom syllabus view"
						onEditViewClick={toggleEditOverlay}
						onDownloadViewClick={toggleDownloadOverlay}
						slotAfterTitle={
							<StagesChips
								css={{
									'&&': {
										marginTop: '1.5rem',
										marginBottom: '1.5rem',
									},
									'.nsw-tag': {
										borderColor: 'currentColor',
										color: '#fff',
									},
								}}
								stages={allStages.filter((s) =>
									currentStages.includes(s.codename),
								)}
							/>
						}
					/>
					<div className="nsw-container pt-8">
						<div className="syllabus-header__tabs">
							{syllabuses.items
								.sort((a, b) =>
									stringCompare(
										a.elements.title.value,
										b.elements.title.value,
									),
								)
								.sort((a, b) => {
									if (
										_isAllowPreviewExternalSyllabusInSetting
									) {
										const isPreviewableA =
											filterPreviewableSyllabusesOnly(a)
										const isPreviewableB =
											filterPreviewableSyllabusesOnly(b)

										if (isPreviewableA && !isPreviewableB)
											return -1
										if (!isPreviewableA && isPreviewableB)
											return 1
									}
									return 0
								})
								.sort((a, b) => {
									const { disabled: disabledA } =
										getSyllabusAccordionItemStatus(
											a,
											currentStages,
										)
									const { disabled: disabledB } =
										getSyllabusAccordionItemStatus(
											b,
											currentStages,
										)
									if (disabledA && !disabledB) return 1
									if (!disabledA && disabledB) return -1
									return 0
								})
								.map((syllabus) => {
									const isExternalSyllabus = isYes(
										syllabus.elements.doredirect,
									)

									const showExternalUrl =
										_isAllowPreviewExternalSyllabusInSetting
											? !filterPreviewableSyllabusesOnly(
													syllabus,
											  )
											: isExternalSyllabus
									const { message, disabled } =
										getSyllabusAccordionItemStatus(
											syllabus,
											currentStages,
										)

									return (
										<CustomAccordion
											id={syllabus.system.id}
											key={syllabus.system.id}
											title={
												syllabus.elements.title.value
											}
											disabled={disabled}
											titleNote={message}
											externalUrl={
												showExternalUrl
													? syllabus.elements
															.redirecturl.value
													: ''
											}
											renderFn={renderAccordionContent(
												syllabus,
											)}
										></CustomAccordion>
									)
								})}
						</div>
					</div>
				</>
			) : (
				<Grid container justifyContent="center">
					<div className="mt-4 font-bold">No results found</div>
				</Grid>
			)}
			{displayEditViewModal && (
				<EditViewModal
					modalStatus={displayEditViewModal}
					onConfirm={handleEditViewModalConfirm}
					onCancel={handleCancel}
					selectedElements={tabIds}
					selectedSyllabuses={internalSyllabusesCodenames}
					selectedStages={currentStages}
					syllabuses={allSyllabusesWithPreview}
					keyLearningAreas={allKeyLearningAreas}
					stages={allStages}
					disabledStages={disabledStages}
					disabledLearningAreas={disabledLearningAreas}
				/>
			)}
			{showDownloadOverlay && (
				<DownloadViewModal
					modalStatus={showDownloadOverlay}
					onCancel={toggleDownloadOverlay}
					selectedElements={[]}
					selectedSyllabuses={internalSyllabusesCodenames}
					selectedStages={currentStages}
					syllabuses={allSyllabusesWithPreview}
					keyLearningAreas={allKeyLearningAreas}
					stages={allStages}
					disabledStages={disabledStages}
					disabledLearningAreas={disabledLearningAreas}
					isPreviewMode={preview}
				/>
			)}
		</>
	)
}
