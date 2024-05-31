import Link from '@/components/Link'
import { SideNav } from '@/components/nsw/side-nav/SideNav'
import {
	Focusarea,
	Focusareaoption,
	Optionslist,
} from '@/kontent/content-types'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { FocusareaOrOptionListOrFocusareoptionExtended } from '@/types/customKontentTypes'
import { getSlugByCodename } from '@/utils'
import { isOptionList } from '@/utils/type_predicates'
import { useId } from 'react'
import { useInView } from 'react-intersection-observer'

export interface ContentSideNavProps {
	focusAreas: FocusareaOrOptionListOrFocusareoptionExtended[]
	currentFocusAreaCodename: Focusarea['system']['codename']
	onNavItemClick?: (
		_e,
		_focusArea: Focusarea | Optionslist | Focusareaoption,
	) => void
	currentSyllabusCodename: string
	currentStage: TaxoStageWithLifeSkill
	currentYear: TaxoStageYearWithLifeSkill
	qsOnUrl?: string[]
	shallowLinks?: boolean
	preview?: boolean
}

export const getUrlFromFocusArea = (
	focusArea: FocusareaOrOptionListOrFocusareoptionExtended,
	currentSyllabusCodename: string,
	currentStage?: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
	qs: string[] = [],
	slugAfterFocusAreaSlug: string = '',
) => {
	const learningAreaSlug = getSlugByCodename(
		focusArea.elements.key_learning_area__items?.value?.[0]?.codename || '',
	)
	const syllabusSlug = getSlugByCodename(currentSyllabusCodename)

	const focusAreaSlug = getSlugByCodename(focusArea.system.codename)

	return `/learning-areas/${learningAreaSlug}/${syllabusSlug}/content/${getSlugByCodename(
		currentYear || currentStage,
	)}/${focusAreaSlug}${slugAfterFocusAreaSlug}${
		qs.length ? '?' + qs.join('&') : ''
	}`
}

export const getFirstFocusAreaOptionUrlFromOptionlist = (
	optionList: Optionslist,
	currentSyllabusCodename: string,
	currentStage?: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
	qs: string[] = [],
) => {
	const firstFocusareaOptionSlug = getSlugByCodename(
		optionList.elements.focus_area_options.value[0] || '',
	)
	return getUrlFromFocusArea(
		optionList,
		currentSyllabusCodename,
		currentStage,
		currentYear,
		qs,
		`/${firstFocusareaOptionSlug}`,
	)
}

export const getFocusAreaOptionUrl = (
	focusAreaOption: Focusareaoption,
	optionList: Optionslist,
	currentSyllabusCodename: string,
	currentStage?: TaxoStageWithLifeSkill,
	currentYear?: TaxoStageYearWithLifeSkill,
	qs: string[] = [],
) => {
	const focusAreaOptionSlug = getSlugByCodename(
		focusAreaOption.system.codename,
	)
	return getUrlFromFocusArea(
		optionList,
		currentSyllabusCodename,
		currentStage,
		currentYear,
		qs,
		`/${focusAreaOptionSlug}`,
	)
}

export const ContentSideNav = ({
	focusAreas,
	onNavItemClick,
	currentFocusAreaCodename,
	currentSyllabusCodename,
	currentStage,
	currentYear,
	qsOnUrl = [],
	shallowLinks = false,
	preview = false,
}: ContentSideNavProps) => {
	const { ref: refSideNavStickyIndicator, inView } = useInView({
		threshold: 0,
	})
	const isSticky = !inView
	const uniqueId = useId()
	return (
		<>
			<div
				id={'content-sidenav-sticky-indicator-' + uniqueId}
				ref={refSideNavStickyIndicator}
			/>
			<SideNav
				className="sticky top-0"
				css={{
					'.is-preview &': {
						top: 26,
						maxHeight: isSticky && 'calc(100vh - 26px)',
					},
					'&': {
						overflow: isSticky && 'auto',
						maxHeight: isSticky && '100vh',
					},
					'.nsw-side-nav__item-link': {
						width: '100%',
						textAlign: 'left',
						fontWeight: 'var(--nsw-font-normal)',
						display: 'block',
						textDecoration: 'none',
						color: 'var(--nsw-text-dark)',
						padding: '1rem',

						'&.current': {
							backgroundColor: 'var(--nsw-off-white)',
							fontWeight: 'bold',
						},
					},
				}}
				items={focusAreas.map((focusArea) => {
					const href = isOptionList(focusArea)
						? getFirstFocusAreaOptionUrlFromOptionlist(
								focusArea,
								currentSyllabusCodename,
								currentStage,
								currentYear,
								qsOnUrl,
						  )
						: getUrlFromFocusArea(
								focusArea,
								currentSyllabusCodename,
								currentStage,
								currentYear,
								qsOnUrl,
						  )

					return {
						tag: onNavItemClick ? 'button' : Link,
						text: focusArea.elements.title.value,
						href: onNavItemClick ? undefined : href,
						onClick: onNavItemClick
							? (e) => {
									onNavItemClick(e as any, focusArea)
							  }
							: undefined,
						isActive:
							focusArea.system.codename ===
							currentFocusAreaCodename,
						shallow: shallowLinks,
						scroll: false,
						prefetch: !preview,
					}
				})}
			/>
		</>
	)
}
