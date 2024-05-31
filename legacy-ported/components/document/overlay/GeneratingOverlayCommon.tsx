import CustomModal, { CustomModalProps } from '../../base/CustomModal'

export interface GeneratingOverlayCommonProps {
	modalStatus: CustomModalProps['modalStatus']
	handleCancel?: CustomModalProps['handleCancel']
}

const GeneratingOverlayCommon = (
	props: GeneratingOverlayCommonProps,
): JSX.Element => {
	const { modalStatus, handleCancel } = props

	return (
		<CustomModal
			title="Processing"
			slotAfterTitle={
				<span className="custom-modal__title-loader"></span>
			}
			modalStatus={modalStatus}
			handleCancel={handleCancel}
			hideConfirmButton
		>
			<p>Please wait a moment while we generate your file.</p>
		</CustomModal>
	)
}

export default GeneratingOverlayCommon
