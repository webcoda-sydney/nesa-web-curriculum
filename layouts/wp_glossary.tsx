import { Loading } from '@/components/Loading'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import Checkbox from '@/components/nsw/Checkbox'
import { NswFilter } from '@/components/nsw/filters/NswFilter'
import { NswFilterCancel } from '@/components/nsw/filters/NswFilterCancel'
import { NswFilterItem } from '@/components/nsw/filters/NswFilterItem'
import { NswFilterList } from '@/components/nsw/filters/NswFilterList'
import { NswFormFieldset } from '@/components/nsw/filters/NswFormFieldset'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { TreeMultiSelect } from '@/components/tree-multi-select/TreeMultiSelect'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WpGlossaryResponseData } from '@/databuilders/wp_glossary'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { useToggle } from '@/hooks/useToggle'
import type { WpGlossary as WpGlossaryModel } from '@/kontent/content-types/wp_glossary'
import { TaxoAceCategory, TaxoSyllabus } from '@/kontent/taxonomies'
import { useGlossary } from '@/legacy-ported/components/base/Glossary'
import GlossaryBody, {
	getUniqueTermsFromSections,
} from '@/legacy-ported/components/base/GlossaryBody'
import GlossaryHeader from '@/legacy-ported/components/base/GlossaryHeader'
import { makeLearningAreaTree } from '@/legacy-ported/components/custom/CustomSyllabusPicker'
import { fetchAllGlossaries } from '@/pages/page-api/all-glossaries'
import type { CommonPageProps } from '@/types'
import {
	byTaxoCodename,
	convertGlossaryToIGlossary,
	excludeGlossariesWhoseSyllabusIsNotLiveOrStaged,
	excludeUnstagedSyllabusesTagsFromGlossaries,
	getTaxoCodenames,
	isRichtextEmpty,
} from '@/utils'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import { useQuery } from '@tanstack/react-query'
import animateScrollTo from 'animated-scroll-to'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TreeNodeProps } from 'react-dropdown-tree-select'
import {
	getDropdownTreeFilterHandlerListenerFn,
	mapTreeElementToTreeNode,
} from './wp_dc_recentchanges'

