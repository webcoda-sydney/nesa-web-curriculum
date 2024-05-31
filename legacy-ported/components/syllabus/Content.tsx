import Icon from '@/components/Icon'
import RichText from '@/components/RichText'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import { PrevNextButton } from '@/components/ace/subgroup/PrevNextButton'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import Checkbox from '@/components/nsw/Checkbox'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { SideNavItem } from '@/components/nsw/side-nav/SideNav'
import { FocusAreaPaper } from '@/components/papers/focusarea/FocusAreaPaper'
import FocusAreaRelatedPaper, {
	FocusAreaRelatedPaperProps,
} from '@/components/papers/focusarea/FocusAreaRelatedPaper'
import { isShowContentOutcomenotificationBasedOnStageAndYear } from '@/components/sections/content_outcomenotification'
import Contentrichtext from '@/components/sections/contentrichtext'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { STAGES_WITH_LIFESKILLS } from '@/constants'
import { fetchFocusareaOrOptionslist } from '@/fetchers'
import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { useLanguagesBasedOnSyllabuses } from '@/hooks/useLanguagesBasedOnSyllabuses'
import { useRouterHash } from '@/hooks/useRouterHash'
import { useSyllabusPath } from '@/hooks/useSyllabusPath'
import {
	ContentOutcomenotification,
	Focusareaoption,
	Optionslist,
	Outcome,
	Syllabus,
} from '@/kontent/content-types'
import type { Focusarea } from '@/kontent/content-types/focusarea'
import type { Teachingadvice } from '@/kontent/content-types/teachingadvice'
import {
	TaxoContentAccordion,
	TaxoLanguage,
	TaxoPathways,
} from '@/kontent/taxonomies'
import { TaxoStage } from '@/kontent/taxonomies/stage'
import { reducerContent } from '@/legacy-ported/reducers/content'
import { QS_SHOW } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]/[stage]/[...afterStageSlugs]'
import type {
	AssetWithRawElements,
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import {
	byTaxoCodename,
	filterOnlyWebOutcomeNotifications,
	getFnIsItemHasStage,
	getFnIsItemHasYear,
	getSlugByCodename,
	isIntersect,
	isRichtextElementEmpty,
	isYes,
} from '@/utils'
import { matchFilesWithResourceAssets } from '@/utils/assets'
import {
	convertToFocusareasOrOptionListOrFocusareaoptionsExtended,
	getLifeSkillsForStageLabel,
	getStagedContentBased,
	isLifeSkillFocusAreaOrOptionListOrOutcome,
} from '@/utils/focusarea'
import { TOverarchingLinkProps } from '@/utils/getLinksFromOverarchingLinks'
import { isStage6Syllabus } from '@/utils/syllabus'
import { isFocusarea, isOptionList } from '@/utils/type_predicates'
import { css } from '@emotion/css'
import type {
	ElementModels,
	Elements,
	IContentItemsContainer,
	Responses,
} from '@kontent-ai/delivery-sdk'

import FormControlLabel from '@mui/material/FormControlLabel'
import Grid, { GridProps } from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Theme } from '@mui/material/styles/createTheme'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useQuery } from '@tanstack/react-query'
import animateScrollTo from 'animated-scroll-to'
import clsx from 'clsx'
import parseHTML, {
	Element,
	attributesToProps,
	domToReact,
} from 'html-react-parser'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as NProgress from 'nprogress'
import { Alert, Button, FormGroupSelect } from 'nsw-ds-react'
import { FormOption } from 'nsw-ds-react/dist/component/forms'
import React, {
	ReactNode,
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import { useImmerReducer } from 'use-immer'
import SYLLABUS from '../../constants/syllabusConstants'
import { arrayToggleMultiple } from '../../utilities/functions'
import useFocusTabIndex from '../../utilities/hooks/useFocusTabIndex'
import CustomPopover from '../base/CustomPopover'
import OutcomeDetailCard, {
	OutcomeDetailCardTitle,
} from '../card/OutcomeDetailCard'
import TeachingSupportCard from '../card/TeachingSupportCard'
import { LanguagePicker } from '../custom/LanguagePicker'
import TagPicker from '../custom/TagPicker'
import {
	FocusAreaSkeleton,
	OutcomeDetailCardSkeleton,
} from './ContentDesktopSkeleton'
import {
	ContentSideNav,
	getFocusAreaOptionUrl,
	getUrlFromFocusArea,
} from './ContentSideNav'
import DownloadList, {
	DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	DownloadListField,
} from './DownloadList'

export interface ContentOrganizerProps {
	/**
	 * Syllabus
	 */
	syllabus: Syllabus

	/**
	 * All stages
	 */
	stages:
		| ElementModels.TaxonomyTerm<TaxoStage>[]
		| ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]

	/**
	 * Stage id
	 */
	stageId?: TaxoStageWithLifeSkill

	/**
	 * Year Id (codenmae)
	 */
	yearId?: TaxoStageYearWithLifeSkill

	/**
	 * Support element ID
	 */
	supportElementId: string

	/**
	 * Syllabus Focus areas (the depth is 0)
	 */
	focusAreasOrOptionList?: (Focusarea | Optionslist | Focusareaoption)[]

	/**
	 * All outcomes
	 */
	outcomes?: Outcome[]

	/**
	 * All assets
	 */
	files?: AssetWithRawElements[]

	/**
	 * Initial state config
	 */
	initialState?: {
		accessPoints?: boolean
		teachingSupport?: boolean
		examples?: boolean
		tags?: string[]
		contentOrganiser?: string
		taScroll?: boolean
		focusAreaOption?: string
		langs?: string
		pathways?: string
		curriculumConnection?: boolean
	}

	initialStageCodename?: string
	initialYearCodename?: string

	linkedItems: IContentItemsContainer
	renderSlotContentLeft?: () => ReactNode
	lifeSkillsInfoForFocusArea?: Elements.RichTextElement

	// Filters
	hideToggleViewLifeSkills?: boolean
	hideToggleParallelContent?: boolean

	/**
	 * Focus area response
	 */
	focusAreaResponse?: Responses.IViewContentItemResponse<FocusareaOrOptionListOrFocusareoptionExtended>

	/**
	 * if true, when the focus area selected from (side) navigation,
	 * it won't redirect to the focus area page
	 */
	isFocusAreaNavigateInView?: boolean

	allOverarchingLinks?: Record<string, TOverarchingLinkProps>
}

export const GridColFilter = (props: GridProps) => {
	return (
		<GridCol
			sm={6}
			width={{ xl: 'auto' }}
			maxWidth={{ xl: 'none' }}
			flexBasis={{ xl: 'auto' }}
			{...props}
		/>
	)
}

export const TEACHING_ADVICE_HIDDEN_FIELDS: DownloadListField[] = [
	...DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	'stage',
	'resourceType',
	'year',
]

const isQuerySameAsAccordion = (
	qStage: string,
	qYear: string,
	accordionStageId: TaxoStageWithLifeSkill,
	accordionYearId: TaxoStageYearWithLifeSkill,
) => {
	if (accordionYearId && qYear) {
		return qYear === accordionYearId
	}
	return qStage === accordionStageId
}
const getScrollFn =
	(
		el: HTMLDivElement,
		isFetchedFocusArea: boolean,
		stage: TaxoStageWithLifeSkill,
		year: TaxoStageYearWithLifeSkill,
		callback: () => void,
		speed = 0,
		targetElScroll = el,
	) =>
	() => {
		if (
			isFetchedFocusArea &&
			el?.dataset.stage === stage &&
			(!year || el?.dataset.year === year)
		) {
			animateScrollTo(targetElScroll, {
				minDuration: speed,
				maxDuration: speed,
				speed,
			})
			setTimeout(callback, 300)
		}
	}

const fnShouldShowOutcomeNotification =
	(
		currentStage: TaxoStageWithLifeSkill,
		currentYear: TaxoStageYearWithLifeSkill,
	) =>
	(notif) => {
		if (isRichtextElementEmpty(notif.elements.content)) {
			return false
		}

		return isShowContentOutcomenotificationBasedOnStageAndYear(
			notif,
			currentStage,
			currentYear,
		)
	}

const renderOutcomeNotificationList = (
	outcomeNotificationList: ContentOutcomenotification[],
	mappings: Mapping[],
	linkedItems: IContentItemsContainer,
	currentStage?: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
) => {
	return (
		<div className="richtext">
			{outcomeNotificationList
				.filter(Boolean)
				.filter(
					(notif) => !isRichtextElementEmpty(notif.elements.content),
				)
				.map((notif) => {
					return (
						<RichText
							key={notif.system.id}
							richTextElement={notif.elements.content}
							mappings={mappings}
							linkedItems={linkedItems}
							currentStage={currentStage}
							currentYear={currentYear}
						/>
					)
				})}
		</div>
	)
}

const fetchFocusAreaOnContent = async (
	codename: string,
	defaultFocusAreaResponse?: Responses.IViewContentItemResponse<FocusareaOrOptionListOrFocusareoptionExtended>,
) => {
	if (defaultFocusAreaResponse) {
		return defaultFocusAreaResponse
	}
	return fetchFocusareaOrOptionslist(codename)
}

const getQueryStringBasedOnStates = ({
	showTeachingSupport,
	showAccessPoints,
	showExamples,
	selectedFilterViewLifeSkill,
	showCurriculumConnection,
}: {
	showTeachingSupport?: boolean
	showAccessPoints?: boolean
	showExamples?: boolean
	selectedFilterViewLifeSkill?: boolean
	showCurriculumConnection?: boolean
}) => {
	const show = [
		showTeachingSupport ? QS_SHOW.ADVICE : '',
		showAccessPoints ? QS_SHOW.ACCESS_CONTENT_POINTS : '',
		showExamples ? QS_SHOW.EXAMPLE : '',
		selectedFilterViewLifeSkill ? QS_SHOW.VIEW_LIFE_SKILLS : '',
		showCurriculumConnection ? QS_SHOW.CURRICULUM_CONNECTION : '',
	].filter(Boolean)

	return show
}

function getAccessPointGroupsBasedOnCurrentFocusAreaAndCurrentStageAndYear(
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	linkedItems,
	stageId: string,
	yearId: string,
) {
	if (isFocusarea(currentFocusArea)) {
		const accessPointGroups = getLinkedItems(
			currentFocusArea.elements.accesspointgroups,
			linkedItems,
		)

		if (isLifeSkillFocusAreaOrOptionListOrOutcome(currentFocusArea)) {
			return accessPointGroups
		}
		return (
			accessPointGroups
				?.filter(getFnIsItemHasStage(stageId as TaxoStage))
				.filter(
					getFnIsItemHasYear(yearId as TaxoStageYearWithLifeSkill),
				) || []
		)
	}

	return []
}

