import { Syllabus } from '@/kontent/content-types'
import { useCallback, useMemo, useState } from 'react'

export function getSyllabusesThatHaveLanguages(syllabuses: Syllabus[]) {
	return syllabuses.filter(
		(syllabus) => syllabus.elements.languages.value.length > 0,
	)
}

export function useSyllabusesThatHaveLanguages(syllabuses: Syllabus[]) {
	return useMemo(
		() => getSyllabusesThatHaveLanguages(syllabuses),
		[syllabuses],
	)
}

export function useLanguagesBasedOnSyllabuses({
	selectedSyllabusCodenames,
	syllabuses,
}: {
	selectedSyllabusCodenames: string[]
	syllabuses: Syllabus[]
}) {
	const [isShowLanguageOptions, setShowLanguageOptions] = useState(false)

	const languageOptions = useMemo(() => {
		const syllabusesThatHaveLanguages =
			getSyllabusesThatHaveLanguages(syllabuses)
		return syllabusesThatHaveLanguages
			.filter((syllabus) =>
				selectedSyllabusCodenames.includes(syllabus.system.codename),
			)
			.flatMap((syllabus) => syllabus.elements.languages.value)
	}, [selectedSyllabusCodenames, syllabuses])

	const toggleLanguageOptions = useCallback((state?: boolean) => {
		setShowLanguageOptions((prevState) => state ?? !prevState)
	}, [])

	return {
		languageOptions,
		isShowLanguageOptions,
		toggleLanguageOptions,
	}
}
