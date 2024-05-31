import { CustomSyllabusTab } from '@/types'

// import { KeyLearningArea } from '@/kontent/content-types/key_learning_area';
export interface ISyllabusTab {
	id: CustomSyllabusTab
	index: number
	name: string
}

export interface ILearningArea {
	id: string
	title: string
	description: string
	available: boolean // TODO remove after MVP
}

// export type KlaWithSyllabuses = KeyLearningArea & { syllabuses: Syllabus[] }
