import { DownloadViewModal } from '@/components/modals/DownloadViewModal'
import {
	EditViewModal,
	useEditViewModal,
	ViewSelection,
} from '@/components/modals/EditViewModal'
import RichText from '@/components/RichText'
import { SyllabusHeader } from '@/components/SyllabusHeader'
import SyllabusNotification from '@/components/SyllabusNotification'
import SyllabusView from '@/components/SyllabusView'
import UnknownComponent from '@/components/UnknownComponent'
import { CURRICULUM_SLUGS } from '@/constants'
import { STYLES } from '@/constants/styles'
import { SyllabusResponseData } from '@/databuilders/syllabus'
import useDisableLearningAreaAndStages from '@/hooks/useDisabledLearningAreasAndStages'
import { useToggle } from '@/hooks/useToggle'
import type { Syllabus as SyllabusModel } from '@/kontent/content-types/syllabus'
import type { TaxoStage } from '@/kontent/taxonomies/stage'
import { SYLLABUS_TABS } from '@/legacy-ported/constants/index'
import { customSyllabusQueryString } from '@/legacy-ported/utilities/functions'
import type {
	CommonPageProps,
	SyllabusTab,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import {
	getTagFromYears,
	getTaxoCodenames,
	isRichtextElementEmpty,
} from '@/utils'
import { getUrlFromSlugs } from '@/utils/getUrlFromMapping'
import { useRouter } from 'next/router'
import { parse, ParsedQs } from 'qs'
import { useEffect, useMemo, useState } from 'react'

export const shouldSyllabusUrlLinkBeCanonical = (url?: string) => {
	return !url?.includes(getUrlFromSlugs(CURRICULUM_SLUGS.LEARNING_AREAS))
}

function Syllabus(props: CommonPageProps<SyllabusModel, SyllabusResponseData>) {
	const router = useRouter()
	const { mappings, data, preview } = props
	const {
		pageResponse,
		stageGroups: allStageGroups,
		stages: allStages,
		syllabuses: allSyllabuses,
		glossaries: allGlossaries,
		assets: allAssets,
		keyLearningAreas: allKeyLearningAreas,
		config,
		webLinkVideos,
		webLinkExternals,
	} = data

	const page = pageResponse.item

	const initialTab = router.query.tab as SyllabusTab | undefined
	const initialStageCodename = router.query.stage as TaxoStage | undefined
	const initialYearCodename = router.query.year as
		| TaxoStageYearWithLifeSkill
		| undefined
	const initialOptionContentOrganiser = router.query[
		'options[contentOrganiser]'
	] as string | undefined
	const initialOptionTeachingSupport = router.query[
		'options[teachingSupport]'
	] as string | undefined

	// States
	const [currentTabs] = useState(SYLLABUS_TABS)
	const [tabValue, setTabValue] = useState(initialTab || SYLLABUS_TABS[0].id)
	// const [currentStageCodename, setCurrentStageCodename] =
	// 	useState(initialStageCodename)
	// const [currentYearCodename, setCurrentYearCodename] =
	// 	useState(initialYearCodename)

	// Edit view
	const { displayEditViewModal, toggleEditOverlay, handleCancel } =
		useEditViewModal(false)

	// Download View
	const [showDownloadOverlay, toggleDownloadOverlay] = useToggle()

	// Computed
	const selectedSyllabuses = useMemo(
		() => [page.system.codename],
		[page.system.codename],
	)
	const { disabledStages, disabledLearningAreas } =
		useDisableLearningAreaAndStages(config)

	const taxoStagesCodenamesOfSyllabus = useMemo<
		TaxoStageWithLifeSkill[]
	>(() => {
		const tmp = getTaxoCodenames(page.elements.stages__stages).filter(
			(taxoStage) => !disabledStages.includes(taxoStage),
		) as TaxoStageWithLifeSkill[]
		tmp.push('life_skills')
		return tmp
	}, [disabledStages, page.elements.stages__stages])

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

	const currentOptions = useMemo(() => {
		const query = parse(router.asPath, {
			ignoreQueryPrefix: true,
		})
		return query.options as ParsedQs | undefined
	}, [router.asPath])

	// Effect
	useEffect(() => {
		if (initialTab) {
			setTabValue(initialTab)
		}
	}, [
		initialTab,
		initialOptionContentOrganiser,
		initialOptionTeachingSupport,
	])

	// useEffect(() => {
	// 	if (initialStageCodename) {
	// 		setCurrentStageCodename(initialStageCodename)
	// 	}
	// }, [initialStageCodename])
	// useEffect(() => {
	// 	if (initialYearCodename) {
	// 		setCurrentYearCodename(initialYearCodename)
	// 	}
	// }, [initialYearCodename])

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	return (
		<>
			<SyllabusHeader
				pretitle={getTagFromYears(
					page.elements.stages__stage_years.value,
				)}
				title={page.elements.title.value + ' Syllabus'}
				onDownloadViewClick={toggleDownloadOverlay}
				onEditViewClick={toggleEditOverlay}
			/>
			{page.elements.implementation_title.value &&
				!isRichtextElementEmpty(page.elements.implementation_info) && (
					<SyllabusNotification
						title={page.elements.implementation_title.value}
						summary={page.elements.implementation_summary.value}
					>
						<RichText
							richTextElement={page.elements.implementation_info}
							linkedItems={pageResponse.linkedItems}
							mappings={mappings}
							css={STYLES.DARK_BACKGROUND_RTE}
						/>
					</SyllabusNotification>
				)}

			<div className="nsw-container px-0 lg:px-4 lg:pt-8">
				{/* tabs */}
				<SyllabusView
					allAssets={allAssets}
					allGlossaries={allGlossaries}
					allStages={allStages}
					allStageGroups={allStageGroups}
					currentOptions={currentOptions}
					currentStages={taxoStagesCodenamesOfSyllabus}
					currentTabs={currentTabs}
					linkedItems={pageResponse.linkedItems}
					syllabus={page}
					initialTab={tabValue}
					initialStageCodename={initialStageCodename}
					initialYearCodename={initialYearCodename}
					allWebLinkVideos={webLinkVideos.items}
					allWebLinkExternals={webLinkExternals.items}
				/>
			</div>
			{displayEditViewModal && (
				<EditViewModal
					modalStatus={displayEditViewModal}
					onConfirm={handleEditViewModalConfirm}
					onCancel={handleCancel}
					selectedElements={currentTabs.map((t) => t.id)}
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

export default Syllabus
