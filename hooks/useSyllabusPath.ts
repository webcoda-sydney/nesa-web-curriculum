import { Syllabus } from '@/kontent/content-types'
import { getSlugByCodename } from '@/utils/getSlugByCodename'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useSyllabusPath = (syllabus: Syllabus) => {
	const { query, asPath } = useRouter()
	const { learningarea, syllabus: syllabusSlug } = query || {}

	const routerHasSyllabusPath = learningarea && syllabusSlug

	const syllabusPath = useMemo(() => {
		const _syllabusSlug =
			syllabusSlug || getSlugByCodename(syllabus.system.codename)
		const klaSlug =
			learningarea ||
			getSlugByCodename(
				syllabus.elements.key_learning_area_default.value[0].codename ||
					syllabus.elements.key_learning_area__items.value[0]
						?.codename ||
					'',
			)

		return `/learning-areas/${klaSlug}/${_syllabusSlug}`
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		learningarea,
		syllabus.elements.key_learning_area__items.value,
		syllabus.elements.key_learning_area_default.value,
		syllabus.system.codename,
		syllabusSlug,
		asPath,
	])

	return {
		routerHasSyllabusPath,
		path: syllabusPath,
	}
}