function getOutcomesFromCurrentFocusarea(
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	allOverarchingOutcomes: Outcome[],
	linkedItems,
	isCurrentStageLifeSkills: boolean,
	stageId: string,
	isCurrentYearLifeSkills: boolean,
	yearId: string,
	overarchingOutcomes: Outcome[],
	selectedFocusAreaOptionCodename?: string,
) {
	if (!currentFocusArea) return []

	const _isOptionList = isOptionList(currentFocusArea)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption = linkedItems[
			selectedFocusAreaOptionCodename
		] as Focusareaoption

		return getOutcomesFromCurrentFocusarea(
			focusAreaOption,
			allOverarchingOutcomes,
			linkedItems,
			isCurrentStageLifeSkills,
			stageId,
			isCurrentYearLifeSkills,
			yearId,
			overarchingOutcomes,
		)
	}
	if (!_isOptionList) {
		return [
			...allOverarchingOutcomes,
			...getLinkedItems(currentFocusArea.elements.outcomes, linkedItems)
				.filter((outcome) => {
					// filter by stage
					if (
						isLifeSkillFocusAreaOrOptionListOrOutcome(
							currentFocusArea,
						) &&
						isCurrentStageLifeSkills
					) {
						return true
					}
					const filter = getFnIsItemHasStage(stageId as TaxoStage)
					return filter(outcome)
				})
				.filter((outcome) => {
					// filter by year
					if (
						isLifeSkillFocusAreaOrOptionListOrOutcome(
							currentFocusArea,
						) &&
						isCurrentYearLifeSkills
					) {
						return true
					}

					const filter = getFnIsItemHasYear(
						yearId as TaxoStageYearWithLifeSkill,
					)
					return filter(outcome)
				})
				.filter((outcome) => {
					// except for the ones that are already in overarching outcomes
					if (overarchingOutcomes.length) {
						return !overarchingOutcomes.some(
							(oa) =>
								oa.system.codename === outcome.system.codename,
						)
					}
					return true
				}),
		]
	}
	return []
}

function getDownloadListOfCurrentFocusArea(
	files: AssetWithRawElements[],
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	curriculumWideAssets: AssetWithRawElements[],
	linkedItems: IContentItemsContainer,
	selectedFocusAreaOptionCodename?: string,
) {
	if (!currentFocusArea) return []
	const _isOptionList = isOptionList(currentFocusArea)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption = linkedItems[
			selectedFocusAreaOptionCodename
		] as Focusareaoption

		return getDownloadListOfCurrentFocusArea(
			files,
			focusAreaOption,
			curriculumWideAssets,
			linkedItems,
		)
	}
	if (!_isOptionList) {
		return [
			...(files || [])?.filter((file) => {
				return currentFocusArea?.elements?.resources?.value?.some(
					(resource) => {
						return matchFilesWithResourceAssets(file, resource)
					},
				)
			}),
			...curriculumWideAssets,
		]
	}
	return []
}

function getCurrentFocusAreaTeachingAdvices(
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	linkedItems: IContentItemsContainer,
	selectedFocusAreaOptionCodename?: string,
) {
	if (!currentFocusArea) return []
	const _isOptionList = isOptionList(currentFocusArea)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption = linkedItems[
			selectedFocusAreaOptionCodename
		] as Focusareaoption

		return getCurrentFocusAreaTeachingAdvices(focusAreaOption, linkedItems)
	}
	if (!_isOptionList && !selectedFocusAreaOptionCodename) {
		return (
			getLinkedItems(
				currentFocusArea?.elements.teachingadvice,
				linkedItems,
			) || []
		)
	}
	return []
}

function getCurrentFocusAreaRelatedFocusAreas(
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	isFetchedFocusArea: boolean,
	linkedItems,
	stageId: string,
	yearId: string,
	selectedFocusAreaOptionCodename?: string,
) {
	if (!currentFocusArea) return []
	const _isOptionList = isOptionList(currentFocusArea)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption: Focusareaoption =
			linkedItems[selectedFocusAreaOptionCodename]
		return getCurrentFocusAreaRelatedFocusAreas(
			focusAreaOption,
			isFetchedFocusArea,
			linkedItems,
			stageId,
			yearId,
		)
	}

	if (isFetchedFocusArea && currentFocusArea && !_isOptionList) {
		const relatedFocusAreas = getLinkedItems(
			currentFocusArea?.elements.related_focusareas,
			linkedItems,
		)

		return (
			relatedFocusAreas
				?.filter((focusArea) => {
					if (
						stageId === 'life_skills' ||
						isLifeSkillFocusAreaOrOptionListOrOutcome(focusArea)
					) {
						return true
					}

					return focusArea.elements.stages__stages.value.some(
						(s) => s.codename === stageId,
					)
				})
				?.filter((focusArea) => {
					if (
						!yearId ||
						yearId === 'life_skills' ||
						isLifeSkillFocusAreaOrOptionListOrOutcome(focusArea)
					) {
						return true
					}
					return focusArea.elements.stages__stage_years.value.some(
						(s) => s.codename === yearId,
					)
				}) || []
		)
	}

	return []
}

function getCurrentFocusAreaContentGroups(
	currentFocusArea: Focusarea | Optionslist | Focusareaoption,
	linkedItems,
	stageId: TaxoStageWithLifeSkill,
	yearId: TaxoStageYearWithLifeSkill,
	selectedFocusAreaOptionCodename?: string,
) {
	if (!currentFocusArea) return []
	const _isOptionList = isOptionList(currentFocusArea)
	if (_isOptionList && selectedFocusAreaOptionCodename) {
		const focusAreaOption = linkedItems[
			selectedFocusAreaOptionCodename
		] as Focusareaoption

		return getCurrentFocusAreaContentGroups(
			focusAreaOption,
			linkedItems,
			stageId,
			yearId,
		)
	}
	if (!_isOptionList) {
		const contentGroups = getLinkedItems(
			currentFocusArea.elements.contentgroups,
			linkedItems,
		)
		if (isLifeSkillFocusAreaOrOptionListOrOutcome(currentFocusArea))
			return contentGroups

		return contentGroups
			.filter(getFnIsItemHasStage(stageId))
			.filter(getFnIsItemHasYear(yearId))
	}
	return []
}

const convertFocusAreaOptionToSideNavItem = (
	fao: Focusareaoption,
	currentFocusAreaOrOptionList: Optionslist,
	currentSyllabusCodename: string,
	currentStage?: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
	qs?: string[],
	otherOptions: SideNavItem | null = null,
	isNavigateInView = false,
) => {
	if (!fao || !currentFocusAreaOrOptionList) return null
	return {
		text: fao.elements.title.value,
		href: isNavigateInView
			? undefined
			: getFocusAreaOptionUrl(
					fao,
					currentFocusAreaOrOptionList,
					currentSyllabusCodename,
					currentStage,
					currentYear,
					qs,
			  ),
		...(otherOptions ?? {}),
	} as SideNavItem
}

/**
 *
 * @param cssVariableForFaOdtHeight css variable name for focus-area/focus-area-option outcome detail title height
 * @param cssVariableForStickyDDHeight css variable name for sticky dropdown height
 * @returns
 */
const getScrollMarginBasedOnODT = (
	cssVariableForFaOdtHeight = '--fa-odt-height',
	cssVariableForStickyDDHeight = '--fao-stickydd-height',
) => {
	return {
		'& [id]': {
			scrollMarginTop: `calc(var(${cssVariableForFaOdtHeight}, 0px) + var(${cssVariableForStickyDDHeight}, 0px))`,
		},
	}
}

