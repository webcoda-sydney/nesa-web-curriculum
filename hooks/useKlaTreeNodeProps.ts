import { Syllabus } from '@/kontent/content-types/syllabus'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies/key_learning_area'
import { TaxoSyllabus } from '@/kontent/taxonomies/syllabus'
import { mapTreeElementToTreeNode } from '@/layouts/wp_dc_recentchanges'
import { makeLearningAreaTree } from '@/legacy-ported/components/custom/CustomSyllabusPicker'
import { getTaxoCodenames } from '@/utils'
import { ElementModels, Elements } from '@kontent-ai/delivery-sdk'
import { useMemo } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'

export const useKlaTreeNodeProps = ({
	disabledKlas,
	keyLearningAreas,
	syllabuses,
	selectedSyllabus,
}: {
	disabledKlas: Elements.TaxonomyElement<TaxoKeyLearningArea>
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	syllabuses: Syllabus[]
	selectedSyllabus: TaxoSyllabus[]
}) =>
	useMemo<TreeNodeProps[]>(
		() =>
			makeLearningAreaTree(
				syllabuses,
				keyLearningAreas,
				true,
				getTaxoCodenames(disabledKlas),
			)
				.filter((option) => !!option.children?.length)
				.map((treeElement) =>
					mapTreeElementToTreeNode(treeElement, selectedSyllabus),
				),
		[disabledKlas, keyLearningAreas, syllabuses, selectedSyllabus],
	)
