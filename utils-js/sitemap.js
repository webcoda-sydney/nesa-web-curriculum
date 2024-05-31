//@ts-check

const SITEMAP_JSON = require('../kontent/sitemap-mappings.json')
const {
	filterPreviewableSyllabusesOnly,
	getAllItemsByType,
	isAllowPreviewExternalSyllabus,
	getSlugByCodename,
	shouldSlugBeRedirected,
	getLinkedItems,
	SLUGGED_PAGE_LAYOUTS,
	SYLLABUS_TABS,
	getCodenameBySlug,
	isStage6Syllabus,
	getLifeSkillStages,
	uniquePrimitiveArray,
	byTaxoCodename,
} = require('.')
const { isOptionList, isFocusarea } = require('./typepredicates')

exports.getDefaultSlugPaths = () =>
	SITEMAP_JSON.filter((path) => {
		// render if
		return (
			path.params.slug &&
			// it's not should be redirected
			!shouldSlugBeRedirected(path.params.slug) &&
			// not excluded in sitemap
			!path.params.excludeInSitemap &&
			// not syllabus (since syllabus has its own page render)
			path.params.navigationItem?.type !== 'syllabus' &&
			// not the ones that have no layout
			SLUGGED_PAGE_LAYOUTS.includes(path.params.navigationItem.type)
		)
	}).map((path) => '/' + path.params.slug.join('/'))

exports.getPathsForSyllabus = async () => {
	const syllabusResponse = await getAllItemsByType({
		type: 'syllabus',
		depth: 0,
		preview: false,
		allFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: 'elements.doredirect',
					value: ['no'],
			  },
		elementsParameter: [
			'key_learning_area__items',
			'doredirect',
			'allowpreview',
		],
	})

	return syllabusResponse.items
		.filter(filterPreviewableSyllabusesOnly)
		.flatMap((syllabus) => {
			const { key_learning_area__items } = syllabus.elements

			return SYLLABUS_TABS.flatMap((tab) => {
				return key_learning_area__items.value.flatMap(
					(keyLearningArea) => {
						const learningarea = getSlugByCodename(
							keyLearningArea.codename,
						)
						const _syllabus = getSlugByCodename(
							syllabus.system.codename,
						)
						const _tab =
							tab.id === 'course-overview' ? 'overview' : tab.id

						return `/learning-areas/${learningarea}/${_syllabus}/${_tab}`
					},
				)
			})
		})
}

exports.getPathsForFocusArea = async () => {
	const syllabusResponse = await getAllItemsByType({
		type: 'syllabus',
		depth: 2,
		preview: false,
		elementsParameter: [
			'focus_areas',
			'key_learning_area__items',
			'relatedlifeskillssyllabus',
			'doredirect',
			'allowpreview',
			'syllabus_type__items',
			'stages__stages',
			'stages__stage_years',
			'syllabus',
			'focus_area_options',
		],
		allFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: 'elements.doredirect',
					value: ['no'],
			  },
	})

	const previewableSyllabusesOnly = syllabusResponse.items.filter(
		filterPreviewableSyllabusesOnly,
	)

	const syllabusPathsByFocusAreaCodename = previewableSyllabusesOnly.reduce(
		(acc, syllabus) => {
			const { focus_areas } = syllabus.elements

			let relatedLsSyllabuses =
				syllabus.elements.relatedlifeskillssyllabus.value || []
			if (!relatedLsSyllabuses.length) {
				relatedLsSyllabuses = previewableSyllabusesOnly
					.filter((syl) =>
						syl.elements.relatedlifeskillssyllabus.value.includes(
							syllabus.system.codename,
						),
					)
					.map((syl) => syl.system.codename)
			}

			const syllabusPaths = [
				syllabus.system.codename,
				...relatedLsSyllabuses,
			].map(getSlugByCodename)

			focus_areas.value.forEach((fa) => {
				acc[fa] = {
					syllabusPaths,
				}
			})
			return acc
		},
		{},
	)

	const focusAreasOrOptionslist = previewableSyllabusesOnly.flatMap(
		(syllabus) => {
			return getLinkedItems(
				syllabus.elements.focus_areas,
				syllabusResponse.linkedItems,
			)
		},
	)

	const paths = focusAreasOrOptionslist
		.flatMap((focusAreaOrOptionslist) => {
			const _isOptionList = isOptionList(focusAreaOrOptionslist)

			// syllabus path for the focus area
			const { syllabusPaths } =
				syllabusPathsByFocusAreaCodename[
					focusAreaOrOptionslist.system.codename
				]

			return syllabusPaths.flatMap((syllabusPath) => {
				// syllabus for the focus area
				const syllabus = syllabusResponse.items.find(
					(_syllabus) =>
						_syllabus.system.codename ===
						getCodenameBySlug(syllabusPath),
				)
				if (!syllabus) return null

				const isStage6Syl = isStage6Syllabus(syllabus)

				let lifeSkillFaStages =
					isFocusarea(focusAreaOrOptionslist) ||
					isOptionList(focusAreaOrOptionslist)
						? getLifeSkillStages(
								focusAreaOrOptionslist,
								syllabus,
								syllabusResponse.linkedItems,
						  )
						: []

				const stagesOrYears = uniquePrimitiveArray([
					...(isStage6Syl
						? focusAreaOrOptionslist.elements.stages__stage_years.value.flatMap(
								byTaxoCodename,
						  )
						: focusAreaOrOptionslist.elements.stages__stages.value.flatMap(
								byTaxoCodename,
						  )),
					...lifeSkillFaStages,
				]).filter(
					(stageOrYearCodename) => stageOrYearCodename != 'stage_6',
				)

				return stagesOrYears.filter(Boolean).flatMap((stageOrYear) => {
					// if it's a life skill focus area

					return syllabus.elements.key_learning_area__items.value.flatMap(
						(keyLearningArea) => {
							if (_isOptionList) {
								return focusAreaOrOptionslist.elements.focus_area_options.value.map(
									(optionCodename) => {
										return {
											params: {
												learningarea: getSlugByCodename(
													keyLearningArea.codename,
												),
												syllabus: syllabusPath,
												tab: 'content',
												stage: getSlugByCodename(
													stageOrYear,
												),
												afterStageSlugs: [
													focusAreaOrOptionslist
														.system.codename,
													optionCodename,
												].map(getSlugByCodename),
											},
										}
									},
								)
							}

							return [
								{
									params: {
										learningarea: getSlugByCodename(
											keyLearningArea.codename,
										),
										syllabus: syllabusPath,
										tab: 'content',
										stage: getSlugByCodename(stageOrYear),
										afterStageSlugs: [
											getSlugByCodename(
												focusAreaOrOptionslist.system
													.codename,
											),
										],
									},
								},
							]
						},
					)
				})
			})
		})
		.filter(Boolean)
		.map((path) => {
			const { params } = path || {}
			return `/learning-areas/${params.learningarea}/${params.syllabus}/${
				params.tab
			}/${params.stage}${
				params.afterStageSlugs
					? `/${params.afterStageSlugs.join('/')}`
					: ''
			}`
		})

	return paths
}
