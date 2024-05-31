import { TaxoLanguage } from '@/kontent/taxonomies'

import { TaxoPathways } from '@/kontent/taxonomies'
import { ElementModels } from '@kontent-ai/delivery-sdk'

export interface ReducerStateContent {
	selectedFocusAreaCodename: string
	selectedFocusAreaOptionCodename: string
	showAccessPoints: boolean
	showTeachingSupport: boolean
	showExamples: boolean
	showCurriculumConnection: boolean
	selectedFilterViewLifeSkill: boolean
	selectedExampleLanguages: Record<string, TaxoLanguage[]>
	selectedPathways: ElementModels.TaxonomyTerm<TaxoPathways>[]
}

export type ReducerActionContent =
	| { type: 'SET_SELECTEDFOCUSAREACODENAME'; payload: string }
	| { type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME'; payload: string }
	| { type: 'SET_SHOWACCESSPOINTS'; payload: boolean }
	| { type: 'SET_SHOWTEACHINGSUPPORT'; payload: boolean }
	| { type: 'SET_ISFIRSTLOAD'; payload: boolean }
	| { type: 'SET_SHOWEXAMPLES'; payload: boolean }
	| { type: 'SET_SELECTEDFILTERVIEWLIFESKILL'; payload: boolean }
	| {
			type: 'TOGGLE_SELECTEDLIFESKILLFOCUSAREA'
			payload: { focusAreaCodename: string }
	  }
	| { type: 'SET_ISSCROLLING'; payload: boolean }
	| {
			type: 'SET_SELECTEDEXAMPLELANGUAGES'
			payload: Record<string, TaxoLanguage[]>
	  }
	| {
			type: 'SET_SELECTEDPATHWAYS'
			payload: ElementModels.TaxonomyTerm<TaxoPathways>[]
	  }
	| {
			type: 'SET_SHOWCURRICULUMCONNECTION'
			payload: boolean
	  }

export const reducerContent = (
	draft: ReducerStateContent,
	action: ReducerActionContent,
) => {
	switch (action.type) {
		case 'SET_SELECTEDFOCUSAREACODENAME':
			draft.selectedFocusAreaCodename = action.payload
			break
		case 'SET_SELECTEDFOCUSAREAOPTIONCODENAME':
			draft.selectedFocusAreaOptionCodename = action.payload
			break
		case 'SET_SHOWACCESSPOINTS':
			draft.showAccessPoints = action.payload
			break
		case 'SET_SHOWEXAMPLES':
			draft.showExamples = action.payload
			break
		case 'SET_SHOWTEACHINGSUPPORT':
			draft.showTeachingSupport = action.payload
			break
		case 'SET_SELECTEDFILTERVIEWLIFESKILL':
			draft.selectedFilterViewLifeSkill = action.payload
			break
		case 'TOGGLE_SELECTEDLIFESKILLFOCUSAREA':
			draft.selectedFilterViewLifeSkill =
				!draft.selectedFilterViewLifeSkill
			draft.selectedFocusAreaCodename = action.payload.focusAreaCodename
			break
		case 'SET_SELECTEDEXAMPLELANGUAGES':
			draft.selectedExampleLanguages = action.payload
			break
		case 'SET_SELECTEDPATHWAYS':
			draft.selectedPathways = [...action.payload]
			break
		case 'SET_SHOWCURRICULUMCONNECTION':
			draft.showCurriculumConnection = action.payload
			break
	}
}