function WpGlossary(
	props: CommonPageProps<WpGlossaryModel, WpGlossaryResponseData>,
) {
	const router = useRouter()
	const currentUrl = useCleanPathDefault()
	const initialCodename = (router.query.code as string) || ''
	const { mappings } = props
	const {
		config,
		pageResponse,
		syllabuses: allSyllabuses,
		keyLearningAreas,
	} = props.data
	const refFirstLoad = useRef(false)
	const refScrollToAfterFilter = useRef<HTMLDivElement>(null)
	const refGlossaryHeader = useRef(1)
	const refRightCol = useRef<HTMLDivElement>(null)
	const page = pageResponse.item

	const { data: allGlossaries, isFetched: isFetchedGlossaries } = useQuery(
		['wp_glossary'],
		async () => {
			const responseGlossaries = await fetchAllGlossaries()
			let _glossaries = excludeGlossariesWhoseSyllabusIsNotLiveOrStaged(
				responseGlossaries.pageProps.glossaries,
				allSyllabuses.items,
			)
			_glossaries = excludeUnstagedSyllabusesTagsFromGlossaries(
				_glossaries,
				allSyllabuses.items,
			)
			return _glossaries
		},
	)

	const terms = isFetchedGlossaries
		? convertGlossaryToIGlossary(allGlossaries.items)
		: []

	// states
	const [selectedAceCategories, setSelectedAceCategories] = useState<
		TaxoAceCategory[]
	>([])
	const [selectedFilterSyllabus, setSelectedFilterSyllabus] = useState<
		TaxoSyllabus[]
	>([])
	const [selectedFilterTerm, setSelectedFilterTerm] = useState('')
	const [isAceGlossaryItemsOnly, toggleAceGlossaryItemsOnly] =
		useToggle(false)

	const [glossaryHeaderProps, filter] = useGlossary({
		sections: terms,
		syllabusFilter: selectedFilterSyllabus,
		aceCategoryFilter: selectedAceCategories,
		isAceGlossaryItemsOnly,
	})

	const glossarySections = filter(terms)
	const filteredUniqueTerms = getUniqueTermsFromSections(glossarySections)

	const klaOptions = useMemo<TreeNodeProps[]>(
		() =>
			makeLearningAreaTree(
				allSyllabuses.items,
				keyLearningAreas,
				true,
				getTaxoCodenames(
					config.item.elements.disabled_key_learning_areas,
				),
			)
				.filter((option) => !!option.children?.length)
				.map((treeElement) =>
					mapTreeElementToTreeNode(
						treeElement,
						selectedFilterSyllabus,
					),
				),
		[
			allSyllabuses.items,
			config.item.elements.disabled_key_learning_areas,
			keyLearningAreas,
			selectedFilterSyllabus,
		],
	)
	// const aceCategoriesTreeNodes = useMemo<TreeNodeProps[]>(() => {
	// 	return aceTaxos.map((item) => {
	// 		return {
	// 			label: item.name,
	// 			value: item.codename,
	// 			children: undefined,
	// 			checked: selectedAceCategories.includes(item.codename),
	// 		}
	// 	})
	// }, [aceTaxos, selectedAceCategories])

	const scrollToTopOfRightCol = () => {
		if (refRightCol.current) {
			animateScrollTo(refRightCol.current, {
				speed: 0,
				verticalOffset: -24,
			})
		}
	}

	// Methods
	const handleReset = () => {
		setSelectedFilterSyllabus([])
		setSelectedAceCategories([])
		toggleAceGlossaryItemsOnly(false)
		refGlossaryHeader.current = +new Date()
		glossaryHeaderProps?.onSearch('')
		glossaryHeaderProps.onSelect(undefined)
	}

	// const handleAceRulesFilterChange = getDropdownTreeFilterHandlerListenerFn(
	// 	(state) => {
	// 		setSelectedAceCategories(state)
	// 		scrollToTopOfRightCol()
	// 	},
	// )

	const handleSyllabusesFilterChange = getDropdownTreeFilterHandlerListenerFn(
		(state) => {
			setSelectedFilterSyllabus(state)
			scrollToTopOfRightCol()
		},
	)

	// Effects
	useEffect(() => {
		if (refFirstLoad.current && selectedFilterSyllabus) {
			refScrollToAfterFilter.current.scrollIntoView()
		}
		refFirstLoad.current = true
	}, [selectedFilterSyllabus])

	useEffect(() => {
		if (isFetchedGlossaries) {
			const _glossary = allGlossaries.items.find((glossary) => {
				return glossary.system.codename === initialCodename
			})
			const _syllabuses =
				_glossary?.elements.syllabus.value.map(byTaxoCodename)

			setSelectedFilterSyllabus(_syllabuses || [])

			if (_glossary) {
				document
					.querySelectorAll('.nsw-accordion__title button')
					.forEach((el: HTMLButtonElement) => {
						if (
							el.innerText.toLowerCase().trim() ==
							_glossary.elements.title.value.toLowerCase()
						) {
							setSelectedFilterTerm(
								_glossary.elements.title.value,
							)
						}
					})
			}
		}
	}, [isFetchedGlossaries, allGlossaries?.items, initialCodename])

	// Reset selected term when syllabus filter changes
	useEffect(() => {
		if (isAceGlossaryItemsOnly) {
			setSelectedFilterSyllabus([])
		}
	}, [isAceGlossaryItemsOnly])

	// Reset selected term when syllabus filter changes
	useEffect(() => {
		if (selectedFilterSyllabus.length > 0) {
			toggleAceGlossaryItemsOnly(false)
		}
	}, [selectedFilterSyllabus, toggleAceGlossaryItemsOnly])

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}
	return (
		<>
			{page.elements.title.value && (
				<CommonCopyUrlWrapper url={currentUrl} className="mb-4">
					<h1
						data-kontent-item-id={page.system.id}
						data-kontent-element-codename="title"
					>
						{page.elements.title.value}
					</h1>
				</CommonCopyUrlWrapper>
			)}
			<div ref={refScrollToAfterFilter}></div>
			<GlossaryHeader
				key={refGlossaryHeader.current}
				{...glossaryHeaderProps}
			></GlossaryHeader>
			<div className="glossary-page__body">
				<GridWrapper className="!mt-0">
					<Grid className="!pt-0" item xs={12} lg={3}>
						<NswFilter
							className="lg:sticky top-0"
							css={{
								'& > .nsw-filters__controls': {
									borderBottom: 0,
									paddingTop: 0,
									paddingBottom: '2rem',
								},
								'& > .nsw-nsw-form__fieldset': {
									padding: 0,
								},
								'& .nsw-form__legend': {
									paddingBottom: 12,
								},
								'.is-preview &': {
									top: 26,
								},
							}}
							totalItems={filteredUniqueTerms.length}
						>
							<NswFilterList>
								<NswFilterItem>
									<NswFormFieldset title="Learning areas and syllabuses">
										<TreeMultiSelect
											key={klaOptions.join(',')}
											data={klaOptions}
											onChange={
												handleSyllabusesFilterChange
											}
											placeholder="Select syllabuses"
										/>
									</NswFormFieldset>
								</NswFilterItem>
								<NswFilterItem>
									<NswFormFieldset title="ACE Rules">
										<FormControlLabel
											className="mx-0"
											htmlFor={'check_isAceGlossaryOnly'}
											sx={{
												alignItems: 'stretch',
											}}
											control={
												<Checkbox
													id={
														'check_isAceGlossaryOnly'
													}
													className="tree-picker__checkbox"
													checked={
														isAceGlossaryItemsOnly
													}
													onChange={
														toggleAceGlossaryItemsOnly
													}
												/>
											}
											label={
												<span className="inline-block mt-3">
													ACE glossary terms only
												</span>
											}
										/>
									</NswFormFieldset>
								</NswFilterItem>
							</NswFilterList>
							<NswFilterCancel onReset={handleReset} />
						</NswFilter>
					</Grid>
					<Grid className="!pt-0" item xs={12} lg={9}>
						<div ref={refRightCol} />
						{!isRichtextEmpty(
							page.elements.web_content_rtb__content.value,
						) && (
							<RichText
								mappings={mappings}
								linkedItems={pageResponse.linkedItems}
								className="w-full cms-content-formatting mb-6"
								richTextElement={
									page.elements.web_content_rtb__content
								}
							/>
						)}

						{isFetchedGlossaries ? (
							<GlossaryBody
								sections={glossarySections}
								glossaryLinkedItems={allGlossaries.linkedItems}
								selectedTerm={selectedFilterTerm}
							/>
						) : (
							<Loading />
						)}
					</Grid>
				</GridWrapper>
			</div>
		</>
	)
}

export default WpGlossary
