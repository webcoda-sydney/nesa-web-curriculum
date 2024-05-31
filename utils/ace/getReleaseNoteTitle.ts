import { CombinedReleaseNote } from '@/databuilders/wp_dc_recentchanges'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'

export const getReleaseNoteTitle = (
	releaseNote: CombinedReleaseNote,
	linkedItems: IContentItemsContainer,
) => {
	return releaseNote.elements.title.value || ''

	// const _isReleaseNoteGeneral = isReleasenoteGeneral(releaseNote)

	// if (isReleasenoteSyllabus(releaseNote)) {
	// 	return releaseNote.elements.syllabus.value[0]?.name
	// }

	// if (
	// 	(isReleasenoteSyllabusMultiple(releaseNote) ||
	// 		isReleasenoteSyllabusKla(releaseNote) ||
	// 		_isReleaseNoteGeneral) &&
	// 	!isReleasenoteAceKla(releaseNote) &&
	// 	!isReleasenoteAceSyllabus(releaseNote)
	// ) {
	// 	let _title =
	// 		releaseNote.elements.title.value ||
	// 		(!_isReleaseNoteGeneral ? 'Multiple syllabuses' : '')
	// 	return (
	// 		_title +
	// 		`${
	// 			// for development only
	// 			process.env.NODE_ENV === 'development'
	// 				? ` (${releaseNote.system.type})`
	// 				: ''
	// 		}`
	// 	)
	// }

	// const subgroup = getLinkedItems(
	// 	releaseNote.elements.subgroup,
	// 	linkedItems,
	// )?.[0]

	// return (
	// 	'ACE Rules: ' +
	// 	(subgroup?.elements.title.value || '') +
	// 	`${
	// 		// for development only
	// 		process.env.NODE_ENV === 'development'
	// 			? ` (${releaseNote.system.type})`
	// 			: ''
	// 	}`
	// )
}
