import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { STYLES } from '@/constants/styles'
import { Syllabus } from '@/kontent/content-types'
import { taxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoKeyLearningArea,
	TaxoResourceType,
	TaxoStage,
} from '@/kontent/taxonomies'
import {
	CustomViewErrorAlert,
	ExtendedResourceTypes,
} from '@/layouts/wp_custom_view'
import { TaxoStageWithLifeSkill } from '@/types'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { arrayToggleMultiple } from '../../utilities/functions'
import { makeLearningAreaTree, makeStageOptions } from './CustomSyllabusPicker'
import TreePicker from './TreePicker'
import { TreeElement } from './treeUtils'

const useResourceTree = (disabledResources: TaxoResourceType[] = []) => {
	return useMemo(() => {
		return [
			...Object.entries(taxonomies.resource_type.terms)
				.filter(([key]) => {
					const _key = key as TaxoResourceType
					return _key !== 'web_resource' && !/^ace_/gi.test(_key)
				})
				.map(([_key, term]) => {
					return {
						id: term.codename,
						label: term.name,
						disabled: disabledResources.includes(
							term.codename as TaxoResourceType,
						),
						// children:
						// 	_key === 'languagesupport'
						// 		? Object.entries(taxonomies.language.terms).map(
						// 				([_, term]) => ({
						// 					id: term.codename,
						// 					label: term.name,
						// 				}),
						// 		  )
						// 		: undefined,
					} as TreeElement
				}),

			{
				id: 'glossary',
				label: 'Glossary',
			},
		]
	}, [disabledResources])
}

export interface CustomResourcePickerProps<
	T extends ExtendedResourceTypes = ExtendedResourceTypes,
> {
	syllabuses: Syllabus[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	disabledLearningAreas: TaxoKeyLearningArea[]
	disabledStages: TaxoStageWithLifeSkill[]
	showLearningAreaError: boolean
	showStageError: boolean
	showResourcesError: boolean
	onChange: (_selected: {
		learningAreas: string[]
		stages: string[]
		resources: string[]
	}) => void
	disabledResourceTypes: T[]
	initialResources: T[]
}

const CustomResourcePicker = forwardRef<
	HTMLDivElement,
	CustomResourcePickerProps
>(<T extends string>(props, ref) => {
	const {
		onChange,
		syllabuses: allSyllabuses,
		keyLearningAreas: allKeyLearningAreas,
		stages: allStages,
		showLearningAreaError,
		showStageError,
		showResourcesError,
		disabledLearningAreas,
		disabledStages,
		disabledResourceTypes = [],
		initialResources = [],
	} = props

	// selected items
	const [learningAreas, setLearningAreas] = useState<string[]>([])
	const [stages, setStages] = useState<TaxoStage[]>([])
	const [resources, setResources] = useState<T[]>(initialResources)

	const resourceTree = useResourceTree(disabledResourceTypes)

	const handleLearningAreas = (ids: string[]) => {
		const updated = arrayToggleMultiple(learningAreas, ids)
		setLearningAreas(updated)

		if (onChange) {
			onChange({
				learningAreas: updated,
				stages,
				resources,
			})
		}
	}

	const handleStages = (ids: TaxoStage[]) => {
		const updated = arrayToggleMultiple(stages, ids)
		setStages(updated)

		if (onChange) {
			onChange({
				learningAreas,
				stages: updated,
				resources,
			})
		}
	}

	const handleResources = (ids: T[]) => {
		const updated = arrayToggleMultiple(resources, ids)
		setResources(updated)

		if (onChange) {
			onChange({
				learningAreas,
				stages,
				resources: updated,
			})
		}
	}

	useEffect(() => {
		setResources(initialResources)
	}, [initialResources])

	return (
		<div ref={ref}>
			<GridWrapper>
				<GridCol lg={4}>
					<TreePicker
						title="Learning areas and subjects *"
						rootElements={makeLearningAreaTree(
							allSyllabuses,
							allKeyLearningAreas,
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
						title="Syllabus support materials *"
						rootElements={resourceTree}
						selected={resources}
						onChange={handleResources}
						slotAfterTitle={
							showResourcesError && (
								<CustomViewErrorAlert>
									Please select a syllabus support material
								</CustomViewErrorAlert>
							)
						}
						css={{
							'.tree-picker-id-glossary': {
								borderTop: '1px solid var(--nsw-grey-01)',
								marginTop: 8,
								paddingTop: 8,
							},
						}}
					/>
				</GridCol>
			</GridWrapper>
		</div>
	)
})

export default CustomResourcePicker
