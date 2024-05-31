/* eslint-disable react-hooks/exhaustive-deps */
import InPageNav from '@/components/InPageNav'
import {
	Glossary,
	Syllabus,
	Weblinkext,
	Weblinkvideo,
} from '@/kontent/content-types'
import { TaxoStage } from '@/kontent/taxonomies/stage'
import { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { useGlossary } from '@/legacy-ported/components/base/Glossary'
import GlossaryBody from '@/legacy-ported/components/base/GlossaryBody'
import GlossaryHeader from '@/legacy-ported/components/base/GlossaryHeader'
import TabBar from '@/legacy-ported/components/tabs/TabBar'
import { SyllabusTabPanel } from '@/legacy-ported/components/tabs/TabPanel'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import { ISyllabusTab } from '@/legacy-ported/types'
import setTabNavigation from '@/legacy-ported/utilities/hooks/useTabNavigation'
import {
	AssetWithRawElements,
	CustomSyllabusTab,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	byTaxoCodename,
	compareValueWithMultipleChoiceCodename,
	convertGlossaryToIGlossary,
	getTaxoCodenames,
	isIntersect,
	isRichtextElementEmpty,
} from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames,
	getVideoLinkOrExtLinkOrAssetStageTaxoCodenames,
} from '@/utils/assets'
import { isLifeSkillSyllabus } from '@/utils/syllabus'
import {
	isAssetWithRawElement,
	isWebLinkVideo,
	isWebLinkext,
} from '@/utils/type_predicates'
import {
	ElementModels,
	IContentItemsContainer,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { useRouter } from 'next/router'
import { ParsedQs } from 'qs'
import { useEffect, useId, useMemo, useState } from 'react'
import NonFullWidthWrapper from './NonFullWidthWrapper'
import RichText from './RichText'
import SyllabusTeachingLearningSupport from './SyllabusTeachingLearningSupport'
import { SyllabusAssessment } from './assessment/SyllabusAssessment'
import { AssetsProvider } from './contexts/AssetsProvider'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from './contexts/KontentHomeConfigProvider'
import { RichtextSectionProps } from './sections'
import { SyllabusSectionFocusarea } from './syllabus-sections/SyllabusSectionFocusarea'
import { SyllabusSectionOutcome } from './syllabus-sections/SyllabusSectionOutcome'
import { StagesChips } from './ui/stage/StageChips'

// const useStyles = makeStyles((theme) => ({
// 	root: {
// 		flexGrow: 1,
// 		width: '100%',
// 		backgroundColor: theme.palette.background.paper,
// 	},
// }))

export interface SyllabusViewProps {
	//syllabus
	syllabus: Syllabus

	// linked items
	linkedItems: RichtextSectionProps<any>['linkedItems']

	// all stages
	allStages:
		| ElementModels.TaxonomyTerm<TaxoStage>[]
		| ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]

	// all stage groups
	allStageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]

	// all assets
	allAssets: AssetWithRawElements[]

	// all glossaries
	allGlossaries: Responses.IListContentItemsResponse<Glossary>

	allWebLinkVideos?: Weblinkvideo[]

	allWebLinkExternals?: Weblinkext[]

	/** Current selected tabs based on the options (edit view) or query string */
	currentTabs: ISyllabusTab[]

	/** Current selected stages based on the options (edit view) or query string */
	currentStages: TaxoStageWithLifeSkill[]

	/** Current selected options based on the query string */
	currentOptions: ParsedQs

	/** Toggle to show current stages tags/pills  */
	showCurrentStagesTags?: boolean

	initialTab?: CustomSyllabusTab

	/** Initial stage that needs to be opened (from `stage` query string) */
	initialStageCodename?: TaxoStageWithLifeSkill

	/** Initial year that needs to be opened (from `year` query string) */
	initialYearCodename?: TaxoStageYearWithLifeSkill

	enableContentCurrentlyViewing?: boolean

	/** is parent page a custom view */
	isParentCustomView?: boolean
}

export const getFocusAreasWithRelatedSyllabusFocusAreas = (
	syllabus: Syllabus,
	linkedItems: IContentItemsContainer,
) => {
	const focusAreas =
		getLinkedItems(syllabus.elements.focus_areas, linkedItems) || []
	const relatedSyllabuses = getLinkedItems(
		syllabus.elements.relatedlifeskillssyllabus,
		linkedItems,
	)
	relatedSyllabuses?.forEach((relatedSyllabus) => {
		const relatedSyllabusFocusAreas = getLinkedItems(
			relatedSyllabus.elements.focus_areas,
			linkedItems,
		)
		relatedSyllabusFocusAreas.forEach((relatedSyllabusFocusArea) => {
			if (
				focusAreas.some(
					(focusArea) =>
						focusArea.system.codename !==
						relatedSyllabusFocusArea.system.codename,
				)
			) {
				focusAreas.push(relatedSyllabusFocusArea)
			}
		})
	})
	return focusAreas
}

