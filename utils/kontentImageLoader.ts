import { transformImageUrl } from '@kontent-ai/delivery-sdk'

export interface IRectCrop {
	x: number
	y: number
	rectWidth: number
	rectHeight: number
}

export const getImageLoaderWithHeight = (
	renditionWidth,
	renditionHeight,
	rectCrop: IRectCrop = null,
) => {
	return ({ src, width, quality }): string => {
		// https://docs.kontent.ai/reference/image-transformation
		let builder = transformImageUrl(src)
			.withWidth(width)
			.withQuality(quality || 75)
			.withCompression('lossless')
			.withAutomaticFormat()

		if (rectCrop) {
			const aspectRatio = renditionHeight / renditionWidth
			const height = aspectRatio * width
			builder = builder.withHeight(height)
			if (rectCrop) {
				builder = builder.withRectangleCrop(
					rectCrop.x,
					rectCrop.y,
					rectCrop.rectWidth,
					rectCrop.rectHeight,
				)
			}
		}
		return builder.getUrl()
	}
}

const kontentImageLoader = getImageLoaderWithHeight(undefined, undefined)

export default kontentImageLoader
