/* eslint-disable react-hooks/exhaustive-deps */
import { CURRICULUM_SLUGS } from '@/constants'
import { STYLES } from '@/constants/styles'
import useDisabledLearningAreasAndStages from '@/hooks/useDisabledLearningAreasAndStages'
import { useToggle } from '@/hooks/useToggle'
import { Syllabus, WpHomepage } from '@/kontent/content-types'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import { SYLLABUS_TABS } from '@/legacy-ported/constants'
import { ISyllabusTab } from '@/legacy-ported/types'
import { customSyllabusQueryString } from '@/legacy-ported/utilities/functions'
import { getTitleWithSuffix } from '@/pages/_app'
import {
	CustomSyllabusTab,
	IPropWithClassNameChildren,
	Mapping,
	SyllabusTab,
	TaxoStageWithLifeSkill,
} from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import {
	getSeoDescriptionFieldKeyByTab,
	getTagFromYears,
	getTaxoCodenames,
	isRichtextElementEmpty,
} from '@/utils'
import { getSyllabusUrlFromMappingBySyllabusCodename } from '@/utils/getSyllabusUrlFromMapping'
import { getUrlFromSlugs } from '@/utils/getUrlFromMapping'
import { isFocusarea } from '@/utils/type_predicates'
import {
	ElementModels,
	IContentItemsContainer,
	Responses,
} from '@kontent-ai/delivery-sdk'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Head from 'next/head'
import NextLink from 'next/link'
import { NextRouter, useRouter } from 'next/router'
import { Button } from 'nsw-ds-react'
import { forwardRef, useMemo } from 'react'
import striptags from 'striptags'
import Icon from './Icon'
import Link from './Link'
import RichText from './RichText'
import { SyllabusHeader } from './SyllabusHeader'
import SyllabusNotification from './SyllabusNotification'
import { DownloadViewModal } from './modals/DownloadViewModal'
import {
	EditViewModal,
	ViewSelection,
	useEditViewModal,
} from './modals/EditViewModal'

export interface SyllabusViewNewProps extends IPropWithClassNameChildren {
	config: Responses.IViewContentItemResponse<WpHomepage>
	mappings: Mapping[]
	linkedItems: IContentItemsContainer
	syllabus: Syllabus
	allSyllabuses: Responses.IListContentItemsResponse<Syllabus>
	allKeyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	allStages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	currentTab?: SyllabusTab
	preview?: boolean
}

const addDotAtTheEnd = (text: string) => {
	if (!text) return text

	let result = text.trim()
	if (result[result.length - 1] !== '.') {
		result += '.'
	}
	return result
}

export const useMetaDescriptionSyllabus = ({
	syllabus,
	syllabusTab,
	stage,
	focusAreaOrOptionlist,
}: {
	syllabus: Syllabus
	syllabusTab: ISyllabusTab
	stage?: string
	focusAreaOrOptionlist?: FocusareaOrOptionListOrFocusareoptionExtended
}) => {
	return useMemo(() => {
		const title = syllabus.elements.title?.value

		let seoDescription =
			syllabus.elements[getSeoDescriptionFieldKeyByTab(syllabusTab.id)]
				?.value
		if (
			syllabusTab.id === 'content' &&
			stage &&
			focusAreaOrOptionlist &&
			isFocusarea(focusAreaOrOptionlist) &&
			focusAreaOrOptionlist.elements.seo_description.value
		) {
			if (focusAreaOrOptionlist.elements.seo_description.value) {
				return addDotAtTheEnd(
					focusAreaOrOptionlist.elements.seo_description.value,
				)
			}
		}

		// if there's SEO Description field speicifed, use it
		if (seoDescription) {
			seoDescription = addDotAtTheEnd(seoDescription)
			if (
				syllabusTab.id === 'content' &&
				stage &&
				focusAreaOrOptionlist
			) {
				return `${seoDescription} ${stage} - ${focusAreaOrOptionlist.elements.title.value}.`
			}
			return seoDescription
		}

		let description =
			striptags(syllabus.elements.description?.value || '') ||
			`The syllabus, resources and teaching and learning support materials for ${title} in NSW.`
		description = addDotAtTheEnd(description)

		if (syllabusTab.id === 'content' && stage && focusAreaOrOptionlist) {
			return `${description} ${stage} - ${focusAreaOrOptionlist.elements.title.value}.`
		}
		return `${syllabusTab.name}. ${description}`
	}, [
		syllabus.elements.description?.value,
		syllabus.elements.title?.value,
		syllabusTab.name,
		syllabus.elements.seo_description_aim?.value,
		syllabus.elements.seo_description_assessment?.value,
		syllabus.elements.seo_description_content?.value,
		syllabus.elements.seo_description_glossary?.value,
		syllabus.elements.seo_description_outcomes?.value,
		syllabus.elements.seo_description_overview?.value,
		syllabus.elements.seo_description_rationale?.value,
		syllabus.elements.seo_description_support?.value,
		focusAreaOrOptionlist,
		stage,
	])
}

