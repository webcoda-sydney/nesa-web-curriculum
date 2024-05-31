import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import Grid from '@mui/material/Grid'
import React from 'react'

interface CustomSyllabusHeaderProps {
	/**
	 * Show/Hide bottom border
	 */
	showBottomBorder?: boolean
	/**
	 * To hide Version History button
	 */
	hideVersionHistoryButton?: boolean
	/**
	 * Whether to use the 'Edit Tags' message on edit button
	 */
	useTagsMessage?: boolean
	/**
	 * Callback fired when version history is clicked
	 */
	onVersionHistoryClick?: (
		_event: React.MouseEvent<HTMLButtonElement>,
	) => void
	/**
	 * Callback fired when edit view is clicked
	 */
	onEditViewClick?: (_event: React.MouseEvent<HTMLButtonElement>) => void
	/**
	 * Callback fired when download view is clicked
	 */
	onDownloadViewClick?: (_event: React.MouseEvent<HTMLButtonElement>) => void
}

const CustomSyllabusHeader = (props: CustomSyllabusHeaderProps) => {
	const {
		showBottomBorder,
		useTagsMessage,
		onEditViewClick,
		onDownloadViewClick,
	} = props

	return (
		<div
			className={`syllabus-header ${
				showBottomBorder
					? 'syllabus-header__title-with-bottom-border'
					: ''
			}`}
		>
			<Grid container className="syllabus-header__body">
				<Grid container item sm={12} lg={6} alignItems="center">
					{/* <div className="sr-only syllabus-header__tag">
						<h2>View</h2>
					</div> */}
					<Grid className="syllabus-header__titles">
						<h1 className="h3 syllabus-header__main-title">
							Custom Syllabus
						</h1>
					</Grid>
				</Grid>
				<Grid
					container
					item
					sm={12}
					lg={6}
					alignItems="center"
					className="!mt-3 lg:!hidden syllabus-header__select-right justify-center space-x-3 lg:space-x-0"
				>
					<Grid>
						<button
							type="button"
							onClick={onEditViewClick}
							className="header__download-view button button--no-min-width nsw-button nsw-button--dark"
						>
							Edit {useTagsMessage ? 'tags' : 'view'}
						</button>
					</Grid>
					<Grid>
						<button
							type="button"
							onClick={onDownloadViewClick}
							className="header__download-view button button--no-min-width nsw-button nsw-button--dark"
						>
							Download view
							<span className="header__download-view-icon">
								<CloudDownloadIcon />
							</span>
						</button>
					</Grid>
				</Grid>
			</Grid>
		</div>
	)
}

export default CustomSyllabusHeader
