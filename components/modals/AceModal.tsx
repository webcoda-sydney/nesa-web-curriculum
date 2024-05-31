import TreePicker from '@/legacy-ported/components/custom/TreePicker'
import { TreeElement } from '@/legacy-ported/components/custom/treeUtils'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import { arrayToggleMultiple } from '@/legacy-ported/utilities/functions'
import { downloadAceDocs } from '@/utils/downloadAceDocs'
import { MouseEvent, ReactNode, useRef, useState } from 'react'
import CustomModal, {
	CustomModalProps,
} from '../../legacy-ported/components/base/CustomModal'
import Icon from '../Icon'

export interface AceDownloadParams {
	aceGroup?: string[]
}

export interface AceModalProps
	extends Pick<
		CustomModalProps,
		'confirmButtonText' | 'hideConfirmButton' | 'hideCancelButton'
	> {
	/**
	 * Subgroup codename
	 */
	subgroup: string

	/**
	 * Show/Hide modal flag variable
	 */
	modalStatus: boolean

	/**
	 * Function to be used on the Cancel button
	 */
	onCancel?: () => void

	/**
	 * Function to be used on the Confirm button
	 */
	onConfirm: (
		_selection: AceDownloadParams,
		_e?: MouseEvent<HTMLButtonElement>,
	) => void

	downloadOptions?: TreeElement[]

	customModalSlotActions?: (_states: {
		showElementsError: boolean
		showLearningAreaError: boolean
		showStageError: boolean
		handleConfirm: CustomModalProps['handleConfirm']
	}) => ReactNode

	isPreviewMode?: boolean
}

/**
 * Edit View Modal
 * @param props
 * @constructor
 */
export const AceModal = (props: AceModalProps) => {
	const refAbortController = useRef<AbortController>(null)
	const { subgroup, onCancel, downloadOptions, modalStatus, isPreviewMode } =
		props

	const [selectedItemsForDownload, setSelectedItemsForDownload] = useState<
		string[]
	>([])
	const [generatingStatus, setGenerating] = useState(false)
	const [errorPopupMessage, setErrorPopupMessage] = useState('')

	const handleConfirm = async (_e) => {
		refAbortController.current = new AbortController()
		const includeGlossary = selectedItemsForDownload.includes('glossary')

		setGenerating(true)
		const [_, _errorMessage] = await downloadAceDocs(
			{
				pdf: true,
				subgroup,
				rules: selectedItemsForDownload.filter(
					(rule) => rule !== 'glossary',
				),
				includeGlossary,
				isPreviewMode,
			},
			refAbortController.current.signal,
		)

		if (refAbortController.current?.signal?.aborted) return
		if (_errorMessage) {
			setErrorPopupMessage(_errorMessage)
		}
		handleCancelDownloadModal()
	}

	const handleCancelDownloadModal = () => {
		refAbortController.current?.abort()
		setGenerating(false)
		setSelectedItemsForDownload([])
		onCancel()
	}

	return (
		<>
			<CustomModal
				title="Please select ACE Rules"
				modalStatus={modalStatus}
				confirmButtonText={
					<span className="w-full flex gap-3">
						<Icon icon="fa:file-pdf-o" />
						<span>Download as PDF</span>
					</span>
				}
				maxWidth="md"
				handleCancel={handleCancelDownloadModal}
				css={{
					'& .MuiDialog-paper': {
						width: '100%',
					},
				}}
				handleConfirm={handleConfirm}
				disableConfirm={selectedItemsForDownload.length === 0}
			>
				<TreePicker
					rootElements={downloadOptions}
					selected={selectedItemsForDownload}
					onChange={(ids) => {
						const updated = arrayToggleMultiple(
							selectedItemsForDownload,
							ids,
						)
						setSelectedItemsForDownload(updated)
					}}
				/>
			</CustomModal>
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
			<GeneratingOverlayCommon
				modalStatus={generatingStatus}
				handleCancel={handleCancelDownloadModal}
			/>
		</>
	)
}
