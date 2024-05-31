import Image from '@/components/Image'
import type { UiMedia } from '@/kontent/content-types/ui_media'
import { Media } from 'nsw-ds-react'
import type { MediaProps } from 'nsw-ds-react/src/component/media/media'
import type { RichtextSectionProps } from '.'

export default function ui_media({
	linkedItem,
}: RichtextSectionProps<UiMedia>) {
	const { align, image, theme, video, type, width, caption } =
		linkedItem.elements

	const _image = image?.value?.[0]
	const _width = _image?.width
	const _height = _image?.height

	const isImage = type.value[0].codename !== 'video'
	const widthNumber = width.value[0].codename.replace(/[n|_]/g, '')
	const videoUrl = isImage ? '' : video.value
	const alignStr = align.value[0].codename || 'centre'
	const style = theme.value[0]?.codename || 'default'
	const alt = _image?.description || caption.value || ''

	return (
		<Media
			caption={caption.value !== '' ? caption.value : ''}
			title={caption.value}
			video={videoUrl}
			left={
				(alignStr === 'left'
					? widthNumber
					: 'none') as MediaProps['left']
			}
			center={
				(alignStr === 'centre'
					? widthNumber
					: 'none') as MediaProps['center']
			}
			right={
				(alignStr === 'right'
					? widthNumber
					: 'none') as MediaProps['right']
			}
			style={style as MediaProps['style']}
		>
			{/* eslint-disable jsx-a11y/alt-text */}
			{isImage && image ? (
				<Image
					alt={alt}
					asset={_image}
					width={_width}
					height={_height}
				/>
			) : null}
		</Media>
	)
}
