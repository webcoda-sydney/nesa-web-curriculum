import { Syllabus } from '@/kontent/content-types'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies/stage'
import { CustomSyllabusTab, TaxoStageWithLifeSkill } from '@/types'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import Grid from '@mui/material/Grid'
import { MouseEvent, ReactNode, useRef, useState } from 'react'
import CustomModal, {
	CustomModalProps,
} from '../../legacy-ported/components/base/CustomModal'
import CustomSyllabusPicker from '../../legacy-ported/components/custom/CustomSyllabusPicker'
import { TreeElement } from '../../legacy-ported/components/custom/treeUtils'

export interface ViewSelection {
	tabs: CustomSyllabusTab[]
	syllabuses?: string[]
	tags?: string[]
	stages?: TaxoStageWithLifeSkill[]
}

export interface CommonSyllabusModalProps
	extends Pick<
		CustomModalProps,
		'confirmButtonText' | 'hideConfirmButton' | 'hideCancelButton'
	> {
	/**
	 * Modal title
	 */
	title: string

	/**
	 * Show/Hide modal flag variable
	 */
	modalStatus: boolean

	/**
	 * Function to be used on the Cancel button
	 */
	onCancel?: (_event: MouseEvent<HTMLButtonElement>) => void

	/**
	 * Function to be used on the Confirm button
	 */
	onConfirm: (
		_selection: ViewSelection,
		_e?: MouseEvent<HTMLButtonElement>,
	) => void

	/**
	 * Currently visible syllabus tabs
	 */
	selectedElements: CustomSyllabusTab[]

	/**
	 * Currently selected learning areas
	 */
	selectedSyllabuses?: string[]

	/**
	 * Currently selected stages
	 */
	selectedStages?: TaxoStageWithLifeSkill[]

	/** Additional */
	syllabuses: Syllabus[]
	keyLearningAreas: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	disabledStages: TaxoStage[]
	disabledLearningAreas: TaxoKeyLearningArea[]

	customModalSlotActions?: (_states: {
		showElementsError: boolean
		showLearningAreaError: boolean
		showStageError: boolean
		handleConfirm: CustomModalProps['handleConfirm']
	}) => ReactNode

	syllabusElementsOptions: TreeElement[]
}

/**
 * Edit View Modal
 * @param props
 * @constructor
 */
export const CommonSyllabusModal = (props: CommonSyllabusModalProps) => {
	const {
		title,
		onConfirm,
		onCancel,
		modalStatus,
		selectedElements: initialSelectedElements,
		selectedSyllabuses: initialSelectedSyllabuses,
		selectedStages: initialSelectedStages,

		// additional
		syllabuses,
		keyLearningAreas,
		stages,
		disabledStages,
		disabledLearningAreas,
		customModalSlotActions,

		hideConfirmButton,
		hideCancelButton,
		confirmButtonText,
		syllabusElementsOptions,
	} = props

	const refCustomSyllabusPicker = useRef<HTMLDivElement>()

	const [selectedElements, setElements] = useState<CustomSyllabusTab[]>(
		initialSelectedElements,
	)
	const [selectedSyllabuses, setSyllabuses] = useState(
		initialSelectedSyllabuses,
	)
	const [selectedStages, setStages] = useState(initialSelectedStages)

	const [showElementsError, setShowElementsError] = useState(false)
	const [showLearningAreaError, setShowLearningAreaError] = useState(false)
	const [showStageError, setShowStageError] = useState(false)

	const handleConfirm = (_e: MouseEvent<HTMLButtonElement>) => {
		let tabError = false
		let laError = false
		let tagError = false
		let stageError = false

		tabError = selectedElements.length === 0
		setShowElementsError(tabError)

		if (selectedSyllabuses) {
			laError = selectedSyllabuses.length === 0
			setShowLearningAreaError(laError)
		}

		if (selectedStages) {
			stageError = selectedStages.length === 0
			setShowStageError(stageError)
		}

		if (!tabError && !laError && !tagError && !stageError) {
			onConfirm(
				{
					tabs: selectedElements,
					syllabuses: selectedSyllabuses,
					stages: selectedStages,
				},
				_e,
			)
		} else {
			// Scroll to error
			setTimeout(() => {
				refCustomSyllabusPicker.current
					.querySelector('.nsw-in-page-alert')
					?.parentElement.parentElement.scrollIntoView()
			}, 0)
		}
	}

	const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
		setShowElementsError(false)
		setShowLearningAreaError(false)
		setShowStageError(false)

		if (onCancel) {
			onCancel(e)
		}
	}

	const handleChangeSyllabus = (selected: {
		learningAreas: string[]
		stages: TaxoStage[]
		elements: CustomSyllabusTab[]
	}) => {
		setSyllabuses(selected.learningAreas)
		setStages(selected.stages)
		setElements(selected.elements)

		setShowLearningAreaError(!selected.learningAreas.length)
		setShowStageError(!selected.stages.length)
		setShowElementsError(!selected.elements.length)
	}

	return (
		<CustomModal
			css={{
				'& .MuiDialog-paper': {
					width: '100%',
					maxWidth: 1029,
				},
			}}
			title={title}
			modalStatus={modalStatus}
			handleConfirm={onConfirm ? handleConfirm : undefined}
			handleCancel={handleCancel}
			maxWidth="lg"
			slotActions={
				customModalSlotActions
					? customModalSlotActions({
							showElementsError,
							showLearningAreaError,
							showStageError,
							handleConfirm,
					  })
					: undefined
			}
			hideConfirmButton={hideConfirmButton}
			hideCancelButton={hideCancelButton}
			confirmButtonText={confirmButtonText}
		>
			<Grid className="syllabus-header-dialog">
				<div className="syllabus-header-dialog__tree-picker-wrapper">
					<CustomSyllabusPicker
						ref={refCustomSyllabusPicker}
						syllabuses={syllabuses}
						keyLearningAreas={keyLearningAreas}
						stages={stages}
						syllabusElementsOptions={syllabusElementsOptions}
						disabledLearningAreas={disabledLearningAreas}
						disabledStages={disabledStages}
						showLearningAreaError={showLearningAreaError}
						showStageError={showStageError}
						showElementsError={showElementsError}
						onChange={handleChangeSyllabus}
						initialSelectedSyllabuses={initialSelectedSyllabuses}
						initialSelectedStages={initialSelectedStages}
						initialSelectedElements={initialSelectedElements}
					/>
				</div>
			</Grid>
		</CustomModal>
	)
}