export const getOutcomesWithRelatedSyllabusOutcomes = (
	syllabus: Syllabus,
	currentStages: TaxoStageWithLifeSkill[],
	linkedItems: IContentItemsContainer,
) => {
	const outcomes = getLinkedItems(
		syllabus.elements.outcomes,
		linkedItems,
	)?.filter((outcome) => {
		return (
			outcome.elements.stages__stages.value.some((t) =>
				currentStages.includes(t.codename),
			) ||
			(currentStages.includes('life_skills') &&
				compareValueWithMultipleChoiceCodename(
					outcome.elements.syllabus_type__items,
					'life_skills',
				))
		)
	})
	const relatedSyllabuses = getLinkedItems(
		syllabus.elements.relatedlifeskillssyllabus,
		linkedItems,
	)
	relatedSyllabuses?.forEach((relatedSyllabus) => {
		const relatedSyllabusOutcomes = getLinkedItems(
			relatedSyllabus.elements.outcomes,
			linkedItems,
		)
		relatedSyllabusOutcomes.forEach((relatedSyllabusOutcome) => {
			if (
				outcomes.some(
					(focusArea) =>
						focusArea.system.codename !==
						relatedSyllabusOutcome.system.codename,
				)
			) {
				outcomes.push(relatedSyllabusOutcome)
			}
		})
	})

	return outcomes
}

