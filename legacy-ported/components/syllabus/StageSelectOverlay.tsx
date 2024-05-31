import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { TaxoStageWithLifeSkill } from '@/types'
import type { ElementModels, ITaxonomyTerms } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { arrayToggleMultiple } from '../../utilities/functions'
import CustomPopover, { CustomPopoverProps } from '../base/CustomPopover'
import StagePicker from '../custom/StagePicker'

export interface StageSelectOverlayProps
	extends Pick<
		CustomPopoverProps,
		| 'title'
		| 'popoverStatus'
		| 'popoverAnchor'
		| 'onCancel'
		| 'anchorOrigin'
	> {
	title?: string
	selected: ITaxonomyTerms['codename'][]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	disabledStages?: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	onConfirm: (_selected: ITaxonomyTerms['codename'][]) => void
}

const StageSelectOverlay = (props: StageSelectOverlayProps): JSX.Element => {
	const {
		selected,
		onConfirm,
		stageGroups,
		stages,
		disabledStages = [],
		...popoverProps
	} = props

	const [stageIds, setStageIds] = useState(selected)
	const [stageError, setStageError] = useState(false)

	const handleStageModalConfirm = () => {
		if (stageIds.length >= 1) {
			onConfirm(stageIds)
			setStageError(false)
		} else {
			setStageError(true)
		}
	}

	const handleStageSelect = (ids: string[]) => {
		setStageIds(arrayToggleMultiple(stageIds, ids))
	}

	return (
		<CustomPopover onConfirm={handleStageModalConfirm} {...popoverProps}>
			<Grid className="w-full">
				<GridWrapper>
					<StagePicker
						stageGroups={stageGroups}
						stages={stages}
						disabledStages={disabledStages}
						selected={stageIds}
						onChange={handleStageSelect}
					/>
					{stageError && (
						<Grid item xs={12}>
							<span className="syllabus-header-dialog__error">
								Please select at least 1 stage
							</span>
						</Grid>
					)}
				</GridWrapper>
			</Grid>
		</CustomPopover>
	)
}
export default StageSelectOverlay
