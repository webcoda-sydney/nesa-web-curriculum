import { CardAssetOrVideoLink } from '@/components/cards/CardAssetOrVideoLink'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import type { AssetWithRawElements } from '@/types'
import { isWebLinkext, isWebLinkVideo } from '@/utils/type_predicates'
import JsFileDownloader from 'js-file-downloader'
import React from 'react'
import VideoModal, { useVideoModal } from '../base/VideoModal'
interface ResourceBodyProps {
	filteredResources: AssetWithRawElements[]
	onReset: () => void
}

export const handleResourceDownload = (
	e: React.MouseEvent<HTMLAnchorElement>,
) => {
	e.preventDefault()
	new JsFileDownloader({
		url: e.currentTarget.href,
		autoStart: true,
		forceDesktopMode: true,
	})
}

const ResourceBody = (props: ResourceBodyProps): JSX.Element => {
	const { filteredResources, onReset } = props

	const {
		currentVideoIframeUrl,
		currentVideoLabel,
		openVideo,
		hideVideo,
		openVideoModal,
	} = useVideoModal()

	const handlePlayVideo = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		openVideo(e.currentTarget.href, e.currentTarget.innerText)
	}

	return (
		<GridWrapper spacing={8}>
			{filteredResources.map((resource) => {
				return (
					<GridCol
						key={resource.id}
						sm={6}
						lg={4}
						className="flex flex-col"
					>
						<CardAssetOrVideoLink
							contentObject={resource}
							onClick={
								isWebLinkVideo(resource)
									? handlePlayVideo
									: !isWebLinkext(resource)
									? handleResourceDownload
									: undefined
							}
						/>
					</GridCol>
				)
			})}
			{!filteredResources.length && (
				<GridCol>
					<h4 className="text-center mt-20">
						{/* eslint-disable-next-line quotes */}
						{"We didn't find any results. "}
						<button
							type="reset"
							className="underline bold nsw-text--brand-dark"
							onClick={onReset}
						>
							Clear all filters
						</button>
					</h4>
				</GridCol>
			)}

			{openVideoModal && currentVideoIframeUrl && (
				<VideoModal
					key={currentVideoIframeUrl}
					ariaLabel={currentVideoLabel}
					modalStatus={openVideoModal}
					onCancel={hideVideo}
					video={currentVideoIframeUrl}
				/>
			)}
		</GridWrapper>
	)
}

export default ResourceBody
