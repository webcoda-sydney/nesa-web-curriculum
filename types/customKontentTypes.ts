import {
	Focusarea,
	Focusareaoption,
	Optionslist,
	Syllabus,
	Teachingadvice,
	WebLinkTeachingadvice,
} from '@/kontent/content-types'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import { Elements, IContentItem } from '@kontent-ai/delivery-sdk'

export type FocusareaOrOptionListOrFocusareoptionExtended = (
	| Focusarea
	| Optionslist
	| Focusareaoption
) &
	IContentItem<{
		key_learning_area__items?: Elements.TaxonomyElement<TaxoKeyLearningArea>
	}>

export interface ExtendedTeachingAdvice extends Teachingadvice {
	focusArea?: Focusarea
	syllabus?: Syllabus
}

export type WebLinkTeachingadviceExtended = WebLinkTeachingadvice & {
	link: string
	elements: WebLinkTeachingadvice['elements'] & {
		updated: Teachingadvice['elements']['updated']
	}
}
