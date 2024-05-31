import Icon from '@/components/Icon'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { TREE_OPTIONS_DOWNLOAD } from '@/constants/treepickeroptions'
import {
	useLanguagesBasedOnSyllabuses,
	useSyllabusesThatHaveLanguages,
} from '@/hooks/useLanguagesBasedOnSyllabuses'
import { TaxoLanguage, TaxoSyllabus } from '@/kontent/taxonomies'
import { LanguagesPayload } from '@/layouts/wp_custom_view'
import { LanguagePicker } from '@/legacy-ported/components/custom/LanguagePicker'
import { downloadDocs } from '@/utils/downloadDocs'
import { Button } from 'nsw-ds-react'
import { useEffect, useRef, useState } from 'react'
import CustomModal from '../../legacy-ported/components/base/CustomModal'
import DocxHelpOverlay from '../../legacy-ported/components/document/overlay/DocxHelpOverlay'
import GeneratingOverlayWordPdf from '../../legacy-ported/components/document/overlay/GeneratingOverlayWordPdf'
import {
	CommonSyllabusModal,
	CommonSyllabusModalProps,
	ViewSelection,
} from './CommonSyllabusModal'

export type DownloadViewModalProps = Omit<
	CommonSyllabusModalProps,
	'onConfirm' | 'title' | 'syllabusElementsOptions'
> & {
	// to set the downloadDocs preview mode param
	isPreviewMode?: boolean
	languagePickerTitle?: string
}

type DownloadModalViewSelection = ViewSelection & {
	isPdf: boolean
	languages?: Record<string, TaxoLanguage[]>
}

export const DownloadViewModal = (props: DownloadViewModalProps) => {
	const refAbortController = useRef<AbortController>(null)
	const [generatingStatus, setGenerating] = useState(false)
	const [showDocxHelp, setShowDocxHelp] = useState(false)
	const [errorPopupMessage, setErrorPopupMessage] = useState('')
	const [selectedLanguages, setSelectedLanguages] = useState<
		Record<TaxoSyllabus | string, TaxoLanguage[]>
	>({})

	const refSelection = useRef<DownloadModalViewSelection>({
		syllabuses: [],
		stages: [],
		tabs: [],
		isPdf: false,
		languages: {},
	})

	const { languageOptions, isShowLanguageOptions, toggleLanguageOptions } =
		useLanguagesBasedOnSyllabuses({
			selectedSyllabusCodenames: props.selectedSyllabuses,
			syllabuses: props.syllabuses,
		})
	const syllabusesThatHaveLanguages = useSyllabusesThatHaveLanguages(
		props.syllabuses,
	)
	const selectedSyllabusesHaveLanguages = syllabusesThatHaveLanguages.filter(
		(syl) => refSelection.current.syllabuses.includes(syl.system.codename),
	)

	const closeModal = () => {
		setGenerating(false)
	}

	const handleCloseDocxHelp = () => {
		setShowDocxHelp(false)
	}

	const handleCancelGeneratingWordPdf = () => {
		refAbortController.current.abort()
		refAbortController.current = null
		closeModal()
	}

	const handleDownload = async (selection: DownloadModalViewSelection) => {
		refAbortController.current = new AbortController()
		setGenerating(true)
		const languages = selection.languages
			? Object.entries(selection.languages).flatMap(
					([syllabusTaxo, languages]) => {
						return languages.map((languageTaxo) => {
							return {
								languageTaxo,
								syllabusTaxo,
							}
						}) as LanguagesPayload[]
					},
			  )
			: []

		const [_, errorMessage] = await downloadDocs(
			{
				stages: selection.stages,
				syllabuses: selection.syllabuses,
				tabs: [...selection.tabs, 'curriculum-connections'],
				pdf: selection.isPdf,
				tags: [],
				isPreviewMode: props.isPreviewMode || false,
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

	useEffect(() => {
		setGenerating(false)
		setShowDocxHelp(false)
		setErrorPopupMessage('')
	}, [])

	return (
		<>
			<CommonSyllabusModal
				{...props}
				title="Please select syllabus content"
				onConfirm={(selection, e) => {
					refSelection.current = {
						...selection,
						isPdf: e.currentTarget.dataset.action === 'downloadpdf',
					}

					const _selectedSyllabusesHaveLanguages =
						syllabusesThatHaveLanguages.filter((syl) =>
							selection.syllabuses.includes(syl.system.codename),
						)
					if (
						_selectedSyllabusesHaveLanguages.length &&
						selection.tabs.includes('examples')
					) {
						return toggleLanguageOptions()
					}
					handleDownload(selection as DownloadModalViewSelection)
				}}
				customModalSlotActions={({ handleConfirm }) => {
					return (
						<>
							<GridCol xs="auto">
								<Button
									onClick={handleConfirm}
									data-action="downloadword"
								>
									<Icon
										icon="fa:file-word-o"
										className="mr-2"
									/>
									Download as Word
								</Button>
							</GridCol>
							<GridCol xs="auto" className="hidden">
								<Button
									onClick={handleConfirm}
									data-action="downloadpdf"
								>
									<Icon
										icon="fa:file-pdf-o"
										className="mr-2"
									/>
									Download as PDF
								</Button>
							</GridCol>
						</>
					)
				}}
				syllabusElementsOptions={TREE_OPTIONS_DOWNLOAD}
				hideConfirmButton
			/>
			<GeneratingOverlayWordPdf
				modalStatus={generatingStatus}
				handleCancel={handleCancelGeneratingWordPdf}
			/>
			<DocxHelpOverlay
				modalStatus={showDocxHelp}
				handleConfirm={handleCloseDocxHelp}
			/>
			<LanguagePicker
				syllabuses={selectedSyllabusesHaveLanguages}
				languages={languageOptions}
				initialSelectedLanguages={selectedLanguages}
				title={props.languagePickerTitle}
				modalStatus={isShowLanguageOptions}
				handleCancel={() => {
					toggleLanguageOptions()
				}}
				handleConfirm={async (languages) => {
					refSelection.current = {
						...refSelection.current,
						languages,
					}
					setSelectedLanguages(languages)
					handleDownload(refSelection.current)
					toggleLanguageOptions()
				}}
				confirmButtonText="Continue to download"
				slotBeforeSearch={
					<p>
						Language selection only applies to language specific
						examples.
					</p>
				}
				isValidationNotRequired
			></LanguagePicker>
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
