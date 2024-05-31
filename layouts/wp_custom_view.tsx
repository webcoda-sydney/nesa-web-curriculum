import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { CURRICULUM_SLUGS } from '@/constants'
import {
	TREE_OPTIONS_DOWNLOAD,
	TREE_OPTIONS_VIEW,
} from '@/constants/treepickeroptions'
import { WpCustomViewResponseData } from '@/databuilders/wp_custom_view'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import useDisableLearningAreaAndStages from '@/hooks/useDisabledLearningAreasAndStages'
import {
	useLanguagesBasedOnSyllabuses,
	useSyllabusesThatHaveLanguages,
} from '@/hooks/useLanguagesBasedOnSyllabuses'
import type { WpCustomView } from '@/kontent/content-types/wp_custom_view'
import { taxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoLanguage,
	TaxoResourceType,
	TaxoStage,
	TaxoSyllabus,
} from '@/kontent/taxonomies'
import CustomModal from '@/legacy-ported/components/base/CustomModal'
import CustomResourcePicker from '@/legacy-ported/components/custom/CustomResourcePicker'
import CustomSyllabusPicker from '@/legacy-ported/components/custom/CustomSyllabusPicker'
import { LanguagePicker } from '@/legacy-ported/components/custom/LanguagePicker'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import GeneratingOverlayWordPdf from '@/legacy-ported/components/document/overlay/GeneratingOverlayWordPdf'
import TabBar from '@/legacy-ported/components/tabs/TabBar'
import { customSyllabusQueryString } from '@/legacy-ported/utilities/functions'
import setTabNavigation from '@/legacy-ported/utilities/hooks/useTabNavigation'
import type { CommonPageProps, CustomSyllabusTab } from '@/types'
import { byTaxoCodename } from '@/utils'
import { downloadDocs } from '@/utils/downloadDocs'
import { downloadResource } from '@/utils/downloadResource'
import { getUrlFromSlugs } from '@/utils/getUrlFromMapping'
import { Icon } from '@iconify/react'
import Grid from '@mui/material/Grid'
import clsx from 'clsx'
import { detect } from 'detect-browser'
import { useRouter } from 'next/router'
import { Alert, Button } from 'nsw-ds-react'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
export type ExtendedResourceTypes = TaxoResourceType | 'glossary'

export const CustomViewErrorAlert = ({ children }: { children: ReactNode }) => {
	return (
		<Alert
			as="error"
			css={{ '&&': { marginTop: 0, marginBottom: '1rem' } }}
			compact
		>
			<strong>{children}</strong>
		</Alert>
	)
}

type TabViewOption = 'download_syllabus' | 'custom_view' | 'resources'

const CUSTOMVIEW_TABS = [
	{ id: 'download_syllabus', name: 'Download syllabus', index: 0 },
	{ id: 'custom_view', name: 'Custom view', index: 1 },
	// { id: 'resources', name: 'Resources', index: 2 },
]

export type LanguagesPayload = {
	syllabusTaxo: TaxoSyllabus
	languageTaxo: TaxoLanguage
}

