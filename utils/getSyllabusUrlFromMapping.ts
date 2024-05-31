import { CURRICULUM_SLUGS } from '@/constants'
import { TaxoSyllabus } from '@/kontent/taxonomies'
import { Mapping } from '@/types'
import { getUrlFromSlugs } from './getUrlFromMapping'

/**
 * @param codename codename of the content
 * @param isCanonicalityChecked check if the mapping is canonical
 * @param isSyllabusCodename check if the codename is a syllabus codename
 */
const getFindByFn =
	(
		codename: string,
		isCanonicalityChecked: boolean,
		isSyllabusCodename: boolean,
	) =>
	(m: Mapping) => {
		const canonicalCondition = CURRICULUM_SLUGS['LEARNING_AREAS'].reduce(
			(_, slug, index) => {
				return m.params?.slug?.[index] === slug
			},
			false,
		)

		let isMatch = false
		if (isSyllabusCodename) {
			isMatch =
				m.params.navigationItem?.codename === codename &&
				(m.params.isCanonical || !isCanonicalityChecked)
		} else {
			// syllabus codename is a TaxoSyllabus
			isMatch =
				m.params.taxoSyllabus === codename &&
				(m.params.isCanonical || !isCanonicalityChecked)
		}

		return isMatch && canonicalCondition
	}

export function getSyllabusUrlFromMappingBySyllabusCodename(
	mappings: Mapping[],
	syllabusCodename: string,
	isCanonicalityChecked = true,
	replaceOverview = false, //by default, syllabus url has /overview. set to true to remove it
) {
	const mapping = mappings.find(
		getFindByFn(syllabusCodename, isCanonicalityChecked, true),
	)
	const result = mapping
		? getUrlFromSlugs(mapping.params.slug, mapping.params.additional)
		: undefined
	if (result && replaceOverview) {
		return result.replace('/overview', '')
	}
	return result
}

export function getSyllabusUrlFromMappingByTaxo(
	mappings: Mapping[],
	syllabusTaxoCodename: TaxoSyllabus,
	isCanonicalityChecked = true,
	replaceOverview = false, //by default, syllabus url has /overview. set to true to remove it
) {
	const mapping = mappings.find(
		getFindByFn(syllabusTaxoCodename, isCanonicalityChecked, false),
	)
	const result = mapping ? getUrlFromSlugs(mapping.params.slug) : undefined
	if (result && replaceOverview) {
		return result.replace('/overview', '')
	}
	return result
}
