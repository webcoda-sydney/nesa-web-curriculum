import { UiVideoTiles as UiVideoTilesModel } from '@/kontent/content-types/ui_video_tiles'
import Grid from '@mui/material/Grid'
import type { RichtextSectionProps } from '.'
import { ModuleSectionWrapper } from '../ModuleSectionWrapper'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import { GridCol } from '../nsw/grid/GridCol'
import { GridWrapper } from '../nsw/grid/GridWrapper'
import UiVideoTile from './ui_video_tile'

export default function UiVideoTiles({
	linkedItem,
}: RichtextSectionProps<UiVideoTilesModel>): JSX.Element {
	const { items } = linkedItem.elements
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	const itemsLinkedItems = getLinkedItems(items, pageResponseLinkedItems)

	return (
		<ModuleSectionWrapper>
			<GridWrapper justifyContent="flex-start">
				{itemsLinkedItems.map((video) => (
					<GridCol key={video.system.id} md={6} lg={4}>
						<UiVideoTile linkedItem={video}></UiVideoTile>
					</GridCol>
				))}
				{itemsLinkedItems.length === 0 && (
					<Grid container justifyContent="center">
						<div className="mt-4 font-bold">No results found</div>
					</Grid>
				)}
			</GridWrapper>
		</ModuleSectionWrapper>
	)
}