const Content = forwardRef<HTMLDivElement, ContentOrganizerProps>(
	(props, ref) => {
		const isScreenDownMd = useIsScreenDown('md')
		const innerRef = useRef<HTMLDivElement>(null)
		const router = useRouter()
		const { urlRouterPath, refUrlHash } = useRouterHash()

		const { mappings, config, preview } = useKontentHomeConfig()
		const {
			syllabus,
			stageId,
			yearId,
			focusAreasOrOptionList,
			outcomes,
			initialState,
			initialStageCodename,
			initialYearCodename,
			files: _files,
			linkedItems: syllabusLinkedItems,
			lifeSkillsInfoForFocusArea,
			renderSlotContentLeft,
			hideToggleViewLifeSkills = false,
			focusAreaResponse: focusAreaOrOptionlistResponse,
			isFocusAreaNavigateInView = false,
			allOverarchingLinks = {},
		} = props
		const refScrollHereOnFocusAreaSelected = useRef<HTMLDivElement>(null)
		const refScrollHereOnFocusAreaSelectedMobile =
			useRef<HTMLDivElement>(null)
		const refScrollHereOnTeachingSupportEnabled =
			useRef<HTMLDivElement>(null)
		const refScrollToFocusAreaContentAfterClick = useRef('')
		const refTeachingSupportTopForTitle = useRef<HTMLDivElement>(null)
		const refIsFirstLoad = useRef(true)

		const isLgLower = useMediaQuery((theme: Theme) =>
			theme.breakpoints.down('lg'),
		)

		// Early computed
		const isStage6Syl = isStage6Syllabus(syllabus)
		const qsTeachingSupport = initialState?.teachingSupport
		const qsFocusArea =
			initialState?.contentOrganiser ||
			focusAreaOrOptionlistResponse?.item.system.codename
		const qsAccessPoints = initialState?.accessPoints
		const qsExamples = initialState?.examples
		const qsCurriculumConnection = initialState?.curriculumConnection
		const qsTaScroll = initialState?.taScroll
		const qsLangs = initialState?.langs
		const qsPathways = initialState?.pathways
		const isStageYearAccordionSameWithQueryString =
			!!focusAreaOrOptionlistResponse ||
			isQuerySameAsAccordion(
				initialStageCodename,
				initialYearCodename,
				stageId,
				yearId,
			)
		const qsFocusAreaOption =
			initialState?.focusAreaOption ||
			(focusAreaOrOptionlistResponse?.item as Optionslist)?.elements
				?.focus_area_options?.value[0]

		const isWithPreloadFocusAreaAndDeepLinkNavigation =
			!!focusAreaOrOptionlistResponse && !isFocusAreaNavigateInView

		const isSyllabusHasPathways =
			syllabus.elements.pathways.value.length > 0

		const initialPathwaysBasedOnQsPathways = useMemo(() => {
			return syllabus.elements.pathways.value.filter((pathway) => {
				if (qsPathways) {
					return qsPathways.split(',').includes(pathway.codename)
				}
				return true
			})
		}, [syllabus.elements.pathways.value, qsPathways])

		const [state, dispatch] = useImmerReducer(reducerContent, {
			selectedFocusAreaCodename: isStageYearAccordionSameWithQueryString
				? qsFocusArea || ''
				: '',
			showAccessPoints: isStageYearAccordionSameWithQueryString
				? qsAccessPoints ?? false
				: false,
			showTeachingSupport: isStageYearAccordionSameWithQueryString
				? qsTeachingSupport ?? false
				: false,
			showExamples: isStageYearAccordionSameWithQueryString
				? qsExamples ?? false
				: false,
			selectedFilterViewLifeSkill:
				stageId === 'life_skills' ||
				(isStageYearAccordionSameWithQueryString &&
					isLifeSkillFocusAreaOrOptionListOrOutcome(
						isWithPreloadFocusAreaAndDeepLinkNavigation
							? focusAreaOrOptionlistResponse.item
							: focusAreasOrOptionList.find(
									(fa) => fa.system.codename === qsFocusArea,
							  ),
					)),
			selectedFocusAreaOptionCodename: qsFocusAreaOption || '',
			selectedExampleLanguages: qsLangs
				? {
						[syllabus.elements.syllabus.value[0].codename]:
							qsLangs?.split(',') as TaxoLanguage[],
				  }
				: {},
			selectedPathways: initialPathwaysBasedOnQsPathways,
			showCurriculumConnection: isStageYearAccordionSameWithQueryString
				? qsCurriculumConnection ?? false
				: false,
		})

		let {
			selectedFocusAreaCodename,
			showAccessPoints,
			showExamples,
			showTeachingSupport,
			selectedFilterViewLifeSkill,
			selectedFocusAreaOptionCodename,
			selectedExampleLanguages,
			selectedPathways,
			showCurriculumConnection,
		} = state

		const selectedExampleLanguagesArray = useMemo(() => {
			return Object.entries(selectedExampleLanguages).flatMap(
				([_, taxoLangs]) => taxoLangs,
			)
		}, [selectedExampleLanguages])

		// for tags
		const [tagsHoverPopover, setTagsHoverPopover] = useState(false)
		const [tagsPopoverAnchor, setTagsPopoverAnchor] =
			useState<HTMLElement>()
		const [pathwaysHoverPopover, setPathwaysHoverPopover] = useState(false)
		const [pathwaysPopoverAnchor, setPathwaysPopoverAnchor] =
			useState<HTMLElement>()
		const [tagIds, setTagIds] = useState(initialState?.tags)
		const [tempTagIds, setTempTagIds] = useState(initialState?.tags)
		const [tempPathways, setTempPathways] = useState(
			initialPathwaysBasedOnQsPathways,
		)
		const [tagSearchText, setTagSearchText] = useState('')
		const tagsButtonRef = useRef<HTMLButtonElement>(null)
		const pathwaysButtonRef = useRef<HTMLButtonElement>(null)

		// computed
		const isCurrentStage4Or5Or6 = STAGES_WITH_LIFESKILLS.includes(
			stageId as any,
		)
		const isCurrentStageLifeSkills = stageId === 'life_skills'
		const isCurrentYearLifeSkills = yearId === 'life_skills'
		const currentStageBasedOnViewLifeskillsToggle =
			stageId && selectedFilterViewLifeSkill ? 'life_skills' : stageId
		const currentYearBasedOnViewLifeskillsToggle =
			yearId && selectedFilterViewLifeSkill ? 'life_skills' : yearId

		const currentFocusAreas = focusAreasOrOptionList.filter((focusArea) => {
			const isLifeSkill =
				isLifeSkillFocusAreaOrOptionListOrOutcome(focusArea)
			return selectedFilterViewLifeSkill || isCurrentStageLifeSkills
				? isLifeSkill
				: !isLifeSkill
		})

		const currentFocusAreaSimple = useMemo(() => {
			if (focusAreaOrOptionlistResponse && !isFocusAreaNavigateInView) {
				const _focusAreaOrOptionList =
					focusAreaOrOptionlistResponse.item
				const _isItemFocusarea = isFocusarea(_focusAreaOrOptionList)
				if (
					selectedFocusAreaCodename ===
					focusAreaOrOptionlistResponse.item.system.codename
				) {
					return focusAreaOrOptionlistResponse.item
				}
				if (_isItemFocusarea) {
					if (
						_focusAreaOrOptionList.elements.related_focusareas.value.includes(
							focusAreaOrOptionlistResponse.item.system.codename,
						)
					) {
						return getLinkedItems(
							_focusAreaOrOptionList.elements.related_focusareas,
							focusAreaOrOptionlistResponse.linkedItems,
						)?.[0]
					}
				}
			}

			return focusAreasOrOptionList.find(
				(item) => item.system.codename === selectedFocusAreaCodename,
			)
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			focusAreaOrOptionlistResponse?.item.system.codename,
			focusAreasOrOptionList.map((fa) => fa.system.codename).join(','), // eslint-disable-line react-hooks/exhaustive-deps
			isFocusAreaNavigateInView,
			selectedFocusAreaCodename,
		])

		const files = _files.filter((file) =>
			isIntersect(
				file.syllabus.map(byTaxoCodename),
				currentFocusAreaSimple?.elements.syllabus.value.map(
					byTaxoCodename,
				) || [],
			),
		)

		const currentFocusAreaCodename = currentFocusAreaSimple?.system.codename

		const {
			data: faResponse,
			isFetched: isFetchedFocusArea,
			isLoading,
		} = useQuery(
			[
				`focusarea_${currentFocusAreaCodename}`,
				currentFocusAreaCodename,
				focusAreaOrOptionlistResponse,
			],
			() => {
				return focusAreaOrOptionlistResponse &&
					currentFocusAreaCodename ===
						focusAreaOrOptionlistResponse.item.system.codename
					? focusAreaOrOptionlistResponse
					: fetchFocusAreaOnContent(currentFocusAreaCodename)
			},
			{
				staleTime: Infinity,
			},
		)
		const currentFocusAreaOrOptionList = useMemo(() => {
			const _temp =
				focusAreaOrOptionlistResponse?.item.system.codename &&
				!isFocusAreaNavigateInView
					? currentFocusAreaSimple
					: faResponse?.item
			if (_temp) {
				return convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
					[_temp],
					syllabus,
				)[0]
			}
			return _temp
		}, [
			currentFocusAreaSimple,
			faResponse?.item,
			focusAreaOrOptionlistResponse?.item.system.codename,
			isFocusAreaNavigateInView,
			syllabus,
		])

		const isCurrentFocusAreaFocusArea = isFocusarea(
			currentFocusAreaOrOptionList,
		)

		const linkedItems = useMemo(() => {
			let _response = faResponse
			if (focusAreaOrOptionlistResponse && !isFocusAreaNavigateInView) {
				_response = focusAreaOrOptionlistResponse
			}

			return {
				...(syllabusLinkedItems || {}),
				...(_response?.linkedItems || {}),
			}
		}, [
			faResponse,
			focusAreaOrOptionlistResponse,
			isFocusAreaNavigateInView,
			syllabusLinkedItems,
		])

		const currentFocusAreaOptions = useMemo(() => {
			if (isOptionList(currentFocusAreaOrOptionList)) {
				return getLinkedItems(
					currentFocusAreaOrOptionList.elements.focus_area_options,
					linkedItems,
				)
			}
			return []
		}, [currentFocusAreaOrOptionList, linkedItems])

		const selectedFocusAreaOption = currentFocusAreaOptions.find(
			(o) => o.system.codename === selectedFocusAreaOptionCodename,
		)

		const currentFocusAreaOptionOrFocusAreaOrOptionlist =
			selectedFocusAreaOption || currentFocusAreaOrOptionList

		const previousAndNextFocusAreaOption = useMemo(() => {
			const currentIndex = currentFocusAreaOptions.findIndex(
				(fo) => fo.system.codename === selectedFocusAreaOptionCodename,
			)
			const prev =
				currentIndex - 1 >= 0
					? currentFocusAreaOptions[currentIndex - 1]
					: null
			const next =
				currentIndex + 1 < currentFocusAreaOptions.length
					? currentFocusAreaOptions[currentIndex + 1]
					: null
			return {
				prev,
				next,
			}
		}, [currentFocusAreaOptions, selectedFocusAreaOptionCodename])

		const focusAreasAndOrFocusAreaOptions = focusAreasOrOptionList.flatMap<
			Focusarea | Focusareaoption
		>((item) => {
			if (isOptionList(item)) {
				return getLinkedItems(
					item.elements.focus_area_options,
					linkedItems,
				)
			}
			return [item]
		})

		const currentStagedContents = isCurrentFocusAreaFocusArea
			? getStagedContentBased(
					currentFocusAreaOrOptionList?.elements.content_staged,
					linkedItems,
					stageId,
					yearId,
			  )
			: []
		const currentRelatedFocusAreasForThisAccordion = useMemo(
			() =>
				getCurrentFocusAreaRelatedFocusAreas(
					currentFocusAreaOrOptionList,
					isFetchedFocusArea,
					linkedItems,
					stageId,
					yearId,
					selectedFocusAreaOptionCodename,
				),
			[
				isFetchedFocusArea,
				currentFocusAreaOrOptionList,
				linkedItems,
				stageId,
				yearId,
				selectedFocusAreaOptionCodename,
			],
		)

		const focusAreasOnCurrentAccordionStageOrYear = useMemo(() => {
			return (
				focusAreasAndOrFocusAreaOptions
					?.filter((focusArea) => {
						if (
							isLifeSkillFocusAreaOrOptionListOrOutcome(
								focusArea,
							) &&
							isCurrentStageLifeSkills
						) {
							return true
						}
						const filter = getFnIsItemHasStage(stageId)
						return filter(focusArea)
					})
					?.filter((focusArea) => {
						if (
							!yearId ||
							yearId === 'life_skills' ||
							isLifeSkillFocusAreaOrOptionListOrOutcome(focusArea)
						) {
							return true
						}
						return focusArea.elements.stages__stage_years.value.some(
							(s) => s.codename === yearId,
						)
					}) || []
			)
		}, [
			focusAreasAndOrFocusAreaOptions,
			isCurrentStageLifeSkills,
			stageId,
			yearId,
		])

		const overarchingOutcomes = useMemo(() => {
			return (
				focusAreasOnCurrentAccordionStageOrYear
					.flatMap((item) =>
						getLinkedItems(
							item.elements.outcomes,
							linkedItems,
						).filter((outcome) =>
							isYes(outcome.elements.isoverarching),
						),
					)
					.reduce((acc, outcome) => {
						if (
							!acc.some((o) => o.system.id === outcome.system.id)
						) {
							return [...acc, outcome]
						}
						return acc
					}, [] as Outcome[]) || []
			)
		}, [focusAreasOnCurrentAccordionStageOrYear, linkedItems])

		const isCurrentFocusAreaLifeSkills =
			isLifeSkillFocusAreaOrOptionListOrOutcome(
				currentFocusAreaOrOptionList,
			)

		const shouldScrollToTeachingAdviceOnLoad =
			!initialStageCodename ||
			(initialStageCodename && initialStageCodename === stageId)
		const hasLiteracyOrNumeracyTags =
			focusAreasOnCurrentAccordionStageOrYear
				.flatMap((focusArea) => {
					const _isCurrentFocusareaFA = isFocusarea(focusArea)
					const contentGroups = _isCurrentFocusareaFA
						? getLinkedItems(
								focusArea.elements.contentgroups,
								linkedItems,
						  )
						: []
					return contentGroups.flatMap((c) =>
						getLinkedItems(c.elements.content_items, linkedItems),
					)
				})
				.some((contentItem) => {
					return (
						contentItem.elements.stages__stages.value.some(
							(s) => s.codename === stageId,
						) &&
						(!!contentItem.elements
							.learningprogression_tags__literacy.value.length ||
							!!contentItem.elements
								.learningprogression_tags__numeracy.value
								.length)
					)
				})

		const outcomesNotificationsList = getLinkedItems(
			syllabus.elements.outcomesnotificationslist,
			linkedItems,
		)

		const filteredOutcomesNotificationList = outcomesNotificationsList
			.filter(filterOnlyWebOutcomeNotifications)
			.filter(
				fnShouldShowOutcomeNotification(
					currentStageBasedOnViewLifeskillsToggle,
					currentYearBasedOnViewLifeskillsToggle,
				),
			)

		const isShowOutcomesNotification =
			filteredOutcomesNotificationList?.length > 0

		// if isFocusAreaNavigateInView is false, then add query string  ?show=
		// to the focus area link, if teaching advice, content point, or example is enabled
		const qsCheckboxes = useMemo(() => {
			return getQueryStringBasedOnStates({
				showAccessPoints,
				showExamples,
				showTeachingSupport,
				showCurriculumConnection,
			})?.sort()
		}, [
			showAccessPoints,
			showExamples,
			showTeachingSupport,
			showCurriculumConnection,
		])

		const qsBySelectedPathways = useMemo<string>(() => {
			const allPathways =
				syllabus.elements.pathways.value.map(byTaxoCodename)
			const _selectedPathways = selectedPathways.map(byTaxoCodename)
			const qs = allPathways.filter((pathway) => {
				if (_selectedPathways?.length) {
					return _selectedPathways.includes(pathway)
				}
				return true
			})
			if (qs.length === allPathways.length || !qs.length) {
				return ''
			}
			return qs.join(',')
		}, [selectedPathways, syllabus.elements.pathways.value])

		const qsOnSideNavs = useMemo(() => {
			let _qs = []
			if (qsCheckboxes?.length) {
				_qs.push(`show=${qsCheckboxes.join(',')}`)

				if (qsCheckboxes.includes(QS_SHOW.ADVICE)) {
					_qs.push('ta_scroll=no')
				}
			}
			if (qsBySelectedPathways) {
				_qs.push(`paths=${qsBySelectedPathways}`)
			}
			if (selectedExampleLanguagesArray?.length) {
				_qs.push(
					'langs=' +
						selectedExampleLanguagesArray
							.filter(Boolean)
							.sort()
							.join(','),
				)
			}

			return _qs
		}, [qsCheckboxes, qsBySelectedPathways, selectedExampleLanguagesArray])

		const scrollToTeachingAdvice = useCallback(
			(
				stage: TaxoStageWithLifeSkill,
				year: TaxoStageYearWithLifeSkill,
			) => {
				const fn = getScrollFn(
					refScrollHereOnTeachingSupportEnabled.current,
					isFetchedFocusArea,
					stage,
					year,
					() => {},
				)
				// set to 450ms to wait for the accordion to open
				setTimeout(fn, 450)
			},
			[isFetchedFocusArea],
		)

		const scrollToFocusAreaContent = useCallback(
			(
				stage: TaxoStageWithLifeSkill,
				year: TaxoStageYearWithLifeSkill,
			) => {
				const $scrollFocusAreaSelected =
					refScrollHereOnFocusAreaSelected.current
				const $closestAccordion: HTMLDivElement =
					$scrollFocusAreaSelected?.closest('.nesa-accordion')

				if ($scrollFocusAreaSelected && $closestAccordion) {
					const fn = getScrollFn(
						$scrollFocusAreaSelected,
						isFetchedFocusArea,
						stage,
						year,
						() => {},
						0,
						$closestAccordion,
					)
					setTimeout(fn, 250)
				}
			},
			[isFetchedFocusArea],
		)

		const { path: syllabusPath } = useSyllabusPath(syllabus)

		const teachingAndLearningTabUrl = useMemo(() => {
			return `${syllabusPath}/teaching-and-learning`
		}, [syllabusPath])

		const focusAreaOrFocusAreaOptionPath = useMemo(() => {
			const slugFocusAreaOrOptionlist = getSlugByCodename(
				currentFocusAreaCodename || '',
			)
			const slugFocusAreaOption = getSlugByCodename(
				selectedFocusAreaOptionCodename || '',
			)
			const stageOrYear = stageId === 'stage_6' ? yearId : stageId
			const slugStageOrYear = getSlugByCodename(stageOrYear || '')

			return [
				syllabusPath,
				'content',
				slugStageOrYear,
				slugFocusAreaOrOptionlist,
				slugFocusAreaOption,
			]
				.filter(Boolean)
				.join('/')
		}, [
			currentFocusAreaCodename,
			selectedFocusAreaOptionCodename,
			stageId,
			yearId,
			syllabusPath,
		])

		const currentTeachingAdvicePath = useMemo(() => {
			return `${focusAreaOrFocusAreaOptionPath}?show=${QS_SHOW.ADVICE}`
		}, [focusAreaOrFocusAreaOptionPath])

		const handleFilterButton = (
			event: React.MouseEvent<HTMLButtonElement>,
			filter: string,
		) => {
			if (filter === SYLLABUS.FILTER.ACCESS_POINTS) {
				dispatch({
					type: 'SET_SHOWACCESSPOINTS',
					payload: !showAccessPoints,
				})
			} else if (filter === SYLLABUS.FILTER.TEACHING_SUPPORT) {
				refIsFirstLoad.current = false
				dispatch({
					type: 'SET_SHOWTEACHINGSUPPORT',
					payload: !showTeachingSupport,
				})
				if (
					!showTeachingSupport &&
					isWithPreloadFocusAreaAndDeepLinkNavigation
				) {
					scrollToTeachingAdvice(stageId, yearId)
				}
			} else if (filter === SYLLABUS.FILTER.TAGS) {
				// if (!tempTagIds) {
				setTagsPopoverAnchor(event.currentTarget)
				setTagsHoverPopover(true)
				// } else {
				// setTempTagIds(undefined)
				// }
			} else if (filter === SYLLABUS.FILTER.EXAMPLES) {
				dispatch({
					type: 'SET_SHOWEXAMPLES',
					payload: !showExamples,
				})
			} else if (filter === SYLLABUS.FILTER.CURRICULUM_CONNECTIONS) {
				dispatch({
					type: 'SET_SHOWCURRICULUMCONNECTION',
					payload: !showCurriculumConnection,
				})
			}
		}

		const handleOnSideNavItemClick = (
			_event:
				| React.MouseEvent<HTMLDivElement, MouseEvent>
				| React.KeyboardEvent<HTMLDivElement>,
			focusArea: Focusarea,
		) => {
			const focusAreaCodename = focusArea?.system.codename
			if (isLgLower) {
				refScrollHereOnFocusAreaSelectedMobile.current.scrollIntoView()
			} else {
				refScrollHereOnFocusAreaSelected.current.scrollIntoView()
			}
			dispatch({
				type: 'SET_SELECTEDFOCUSAREACODENAME',
				payload: focusAreaCodename,
			})
			refIsFirstLoad.current = false
			refScrollToFocusAreaContentAfterClick.current = focusAreaCodename
		}

		const previousAndNextFocusAreaOptionAsSideNavItem = useMemo(() => {
			const { prev, next } = previousAndNextFocusAreaOption
			if (!isOptionList(currentFocusAreaOrOptionList)) {
				return null
			}

			if (!prev && !next) return null

			return {
				prev: prev
					? convertFocusAreaOptionToSideNavItem(
							prev,
							currentFocusAreaOrOptionList,
							syllabus.system.codename,
							stageId,
							yearId,
							qsOnSideNavs,
							{
								onClick: () => {
									dispatch({
										type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME',
										payload: prev.system.codename,
									})
									scrollToFocusAreaContent(stageId, yearId)
								},
								shallow: true,
							},
							isFocusAreaNavigateInView,
					  )
					: null,
				next: next
					? convertFocusAreaOptionToSideNavItem(
							next,
							currentFocusAreaOrOptionList,
							syllabus.system.codename,
							stageId,
							yearId,
							qsOnSideNavs,
							{
								onClick: () => {
									dispatch({
										type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME',
										payload: next.system.codename,
									})
									scrollToFocusAreaContent(stageId, yearId)
								},
								shallow: true,
							},
							isFocusAreaNavigateInView,
					  )
					: null,
			}
		}, [
			previousAndNextFocusAreaOption,
			currentFocusAreaOrOptionList,
			syllabus.system.codename,
			stageId,
			yearId,
			qsOnSideNavs,
			isFocusAreaNavigateInView,
			dispatch,
			scrollToFocusAreaContent,
		])

		useImperativeHandle(ref, () => innerRef.current!, [])

		useEffect(() => {
			const hash = refUrlHash.current
			const $hashScrollTarget = hash ? document.querySelector(hash) : null
			if (!refIsFirstLoad.current && isFetchedFocusArea) {
				if (hash) {
					if ($hashScrollTarget) {
						const rootStyle = window.getComputedStyle(
							document.documentElement,
						)
						const scrollOffset = [
							rootStyle.getPropertyValue(cssVarFaoOdtHeight) ||
								'0px',
							rootStyle.getPropertyValue(
								cssVarStickyDropdownHeight,
							) || '0px',
							'24px',
						]
							.map(parseFloat)
							.reduce((arr, curr) => arr + curr, 0)

						setTimeout(() => {
							animateScrollTo($hashScrollTarget, {
								speed: 0,
								minDuration: 0,
								maxDuration: 0,
								verticalOffset: -(
									parseFloat(
										window.getComputedStyle(
											$hashScrollTarget,
										).scrollMarginTop,
									) ||
									scrollOffset ||
									86
								),
							})
						}, 450)
						refUrlHash.current = ''
					}
					return
				}
				if (!showTeachingSupport) {
					if (
						refScrollToFocusAreaContentAfterClick.current ===
						selectedFocusAreaCodename
					) {
						scrollToFocusAreaContent(stageId, yearId)
						refScrollToFocusAreaContentAfterClick.current = ''
					} else {
						if (isWithPreloadFocusAreaAndDeepLinkNavigation) {
							scrollToFocusAreaContent(stageId, yearId)
						}
					}
				} else {
					if (!isWithPreloadFocusAreaAndDeepLinkNavigation) {
						scrollToTeachingAdvice(stageId, yearId)
					} else {
						if (!qsTaScroll && showTeachingSupport) {
							scrollToFocusAreaContent(stageId, yearId)
						} else {
							scrollToTeachingAdvice(stageId, yearId)
						}
					}
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			isFetchedFocusArea,
			isWithPreloadFocusAreaAndDeepLinkNavigation,
			qsTaScroll,
			refUrlHash,
			scrollToFocusAreaContent,
			scrollToTeachingAdvice,
			selectedFocusAreaCodename,
			showTeachingSupport,
			stageId,
			yearId,
			refIsFirstLoad.current,
		])

		/**
		 * Change states based on the query strings
		 */
		useEffect(() => {
			if (
				!refIsFirstLoad.current &&
				(initialStageCodename === stageId ||
					isWithPreloadFocusAreaAndDeepLinkNavigation)
			) {
				dispatch({
					type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME',
					payload: qsFocusAreaOption,
				})
				dispatch({
					type: 'SET_SELECTEDFOCUSAREACODENAME',
					payload: qsFocusArea || '',
				})
				dispatch({
					type: 'SET_SHOWACCESSPOINTS',
					payload: qsAccessPoints ?? false,
				})
				dispatch({
					type: 'SET_SHOWTEACHINGSUPPORT',
					payload: qsTeachingSupport ?? false,
				})
				dispatch({
					type: 'SET_SHOWEXAMPLES',
					payload: qsExamples ?? false,
				})
				dispatch({
					type: 'SET_SELECTEDEXAMPLELANGUAGES',
					payload: qsLangs
						? {
								[syllabus.elements.syllabus.value?.[0]
									?.codename]: qsLangs.split(
									',',
								) as TaxoLanguage[],
						  }
						: {},
				})
				dispatch({
					type: 'SET_SELECTEDPATHWAYS',
					payload: initialPathwaysBasedOnQsPathways,
				})
				dispatch({
					type: 'SET_SHOWCURRICULUMCONNECTION',
					payload: qsCurriculumConnection ?? false,
				})
				setTempPathways(initialPathwaysBasedOnQsPathways)
			}
		}, [
			dispatch,
			initialStageCodename,
			isWithPreloadFocusAreaAndDeepLinkNavigation,
			qsAccessPoints,
			qsExamples,
			qsFocusArea,
			qsTeachingSupport,
			stageId,
			currentFocusAreaOptions,
			qsFocusAreaOption,
			qsLangs,
			qsPathways,
			syllabus.elements.syllabus.value,
			initialPathwaysBasedOnQsPathways,
			qsCurriculumConnection,
		])

		/**
		 * Scroll to focus area content / teaching support on initial load
		 */
		useEffect(() => {
			const { hash = '' } = urlRouterPath || {}
			if (
				(qsFocusArea === selectedFocusAreaCodename &&
					stageId === initialStageCodename &&
					(!initialYearCodename || yearId === initialYearCodename) &&
					isFetchedFocusArea &&
					refIsFirstLoad.current) ||
				(isWithPreloadFocusAreaAndDeepLinkNavigation &&
					refIsFirstLoad.current)
			) {
				// if there's a hash, don't scroll to focus area content
				if (hash) {
					return
				}

				let scrollFn =
					showTeachingSupport && qsTaScroll
						? scrollToTeachingAdvice
						: scrollToFocusAreaContent
				if (
					showTeachingSupport &&
					isWithPreloadFocusAreaAndDeepLinkNavigation &&
					!qsTaScroll
				) {
					scrollFn = scrollToFocusAreaContent
				}
				scrollFn(stageId, yearId)
			}
		}, [
			dispatch,
			initialStageCodename,
			initialYearCodename,
			isFetchedFocusArea,
			qsFocusArea,
			scrollToFocusAreaContent,
			scrollToTeachingAdvice,
			selectedFocusAreaCodename,
			showTeachingSupport,
			stageId,
			yearId,
			isWithPreloadFocusAreaAndDeepLinkNavigation,
			qsTaScroll,
			urlRouterPath,
		])

		/**
		 * Fix [BH-298] - issue happens when going to the url that is the same with the
		 * currently-opened url (especially for teaching advice link)
		 */
		useEffect(() => {
			const routeChangeStart = (url) => {
				const urlObj = new URL(url, window.location.origin)
				const shoulScrollForTeachingAdvice =
					url.includes('teachingSupport') &&
					shouldScrollToTeachingAdviceOnLoad

				const shouldScrollForParallelContent =
					stageId === urlObj.searchParams.get('stage')

				if (
					selectedFocusAreaCodename != qsFocusArea &&
					// same destination
					url ===
						window.location.href.replace(
							window.location.origin,
							'',
						) &&
					(shoulScrollForTeachingAdvice ||
						shouldScrollForParallelContent)
				) {
					dispatch({
						type: 'SET_SELECTEDFOCUSAREACODENAME',
						payload: qsFocusArea,
					})
					// stop the nextjs-progressbar
					NProgress.done(true)
					// stop the route change
					// eslint-disable-next-line quotes
					throw "Content.tsx aborts route change since it's going to the same path"
				}
			}
			const routeChangeComplete = () => {
				if (isFocusAreaNavigateInView) {
					refIsFirstLoad.current = true
				}
			}
			router.events.on('routeChangeStart', routeChangeStart)
			router.events.on('routeChangeComplete', routeChangeComplete)
			return () => {
				router.events.off('routeChangeStart', routeChangeStart)
				router.events.off('routeChangeComplete', routeChangeComplete)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			selectedFocusAreaCodename,
			qsFocusArea,
			shouldScrollToTeachingAdviceOnLoad,
		])

		/**
		 * Set the state of codename of the first selected focus areas
		 */
		const firstFocusAreaCodename = currentFocusAreas?.[0]?.system.codename
		useEffect(() => {
			if (!selectedFocusAreaCodename) {
				dispatch({
					type: 'SET_SELECTEDFOCUSAREACODENAME',
					payload: firstFocusAreaCodename,
				})
			}
		}, [selectedFocusAreaCodename, firstFocusAreaCodename, dispatch])

		/**
		 * Set the state of codename of the first selected focus areas
		 */
		useEffect(() => {
			if (
				isOptionList(currentFocusAreaOrOptionList) &&
				isFocusAreaNavigateInView
			) {
				dispatch({
					type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME',
					payload:
						currentFocusAreaOrOptionList.elements.focus_area_options
							.value[0],
				})
			}
		}, [currentFocusAreaOrOptionList, isFocusAreaNavigateInView, dispatch])

		/**
		 * Change the selectedFilterViewLifeSkill based on the focusAreaSponse change
		 */
		useEffect(() => {
			if (isWithPreloadFocusAreaAndDeepLinkNavigation) {
				dispatch({
					type: 'SET_SELECTEDFILTERVIEWLIFESKILL',
					payload: isLifeSkillFocusAreaOrOptionListOrOutcome(
						focusAreaOrOptionlistResponse.item,
					),
				})
			}
		}, [
			isWithPreloadFocusAreaAndDeepLinkNavigation,
			focusAreaOrOptionlistResponse,
			dispatch,
		])

		const handleTagsChange = (ids: string[]) => {
			setTempTagIds(arrayToggleMultiple(tempTagIds ?? [], ids))
		}

		const handleTagPopoverConfirm = () => {
			setTagIds(tempTagIds)
			setTagsHoverPopover(false)
		}
		const handlePathwaysPopoverConfirm = () => {
			dispatch({
				type: 'SET_SELECTEDPATHWAYS',
				payload: !tempPathways.length
					? syllabus.elements.pathways.value
					: tempPathways,
			})
			if (!tempPathways.length) {
				setTempPathways(syllabus.elements.pathways.value)
			}
			setPathwaysHoverPopover(false)
		}

		const handleTagSearch = (text: string = 'text') => {
			setTagSearchText(text)
		}

		/**
		 * Set focus to 'Tags' button when tags popover closed
		 * Not setting focus on first render
		 */
		useFocusTabIndex(tagsHoverPopover, tagsButtonRef.current)
		useFocusTabIndex(pathwaysHoverPopover, pathwaysButtonRef.current)

		const curriculumWideAssets = useMemo(
			() =>
				files?.filter((asset) =>
					asset.curriculum_wide?.some((t) => t.codename === 'yes'),
				) || [],
			[files],
		)

		const downloadListFiles = useMemo(
			() =>
				getDownloadListOfCurrentFocusArea(
					files,
					currentFocusAreaOrOptionList,
					curriculumWideAssets,
					linkedItems,
					selectedFocusAreaOptionCodename,
				),
			[
				files,
				curriculumWideAssets,
				currentFocusAreaOrOptionList,
				linkedItems,
				selectedFocusAreaOptionCodename,
			],
		)

		const currentFocusAreaTeachingAdvices = useMemo(
			() =>
				getCurrentFocusAreaTeachingAdvices(
					currentFocusAreaOrOptionList,
					linkedItems,
					selectedFocusAreaOptionCodename,
				),
			[
				currentFocusAreaOrOptionList,
				linkedItems,
				selectedFocusAreaOptionCodename,
			],
		)

		const currentStageOrYearTeachingAdvices = useMemo(() => {
			return currentFocusAreaTeachingAdvices.filter((teachingAdvice) => {
				const isStageFn = getFnIsItemHasStage(stageId)
				return (
					isStageFn(teachingAdvice) ||
					(stageId === 'life_skills' && isCurrentFocusAreaLifeSkills)
				)
			})
		}, [
			currentFocusAreaTeachingAdvices,
			isCurrentFocusAreaLifeSkills,
			stageId,
		])

		const currentFocusAreaTeachingAdvicesResources =
			currentFocusAreaTeachingAdvices.flatMap(
				(ta) => ta.elements.resources.value,
			)

		const teachingAdviceFiles = useMemo(() => {
			return (
				files?.filter((file) => {
					return currentFocusAreaTeachingAdvicesResources.some(
						(resource) =>
							matchFilesWithResourceAssets(file, resource),
					)
				}) || []
			)
		}, [currentFocusAreaTeachingAdvicesResources, files])

		const nonTeachingAdviceFiles =
			downloadListFiles
				?.filter((file) =>
					file.resource_type.some((rt) => rt.codename !== 'advice'),
				)
				.filter((file) => {
					// if is stage life skills, only return file on stage 4 and 5
					if (isCurrentStageLifeSkills) {
						return file.stage.some(
							(s) =>
								s.codename === 'stage_4' ||
								s.codename === 'stage_5' ||
								s.codename === 'stage_6',
						)
					}
					return true
				}) || []

		const downloadListHiddenFields = useMemo<DownloadListField[]>(() => {
			if (isScreenDownMd) {
				return [
					...TEACHING_ADVICE_HIDDEN_FIELDS,
					'fileSize',
					'fileType',
				]
			}
			return TEACHING_ADVICE_HIDDEN_FIELDS
		}, [isScreenDownMd])

		const currentContentOrganiserAccessPointGroups = useMemo(
			() =>
				getAccessPointGroupsBasedOnCurrentFocusAreaAndCurrentStageAndYear(
					currentFocusAreaOrOptionList,
					linkedItems,
					stageId,
					yearId,
				),
			[currentFocusAreaOrOptionList, linkedItems, stageId, yearId],
		)

		const currentFocusAreaAccessPointContent = useMemo(() => {
			if (!isCurrentFocusAreaFocusArea) return []

			const temp =
				getLinkedItems(
					currentFocusAreaOrOptionList?.elements.accesspointcontent,
					linkedItems,
				) || []
			return temp.filter((accessPointContent) => {
				if (stageId === 'life_skills' || yearId === 'life_skills')
					return true
				if (yearId) {
					return accessPointContent.elements.stage_years.value.some(
						(y) => y.codename === yearId,
					)
				}
				if (stageId) {
					return accessPointContent.elements.stages.value.some(
						(y) => y.codename === stageId,
					)
				}
				return false
			})
		}, [
			currentFocusAreaOrOptionList,
			isCurrentFocusAreaFocusArea,
			linkedItems,
			stageId,
			yearId,
		])

		const currentFocusAreaContentGroups = useMemo(() => {
			return getCurrentFocusAreaContentGroups(
				currentFocusAreaOrOptionList,
				linkedItems,
				stageId,
				yearId,
				selectedFocusAreaOptionCodename,
			)
		}, [
			currentFocusAreaOrOptionList,
			linkedItems,
			stageId,
			yearId,
			selectedFocusAreaOptionCodename,
		])

		const allOverarchingOutcomes = useMemo(() => {
			return (
				outcomes?.filter((outcome) => {
					return (
						!syllabus.elements.outcomes.value.some((oc) => {
							return oc === outcome.elements.code.value
						}) && isYes(outcome.elements.isoverarching)
					)
				}) || []
			)
		}, [outcomes, syllabus])

		const currentFocusAreaOutcomes = useMemo(
			() =>
				getOutcomesFromCurrentFocusarea(
					currentFocusAreaOrOptionList,
					allOverarchingOutcomes,
					linkedItems,
					isCurrentStageLifeSkills,
					stageId,
					isCurrentYearLifeSkills,
					yearId,
					overarchingOutcomes,
					selectedFocusAreaOptionCodename,
				),
			[
				currentFocusAreaOrOptionList,
				allOverarchingOutcomes,
				linkedItems,
				isCurrentStageLifeSkills,
				stageId,
				isCurrentYearLifeSkills,
				yearId,
				overarchingOutcomes,
				selectedFocusAreaOptionCodename,
			],
		)

		const disableLifeSkillCheckbox = useMemo(() => {
			return (
				isCurrentStage4Or5Or6 &&
				!currentRelatedFocusAreasForThisAccordion.length
			)
		}, [
			currentRelatedFocusAreasForThisAccordion.length,
			isCurrentStage4Or5Or6,
		])

		const syllabusesForExampleLanguagePicker = useMemo(() => {
			return [syllabus]
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [syllabus.system.codename])

		const {
			languageOptions,
			isShowLanguageOptions,
			toggleLanguageOptions,
		} = useLanguagesBasedOnSyllabuses({
			selectedSyllabusCodenames: syllabusesForExampleLanguagePicker.map(
				(syl) => syl.system.codename,
			),
			syllabuses: syllabusesForExampleLanguagePicker,
		})

		const shouldShowExamplesCheckboxShow = useMemo(() => {
			// if it's stage 6 syllabus
			if (isStage6Syl) {
				const relatedLsSyllabus = getLinkedItems(
					syllabus.elements.relatedlifeskillssyllabus,
					linkedItems,
				)
				// if current focus area is life skills
				if (isCurrentFocusAreaLifeSkills && relatedLsSyllabus?.[0]) {
					return isYes(relatedLsSyllabus[0].elements.has_examples)
				}
			}
			// otherwise
			return isYes(syllabus.elements.has_examples)
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			isStage6Syl,
			syllabus.system.codename,
			isCurrentFocusAreaLifeSkills,
			stageId,
			yearId,
		])

		const shouldEnableExamplesCheckbox = useMemo(() => {
			const fnMatchTheStageOrYear = (
				stageOrYear: ElementModels.TaxonomyTerm<TaxoContentAccordion>,
			) => {
				return (
					stageOrYear.codename === yearId ||
					stageOrYear.codename === stageId
				)
			}

			// if it's stage 6 syllabus
			if (isStage6Syl) {
				const relatedLsSyllabus = getLinkedItems(
					syllabus.elements.relatedlifeskillssyllabus,
					linkedItems,
				)
				// if current focus area is life skills
				if (isCurrentFocusAreaLifeSkills && relatedLsSyllabus?.[0]) {
					return relatedLsSyllabus[0].elements.has_examples_in.value.some(
						fnMatchTheStageOrYear,
					)
				}
			}
			// otherwise
			return syllabus.elements.has_examples_in.value.some(
				fnMatchTheStageOrYear,
			)
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			isStage6Syl,
			syllabus.system.codename,
			isCurrentFocusAreaLifeSkills,
			stageId,
			yearId,
		])

		const selectedPathwaysBasedOnSyllabus = useMemo(() => {
			/**
			 * if syllabus has pathways, return the selected pathways,
			 * otherwise, return an array with one object that mimicks TaxoPathways,
			 * but empty codename and name, so that it won't group the content items
			 */

			return isSyllabusHasPathways
				? syllabus.elements.pathways.value.filter((p) =>
						selectedPathways.some(
							(sp) => sp.codename === p.codename,
						),
				  )
				: [
						{
							codename: '' as TaxoPathways,
							name: '',
						} as ElementModels.TaxonomyTerm<TaxoPathways>,
				  ]
		}, [
			isSyllabusHasPathways,
			syllabus.elements.pathways.value,
			selectedPathways,
		])

		const uuid = useId()
		const lifeSkillCheckboxId = `ls-${uuid}`,
			teachingSupportCheckboxId = `ts-${uuid}`,
			examplesCheckboxId = `ex-${uuid}`,
			accessPointsCheckboxId = `ap-${uuid}`

		const cssVariableId = useId()
		const uuidAlphaNumericsOnly = cssVariableId.replace(/[^a-zA-Z0-9]/g, '')

		// set css variable for focus area options dropdown - replace all non-alphanumeric characters with blank
		const cssVarFaoOdtHeight = `--fao-odt-height-${uuidAlphaNumericsOnly}`
		const cssVarStickyDropdownHeight = `--fao-stickydd-height-${uuidAlphaNumericsOnly}`

		/**
		 * Handler
		 */
		const onRelatedFocusAreaTitleClick: FocusAreaRelatedPaperProps['onTitleClick'] =
			(_e, _focusArea) => {
				const focusAreaCodename = _focusArea.system.codename
				dispatch({
					type: 'TOGGLE_SELECTEDLIFESKILLFOCUSAREA',
					payload: { focusAreaCodename },
				})
				refScrollToFocusAreaContentAfterClick.current =
					focusAreaCodename
			}

		/**
		 * Render "No teaching advice"
		 */
		const renderNoTeachingAdvice = () => {
			return (
				<TeachingSupportCard
					content={null}
					mappings={mappings}
					linkedItems={linkedItems}
				>
					{config.item.elements.nocontent_teachingadvice.value ? (
						<p>
							{parseHTML(
								config.item.elements.nocontent_teachingadvice.value.replace(
									'teaching and learning support tab',
									`<a href="${teachingAndLearningTabUrl}">teaching and learning support tab</a>`,
								),
								{
									replace: (domNode: Element) => {
										if (
											domNode.type === 'tag' &&
											domNode.name === 'a'
										) {
											const attributes =
												attributesToProps(
													domNode.attribs,
												)

											return (
												<Link href={attributes.href}>
													<a>
														{domToReact(
															domNode.children,
														)}
													</a>
												</Link>
											)
										}
									},
								},
							)}
						</p>
					) : (
						<p>
							There is no teaching advice for this content. Please
							refer to the{' '}
							<Link href={teachingAndLearningTabUrl}>
								<a>
									teaching and learning support tab of the
									syllabus for support materials
								</a>
							</Link>
						</p>
					)}
				</TeachingSupportCard>
			)
		}

		const handleFocusareaOptionsDropdownChange = (
			e: React.ChangeEvent<HTMLSelectElement>,
		): void => {
			dispatch({
				type: 'SET_SELECTEDFOCUSAREAOPTIONCODENAME',
				payload: e.target.value,
			})

			if (
				isWithPreloadFocusAreaAndDeepLinkNavigation &&
				isOptionList(currentFocusAreaOrOptionList)
			) {
				const nextFocusAreaUrl = getFocusAreaOptionUrl(
					currentFocusAreaOptions.find(
						(fao) => fao.system.codename === e.target.value,
					),
					currentFocusAreaOrOptionList,
					syllabus.system.codename,
					stageId,
					yearId,
					qsOnSideNavs,
				)

				router.push(nextFocusAreaUrl, undefined, {
					shallow: true,
					scroll: false,
				})
			}

			// Scroll to focus area content
			scrollToFocusAreaContent(stageId, yearId)
		}

		// set the height of the sticky focus area option dropdown
		useEffect(() => {
			if (!innerRef.current || isCurrentFocusAreaFocusArea) return

			const stickyFaoDropdown = innerRef.current.querySelector(
				'.Content__faoDropdown',
			)

			if (!stickyFaoDropdown) return

			const observer = new ResizeObserver((entries) => {
				for (let entry of entries) {
					const height = entry.borderBoxSize?.[0]?.blockSize
					document.documentElement.style.setProperty(
						cssVarStickyDropdownHeight,
						`${height}px`,
					)
				}
			})
			observer.observe(stickyFaoDropdown)
			return () => {
				observer.disconnect()
			}
		}, [isCurrentFocusAreaFocusArea, cssVarStickyDropdownHeight])

		/**
		 * Shallow route-push based on the states
		 */
		useEffect(() => {
			if (
				isWithPreloadFocusAreaAndDeepLinkNavigation &&
				!refIsFirstLoad.current
			) {
				const currentUrl = new URL(window.location.href)
				const url = new URL(window.location.href)

				const qsCheckboxesSorted = qsCheckboxes.sort().join(',')
				const qsLangsSorted = selectedExampleLanguagesArray
					.sort()
					.join(',')
				const qsPathwaysSorted = selectedPathways
					.map(byTaxoCodename)
					.sort()
					.join(',')

				// if there's no advice in the query string, remove the ta_scroll
				if (!qsCheckboxesSorted?.includes('advice')) {
					url.searchParams.delete('ta_scroll')
				}

				if (qsCheckboxesSorted) {
					url.searchParams.set('show', qsCheckboxesSorted)
					if (qsCheckboxesSorted.includes('example')) {
						if (qsLangsSorted) {
							url.searchParams.set('langs', qsLangsSorted)
						} else {
							url.searchParams.delete('langs')
						}
					}
				} else {
					url.searchParams.delete('show')
					url.searchParams.delete('langs')
				}

				if (
					qsPathwaysSorted &&
					qsPathwaysSorted.split(',').length !==
						syllabus.elements.pathways.value.length
				) {
					url.searchParams.set('paths', qsPathwaysSorted)
				} else {
					url.searchParams.delete('paths')
				}

				url.hash = ''
				if (currentUrl.href !== url.href) {
					router.replace(url, undefined, {
						shallow: true,
						scroll: false,
					})
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [
			qsCheckboxes,
			refIsFirstLoad.current,
			isWithPreloadFocusAreaAndDeepLinkNavigation,
			selectedExampleLanguagesArray,
			selectedPathways,
			syllabus.elements.pathways.value.length,
		])

		useEffect(() => {
			refIsFirstLoad.current = false
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [refIsFirstLoad.current])

		return (
			<div ref={innerRef}>
				<div className="space-y-4 md:space-y-8 lg:space-y-0">
					{/* Filters */}
					<div>
						<GridWrapper
							spacing={{ xs: 4, lg: 6 }}
							alignItems={{ xl: 'center' }}
						>
							{!hideToggleViewLifeSkills && (
								<GridColFilter>
									<FormControlLabel
										htmlFor={lifeSkillCheckboxId}
										className="mx-0"
										checked={selectedFilterViewLifeSkill}
										control={
											<Checkbox
												id={lifeSkillCheckboxId}
												disabled={
													disableLifeSkillCheckbox
												}
											/>
										}
										label="View Life Skills"
										onChange={() => {
											if (isFetchedFocusArea) {
												const firstFocusAreaMS =
													focusAreasOrOptionList?.find(
														(focusArea) =>
															!isLifeSkillFocusAreaOrOptionListOrOutcome(
																focusArea,
															),
													)
												const firstFocusAreaLS =
													focusAreasOrOptionList?.find(
														(focusArea) =>
															isLifeSkillFocusAreaOrOptionListOrOutcome(
																focusArea,
															),
													)

												const nextFocusArea =
													convertToFocusareasOrOptionListOrFocusareaoptionsExtended(
														[
															currentRelatedFocusAreasForThisAccordion?.[0] ||
																(selectedFilterViewLifeSkill
																	? firstFocusAreaMS
																	: firstFocusAreaLS),
														],
														syllabus,
													)[0]

												if (
													!isFocusAreaNavigateInView
												) {
													const nextFocusAreaUrl =
														getUrlFromFocusArea(
															nextFocusArea,
															syllabus.system
																.codename,
															stageId,
															yearId,
															qsOnSideNavs,
														)

													router.push(
														nextFocusAreaUrl,
														undefined,
														{
															scroll: false,
														},
													)
													return
												}

												dispatch({
													type: 'TOGGLE_SELECTEDLIFESKILLFOCUSAREA',
													payload: {
														focusAreaCodename:
															nextFocusArea
																?.system
																.codename,
													},
												})
											}
										}}
										disabled={disableLifeSkillCheckbox}
									/>
								</GridColFilter>
							)}
							<GridColFilter>
								<FormControlLabel
									htmlFor={teachingSupportCheckboxId}
									className="mx-0"
									checked={showTeachingSupport}
									control={
										<Checkbox
											id={teachingSupportCheckboxId}
										/>
									}
									label="Teaching advice"
									onChange={(e) =>
										handleFilterButton(
											e as any,
											SYLLABUS.FILTER.TEACHING_SUPPORT,
										)
									}
								/>
							</GridColFilter>
							{shouldShowExamplesCheckboxShow && (
								<GridColFilter className="flex items-center gap-2">
									<FormControlLabel
										htmlFor={examplesCheckboxId}
										className="mx-0"
										checked={
											shouldEnableExamplesCheckbox &&
											showExamples
										}
										control={
											<Checkbox id={examplesCheckboxId} />
										}
										label="Examples"
										onChange={(e) => {
											if (
												languageOptions.length &&
												!(
													shouldEnableExamplesCheckbox &&
													showExamples
												)
											) {
												toggleLanguageOptions(true)
											}
											// Reset example languages when changing this toggle
											dispatch({
												type: 'SET_SELECTEDEXAMPLELANGUAGES',
												payload: {},
											})
											return handleFilterButton(
												e as any,
												SYLLABUS.FILTER.EXAMPLES,
											)
										}}
										disabled={!shouldEnableExamplesCheckbox}
									/>
									{syllabus.elements.languages.value.length >
										0 &&
										shouldEnableExamplesCheckbox &&
										showExamples && (
											<button
												className="w-[1.875rem] h-[1.875rem]"
												type="button"
												onClick={() => {
													toggleLanguageOptions()
												}}
												aria-label="Show language filters"
											>
												<Icon icon="mdi:chevron-down" />
											</button>
										)}
								</GridColFilter>
							)}
							{currentContentOrganiserAccessPointGroups?.length >
								0 && (
								<GridColFilter>
									<FormControlLabel
										htmlFor={accessPointsCheckboxId}
										className="mx-0"
										checked={showAccessPoints}
										control={
											<Checkbox
												id={accessPointsCheckboxId}
											/>
										}
										label="Access content points"
										onChange={(e) =>
											handleFilterButton(
												e as any,
												SYLLABUS.FILTER.ACCESS_POINTS,
											)
										}
									/>
								</GridColFilter>
							)}
							<GridColFilter
								xs={12}
								sm={12}
								display={{ xs: 'flex' }}
								flex={{ xs: '1 1 0%' }}
								justifyContent={{ xl: 'flex-end' }}
								gap={{ xs: 2 }}
							>
								{hasLiteracyOrNumeracyTags && (
									<Button
										ref={tagsButtonRef}
										style="dark-outline"
										className={clsx(
											'flex-1 xl:flex-initial',
											tagIds
												? 'button--selected'
												: 'nsw-button--secondary',
										)}
										onClick={(e) =>
											handleFilterButton(
												e,
												SYLLABUS.FILTER.TAGS,
											)
										}
										tabIndex={0}
									>
										<span className="mr-2">
											{SYLLABUS.FILTER.TAGS}
										</span>
										<Icon icon="mdi:chevron-down"></Icon>
									</Button>
								)}
								{isSyllabusHasPathways && (
									<Button
										ref={pathwaysButtonRef}
										style="dark-outline"
										className={clsx(
											'flex-1 xl:flex-initial',
											'nsw-button--secondary',
										)}
										onClick={(e) => {
											setPathwaysPopoverAnchor(
												e.currentTarget,
											)
											setPathwaysHoverPopover((v) => {
												return !v
											})
										}}
									>
										<span className="mr-2">
											Pathways ({selectedPathways.length})
										</span>
										<Icon icon="mdi:chevron-down"></Icon>
									</Button>
								)}
							</GridColFilter>
						</GridWrapper>
					</div>
					{/* Mobile: current focus area */}
					<div
						ref={refScrollHereOnFocusAreaSelectedMobile}
						className="mt-8 lg:hidden"
					>
						<GridWrapper>
							<GridCol md={6}>
								{!isFetchedFocusArea ||
								isLoading ||
								!currentFocusAreaOrOptionList ? (
									<FocusAreaSkeleton />
								) : currentFocusAreaOrOptionList ? (
									<FocusAreaPaper
										currentStage={stageId}
										focusAreaOrOptionlistOrFocusareaoption={
											currentFocusAreaOrOptionList
										}
										outcomes={currentFocusAreaOutcomes}
										linkedItems={linkedItems}
										mappings={mappings}
										isLifeSkill={isLifeSkillFocusAreaOrOptionListOrOutcome(
											currentFocusAreaOrOptionList,
										)}
										slotBeforeOutcomes={
											isShowOutcomesNotification && (
												<Alert
													as="info"
													className="mb-4 text-nsw-grey-01"
												>
													{renderOutcomeNotificationList(
														filteredOutcomesNotificationList,
														mappings,
														linkedItems,
														currentStageBasedOnViewLifeskillsToggle,
														currentYearBasedOnViewLifeskillsToggle,
													)}
												</Alert>
											)
										}
										selected
									/>
								) : null}
							</GridCol>
							<GridCol
								md={6}
								display="flex"
								flexDirection="column"
							>
								{!isFetchedFocusArea ||
								isLoading ||
								!currentFocusAreaOrOptionList ? (
									<FocusAreaSkeleton />
								) : isCurrentStage4Or5Or6 &&
								  currentFocusAreaOrOptionList ? (
									<FocusAreaRelatedPaper
										className="flex-1"
										syllabus={syllabus}
										mainFocusArea={
											selectedFocusAreaOption ||
											(currentFocusAreaOrOptionList as Focusarea)
										}
										currentStage={stageId}
										currentYear={yearId}
										onTitleClick={
											!isWithPreloadFocusAreaAndDeepLinkNavigation
												? onRelatedFocusAreaTitleClick
												: undefined
										}
										linkedItems={linkedItems}
										qsOnUrl={qsOnSideNavs}
									/>
								) : null}
							</GridCol>
						</GridWrapper>
					</div>

					{/* Content */}
					<div>
						<Grid
							container
							spacing={8}
							className="flex-col-reverse lg:flex-row lg:mt-0"
						>
							{/* Left: Side Navigation */}
							<GridCol
								lg={4}
								display="flex"
								flexDirection="column"
							>
								<>
									{/* Slot */}
									{renderSlotContentLeft &&
										renderSlotContentLeft()}
									{/* Desktop: Current focus area and its related */}
									{((!isFetchedFocusArea || isLoading) &&
										isFocusAreaNavigateInView) ||
									!currentFocusAreaOrOptionList ? (
										<div className="mb-8 space-y-4 hidden lg:block">
											<FocusAreaSkeleton />
											{isCurrentStage4Or5Or6 && (
												<FocusAreaSkeleton />
											)}
										</div>
									) : (
										<div className="mb-8 space-y-4 hidden lg:block">
											<FocusAreaPaper
												currentStage={stageId}
												focusAreaOrOptionlistOrFocusareaoption={
													currentFocusAreaOrOptionList
												}
												outcomes={
													currentFocusAreaOutcomes
												}
												linkedItems={linkedItems}
												mappings={mappings}
												isLifeSkill={isLifeSkillFocusAreaOrOptionListOrOutcome(
													currentFocusAreaOrOptionList,
												)}
												slotBeforeOutcomes={
													isShowOutcomesNotification && (
														<Alert
															as="info"
															className="mt-1 mb-3 text-nsw-grey-01"
														>
															{renderOutcomeNotificationList(
																filteredOutcomesNotificationList,
																mappings,
																linkedItems,
																currentStageBasedOnViewLifeskillsToggle,
																currentYearBasedOnViewLifeskillsToggle,
															)}
														</Alert>
													)
												}
												selected
											/>
											{isCurrentStage4Or5Or6 && (
												<FocusAreaRelatedPaper
													syllabus={syllabus}
													mainFocusArea={
														selectedFocusAreaOption ||
														(currentFocusAreaOrOptionList as Focusarea)
													}
													currentStage={stageId}
													currentYear={yearId}
													onTitleClick={
														!isWithPreloadFocusAreaAndDeepLinkNavigation
															? onRelatedFocusAreaTitleClick
															: undefined
													}
													linkedItems={linkedItems}
													qsOnUrl={qsOnSideNavs}
													selectedFocusAreaOptionCodename={
														selectedFocusAreaOptionCodename
													}
												/>
											)}
										</div>
									)}
									<ContentSideNav
										focusAreas={currentFocusAreas}
										currentFocusAreaCodename={
											currentFocusAreaCodename
										}
										currentStage={stageId}
										currentYear={yearId}
										currentSyllabusCodename={
											syllabus.system.codename
										}
										onNavItemClick={
											isWithPreloadFocusAreaAndDeepLinkNavigation
												? undefined
												: handleOnSideNavItemClick
										}
										qsOnUrl={qsOnSideNavs}
										preview={preview}
									/>
								</>
							</GridCol>

							{/* Right */}
							<GridCol lg={8}>
								{((!isFetchedFocusArea || isLoading) &&
									isFocusAreaNavigateInView) ||
								!currentFocusAreaOrOptionList ? (
									<OutcomeDetailCardSkeleton />
								) : (
									<>
										<div
											id={`scrollhereonfocusareaselected-${stageId}${
												yearId ? `-${yearId}` : ''
											}`}
											data-stage={stageId}
											data-year={yearId}
											ref={
												refScrollHereOnFocusAreaSelected
											}
											css={{
												'.is-preview &': {
													scrollMarginTop: 26,
												},
											}}
										/>

										<div className={clsx('space-y-8')}>
											{
												// on desktop we display the content on the right
												selectedFocusAreaCodename && (
													<OutcomeDetailCard
														className={clsx(
															'border-t-8 ',
															isCurrentFocusAreaLifeSkills &&
																'border-t-nsw-brand-light',
															!isCurrentFocusAreaLifeSkills &&
																'border-t-nsw-brand-dark',
														)}
														data-kontent-item-id={
															currentFocusAreaOrOptionList
																?.system.id
														}
														stage={stageId}
														year={
															yearId ===
															'life_skills'
																? undefined
																: yearId
														}
														groups={
															currentFocusAreaContentGroups
														}
														accessPointContent={
															currentFocusAreaAccessPointContent
														}
														accessPoints={
															currentContentOrganiserAccessPointGroups
														}
														showAccessPoints={
															showAccessPoints
														}
														showTags={tagIds}
														showExamples={
															shouldEnableExamplesCheckbox &&
															showExamples
														}
														linkedItems={
															linkedItems
														}
														mappings={mappings}
														slotBeforeContentGroups={
															<>
																{!isRichtextElementEmpty(
																	currentFocusAreaOrOptionList
																		?.elements
																		.content,
																) && (
																	<RichText
																		richTextElement={
																			currentFocusAreaOrOptionList
																				?.elements
																				.content
																		}
																		linkedItems={
																			linkedItems
																		}
																		mappings={
																			mappings
																		}
																		css={getScrollMarginBasedOnODT(
																			cssVarFaoOdtHeight,
																			cssVarStickyDropdownHeight,
																		)}
																		copyUrlPrefix={
																			focusAreaOrFocusAreaOptionPath
																		}
																	/>
																)}

																{!!currentStagedContents.length && (
																	<div className="space-y-3">
																		{currentStagedContents.map(
																			(
																				stagedContent,
																			) => (
																				<Contentrichtext
																					key={
																						stagedContent
																							.system
																							.id
																					}
																					linkedItem={
																						stagedContent
																					}
																					css={getScrollMarginBasedOnODT(
																						cssVarFaoOdtHeight,
																						cssVarStickyDropdownHeight,
																					)}
																					linkedItems={
																						linkedItems
																					}
																					mappings={
																						mappings
																					}
																				/>
																			),
																		)}
																	</div>
																)}

																{/* If it's an optionlist OR focusarea option */}
																{!isCurrentFocusAreaFocusArea && (
																	<>
																		<WrapperWithInView
																			css={{
																				'&.WrapperWithInView-trigger':
																					{
																						transform: `translateY(calc(${cssVarFaoOdtHeight} * -1))`,
																					},
																			}}
																		>
																			{(
																				inView,
																			) => {
																				return (
																					<div
																						className={clsx(
																							'sticky z-[2] border-t-2 border-b-2 border-white bg-white -mx-8 px-8 pb-2 !-mb-2 transition',
																							!inView &&
																								'border-b-black',
																							'Content__faoDropdown',
																						)}
																						css={{
																							top: preview
																								? `calc(var(${cssVarFaoOdtHeight}) + 26px - 2px)`
																								: `calc(var(${cssVarFaoOdtHeight}) - 2px)`,
																						}}
																					>
																						<FormGroupSelect
																							key={
																								selectedFocusAreaOptionCodename
																							}
																							selected={
																								selectedFocusAreaOptionCodename
																							}
																							className="border-nsw-blue-01 border-2 font-bold text-nsw-blue-01 truncate"
																							label="Select focus area option"
																							placeholder=""
																							options={currentFocusAreaOptions.map<FormOption>(
																								(
																									option,
																								) => {
																									return {
																										text: option
																											.elements
																											.title
																											.value,
																										value: option
																											.system
																											.codename,
																									}
																								},
																							)}
																							onChange={
																								handleFocusareaOptionsDropdownChange
																							}
																							hideLabel
																							autoComplete="off"
																						/>
																					</div>
																				)
																			}}
																		</WrapperWithInView>

																		{selectedFocusAreaOption && (
																			<CommonCopyUrlWrapper
																				url={
																					focusAreaOrFocusAreaOptionPath
																				}
																				className="nsw-h4 my-8"
																			>
																				{
																					selectedFocusAreaOption
																						.elements
																						.title
																						.value
																				}
																			</CommonCopyUrlWrapper>
																		)}

																		{!isRichtextElementEmpty(
																			selectedFocusAreaOption
																				?.elements
																				.content,
																		) && (
																			<RichText
																				linkedItems={
																					linkedItems
																				}
																				mappings={
																					mappings
																				}
																				richTextElement={
																					selectedFocusAreaOption
																						?.elements
																						.content
																				}
																				css={getScrollMarginBasedOnODT(
																					cssVarFaoOdtHeight,
																					cssVarStickyDropdownHeight,
																				)}
																			/>
																		)}
																	</>
																)}
															</>
														}
														title={
															<OutcomeDetailCardTitle
																variant={
																	isCurrentFocusAreaLifeSkills
																		? 'brand-light'
																		: 'brand-dark'
																}
																cssVariableForHeight={
																	cssVarFaoOdtHeight
																}
																useInViewOptions={{
																	rootMargin:
																		preview
																			? '-58px 0px 0px 0px'
																			: '-32px 0px 0px 0px',
																}}
															>
																<CommonCopyUrlWrapper
																	url={
																		focusAreaOrFocusAreaOptionPath
																	}
																>
																	{
																		currentFocusAreaOrOptionList
																			?.elements
																			.title
																			.value
																	}
																</CommonCopyUrlWrapper>
															</OutcomeDetailCardTitle>
														}
														slotBeforeTitle={
															isCurrentFocusAreaLifeSkills &&
															!isRichtextElementEmpty(
																lifeSkillsInfoForFocusArea,
															) && (
																<div>
																	<div className="nsw-h4 mb-8">
																		{getLifeSkillsForStageLabel(
																			currentFocusAreaOrOptionList,
																		)}
																	</div>
																	<RichText
																		richTextElement={
																			lifeSkillsInfoForFocusArea
																		}
																		linkedItems={
																			linkedItems
																		}
																		mappings={
																			mappings
																		}
																		copyUrlPrefix={
																			focusAreaOrFocusAreaOptionPath
																		}
																		css={getScrollMarginBasedOnODT(
																			cssVarFaoOdtHeight,
																			cssVarStickyDropdownHeight,
																		)}
																	/>
																</div>
															)
														}
														focusAreaOrFocusAreaOptionPath={
															focusAreaOrFocusAreaOptionPath
														}
														slotAfterContentGroups={
															previousAndNextFocusAreaOptionAsSideNavItem && (
																<div className="flex justify-between gap-6">
																	{previousAndNextFocusAreaOptionAsSideNavItem.prev ? (
																		<PrevNextButton
																			className="[&_.Link]:text-nsw-brand-dark [&_.Link]:font-bold [&_.Link]:underline [&_.Link:hover]:bg-nsw-text-hover [&_.Link:focus]:outline-3 [&_.Link:focus]:outline [&_.Link:focus]:outline-[var(--nsw-focus)]"
																			type="Previous"
																			contentItem={
																				previousAndNextFocusAreaOptionAsSideNavItem.prev
																			}
																		>
																			<span>
																				Previous
																			</span>
																		</PrevNextButton>
																	) : (
																		<span />
																	)}
																	{previousAndNextFocusAreaOptionAsSideNavItem.next ? (
																		<PrevNextButton
																			className="[&_.Link]:text-nsw-brand-dark [&_.Link]:font-bold [&_.Link]:underline [&_.Link:hover]:bg-nsw-text-hover [&_.Link:focus]:outline-3 [&_.Link:focus]:outline [&_.Link:focus]:outline-[var(--nsw-focus)]"
																			type="Next"
																			contentItem={
																				previousAndNextFocusAreaOptionAsSideNavItem.next
																			}
																		>
																			<span>
																				Next
																			</span>
																		</PrevNextButton>
																	) : (
																		<span />
																	)}
																</div>
															)
														}
														allOverarchingLinks={
															allOverarchingLinks
														}
														cssVariablesForODTTotalHeight={[
															cssVarFaoOdtHeight,
															cssVarStickyDropdownHeight,
														]}
														selectedLanguages={
															selectedExampleLanguagesArray
														}
														selectedPathways={
															selectedPathwaysBasedOnSyllabus
														}
													/>
												)
											}
											<div>
												<div
													id={`scrollhereonteachingsupport-${stageId}${
														yearId
															? `-${yearId}`
															: ''
													}`}
													data-stage={stageId}
													data-year={yearId}
													ref={
														refScrollHereOnTeachingSupportEnabled
													}
													css={{
														position: 'relative',
														'.is-preview &': {
															top: -26,
														},
														height: showTeachingSupport
															? 12
															: undefined,
														marginTop:
															showTeachingSupport
																? -12
																: undefined,
													}}
												></div>
												{showTeachingSupport &&
													currentFocusAreaCodename && (
														<>
															{currentStageOrYearTeachingAdvices.length
																? currentStageOrYearTeachingAdvices.map(
																		(
																			teachingAdvice: Teachingadvice,
																		) => {
																			return (
																				<TeachingSupportCard
																					key={
																						teachingAdvice
																							.system
																							.id
																					}
																					data-kontent-item-id={
																						teachingAdvice
																							.system
																							.id
																					}
																					mappings={
																						mappings
																					}
																					linkedItems={
																						linkedItems
																					}
																					content={
																						teachingAdvice
																							.elements
																							.content
																					}
																					currentSyllabus={
																						syllabus
																					}
																					currentStage={
																						stageId
																					}
																					currentYear={
																						yearId
																					}
																					isLifeSkillMode={
																						selectedFilterViewLifeSkill
																					}
																					title={
																						<OutcomeDetailCardTitle
																							className="!bg-nsw-off-white !border-t-0"
																							whenStickyClassNames="!px-6 md:!px-8 !py-4"
																							indicatorClassName={css(
																								{
																									top: 1,
																									'.is-preview &':
																										{
																											position:
																												'relative',
																											top: -16,
																										},
																								},
																							)}
																							ref={
																								refTeachingSupportTopForTitle
																							}
																							css={{
																								'&&': {
																									margin: '-1.5rem',
																									padding:
																										'1.5rem',
																									paddingBottom:
																										'.5rem',
																									marginBottom:
																										'1rem',

																									'@media (min-width: 768px)':
																										{
																											margin: '-2rem',
																											padding:
																												'2rem',
																											paddingBottom:
																												'1rem',
																											marginBottom:
																												'-1rem',
																										},
																								},
																							}}
																							cssVariableForHeight="--ta-odt-height"
																							useInViewOptions={{
																								rootMargin:
																									preview
																										? '-58px 0px 0px 0px'
																										: '-32px 0px 0px 0px',
																							}}
																						>
																							<CommonCopyUrlWrapper
																								url={
																									currentTeachingAdvicePath
																								}
																							>
																								{'Teaching advice for ' +
																									currentFocusAreaOptionOrFocusAreaOrOptionlist
																										?.elements
																										.title
																										.value}
																							</CommonCopyUrlWrapper>
																						</OutcomeDetailCardTitle>
																					}
																					css={{
																						'& [id]':
																							{
																								scrollMarginTop:
																									'calc(var(--ta-odt-height, 0px) + 24px)',
																							},
																					}}
																				>
																					{!!teachingAdviceFiles?.length && (
																						<DownloadList
																							key={`teachingAdviceFiles-${currentFocusAreaCodename}`}
																							className="mt-8"
																							files={
																								teachingAdviceFiles
																							}
																							hideCheckbox
																							hiddenFields={
																								downloadListHiddenFields
																							}
																						/>
																					)}
																				</TeachingSupportCard>
																			)
																		},
																  )
																: renderNoTeachingAdvice()}
														</>
													)}
											</div>

											{!!nonTeachingAdviceFiles?.length && (
												<Paper
													variant="outlined"
													className="p-4 md:p-8"
												>
													<div className="nsw-h3">
														Related files
													</div>

													<DownloadList
														key={`nonTeachingAdviceFiles-${currentFocusAreaCodename}`}
														className="mt-4"
														files={
															nonTeachingAdviceFiles
														}
														hideCheckbox
														hiddenFields={
															downloadListHiddenFields
														}
													/>
												</Paper>
											)}
										</div>
									</>
								)}
							</GridCol>
						</Grid>
					</div>
				</div>
				<CustomPopover
					title="Select tags to begin"
					popoverStatus={tagsHoverPopover}
					popoverAnchor={tagsPopoverAnchor}
					onConfirm={handleTagPopoverConfirm}
					onCancel={() => setTagsHoverPopover(false)}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						horizontal: 'right',
						vertical: 'top',
					}}
				>
					<div>
						<TagPicker
							initialSearchText={tagSearchText}
							selected={tempTagIds ?? []}
							onChange={handleTagsChange}
							onSearch={handleTagSearch}
						/>
					</div>
				</CustomPopover>
				<LanguagePicker
					syllabuses={syllabusesForExampleLanguagePicker}
					languages={languageOptions}
					initialSelectedLanguages={selectedExampleLanguages}
					title="Select language example"
					modalStatus={isShowLanguageOptions}
					handleCancel={() => {
						toggleLanguageOptions()
					}}
					handleConfirm={async (languages) => {
						dispatch({
							type: 'SET_SELECTEDEXAMPLELANGUAGES',
							payload: languages,
						})
						toggleLanguageOptions()
					}}
					resetSelectedLanguagesOnClose={false}
					slotBeforeSearch={
						<p>
							Language selection only applies to language specific
							examples.
						</p>
					}
					isValidationNotRequired
				></LanguagePicker>
				<CustomPopover
					title="Select Pathway"
					popoverStatus={pathwaysHoverPopover}
					popoverAnchor={pathwaysPopoverAnchor}
					onConfirm={handlePathwaysPopoverConfirm}
					onCancel={() => {
						setTempPathways(selectedPathways)
						setPathwaysHoverPopover(false)
					}}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						horizontal: 'right',
						vertical: 'top',
					}}
				>
					<div>
						{syllabus.elements.pathways.value.map(
							(pathway, _index, _allPathways) => {
								return (
									<div key={pathway.codename}>
										<FormControlLabel
											htmlFor={pathway.codename}
											className="mx-0"
											control={
												<Checkbox
													id={pathway.codename}
												/>
											}
											label={pathway.name}
											onChange={(_e, checked) => {
												if (checked) {
													setTempPathways([
														...tempPathways,
														pathway,
													])
												} else {
													const unselecteds =
														tempPathways.filter(
															(p) =>
																p.codename !==
																pathway.codename,
														)
													setTempPathways(unselecteds)
												}
											}}
											checked={tempPathways
												.map(byTaxoCodename)
												.includes(pathway.codename)}
										/>
									</div>
								)
							},
						)}
					</div>
				</CustomPopover>
			</div>
		)
	},
)

export default Content
