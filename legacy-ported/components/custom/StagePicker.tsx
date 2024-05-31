import { STAGEGROUPS_STAGES } from '@/constants'
import { STYLES } from '@/constants/styles'
import type { TaxoStage } from '@/kontent/taxonomies/stage'
import type { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { TaxoStageWithLifeSkill } from '@/types'
import type { ElementModels } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import intersection from 'lodash.intersection'
import type { FixedTreePickerProps } from './TagPicker'
import TreePicker from './TreePicker'
import { TreeElement } from './treeUtils'

export type StagePickerProps = FixedTreePickerProps & {
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	disabledStages?: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
}

export type TStageGroupPicker = ElementModels.TaxonomyTerm<TaxoStageGroup> & {
	rootElements: TreeElement[]
}

export const getLifeSkillsTreeElement = (
	disabledStages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
): TreeElement => {
	return {
		id: 'life_skills',
		label: 'Life Skills',
		disabled: disabledStages.some((ds) => ds.codename === 'life_skills'),
	}
}

export const getStageGroupWithLifeSkill = (
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[],
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
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
			let rootElements = stages
				.filter((s) =>
					STAGEGROUPS_STAGES[stageGroup.codename].includes(
						s.codename as TaxoStage,
					),
				)
				.map<TreeElement>((s) => {
					return {
						id: s.codename,
						label: s.name.replace(/\(.*\)/, ''),
						disabled: disabledStages.some(
							(ds) => ds.codename === s.codename,
						),
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

const StagePicker = (props: StagePickerProps): JSX.Element => {
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
							selected={intersection(
								selected,
								stages.map((item) => item.codename),
							)}
							{...others}
							css={STYLES.LIFE_SKILL_TREE_PICKER}
						/>
					</Grid>
				)
			})}
		</>
	)
}

export default StagePicker
