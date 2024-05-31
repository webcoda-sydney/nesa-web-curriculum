import { AssetWithRawElements } from '@/types'
import {
	getFilesizeFormatter,
	getFileTypeClassification,
	getStageTagsByTaxoTerms,
} from '@/utils'
import { getAssetUpdatedDate } from '@/utils/assets'
import { Icon } from '@iconify/react'
import useTheme from '@mui/material/styles/useTheme'
import { Button, Card, TagList } from 'nsw-ds-react'
import { MouseEvent, useMemo } from 'react'

const formatFilesize = getFilesizeFormatter()

export interface CardAssetProps {
	asset: AssetWithRawElements
	// eslint-disable-next-line no-unused-vars
	onClick: (ev: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void
}

export const styleCardTagListOnHover = {
	'&:hover .nsw-tag, &:focus .nsw-tag': {
		borderColor: '#fff',
		color: '#fff',
	},
}

export const CardAsset = (props: CardAssetProps) => {
	const { asset, onClick } = props
	const theme = useTheme()

	const tags = getStageTagsByTaxoTerms(asset.stage)

	const assetLastModified = useMemo(() => {
		return getAssetUpdatedDate(asset)
	}, [asset])

	return (
		<Card
			headline={asset.title || asset.fileName}
			tag={
				asset.syllabus.length > 1
					? 'Multiple syllabuses'
					: asset.syllabus?.[0]?.name
			}
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
							Updated: {assetLastModified}
							<br />
							Size: {formatFilesize(asset.size)}
						</>
					</div>
				</div>
				<Button
					linkComponent="a"
					style="dark"
					link={asset.url}
					rel="noindex nofollow"
					onClick={onClick}
					className="justify-center lg:justify-start items-center gap-2"
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
					<Icon
						icon={`fa:file-${getFileTypeClassification(
							asset.type,
						).toLowerCase()}-o`}
						width="24"
						height="24"
					/>
					Download
				</Button>
			</div>
		</Card>
	)
}
