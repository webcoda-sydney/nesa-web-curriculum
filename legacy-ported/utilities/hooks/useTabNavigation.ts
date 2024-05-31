import SYLLABUS from '../../constants/syllabusConstants'

export default function useTabNavigation<T extends { id: string }>(
	tabs: T[],
	tabValue: string,
	navigationType: 'PREVIOUS' | 'NEXT',
): T {
	let foundTab

	if (navigationType === SYLLABUS.NAVIGATION_TYPE.PREVIOUS) {
		const currentIndex = tabs?.findIndex((tab) => tab.id === tabValue)
		if (currentIndex && currentIndex > 0) {
			const newTab = tabs && tabs[currentIndex - 1]
			if (newTab) {
				foundTab = newTab
			}
		}
	} else if (navigationType === SYLLABUS.NAVIGATION_TYPE.NEXT) {
		const currentIndex = tabs?.findIndex((tab) => tab.id === tabValue)
		if (tabs && currentIndex !== undefined) {
			if (currentIndex > -1 && currentIndex < tabs.length - 1) {
				const newTab = tabs && tabs[currentIndex + 1]
				if (newTab) {
					foundTab = newTab
				}
			}
		}
	}

	return foundTab as T
}
