import { ISyllabus } from '../backendTypes'

export interface RequiredSyllabusComponents {
	id: ISyllabus['id']
	requireGlossary?: boolean
	requireOutcomes?: boolean
	requireFiles?: boolean
	requireContents?: boolean
}
