import { Alert } from 'nsw-ds-react'
import CustomModal, { CustomModalProps } from '../../base/CustomModal'

export interface GeneratingOverlayWordPdfProps {
	modalStatus: CustomModalProps['modalStatus']
	handleCancel?: CustomModalProps['handleCancel']
	isExplicitCancel?: CustomModalProps['isExplicitClose']
	hideAsposeWarning?: boolean
}

const GeneratingOverlayWordPdf = (
	props: GeneratingOverlayWordPdfProps,
): JSX.Element => {
	const { modalStatus, handleCancel, isExplicitCancel = true } = props

	return (
		<CustomModal
			title="Processing"
			slotAfterTitle={
				<span className="custom-modal__title-loader"></span>
			}
			modalStatus={modalStatus}
			handleCancel={handleCancel}
			isExplicitClose={isExplicitCancel}
			hideConfirmButton
		>
			<p>
				Please wait a moment while we generate your document.
				<br />
				If your selection includes multiple or large syllabuses it may
				take several minutes to compile.
			</p>
			<Alert
				as="info"
				css={{
					h5: {
						display: 'none',
					},
				}}
			>
				<p>
					There are known formatting issues when downloading documents
					that are greater than 500 pages.
					<br />
					To reduce the size, consider downloading syllabuses by Stage
					or downloading teaching advice separately.
				</p>
			</Alert>
		</CustomModal>
	)
}

export default GeneratingOverlayWordPdf
