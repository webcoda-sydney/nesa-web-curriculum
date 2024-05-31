import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import { Tooltip } from '@/components/tooltip/Tooltip'
import { UiVideoTile as UiVideoTileModel } from '@/kontent/content-types'
import VideoModal, {
	useVideoModal,
} from '@/legacy-ported/components/base/VideoModal'
import IntroductionVideoCard from '@/legacy-ported/components/card/IntroductionVideoCard'
import { Mapping } from '@/types'
import { isRichtextElementEmpty } from '@/utils'
import kontentImageLoader from '@/utils/kontentImageLoader'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { format } from 'date-fns'
import type { RichtextSectionProps } from '.'
import { useKontentHomeConfig } from '../contexts/KontentHomeConfigProvider'
import RichText from '../RichText'

const getDescription = (
	videoTile: UiVideoTileModel,
	mappings: Mapping[],
	linkedItems: IContentItemsContainer,
) => {
	const syllabus = videoTile.elements.syllabus.value
	const isMultipleSyllabus = videoTile.elements.syllabus.value.length > 1
	const possibleDateField =
		videoTile.elements.date.value || videoTile.system.lastModified
	const date = possibleDateField
		? format(new Date(possibleDateField), 'dd MMM yyyy')
		: ''
	return (
		<>
			<div>
				{isMultipleSyllabus ? (
					<>
						<span className="mr-1">Multiple syllabuses</span>
						<Tooltip
							text={
								<SanitisedHTMLContainer>
									{syllabus
										.map((item) => item.name)
										.join('<br>')}
								</SanitisedHTMLContainer>
							}
						/>
						<span className="ml-2">{date}</span>
					</>
				) : (
					<span>
						{[syllabus[0]?.name, date]
							.filter((item) => !!item)
							.join(', ')}
					</span>
				)}
			</div>
			{!isRichtextElementEmpty(videoTile.elements.caption) && (
				<RichText
					mappings={mappings}
					linkedItems={linkedItems}
					richTextElement={videoTile.elements.caption}
				></RichText>
			)}
		</>
	)
}

export default function UiVideoTile({
	linkedItem,
	linkedItems,
	mappings,
}: RichtextSectionProps<UiVideoTileModel>): JSX.Element {
	const { pageResponseLinkedItems, mappings: configMappings } =
		useKontentHomeConfig()
	const _linkedItems = linkedItems || pageResponseLinkedItems
	const _mappings = mappings || configMappings

	const {
		currentVideoIframeUrl,
		currentVideoLabel,
		openVideo,
		hideVideo,
		openVideoModal,
	} = useVideoModal()

	const handleCardClick = (video: string, label: string) => {
		openVideo(video, label)
	}

	return (
		<>
			<IntroductionVideoCard
				label=""
				date={
					new Date(
						linkedItem.elements.date.value ||
							linkedItem.system.lastModified,
					)
				}
				title={linkedItem.elements.title.value}
				description={getDescription(
					linkedItem,
					_mappings,
					_linkedItems,
				)}
				thumbnail={
					linkedItem.elements.thumbnail.value.length
						? kontentImageLoader({
								src: linkedItem.elements.thumbnail?.value?.[0]
									.url,
								width: 640,
								quality: 75,
						  })
						: undefined
				}
				onCardClick={handleCardClick}
				video={linkedItem.elements.video_url.value}
				transcriptFile={linkedItem.elements.transcript.value?.[0]?.url}
				data-videourl={linkedItem.elements.video_url.value}
				data-videolabel={linkedItem.elements.title.value}
			/>
			{openVideoModal && currentVideoIframeUrl && (
				<VideoModal
					key={currentVideoIframeUrl}
					ariaLabel={currentVideoLabel}
					modalStatus={openVideoModal}
					onCancel={hideVideo}
					video={currentVideoIframeUrl}
				/>
			)}
		</>
	)
}
