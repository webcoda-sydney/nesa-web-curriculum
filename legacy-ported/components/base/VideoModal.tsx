import { useToggle } from '@/hooks/useToggle'
import CancelIcon from '@mui/icons-material/Cancel'
import Dialog from '@mui/material/Dialog'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import DESIGN from '../../constants/designConstants'

export const useVideoModal = () => {
	const [openVideoModal, toggle] = useToggle(false)
	const [currentVideoIframeUrl, setCurrentVideoIframeUrl] = useState('')
	const [currentVideoLabel, setCurrentVideoLabel] = useState('')
	const hideVideo = () => {
		toggle()
	}
	const openVideo = (url: string, label: string) => {
		toggle()
		setCurrentVideoIframeUrl(url)
		setCurrentVideoLabel(label)
	}

	return {
		openVideoModal,
		currentVideoIframeUrl,
		currentVideoLabel,
		openVideo,
		hideVideo,
	}
}

export interface VideoModalProps {
	/**
	 * Aria Label
	 */
	ariaLabel: string

	/*
	 * Show/Hide modal flag variable
	 * */
	modalStatus: boolean

	/*
	 * Video url
	 * */
	video: string

	/*
	 * Function to be used on the modal close
	 * */
	onCancel: () => void
}

export default function VideoModal(props: VideoModalProps) {
	const { ariaLabel, onCancel, modalStatus, video } = props

	const srcUrl = isMobile ? video : `${video}&autoplay`

	return (
		<Dialog
			open={modalStatus}
			keepMounted
			onClose={onCancel}
			aria-labelledby={ariaLabel}
			aria-describedby={ariaLabel}
			fullScreen
			className="video-modal"
		>
			<Grid className="video-modal__video-container">
				<Grid container justifyContent="flex-end">
					<div
						role="button"
						className="video-modal__close-button"
						onClick={onCancel}
						onKeyPress={onCancel}
						tabIndex={0}
					>
						<CancelIcon style={{ color: DESIGN.COLOR_WHITE }} />
					</div>
				</Grid>
				<Grid
					container
					justifyContent="center"
					alignItems="center"
					className="video-modal__video"
				>
					{video && (
						<iframe
							src={srcUrl}
							title="Resource video"
							width="100%"
							height="100%"
							allow="autoplay"
							frameBorder="0"
						/>
					)}
				</Grid>
			</Grid>
		</Dialog>
	)
}
