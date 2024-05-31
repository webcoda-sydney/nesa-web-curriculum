import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { STYLES } from '@/constants/styles'
import { TREE_ID_LABELS } from '@/constants/treepickeroptions'
import { Syllabus } from '@/kontent/content-types'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import { CustomViewErrorAlert } from '@/layouts/wp_custom_view'
import { TaxoStageWithLifeSkill } from '@/types'
import {
	byTaxoCodename,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	isYes,
} from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { forwardRef, useState } from 'react'
import { arrayToggleMultiple } from '../../utilities/functions'
import TreePicker from './TreePicker'
import { TreeElement } from './treeUtils'

export const makeLearningAreaTree = (
	syllabuses: Syllabus[],
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[],
	isSyllabusValueFromSyllabusTaxoCodename = false,
	disabledKeyLearningAreas = [] as TaxoKeyLearningArea[],
): TreeElement[] =>
	keyLearningAreas.map((kla) => {
		const children = syllabuses
			.filter(
				(syl) =>
					syl.elements.key_learning_area__items.value.some(
						(sylKla) => sylKla.codename === kla.codename,
					) &&
					(isAllowPreviewExternalSyllabus() ||
						!isYes(syl.elements.doredirect)),
			)
			.map((syl) => {
				return {
					id: isSyllabusValueFromSyllabusTaxoCodename
						? syl.elements.syllabus.value?.[0]?.codename
						: syl.system.codename,
					label: syl.elements.title.value,
					disabled: isIntersect(
						syl.elements.key_learning_area__items.value.map(
							byTaxoCodename,
						),
						disabledKeyLearningAreas,
					),
				}
			})
		const childrenNotDisabled = children.filter((c) => !c.disabled)

		return {
			id: kla.codename,
			label: kla.name,
			disabled: !childrenNotDisabled.length,
			children: children,
		}
	})

export const makeStageOptions = (
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[],
	disabledStages: TaxoStageWithLifeSkill[] = [],
): TreeElement[] => {
	const _temp = stages.map((s) => ({
		id: s.codename,
		label: s.name,
		disabled: disabledStages.includes(s.codename),
	}))
	return _temp
}

export interface CustomSyllabusPickerProps {
	syllabuses: Syllabus[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	showLearningAreaError: boolean
	showStageError: boolean
	showElementsError: boolean
	disabledLearningAreas: TaxoKeyLearningArea[]
	disabledStages: TaxoStageWithLifeSkill[]
	onChange: (_selected: {
		learningAreas: string[]
		stages: string[]
		elements: string[]
	}) => void
	syllabusElementsOptions: TreeElement[]

	initialSelectedSyllabuses?: string[]
	initialSelectedStages?: string[]
	initialSelectedElements?: string[]
}

const CustomSyllabusPicker = forwardRef<
	HTMLDivElement,
	CustomSyllabusPickerProps
>((props, ref) => {
	const {
		onChange,
		syllabuses: allSyllabuses,
		keyLearningAreas,
		stages: allStages,
		showLearningAreaError,
		showStageError,
		showElementsError,
		disabledLearningAreas,
		disabledStages,
		syllabusElementsOptions,
		initialSelectedSyllabuses = [],
		initialSelectedStages = [],
		initialSelectedElements = [],
	} = props

	// selected items
	const [learningAreas, setLearningAreas] = useState<string[]>(
		initialSelectedSyllabuses,
	)
	const [stages, setStages] = useState<string[]>(initialSelectedStages)
	const [elements, setElements] = useState<string[]>(initialSelectedElements)

	const handleLearningAreas = (ids: string[]) => {
		const updated = arrayToggleMultiple(learningAreas, ids)
		setLearningAreas(updated)

		if (onChange) {
			onChange({
				learningAreas: updated,
				stages,
				elements,
			})
		}
	}

	const handleStages = (ids: string[]) => {
		const updated = arrayToggleMultiple(stages, ids)
		setStages(updated)

		if (onChange) {
			onChange({
				learningAreas,
				stages: updated,
				elements,
			})
		}
	}

	const handleElements = (ids: string[]) => {
		let updated = arrayToggleMultiple(elements, ids)

		// DC-357 Clear AccessPoints and Examples when content is unselected
		if (
			ids.includes(TREE_ID_LABELS.CONTENT.id) &&
			!updated.includes(TREE_ID_LABELS.CONTENT.id)
		) {
			updated = updated.filter(
				(element) =>
					//element !== TREE_ID_LABELS.ADDRESSED_IN_PARALLEL.id &&
					element !== TREE_ID_LABELS.ACCESS_POINTS.id &&
					element !== TREE_ID_LABELS.EXAMPLES.id &&
					element !== TREE_ID_LABELS.CURRICULUM_CONNECTIONS.id &&
					element !== TREE_ID_LABELS.TAGS.id,
			)
		}
		// DC-357 Select content if AccessPoints or Examples are selected
		if (
			//updated.includes(TREE_ID_LABELS.ADDRESSED_IN_PARALLEL.id) ||
			(updated.includes(TREE_ID_LABELS.ACCESS_POINTS.id) ||
				updated.includes(TREE_ID_LABELS.EXAMPLES.id) ||
				updated.includes(TREE_ID_LABELS.CURRICULUM_CONNECTIONS.id) ||
				updated.includes(TREE_ID_LABELS.TAGS.id)) &&
			!updated.includes(TREE_ID_LABELS.CONTENT.id)
		) {
			updated.push(TREE_ID_LABELS.CONTENT.id)
		}

		setElements(updated)

		if (onChange) {
			onChange({
				learningAreas,
				stages,
				elements: updated,
			})
		}
	}

	return (
		<div ref={ref}>
			<GridWrapper>
				<GridCol lg={4}>
					<TreePicker
						title="Learning areas and subjects *"
						rootElements={makeLearningAreaTree(
							allSyllabuses,
							keyLearningAreas,
							false,
							disabledLearningAreas,
						)}
						selected={learningAreas}
						onChange={handleLearningAreas}
						slotAfterTitle={
							showLearningAreaError && (
								<CustomViewErrorAlert>
									Please select a learning area
								</CustomViewErrorAlert>
							)
						}
					/>
				</GridCol>
				<GridCol lg={4}>
					<TreePicker
						title="Stages *"
						rootElements={makeStageOptions(
							allStages,
							disabledStages,
						)}
						selected={stages}
						onChange={handleStages}
						slotAfterTitle={
							showStageError && (
								<CustomViewErrorAlert>
									Please select a stage
								</CustomViewErrorAlert>
							)
						}
						css={STYLES.LIFE_SKILL_TREE_PICKER}
					/>
				</GridCol>
				<GridCol lg={4}>
					<TreePicker
						title="Syllabus elements *"
						rootElements={syllabusElementsOptions}
						selected={elements}
						onChange={handleElements}
						slotAfterTitle={
							showElementsError && (
								<CustomViewErrorAlert>
									Please select a syllabus element
								</CustomViewErrorAlert>
							)
						}
						css={STYLES.TAGS_TREE_PICKER}
						defaultExpanded="top-level"
					/>
				</GridCol>
			</GridWrapper>
		</div>
	)
})

export default CustomSyllabusPicker