export const SyllabusView = (props: SyllabusViewProps) => {
	const router = useRouter()
	const {
		allAssets,
		allGlossaries,
		allStageGroups,
		allStages,
		allWebLinkVideos = [],
		allWebLinkExternals = [],
		currentStages,
		currentTabs,
		linkedItems,
		// mappings,
		syllabus,
		currentOptions,
		showCurrentStagesTags = false,
		initialTab,
		initialStageCodename,
		initialYearCodename,
		enableContentCurrentlyViewing = false,
		isParentCustomView = false,
		// config,
	} = props

	const { config, mappings, preview } = useKontentHomeConfig()

	const [tabValue, setTabValue] = useState(initialTab || SYLLABUS_TABS[0].id)
	const terms = convertGlossaryToIGlossary(allGlossaries.items)
	const [glossaryHeaderProps, glossaryFilter] = useGlossary({
		sections: terms,
		syllabusFilter: getTaxoCodenames(syllabus.elements.syllabus),
	})

	// Computed
	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)

	const taxoSyllabusCodenamesOfCurrentSyllabus = useMemo(() => {
		return syllabus.elements.syllabus.value.map(byTaxoCodename)
	}, [syllabus.system.codename])

	const taxoSyllabusCodenamesOfCurrentSyllabusAndRelatedLSSyllabus =
		useMemo(() => {
			const relatedLS = getLinkedItems(
				syllabus.elements.relatedlifeskillssyllabus,
				linkedItems,
			)
			return [
				...taxoSyllabusCodenamesOfCurrentSyllabus,
				...relatedLS.flatMap((syl) =>
					syl.elements.syllabus.value.map(byTaxoCodename),
				),
			]
		}, [taxoSyllabusCodenamesOfCurrentSyllabus, syllabus.system.codename])

	const syllabusAssets = useMemo(() => {
		return [
			...(allAssets?.filter((asset) => {
				const assetSyllabus = asset.syllabus.map(byTaxoCodename)

				return isIntersect(
					assetSyllabus,
					taxoSyllabusCodenamesOfCurrentSyllabusAndRelatedLSSyllabus,
				)
			}) || []),
			...allWebLinkVideos,
			...allWebLinkExternals,
		]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		allAssets.map((asset) => asset.id).join(),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		taxoSyllabusCodenamesOfCurrentSyllabus.join(),
	])
	const typeFileOnlySyllabusAssets: AssetWithRawElements[] = syllabusAssets
		.filter((asset) => !(isWebLinkVideo(asset) || isWebLinkext(asset)))
		.map((item) => item as AssetWithRawElements)

	const teachingSupportAssets = useMemo(() => {
		const currentStagesForAssets = currentStages.reduce(
			(acc, currentStage) => {
				if (currentStage === 'life_skills' && isLifeSkillsSyl) {
					return [...acc, 'stage_6']
				}
				return [...acc, currentStage]
			},
			[],
		)

		return (
			syllabusAssets
				// strictly only for the syllabus (excluding the related syllabus)
				.filter((asset) => {
					const assetSyllabus = isAssetWithRawElement(asset)
						? asset.syllabus.map(byTaxoCodename)
						: asset.elements.syllabus.value.map(byTaxoCodename)

					return isIntersect(
						assetSyllabus,
						taxoSyllabusCodenamesOfCurrentSyllabus,
					)
				})
				.filter((asset) => {
					const assetStageTaxos =
						getVideoLinkOrExtLinkOrAssetStageTaxoCodenames(asset)
					const assetResourceTypeTaxos =
						getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames(
							asset,
						)
					return (
						assetResourceTypeTaxos.length &&
						!assetResourceTypeTaxos.some(
							(t) => t === 'web_resource',
						) &&
						(!assetStageTaxos.length ||
							isIntersect(
								currentStagesForAssets,
								assetStageTaxos,
							))
					)
				})
		)
		/* eslint-disable react-hooks/exhaustive-deps */
	}, [
		syllabusAssets
			.map((asset) =>
				isWebLinkVideo(asset) || isWebLinkext(asset)
					? asset.system.id
					: asset.id,
			)
			.join(),
	])

	// current taxo term of taxo stages
	const currentTaxoTermStages = allStages.filter((s) =>
		currentStages.includes(s.codename),
	)

	// Methods
	const handleTabChange = (newTabValue: CustomSyllabusTab) => {
		setTabValue(newTabValue)
	}

	const handleTabPrevious = () => {
		const newTab = setTabNavigation(currentTabs, tabValue, 'PREVIOUS')
		if (newTab) {
			setTabValue(newTab?.id)
		}
	}

	const handleTabNext = () => {
		const newTab = setTabNavigation(currentTabs, tabValue, 'NEXT')
		if (newTab) {
			setTabValue(newTab?.id)
		}
	}
	const isShowSyllabusTab = (tabIndex: number) => {
		return currentTabs.some((c) => c.id === SYLLABUS_TABS?.[tabIndex]?.id)
	}

	// Effect
	// useRouter is a react hook, it catches up to the current query on ReactDOM.hydrate.
	// so we need to use useEffect and "watch" initialTab change
	// https://github.com/vercel/next.js/discussions/11484#discussioncomment-2362
	useEffect(() => {
		if (initialTab) {
			setTabValue(initialTab)
		}
	}, [initialTab])

	const syllabusGroupId = useId()
	return (
		<AssetsProvider assets={allAssets}>
			<TabBar
				value={tabValue}
				onChange={handleTabChange}
				tabs={currentTabs.map((tab) => ({
					tabId: tab.id,
					label: tab.name,
					panelId: `tab-panel-${tab.id}-${syllabusGroupId}`,
					className: `${
						tab.id === tabValue
							? 'syllabus-header__tab--selected'
							: 'syllabus-header__tab'
					}`,
				}))}
				className="w-full bg-nsw-off-white lg:bg-white syllabus-header__tab-bar"
				onPreviousClick={handleTabPrevious}
				onNextClick={handleTabNext}
				enableLinkTab
			/>

			{/* course-overview */}
			{isShowSyllabusTab(0) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[0].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[0].id}
					tabValue={tabValue}
				>
					<h2>Course overview</h2>

					<div key={syllabus.system.id}>
						<NonFullWidthWrapper>
							<RichText
								currentPath={router.asPath}
								mappings={mappings}
								data-kontent-item-id={syllabus.system.id}
								data-kontent-element-codename="web_content_rtb__content"
								linkedItems={linkedItems}
								className="cms-content-formatting"
								richTextElement={
									syllabus.elements.web_content_rtb__content
								}
								suffixForHeading={syllabus.system.codename}
								renderFnBefore={(nodes) => {
									return (
										<InPageNav
											richTextElements={
												nodes as JSX.Element[]
											}
										/>
									)
								}}
							/>
						</NonFullWidthWrapper>
					</div>
				</SyllabusTabPanel>
			)}

			{/* rationale */}
			{isShowSyllabusTab(1) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[1].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[1].id}
					tabValue={tabValue}
				>
					<h2 className="mb-8">Rationale</h2>
					<NonFullWidthWrapper className="-mt-4">
						<RichText
							currentPath={router.asPath}
							mappings={mappings}
							data-kontent-item-id={syllabus.system.id}
							data-kontent-element-codename="rationale"
							linkedItems={linkedItems}
							className="cms-content-formatting"
							richTextElement={syllabus.elements.rationale}
						/>
					</NonFullWidthWrapper>
				</SyllabusTabPanel>
			)}

			{/* aim */}
			{isShowSyllabusTab(2) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[2].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[2].id}
					tabValue={tabValue}
				>
					<h2 className="mb-8">Aim</h2>
					<NonFullWidthWrapper className="-mt-4">
						<RichText
							currentPath={router.asPath}
							mappings={mappings}
							data-kontent-item-id={syllabus.system.id}
							data-kontent-element-codename="aim"
							linkedItems={linkedItems}
							className="cms-content-formatting"
							richTextElement={syllabus.elements.aim}
						/>
					</NonFullWidthWrapper>
				</SyllabusTabPanel>
			)}

			{/* outcomes */}
			{isShowSyllabusTab(3) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[3].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[3].id}
					tabValue={tabValue}
				>
					<SyllabusSectionOutcome
						syllabus={syllabus}
						currentStages={currentStages}
						allStageGroups={allStageGroups}
						allStages={allStages}
						isInitialLifeSkillBasedOnSelectedStage={
							isParentCustomView
						}
					></SyllabusSectionOutcome>
				</SyllabusTabPanel>
			)}

			{/* content-organisers */}
			{isShowSyllabusTab(4) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[4].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[4].id}
					tabValue={tabValue}
				>
					<SyllabusSectionFocusarea
						allStages={allStages}
						currentOptions={currentOptions}
						currentStages={currentStages}
						initialStageCodename={initialStageCodename}
						initialYearCodename={initialYearCodename}
						syllabus={syllabus}
						syllabusAssets={typeFileOnlySyllabusAssets}
						enableContentCurrentlyViewing={
							enableContentCurrentlyViewing
						}
						isFocusAreaNavigateInView={isParentCustomView}
					/>
				</SyllabusTabPanel>
			)}

			{/* assessment */}
			{isShowSyllabusTab(5) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[5].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[5].id}
					tabValue={tabValue}
				>
					<h2 className="mb-8">Assessment</h2>
					{showCurrentStagesTags && (
						<div className="flex gap-2 items-center my-8">
							<StagesChips
								stages={currentTaxoTermStages.filter(
									(stage) => {
										return syllabus.elements.stages__stages.value
											.map(byTaxoCodename)
											.some((s) => s === stage.codename)
									},
								)}
							/>
						</div>
					)}
					<SyllabusAssessment
						syllabus={syllabus}
						mappings={mappings}
						linkedItems={linkedItems}
						currentStages={currentStages}
					/>
				</SyllabusTabPanel>
			)}

			{/* glossary */}
			{isShowSyllabusTab(6) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[6].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[6].id}
					tabValue={tabValue}
				>
					<h2 className="mb-2">Glossary</h2>
					{!!config.item.elements.glossary_intro &&
						!isRichtextElementEmpty(
							config.item.elements.glossary_intro,
						) && (
							<NonFullWidthWrapper>
								<RichText
									mappings={mappings}
									linkedItems={config.linkedItems}
									className="w-full cms-content-formatting"
									richTextElement={
										config.item.elements.glossary_intro
									}
								/>
							</NonFullWidthWrapper>
						)}
					<div className="space-y-8">
						<GlossaryHeader {...glossaryHeaderProps} />
						<GlossaryBody
							sections={glossaryFilter(terms)}
							glossaryLinkedItems={allGlossaries.linkedItems}
						/>
					</div>
				</SyllabusTabPanel>
			)}

			{/* teaching-and-learning */}
			{isShowSyllabusTab(7) && (
				<SyllabusTabPanel
					panelId={`tab-panel-${SYLLABUS_TABS[7].id}-${syllabusGroupId}`}
					id={SYLLABUS_TABS[7].id}
					tabValue={tabValue}
				>
					<h2 className="mb-8">Teaching and learning support</h2>
					<SyllabusTeachingLearningSupport
						files={teachingSupportAssets}
						allStages={currentTaxoTermStages.filter((stage) => {
							return stage.codename !== 'life_skills'
						})}
						className="mt-8"
						syllabus={syllabus}
						isPreviewMode={preview}
					/>
				</SyllabusTabPanel>
			)}
		</AssetsProvider>
	)
}

export default SyllabusView