function WpCustomViewLayout(
	props: CommonPageProps<WpCustomView, WpCustomViewResponseData>,
) {
	const { pageResponse, syllabuses, keyLearningAreas, stages, config } =
		props.data
	const page = pageResponse.item
	const currentUrl = useCleanPathDefault()
	const browser = detect()
	const router = useRouter()
	const refSelectOneMore = useRef()
	const refCustomSyllabusPicker = useRef<HTMLDivElement>()
	const refCustomResourcePicker = useRef<HTMLDivElement>()
	const refAbortController = useRef<AbortController>(null)

	const mobileUserUsingChromeAndiOS =
		browser && browser.os === 'iOS' && browser.name === 'crios' && isMobile

	const [formattingPopup, setFormattingPopup] = useState(false)
	const [errorPopupMessage, setErrorPopupMessage] = useState('')
	const [selectedTabView, setTabView] =
		useState<TabViewOption>('download_syllabus')
	const [generatingStatus, setGenerating] = useState(false)
	const [generatingStatusAllResource, setGeneratingAllResource] =
		useState(false)
	const [chromePopup, setChromePopup] = useState(false)
	const [step] = useState(1)

	const [selectedSyllabusCodenames, setSelectedSyllabusCodenames] = useState<
		string[]
	>([])
	const [selectedStages, setStages] = useState<TaxoStage[]>([])
	const [selectedElements, setElements] = useState<CustomSyllabusTab[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [selectedResourceTypes, setResourceTypes] = useState<
		ExtendedResourceTypes[]
	>([])
	const [selectedLanguages, setSelectedLanguages] = useState<
		Record<TaxoSyllabus | string, TaxoLanguage[]>
	>({})
	const [showLearningAreaError, setShowLearningAreaError] = useState(false)
	const [showStageError, setShowStageError] = useState(false)
	const [showElementsError, setShowElementsError] = useState(false)
	const [showResourcesError, setShowResourceError] = useState(false)
	const [isConfirmedOnce, setIsConfirmedOnce] = useState(false)

	// Computed
	const taxoSyllabusesFromSelectedSyllabusCodenames = useMemo(
		() =>
			syllabuses.items
				.filter((syl) =>
					selectedSyllabusCodenames.includes(syl.system.codename),
				)
				.map((syl) => syl.elements.syllabus.value?.[0]?.codename),
		[syllabuses.items, selectedSyllabusCodenames],
	)

	const { disabledStages, disabledLearningAreas } =
		useDisableLearningAreaAndStages(config)

	const { languageOptions, isShowLanguageOptions, toggleLanguageOptions } =
		useLanguagesBasedOnSyllabuses({
			selectedSyllabusCodenames,
			syllabuses: syllabuses.items,
		})

	const syllabusesThatHaveLanguages = useSyllabusesThatHaveLanguages(
		syllabuses.items,
	)

	const selectedResourceTypeHasLanguageSupport =
		selectedResourceTypes.includes('languagesupport')
	const selectedElementsHasExample = selectedElements.includes('examples')

	const selectedSyllabusesHaveLanguages = useMemo(() => {
		return selectedSyllabusCodenames
			.filter((syllabusCodename) => {
				return syllabusesThatHaveLanguages
					.map((s) => s.system.codename)
					.includes(syllabusCodename)
			})
			.map((syllabusCodename) => {
				return syllabuses.items.find(
					(s) => s.system.codename === syllabusCodename,
				)
			})
	}, [
		selectedSyllabusCodenames,
		syllabuses.items,
		syllabusesThatHaveLanguages,
	])

	const isSelectedSyllabusesHaveLanguages = useMemo(() => {
		return !!selectedSyllabusesHaveLanguages.length
	}, [selectedSyllabusesHaveLanguages.length])

	// Methods
	function handleChangeResources(selected: {
		learningAreas: string[]
		stages: TaxoStage[]
		resources: ExtendedResourceTypes[]
	}) {
		setSelectedSyllabusCodenames(selected.learningAreas)
		setStages(selected.stages)
		setResourceTypes(selected.resources)

		// setElements(selected.resources ? selected.resources : [])
		if (isConfirmedOnce) {
			setShowLearningAreaError(!selected.learningAreas.length)
			setShowStageError(!selected.stages.length)
			setShowResourceError(!selected.resources.length)
		} else {
			if (selected.learningAreas.length) {
				setShowLearningAreaError(false)
			}
			if (selected.stages.length) {
				setShowStageError(false)
			}
			if (selected.resources.length) {
				setShowResourceError(false)
			}
		}
	}

	const handleChangeSyllabus = (selected: {
		learningAreas: string[]
		stages: TaxoStage[]
		elements: CustomSyllabusTab[]
		tags: string[]
	}) => {
		setSelectedSyllabusCodenames(selected.learningAreas)
		setStages(selected.stages)
		setElements(selected.elements)
		// setSelectedTags(selected.tags)

		if (isConfirmedOnce) {
			setShowLearningAreaError(!selected.learningAreas.length)
			setShowStageError(!selected.stages.length)
			setShowElementsError(!selected.elements.length)
		} else {
			if (selected.learningAreas.length) {
				setShowLearningAreaError(false)
			}
			if (selected.stages.length) {
				setShowStageError(false)
			}
			if (selected.elements.length) {
				setShowElementsError(false)
			}
		}
	}

	const handleDownloadDoc = async ({
		selectedLanguages: _languages,
	}: {
		selectedLanguages?: Record<TaxoSyllabus | string, TaxoLanguage[]>
	} = {}) => {
		if (!isSelectedOptionsValid()) {
			scrollToError()
			return
		}

		if (mobileUserUsingChromeAndiOS) {
			setChromePopup(true)
		}

		refAbortController.current = new AbortController()
		setGenerating(true)

		const languages = Object.entries(
			_languages || selectedLanguages,
		).flatMap(([syllabusTaxo, languages]) => {
			return languages.map((languageTaxo) => {
				return {
					languageTaxo,
					syllabusTaxo,
				}
			}) as LanguagesPayload[]
		})

		const [_, errorMessage] = await downloadDocs(
			{
				pdf: false,
				stages: selectedStages,
				syllabuses: selectedSyllabusCodenames,
				tabs: [...selectedElements, 'curriculum-connections'],
				tags: selectedTags,
				isPreviewMode: props.preview,
				languages,
			},
			refAbortController.current.signal,
		)
		if (refAbortController.current?.signal?.aborted) return
		if (errorMessage) {
			setErrorPopupMessage(errorMessage)
		}

		closeModal()
	}

	const closeModal = () => {
		setGenerating(false)
		setGeneratingAllResource(false)
	}

	const isSelectedOptionsValid = (isCheckStep = false) => {
		const isLearningAreaError = !selectedSyllabusCodenames.length
		const isElementsError = !selectedElements.length
		const isStageError = !selectedStages.length
		const isResourceError = !selectedResourceTypes.length
		setIsConfirmedOnce(true)
		setShowLearningAreaError(isLearningAreaError)
		setShowElementsError(isElementsError)
		setShowStageError(isStageError)
		setShowResourceError(isResourceError)

		if (isCheckStep) {
			if (step === 1) {
				return !isLearningAreaError
			}
			if (step === 2) {
				return !isStageError
			}
			if (step === 3) {
				return selectedTabView ? !isResourceError : !isElementsError
			}
		}
		return (
			!isLearningAreaError &&
			!isStageError &&
			(selectedTabView === 'resources'
				? !isResourceError
				: !isElementsError)
		)
	}

	const scrollToError = () => {
		setTimeout(() => {
			const $activePicker =
				refCustomSyllabusPicker.current ||
				refCustomResourcePicker.current

			$activePicker
				.querySelector('.nsw-in-page-alert')
				?.parentElement.parentElement.scrollIntoView()
		}, 0)
	}

	const handleViewOnline = () => {
		if (!isSelectedOptionsValid()) {
			scrollToError()
			return
		}
		router.push({
			pathname: getUrlFromSlugs(CURRICULUM_SLUGS.CUSTOM_SYLLABUSES),
			search: customSyllabusQueryString({
				stageIds: selectedStages,
				tabIds: selectedElements,
				syllabusIds: selectedSyllabusCodenames as string[],
				tagIds: selectedTags,
			}),
		})
	}

	const handleDownloadAllPDFs = async ({
		selectedLanguages: _languages,
	}: {
		selectedLanguages?: Record<TaxoSyllabus | string, TaxoLanguage[]>
	} = {}) => {
		if (!isSelectedOptionsValid()) {
			scrollToError()
			return
		}
		refAbortController.current = new AbortController()
		setGeneratingAllResource(true)

		const resourceTypeTerms = Object.values(taxonomies.resource_type.terms)
			.map(byTaxoCodename)
			.filter((taxoCodename) => !taxoCodename.includes('ace_'))

		const languages = Object.entries(
			_languages || selectedLanguages,
		).flatMap(([syllabusTaxo, languages]) => {
			return languages.map((languageTaxo) => {
				return {
					languageTaxo,
					syllabusTaxo,
				}
			}) as LanguagesPayload[]
		})

		const [_, errorMessage] = await downloadResource(
			{
				stages: selectedStages,
				syllabuses: taxoSyllabusesFromSelectedSyllabusCodenames,
				contenttypes: selectedResourceTypes.filter(
					(item) => !resourceTypeTerms.includes(item),
				),
				languages,
				resourcetypes: selectedResourceTypes,
				isPreviewMode: props.preview,
			},
			refAbortController.current.signal,
		)

		if (refAbortController.current?.signal?.aborted) return
		if (errorMessage) {
			setErrorPopupMessage(errorMessage)
		}

		setGeneratingAllResource(false)
	}

	const handleTabChange = (tabKey) => {
		setTabView(tabKey)
	}

	const handleTabPrevious = () => {
		const newTab = setTabNavigation(
			CUSTOMVIEW_TABS,
			selectedTabView,
			'PREVIOUS',
		)
		if (newTab) {
			setTabView(newTab?.id as TabViewOption)
		}
	}

	const handleTabNext = () => {
		const newTab = setTabNavigation(
			CUSTOMVIEW_TABS,
			selectedTabView,
			'NEXT',
		)
		if (newTab) {
			setTabView(newTab?.id as TabViewOption)
		}
	}

	const handleCancelGeneratingOverlayWordPdf = () => {
		refAbortController.current.abort()
		closeModal()
	}

	const handleDownloadClick = (callback) => {
		if (
			isSelectedSyllabusesHaveLanguages &&
			(selectedResourceTypeHasLanguageSupport ||
				selectedElementsHasExample)
		) {
			if (!isSelectedOptionsValid()) {
				scrollToError()
				return
			}
			return toggleLanguageOptions()
		}
		return callback()
	}

	useEffect(() => {
		// reset error visibility
		setShowLearningAreaError(false)
		setShowStageError(false)
		setShowElementsError(false)
		setShowResourceError(false)
		setIsConfirmedOnce(false)

		// reset values
		setSelectedSyllabusCodenames([])
		setStages([])
		setElements([])
		setSelectedTags([])
	}, [selectedTabView])

	useEffect(() => {
		if (
			!isSelectedSyllabusesHaveLanguages &&
			selectedResourceTypeHasLanguageSupport
		) {
			setResourceTypes((prev) =>
				prev.filter((item) => item !== 'languagesupport'),
			)
		}
	}, [
		isSelectedSyllabusesHaveLanguages,
		selectedResourceTypeHasLanguageSupport,
	])

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
			<NonFullWidthWrapper>
				<RichText
					className="w-full cms-content-formatting"
					mappings={props.mappings}
					linkedItems={pageResponse.linkedItems}
					richTextElement={page.elements.web_content_rtb__content}
					data-kontent-item-id={page.system.id}
					data-kontent-element-codename="web_content_rtb__content"
				/>
			</NonFullWidthWrapper>

			<div className="mt-8">
				{/* Tabs */}
				<TabBar
					value={selectedTabView}
					onChange={handleTabChange}
					tabs={CUSTOMVIEW_TABS.map((tab) => ({
						tabId: tab.id,
						label: tab.name,
						panelId: `tab-panel-${tab.id}`,
						className: `${
							tab.id === selectedTabView
								? 'syllabus-header__tab--selected'
								: 'syllabus-header__tab'
						}`,
					}))}
					className="w-full bg-nsw-off-white lg:bg-white syllabus-header__tab-bar"
					onPreviousClick={handleTabPrevious}
					onNextClick={handleTabNext}
				/>
				{/* End Tabs */}

				{/* Tabs section */}
				<div className="p-4 pt-12">
					<NonFullWidthWrapper className="space-y-4 mb-8">
						<h3 className="mt-0" ref={refSelectOneMore}>
							Select one or more:
						</h3>
						<p>
							* A minimum of one selection from Learning areas,
							Stages and Syllabus{' '}
							{selectedTabView === 'resources'
								? 'support materials'
								: 'elements'}{' '}
							is required
						</p>
					</NonFullWidthWrapper>

					<Grid
						container
						wrap="nowrap"
						className="custom-view__syllabus-container"
						direction="column"
						alignItems="stretch"
					>
						{(selectedTabView === 'download_syllabus' ||
							selectedTabView === 'custom_view') && (
							<CustomSyllabusPicker
								key={selectedTabView}
								ref={refCustomSyllabusPicker}
								syllabuses={syllabuses.items}
								keyLearningAreas={keyLearningAreas}
								stages={stages}
								onChange={handleChangeSyllabus}
								showLearningAreaError={showLearningAreaError}
								showStageError={showStageError}
								showElementsError={showElementsError}
								disabledLearningAreas={disabledLearningAreas}
								disabledStages={disabledStages}
								syllabusElementsOptions={
									selectedTabView === 'download_syllabus'
										? TREE_OPTIONS_DOWNLOAD
										: TREE_OPTIONS_VIEW
								}
							/>
						)}
						{selectedTabView === 'resources' && (
							<CustomResourcePicker
								ref={refCustomResourcePicker}
								syllabuses={syllabuses.items}
								keyLearningAreas={keyLearningAreas}
								stages={stages}
								onChange={handleChangeResources}
								showLearningAreaError={showLearningAreaError}
								showStageError={showStageError}
								showResourcesError={showResourcesError}
								disabledLearningAreas={disabledLearningAreas}
								disabledStages={disabledStages}
								disabledResourceTypes={
									!isSelectedSyllabusesHaveLanguages
										? ([
												'languagesupport',
										  ] as TaxoResourceType[])
										: []
								}
								initialResources={selectedResourceTypes}
							/>
						)}
					</Grid>
					<Grid
						container
						justifyContent={{ lg: 'flex-end' }}
						direction={{ xs: 'column', md: 'row' }}
						className={clsx('gap-3 mt-8')}
					>
						{selectedTabView === 'download_syllabus' && (
							<Button
								className="flex-1 lg:flex-grow-0 lg:flex-shrink-0 lg:basis-auto px-[1rem] lg:px-[21.33px]"
								onClick={() =>
									handleDownloadClick(handleDownloadDoc)
								}
							>
								<Grid
									container
									justifyContent="center"
									alignItems="center"
								>
									<Icon
										icon="fa:file-word-o"
										width="24"
										height="24"
										className="mr-2"
										aria-hidden="true"
									/>
									Download Word doc
								</Grid>
							</Button>
						)}

						{selectedTabView === 'custom_view' && (
							<Button
								className="flex-1 lg:flex-grow-0 lg:flex-shrink-0 lg:basis-auto px-[1rem] lg:px-[21.33px]"
								onClick={handleViewOnline}
							>
								View online
							</Button>
						)}

						{selectedTabView === 'resources' && (
							<Button
								onClick={() =>
									handleDownloadClick(handleDownloadAllPDFs)
								}
							>
								<Grid
									container
									justifyContent="center"
									alignItems="center"
								>
									Download all resources
								</Grid>
							</Button>
						)}
					</Grid>
					<GeneratingOverlayWordPdf
						modalStatus={generatingStatus}
						handleCancel={handleCancelGeneratingOverlayWordPdf}
					/>
					<GeneratingOverlayCommon
						modalStatus={generatingStatusAllResource}
						handleCancel={handleCancelGeneratingOverlayWordPdf}
					/>
					{formattingPopup && (
						<CustomModal
							title="Recommendation"
							modalStatus={formattingPopup}
							hideCancelButton
							handleConfirm={() => setFormattingPopup(false)}
						>
							<p>
								If you experience formatting issues with the
								downloaded PDF we recommend using Google Chrome
								browser.
							</p>
						</CustomModal>
					)}
					{chromePopup && (
						<CustomModal
							title="Recommendation"
							modalStatus={chromePopup}
							hideCancelButton
							handleConfirm={() => {
								setChromePopup(false)
							}}
						>
							<p>
								If you experience issues with Word doc download
								we recommend using Safari browser.
							</p>
						</CustomModal>
					)}
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
					<LanguagePicker
						syllabuses={selectedSyllabusesHaveLanguages}
						languages={languageOptions}
						initialSelectedLanguages={selectedLanguages}
						modalStatus={isShowLanguageOptions}
						handleCancel={() => {
							toggleLanguageOptions()
						}}
						handleConfirm={async (languages) => {
							const selectedLang = {
								selectedLanguages: languages,
							}
							setSelectedLanguages(() => languages)
							// instead of using useEffect, better to pass in the languages as arguemnt
							// no more complication needed
							if (selectedTabView === 'download_syllabus') {
								handleDownloadDoc(selectedLang)
							} else if (selectedTabView === 'resources') {
								handleDownloadAllPDFs(selectedLang)
							}
							toggleLanguageOptions()
						}}
						slotBeforeSearch={
							<p>
								Language selection only applies to
								language-specific support materials.{' '}
							</p>
						}
						isValidationNotRequired
					></LanguagePicker>
				</div>
			</div>
		</>
	)
}

export default WpCustomViewLayout
