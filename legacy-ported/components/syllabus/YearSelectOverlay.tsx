import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { YEARS } from '@/constants'
import { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { TaxoStageWithLifeSkill } from '@/types'
import type { ElementModels, ITaxonomyTerms } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { arrayToggleMultiple } from '../../utilities/functions'
import CustomPopover, { CustomPopoverProps } from '../base/CustomPopover'
import { YearPicker } from '../custom/YearPicker'

export interface YearSelectOverlayProps
	extends Pick<
		CustomPopoverProps,
		'popoverStatus' | 'popoverAnchor' | 'onCancel' | 'anchorOrigin'
	> {
	title?: string
	selected: ITaxonomyTerms['codename'][]
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	onConfirm: (_selected: ITaxonomyTerms['codename'][]) => void
}

export const YearSelectOverlay = (
	props: YearSelectOverlayProps,
): JSX.Element => {
	const { selected, onConfirm, stageGroups, stages, ...popoverProps } = props

	const [yearIds, setYearIds] = useState(selected)
	const [stageError, setStageError] = useState(false)

	const handleStageModalConfirm = () => {
		if (yearIds.length >= 1) {
			onConfirm(yearIds)
			setStageError(false)
		} else {
			setStageError(true)
		}
	}

	const handleStageSelect = (ids: string[]) => {
		setYearIds(arrayToggleMultiple(yearIds, ids))
	}

	return (
		<CustomPopover onConfirm={handleStageModalConfirm} {...popoverProps}>
			<Grid className="w-full">
				<GridWrapper>
					<YearPicker
						years={YEARS}
						stageGroups={stageGroups}
						stages={stages}
						selected={yearIds}
						onChange={handleStageSelect}
					/>
					{stageError && (
						<Grid item xs={12}>
							<span className="syllabus-header-dialog__error">
								Please select at least 1 year
							</span>
						</Grid>
					)}
				</GridWrapper>
			</Grid>
		</CustomPopover>
	)
}
