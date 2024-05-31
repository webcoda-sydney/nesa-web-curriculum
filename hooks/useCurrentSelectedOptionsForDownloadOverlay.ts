import { ISyllabusTab } from '@/legacy-ported/types'
import { useMemo } from 'react'

export const useCurrentSelectedOptionsForDownloadOverlay = (
	currentTabs: ISyllabusTab[],
) => {
	return useMemo(() => {
		const result = currentTabs
			.flatMap((tab) => {
				return tab.id
			})
			.filter((t) => t !== 'teaching-and-learning')
		if (result.includes('content')) {
			result.push('teaching-advice', 'access-points', 'examples', 'tags')
		}
		return result
	}, [currentTabs])
}
