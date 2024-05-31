import type { Glossary as GlossaryType } from '@/kontent/content-types/glossary'
import { TaxoAceCategory, TaxoSyllabus } from '@/kontent/taxonomies'
import { byTaxoCodename, isIntersect } from '@/utils'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import { useEffect, useMemo, useState } from 'react'
import type { IGlossary } from '../../utilities/backendTypes'
import { AlphabetChar, alphabet } from '../../utilities/frontendTypes'
import GlossaryBody from './GlossaryBody'
import GlossaryHeader, { GlossaryHeaderProps } from './GlossaryHeader'

const matchesSearch = (text: string, record: GlossaryType) => {
	return [record.elements.title.value]
		.join()
		.toLowerCase()
		.includes(text.toLowerCase())
}

export interface GlossaryProps {
	/**
	 * The initial search term, mostly used for testing
	 */
	startSearchTerm?: string

	/**
	 * Filter terms to only include a specific KLA
	 */
	klaFilter?: string

	/**
	 * Filter terms to only include a specific syllabus
	 */
	syllabusFilter?: TaxoSyllabus[]

	/**
	 * Filter terms to only include a specific AceCategory
	 */
	aceCategoryFilter?: TaxoAceCategory[]

	/**
	 * Filter terms to only include a specific AceCategory
	 */
	isAceGlossaryItemsOnly?: boolean

	/**
	 * Terms defined in the glossary
	 */
	sections: IGlossary[]

	/**
	 * Glossary linked items
	 */
	glossaryLinkedItems: IContentItemsContainer
}

const applySearchAndFilter = (
	filterSections: IGlossary[],
	selectedFilter?: string,
	searchTerm?: string,
	_klaFilter?: string,
	syllabusFilter?: GlossaryProps['syllabusFilter'],
	aceCategoryFilter?: GlossaryProps['aceCategoryFilter'],
	isAceGlossaryItemsOnly = false,
): IGlossary[] => {
	if (!filterSections) return []

	return filterSections
		.filter(({ section }) => !selectedFilter || section === selectedFilter)
		?.map(({ section, records }) => {
			return {
				section,
				records: records
					.filter((r) => {
						const isTypeAce = r.elements.type.value.some(
							(v) => v.codename === 'ace',
						)

						const termSyllabuses: string[] =
							r.elements.syllabus.value.map((v) => v.codename)

						if (!syllabusFilter.length) {
							return true
						}

						// if syllabusFilter is not empty, but termSyllabuses is empty, then we want to filter out the ACE term
						if (!termSyllabuses.length) {
							return !isTypeAce
						}

						return (
							isIntersect(termSyllabuses, syllabusFilter) &&
							!isTypeAce
						)
					})
					.filter((r) => {
						const isTypeAce = r.elements.type.value.some(
							(v) => v.codename === 'ace',
						)

						// If it's not an ace glossary item, return true
						if (!isAceGlossaryItemsOnly) return true

						//otherwise, return true if it is an ace glossary item
						return isTypeAce
					})
					.filter((r) => {
						// Filter by ace category
						if (!aceCategoryFilter?.length) return true
						return isIntersect(
							r.elements.ace_category.value.map(byTaxoCodename),
							aceCategoryFilter,
						)
					})
					.filter((r) => !searchTerm || matchesSearch(searchTerm, r)),
			}
		})
		?.filter(({ records }) => records?.length)
}

/**
 * Hook to make glossary functionality usable in split-body scenarios. Allows a single glossary
 * header to control multiple bodies without adding complexity to containing component.
 * @param props see GlossaryProps. Should contain all terms used in any glossary body.
 * @return [
 *  A complete set of GlossaryHeaderProps that can be passed to the header component,
 *  A filter that can be applied to individual body terms.
 * ]
 */
export const useGlossary = (
	props: Omit<GlossaryProps, 'glossaryLinkedItems'>,
	// eslint-disable-next-line no-unused-vars
): [GlossaryHeaderProps, (terms: IGlossary[]) => IGlossary[]] => {
	const {
		startSearchTerm,
		klaFilter,
		sections,
		syllabusFilter,
		aceCategoryFilter,
		isAceGlossaryItemsOnly,
	} = props

	const [searchTerm, setSearchTerm] = useState(startSearchTerm)
	const [selectedFilter, setSelectedFilter] = useState<AlphabetChar>()

	const availableSections = useMemo(
		// Don't apply selectedFilter here, otherwise picking a letter disables all others
		() =>
			applySearchAndFilter(
				sections,
				undefined,
				searchTerm,
				klaFilter,
				syllabusFilter,
				aceCategoryFilter,
				isAceGlossaryItemsOnly,
			),
		[
			sections,
			searchTerm,
			klaFilter,
			syllabusFilter,
			aceCategoryFilter,
			isAceGlossaryItemsOnly,
		],
	)

	const disabledButtons = useMemo(
		() =>
			alphabet.filter(
				(char) =>
					!availableSections.some(
						(section) => section.section === char,
					),
			),
		[availableSections],
	)

	useEffect(() => {
		// If our search term has no results under current filter char
		if (selectedFilter && disabledButtons.includes(selectedFilter)) {
			// remove filter
			setSelectedFilter(undefined)
		}
	}, [selectedFilter, disabledButtons])

	const handleSearch = (term: string | null) => {
		setSearchTerm(term ?? undefined)
	}

	const handleSelect = (char: AlphabetChar) => {
		if (selectedFilter === char) {
			setSelectedFilter(undefined)
		} else {
			setSelectedFilter(char)
		}
	}

	return [
		{
			selected: selectedFilter,
			onSelect: handleSelect,
			disabled: disabledButtons,
			startSearchTerm: searchTerm,
			onSearch: handleSearch,
		},
		(filterSections) =>
			applySearchAndFilter(
				filterSections,
				selectedFilter,
				searchTerm,
				klaFilter,
				syllabusFilter,
				aceCategoryFilter,
				isAceGlossaryItemsOnly,
			),
	]
}

/**
 * A glossary of terms, providing descriptive text.
 * @param props
 * @constructor
 */
const Glossary = (props: GlossaryProps): JSX.Element => {
	const { sections, glossaryLinkedItems } = props

	const [headerProps, filter] = useGlossary(props)

	return (
		<div>
			<GlossaryHeader {...headerProps} />
			<GlossaryBody
				sections={filter(sections)}
				glossaryLinkedItems={glossaryLinkedItems}
			/>
		</div>
	)
}

export default Glossary
