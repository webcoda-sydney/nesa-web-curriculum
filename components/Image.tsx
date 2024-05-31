import { getImageLoaderWithHeight, IRectCrop } from '@/utils/kontentImageLoader'
import { ElementModels, IRichTextImage } from '@kontent-ai/delivery-sdk'
import useTheme from '@mui/material/styles/useTheme'
import NextImage, { ImageProps } from 'next/image'
import { srcIsKontentAsset } from '../utils'

export interface IImageProps extends Omit<ImageProps, 'src'> {
	width?: number
	height?: number
	asset: ElementModels.AssetModel | IRichTextImage
}

const isAssetElementAssetModel = (
	asset: ElementModels.AssetModel | IRichTextImage,
): asset is ElementModels.AssetModel => {
	return 'renditions' in asset && 'default' in asset.renditions
}

const Image = (props: IImageProps) => {
	const { asset, width, height, layout = 'intrinsic', ...rest } = props
	const theme = useTheme()

	if (!asset) return null
	let url = asset.url
	let crop: IRectCrop = null
	const isAssetModel = isAssetElementAssetModel(asset)

	const componentWidth = isAssetModel
		? asset.renditions.default.width || width || asset.width
		: width || asset.width || theme.breakpoints.values.md
	const componentHeight = isAssetModel
		? asset.renditions.default.height
		: height || (componentWidth / asset.width) * asset.height

	if (isAssetModel) {
		const searchParams = new URLSearchParams(asset.renditions.default.query)
		const qRect = searchParams.get('rect')?.split(',')

		crop = {
			x: parseFloat(qRect[0]),
			y: parseFloat(qRect[1]),
			rectWidth: parseFloat(qRect[2]),
			rectHeight: parseFloat(qRect[3]),
		}
	}

	const loader = srcIsKontentAsset(asset.url)
		? getImageLoaderWithHeight(componentWidth, componentHeight, crop)
		: undefined

	return (
		<NextImage
			{...rest}
			src={url}
			width={componentWidth}
			height={componentHeight}
			loader={loader}
			layout={layout}
		/>
	)
}

export default Image
