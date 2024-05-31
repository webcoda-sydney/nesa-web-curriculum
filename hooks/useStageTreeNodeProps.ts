import { TaxoStage } from '@/kontent/taxonomies/stage'
import { TaxoStageGroup } from '@/kontent/taxonomies/stage_group'
import { mapTreeElementToTreeNode } from '@/layouts/wp_dc_recentchanges'
import { makeStageGroupOptions } from '@/layouts/wp_teachingadvice'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { useMemo } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'

export const useStageTreeNodeProps = ({
	stageGroups,
	stages,
	selectedStages,
	withLifeSkillsOnSecondaryAndSenior = false,
}: {
	stageGroups: ElementModels.TaxonomyTerm<TaxoStageGroup>[]
	stages: ElementModels.TaxonomyTerm<TaxoStage>[]
	selectedStages: TaxoStage[]
	withLifeSkillsOnSecondaryAndSenior?: boolean
}) =>
	useMemo<TreeNodeProps[]>(
		() =>
			makeStageGroupOptions(
				stageGroups,
				stages,
				withLifeSkillsOnSecondaryAndSenior,
			).map((treeElement) =>
				mapTreeElementToTreeNode(treeElement, selectedStages),
			),
		[
			stageGroups,
			stages,
			selectedStages,
			withLifeSkillsOnSecondaryAndSenior,
		],
	)
