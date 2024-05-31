import { STAGEGROUPS_STAGES, STAGEGROUPS_YEARS, YEARS } from '@/constants'
import { STYLES } from '@/constants/styles'
import { TaxoStageYear } from '@/kontent/taxonomies'
import type { TaxoStage } from '@/kontent/taxonomies/stage'
import type { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { TaxoStageWithLifeSkill } from '@/types'
import type { ElementModels } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { getLifeSkillsTreeElement } from './StagePicker'
import type { FixedTreePickerProps } from './TagPicker'
import TreePicker from './TreePicker'
import { TreeElement } from './treeUtils'

export type YearPickerProps = FixedTreePickerProps & {
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	years: ElementModels.TaxonomyTerm<TaxoStageYear>[]
	disabledStages?: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
}

export type TStageGroupPicker = ElementModels.TaxonomyTerm<TaxoStageGroup> & {
	rootElements: TreeElement[]
}

export const getStageGroupWithLifeSkill = (
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[],
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
	years: ElementModels.TaxonomyTerm<TaxoStageYear>[],
	disabledStages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
) => {
	const lifeSkillTreeElement = getLifeSkillsTreeElement(disabledStages)

	const _stageGroups = stageGroups.filter((stageGroup) => {
		const stageGroupStages = stages.filter((s) =>
			STAGEGROUPS_STAGES[stageGroup.codename].includes(
				s.codename as TaxoStage,
			),
		)
		return stageGroupStages.length
	})

	if (_stageGroups.length) {
		return _stageGroups.map((stageGroup, index) => {
			let rootElements = years
				.filter((year) =>
					STAGEGROUPS_YEARS[stageGroup.codename].includes(
						year.codename as TaxoStageYear,
					),
				)
				.map<TreeElement>((s) => {
					return {
						id: s.codename,
						label: `Year ${s.name.replace(/\(.*\)/, '')}`,
						// disabled: disabledStages.some(
						// 	(ds) => ds.codename === s.codename,
						// ),
					}
				})

			if (
				index === _stageGroups.length - 1 &&
				stages.some((s) => s.codename === 'life_skills')
			) {
				rootElements.push(lifeSkillTreeElement)
			}

			return {
				...stageGroup,
				rootElements,
			} as TStageGroupPicker
		})
	}

	// Make a dummy life skills stage group
	return [
		{
			codename: 'life_skills_stagegroup',
			name: 'Life Skills',
			rootElements: [lifeSkillTreeElement],
		},
	]
}

export const YearPicker = (props: YearPickerProps): JSX.Element => {
	const {
		selected,
		stageGroups,
		disabledStages = [],
		stages,
		...others
	} = props

	const _stageGroups = getStageGroupWithLifeSkill(
		stageGroups,
		stages,
		YEARS,
		disabledStages,
	)

	return (
		<>
			{_stageGroups.map((stageGroup) => {
				return (
					<Grid
						key={stageGroup.codename}
						item
						xs={12}
						md={12 / _stageGroups.length}
					>
						<h6 className="mb-2">{stageGroup.name}</h6>
						<TreePicker
							rootElements={stageGroup.rootElements}
							selected={selected}
							{...others}
							css={STYLES.LIFE_SKILL_TREE_PICKER}
						/>
					</Grid>
				)
			})}
		</>
	)
}
