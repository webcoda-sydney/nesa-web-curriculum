import { TREE_OPTIONS_VIEW } from '@/constants/treepickeroptions'
import { CustomSyllabusTab, TaxoStageWithLifeSkill } from '@/types'
import { useState } from 'react'
import {
	CommonSyllabusModal,
	CommonSyllabusModalProps,
} from './CommonSyllabusModal'

export interface ViewSelection {
	tabs: CustomSyllabusTab[]
	syllabuses?: string[]
	tags?: string[]
	stages?: TaxoStageWithLifeSkill[]
}

export type EditViewModalProps = Omit<
	CommonSyllabusModalProps,
	'title' | 'syllabusElementsOptions'
>

export const useEditViewModal = (initialDisplayEditViewModal) => {
	const [displayEditViewModal, setDisplayEditViewModal] = useState(
		initialDisplayEditViewModal,
	)

	const toggleEditOverlay = () => {
		setDisplayEditViewModal(true)
	}
	const handleCancel = () => {
		setDisplayEditViewModal(false)
	}

	return {
		displayEditViewModal,
		setDisplayEditViewModal,
		toggleEditOverlay,
		handleCancel,
	}
}

/**
 * Edit View Modal
 * @param props
 * @constructor
 */
export const EditViewModal = (props: EditViewModalProps): JSX.Element => {
	return (
		<CommonSyllabusModal
			{...props}
			title="Edit view"
			syllabusElementsOptions={TREE_OPTIONS_VIEW}
			confirmButtonText="Update"
		/>
	)
}
