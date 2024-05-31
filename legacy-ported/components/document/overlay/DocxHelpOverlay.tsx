import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import { ChangeEvent, useEffect, useId, useState } from 'react'
import { isMobile } from 'react-device-detect'
import CustomModal, { CustomModalProps } from '../../base/CustomModal'

export interface DocxHelpOverlayProps {
	modalStatus: CustomModalProps['modalStatus']
	handleConfirm: () => void
}

const DocxHelpOverlay = (props: DocxHelpOverlayProps): JSX.Element => {
	const { modalStatus, handleConfirm } = props

	const [blockPopup, setBlockPopup] = useState(false)

	useEffect(() => {
		const storageFlag = localStorage.getItem('docx-popup-blocked')
		if (modalStatus && (storageFlag === 'true' || isMobile)) {
			handleConfirm()
		}
	}, [modalStatus, blockPopup, handleConfirm])

	const handleOverlayConfirm = () => {
		localStorage.setItem(
			'docx-popup-blocked',
			blockPopup ? 'true' : 'false',
		)
		handleConfirm()
	}

	const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
		setBlockPopup(event.target.checked)
	}

	const checkboxId = useId()

	return (
		<CustomModal
			title="All Done!"
			modalStatus={modalStatus}
			hideCancelButton
			handleConfirm={handleOverlayConfirm}
			maxWidth="md"
		>
			<Grid
				container
				justifyContent="center"
				direction="column"
				className="docx-help"
			>
				<p className="docx-help_message">
					To generate a Table of Contents, enable editing and click
					Yes to the popup.
				</p>
				<p>
					<FormControlLabel
						htmlFor={checkboxId}
						control={
							<Checkbox
								checked={blockPopup}
								onChange={handleCheckboxChange}
								name="checkedB"
								color="primary"
								id={checkboxId}
							/>
						}
						label="Don't show this message again"
					/>
				</p>
			</Grid>
		</CustomModal>
	)
}

export default DocxHelpOverlay
