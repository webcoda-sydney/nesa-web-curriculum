import { CombinedReleaseNote } from '@/databuilders/wp_dc_recentchanges'
import { Mapping } from '@/types'
import { Responses } from '@kontent-ai/delivery-sdk'
import { optimiseSystemJson } from '../optimise-json'
import { getReleaseNoteTitle } from './getReleaseNoteTitle'

export function buildAceReleaseNotesMappings(
	releaseNotes: Responses.IListContentItemsResponse<CombinedReleaseNote>,
): Mapping[] {
	// only return release notes with a slug
	return releaseNotes.items
		.filter((item) => !!item.elements.slug.value)
		.map((releaseNote) => {
			return {
				params: {
					pageTitle:
						getReleaseNoteTitle(
							releaseNote,
							releaseNotes.linkedItems,
						) || releaseNote.elements.title.value,
					slug: [
						'resources',
						'record-of-changes',
						releaseNote.elements.slug.value,
					],
					navigationItem: optimiseSystemJson(releaseNote.system),
					excludeInSitemap: false,
					isCanonical: true,
				},
			} as Mapping
		})
}
