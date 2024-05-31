import { VideoLinkOrExtLinkOrAssetType } from '@/types'
import { getFilesizeFormatter, getFileTypeClassification } from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetHeadline,
	getVideoLinkOrExtLinkOrAssetLastModified,
	getVideoLinkOrExtLinkOrAssetStageTags,
	getVideoLinkOrExtLinkOrAssetSyllabusLabels,
	getVideoLinkOrExtLinkOrAssetUrl,
} from '@/utils/assets'
import {
	isWebLinkext,
	isWebLinkTeachingadviceExtended,
	isWebLinkVideo,
} from '@/utils/type_predicates'
import { Icon } from '@iconify/react'
import useTheme from '@mui/material/styles/useTheme'
import format from 'date-fns/format'
import { Button, Card, TagList } from 'nsw-ds-react'
import { MouseEvent, useRef } from 'react'
export interface CardAssetOrVideoLinkProps {
	contentObject: VideoLinkOrExtLinkOrAssetType
	// eslint-disable-next-line no-unused-vars
	onClick: (ev: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
}

export const styleCardTagListOnHover = {
	'&:hover .nsw-tag, &:focus .nsw-tag': {
		borderColor: '#fff',
		color: '#fff',
	},
}

export const CardAssetOrVideoLink = (props: CardAssetOrVideoLinkProps) => {
	const formatFilesize = useRef(getFilesizeFormatter())
	const { contentObject, onClick } = props
	const theme = useTheme()
	const isVideo = isWebLinkVideo(contentObject)
	const isExternalLink = isWebLinkext(contentObject)
	const isVideoOrExternalLink =
		isVideo ||
		isExternalLink ||
		isWebLinkTeachingadviceExtended(contentObject)

	const tags = getVideoLinkOrExtLinkOrAssetStageTags(contentObject)
	const headline = getVideoLinkOrExtLinkOrAssetHeadline(contentObject)
	const syllabusTag =
		getVideoLinkOrExtLinkOrAssetSyllabusLabels(contentObject)
	const lastModified = getVideoLinkOrExtLinkOrAssetLastModified(contentObject)
	const fileSize = isVideoOrExternalLink ? '' : contentObject.size
	const url = getVideoLinkOrExtLinkOrAssetUrl(contentObject)
	const type = isVideoOrExternalLink
		? contentObject.system.type
		: contentObject.type

	return (
		<Card
			headline={headline}
			tag={syllabusTag}
			className="flex-1 flex flex-col"
			css={[
				styleCardTagListOnHover,
				{
					'.nsw-card__icon': {
						display: 'none',
					},
					'.nsw-card__content': {
						paddingBottom: '1rem',
						[theme.breakpoints.up('lg')]: {
							paddingBottom: '2rem',
						},
					},
				},
			]}
		>
			<div className="flex flex-col flex-1">
				<div className="flex-1 mb-4">
					<div className="mt-4">
						<TagList tags={tags} />
					</div>
					<div className="nsw-small mt-4">
						<>
							Updated:{' '}
							{format(new Date(lastModified), 'MMM yyyy')}
							{fileSize && (
								<>
									<br />
									Size: {formatFilesize.current(fileSize)}
								</>
							)}
						</>
					</div>
				</div>
				<Button
					linkComponent="a"
					style="dark"
					link={url}
					rel={
						!isVideoOrExternalLink
							? 'noindex nofollow'
							: isExternalLink
							? 'noopener noreferrer'
							: ''
					}
					target={isExternalLink ? '_blank' : undefined}
					onClick={onClick}
					className="justify-center lg:justify-start items-center gap-2 no-icon"
					css={{
						'&.nsw-button': {
							display: 'flex',
						},

						':after': {
							content: '""',
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							top: 0,
						},
					}}
				>
					{isVideo && (
						<>
							<Icon
								icon={'ic:baseline-play-circle'}
								width="24"
								height="24"
							/>
							Watch online
						</>
					)}

					{isExternalLink && (
						<>
							View online
							<Icon
								icon={'mdi:external-link'}
								width="24"
								height="24"
							/>
						</>
					)}

					{!isVideoOrExternalLink && (
						<>
							<Icon
								icon={`fa:file-${getFileTypeClassification(
									type,
								)?.toLowerCase()}-o`}
								width="24"
								height="24"
							/>
							Download
						</>
					)}
				</Button>
			</div>
		</Card>
	)
}