const TabLink = forwardRef<HTMLAnchorElement, any>((props, ref) => {
	return <Link ref={ref} {...props} scroll={false} />
})

const TabLinkNoPrefetch = forwardRef<HTMLAnchorElement, any>((props, ref) => {
	return <Link ref={ref} {...props} scroll={false} prefetch={false} />
})

export const SyllabusViewNew = (props: SyllabusViewNewProps) => {
	const {
		children,
		syllabus,
		config,
		linkedItems,
		mappings,
		allSyllabuses,
		allKeyLearningAreas,
		allStages,
		preview = false,
		currentTab = SYLLABUS_TABS[0].id,
	} = props
	const router = useRouter()
	const { route, query } = router
	const {
		learningarea: paramLearningArea,
		syllabus: paramSyllabus,
		tab: paramTab,
		stage: paramStage,
		focusarea: paramFocusarea,
	} = (router?.['components']?.[route] as NextRouter)?.query || query
	let _currentTab

	// Computed
	const selectedSyllabuses = useMemo(
		() => [syllabus.system.codename],
		[syllabus.system.codename],
	)

	const { disabledStages, disabledLearningAreas } =
		useDisabledLearningAreasAndStages(config)

	// Edit view
	const { displayEditViewModal, toggleEditOverlay, handleCancel } =
		useEditViewModal(false)

	// Download View
	const [showDownloadOverlay, toggleDownloadOverlay] = useToggle()

	const syllabusTab: ISyllabusTab = SYLLABUS_TABS.find((tab) => {
		if (paramTab === 'overview') return tab.id === 'course-overview'
		return tab.id === paramTab
	})
	if (syllabusTab) {
		let queryTab = paramTab === 'overview' ? 'course-overview' : paramTab
		_currentTab = queryTab || (currentTab as CustomSyllabusTab)
	}

	const taxoStagesCodenamesOfSyllabus = useMemo<
		TaxoStageWithLifeSkill[]
	>(() => {
		const tmp = getTaxoCodenames(syllabus.elements.stages__stages).filter(
			(taxoStage) => !disabledStages.includes(taxoStage),
		) as TaxoStageWithLifeSkill[]
		tmp.push('life_skills')
		return tmp
	}, [disabledStages, syllabus.elements.stages__stages])

	// Events
	const handleEditViewModalConfirm = (selectedItems: ViewSelection) => {
		const tabIds = selectedItems.tabs

		router.push({
			pathname: getUrlFromSlugs(CURRICULUM_SLUGS.CUSTOM_SYLLABUSES),
			search: customSyllabusQueryString({
				stageIds: selectedItems.stages,
				tabIds,
				tagIds: selectedItems.tags,
				syllabusIds: selectedItems.syllabuses,
			}),
		})
	}

	const canonicalUrl = useMemo(() => {
		const syllabusPath = getSyllabusUrlFromMappingBySyllabusCodename(
			mappings,
			syllabus.system.codename,
			true,
			true,
		)
		const otherParams = []
		if (paramTab) {
			otherParams.push(`${paramTab}`)
		}
		if (paramStage) {
			otherParams.push(`${paramStage}`)
		}
		if (paramFocusarea) {
			// focus area canonical is set in the [focusarea]/index.tsx
			return ''
			// otherParams.push(`${paramFocusarea}`)
		}
		const otherSlugs = otherParams.join('/')
		return syllabusPath + (otherSlugs ? `/${otherSlugs}` : '')
	}, [mappings, syllabus.system.codename])

	const metaDescription = useMetaDescriptionSyllabus({
		syllabus,
		syllabusTab,
	})

	const recordOfChangesUrl = `/resources/record-of-changes?syllabus=${syllabus.elements.syllabus.value[0]?.codename}`

	return (
		<>
			<Head>
				<title>
					{getTitleWithSuffix(
						`${syllabus.elements.title.value}${
							syllabusTab ? ` - ${syllabusTab.name}` : ''
						}`,
						config,
					)}
				</title>
				{canonicalUrl && (
					<link key="canonical" rel="canonical" href={canonicalUrl} />
				)}
				<meta name="description" content={metaDescription} />
			</Head>
			<SyllabusHeader
				className="[&_.SyllabusHeader\_\_buttons>*]:flex-shrink-0 [&_.SyllabusHeader\_\_buttons]:flex-wrap"
				pretitle={getTagFromYears(
					syllabus.elements.stages__stage_years.value,
				)}
				title={syllabus.elements.title.value + ' Syllabus'}
				onDownloadViewClick={toggleDownloadOverlay}
				onEditViewClick={toggleEditOverlay}
				slotAfterButtons={
					<NextLink href={recordOfChangesUrl} passHref>
						<Button
							link={recordOfChangesUrl}
							className="flex justify-center"
							style="white"
							css={{
								'& > *': {
									flexShrink: 0,
								},
							}}
							linkComponent="a"
						>
							<span className="mr-2">Record of changes</span>
							<Icon icon="mdi:arrow-right" />
						</Button>
					</NextLink>
				}
			/>
			{syllabus.elements.implementation_title.value &&
				!isRichtextElementEmpty(
					syllabus.elements.implementation_info,
				) && (
					<SyllabusNotification
						title={syllabus.elements.implementation_title.value}
						summary={syllabus.elements.implementation_summary.value}
					>
						<RichText
							richTextElement={
								syllabus.elements.implementation_info
							}
							linkedItems={linkedItems}
							mappings={mappings}
							css={STYLES.DARK_BACKGROUND_RTE}
						/>
					</SyllabusNotification>
				)}

			<div className="nsw-container px-0 lg:px-4 lg:pt-8">
				<Tabs
					className="w-full bg-nsw-off-white lg:bg-white syllabus-header__tab-bar"
					value={_currentTab}
					indicatorColor="secondary"
					variant="scrollable"
					sx={{
						'.MuiTabs-scroller:before': {
							content: '""',
							display: 'block',
							height: 2,
							background: 'var(--nsw-grey-04)',
							position: 'absolute',
							width: '100%',
							left: 0,
							bottom: 0,
						},
						'.MuiTab-root:focus': {
							outlineOffset: '-3px',
						},
					}}
				>
					{SYLLABUS_TABS.map((tab) => {
						let tabSlug =
							tab.id === 'course-overview' ? 'overview' : tab.id

						return (
							<Tab
								key={tab.id}
								href={`/learning-areas/${paramLearningArea}/${paramSyllabus}/${tabSlug}`}
								label={tab.name}
								value={tab.id}
								LinkComponent={
									preview ? TabLinkNoPrefetch : TabLink
								}
							></Tab>
						)
					})}
				</Tabs>
				{children}
			</div>

			{displayEditViewModal && (
				<EditViewModal
					modalStatus={displayEditViewModal}
					onConfirm={handleEditViewModalConfirm}
					onCancel={handleCancel}
					selectedElements={SYLLABUS_TABS.map((t) => t.id)}
					selectedSyllabuses={selectedSyllabuses}
					selectedStages={taxoStagesCodenamesOfSyllabus}
					syllabuses={allSyllabuses.items}
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
					selectedSyllabuses={selectedSyllabuses}
					selectedStages={[]}
					syllabuses={allSyllabuses.items}
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

export default SyllabusViewNew
