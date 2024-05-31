import { STAGE_YEARS } from '@/constants'
import { CombinedReleaseNote } from '@/databuilders/wp_dc_recentchanges'
import { useToggle } from '@/hooks/useToggle'
import { taxonomies } from '@/kontent/project/taxonomies'
import { TaxoStageYear, TaxoSyllabus } from '@/kontent/taxonomies'
import { byTaxoCodename, fnExist, isIntersect } from '@/utils'
import {
	isReleasenoteAceKla,
	isReleasenoteAceSyllabus,
	isReleasenoteSyllabus,
	isReleasenoteSyllabusKla,
	isReleasenoteSyllabusMultiple,
} from '@/utils/type_predicates'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import orderBy from 'lodash.orderby'
import { NavItem } from 'nsw-ds-react/dist/component/main-nav/mainNav'
import NextMuiLink from '../ui/NextMuiLink'
import {
	ReleaseNoteAccordionProps,
	getNavItemFromSyllabusTaxo,
} from './ReleaseNoteAccordion'

export interface ReleaseNoteAffectedSyllabusProps {
	releaseNote: CombinedReleaseNote
	title?: string
	syllabusTaxoSyllabusUrls: ReleaseNoteAccordionProps['syllabusTaxoSyllabusUrls']
	limit?: number
	listItemsBeforeDefault?: NavItem[]
}

const fnByName = (t: ElementModels.TaxonomyTerm) => t.name

const getStageAndYearCombined = (
	years: ElementModels.TaxonomyTerm<TaxoStageYear>[],
) => {
	const yearsByTaxo = years.map(byTaxoCodename)

	if (
		!years.length ||
		years.length === Object.values(STAGE_YEARS).flatMap((t) => t).length
	) {
		return ''
	}
	return Object.entries(STAGE_YEARS)
		.map(([stage, yearsInStage]) => {
			const stageName = taxonomies.stage.terms[stage].name

			// if all years in stage are in the release note, return stage name
			if (yearsInStage.every((y) => yearsByTaxo.includes(y))) {
				return stageName
			}

			// if some years in stage are in the release note, return stage name and years
			if (isIntersect(yearsByTaxo, yearsInStage)) {
				return `Year ${yearsInStage
					.filter((y) => yearsByTaxo.includes(y))
					.map(
						(yearCodename) =>
							years.find((y) => y.codename === yearCodename).name,
					)
					.join(', ')}`
			}
			return ''
		})
		.filter(fnExist)
		.join(', ')
}

const getYearRangeOrderIndex = (text: string) => {
	// Match K-6 or K–6
	const patternK6 = /K-6|K–6/g
	// Match K-10 or K–10
	const patternK10 = /K-10|K–10/g
	// Match 7–10
	const pattern7_10 = /7-10|7–10/g
	// Match 11–12
	const pattern11_12 = /11-12|11–12/g

	if (patternK6.test(text)) {
		return 0
	} else if (patternK10.test(text)) {
		return 1
	} else if (pattern7_10.test(text)) {
		return 2
	} else if (pattern11_12.test(text)) {
		return 3
	}
}

type NavItemWithYearRangeOrder = NavItem & { yearRangeOrderIndex: number }

const getListItemFromSyllabusesList = (
	syllabusTaxos: TaxoSyllabus[],
	syllabusTaxoSyllabusUrls: Record<TaxoSyllabus, NavItem>,
	stageYearsText: string,
	keyLearningAreas: string[],
) => {
	if (syllabusTaxos.length) {
		return orderBy(
			syllabusTaxos.map<NavItemWithYearRangeOrder>(
				(codename: TaxoSyllabus, index) => {
					const navItem =
						getNavItemFromSyllabusTaxo(
							codename,
							syllabusTaxoSyllabusUrls,
						) || ({} as NavItem)

					return {
						id: 'syllabus-taxos-' + index,
						...navItem,
						yearRangeOrderIndex: getYearRangeOrderIndex(
							navItem.text,
						),
					}
				},
			),
			['yearRangeOrderIndex', 'text'],
			['asc', 'asc'],
		).map<NavItem>(({ yearRangeOrderIndex, ...navItem }) => {
			return navItem
		})
	}

	return [
		{
			id: 'all-syllabuses',
			text: `All ${stageYearsText} ${keyLearningAreas.join(
				', ',
			)} syllabuses`.trim(),
			url: undefined,
			target: undefined,
		} as NavItem,
	]
}

export const ReleaseNoteAffectedSyllabus = ({
	releaseNote,
	syllabusTaxoSyllabusUrls,
	title = 'Affected syllabuses',
	limit = 3,
	listItemsBeforeDefault = [],
}: ReleaseNoteAffectedSyllabusProps) => {
	const [showAll, setShowAll] = useToggle(false)

	const isSyllabusMultiple = isReleasenoteSyllabusMultiple(releaseNote)
	const isSyllabusKla = isReleasenoteSyllabusKla(releaseNote)
	const isAceSyllabus = isReleasenoteAceSyllabus(releaseNote)
	const isAceKla = isReleasenoteAceKla(releaseNote)
	const isDcSyllabus = isReleasenoteSyllabus(releaseNote)

	if (
		!(
			isSyllabusMultiple ||
			isSyllabusKla ||
			isAceSyllabus ||
			isAceKla ||
			isDcSyllabus
		)
	)
		return null

	const syllabuses = isDcSyllabus
		? releaseNote.elements.syllabus.value.map(byTaxoCodename)
		: isSyllabusMultiple || isAceSyllabus
		? releaseNote.elements.syllabuses.value.map(byTaxoCodename)
		: []
	const klas =
		releaseNote.elements.key_learning_area__items.value.map(fnByName)

	const keyLearningAreas = Object.values(
		taxonomies.key_learning_area.terms,
	).every((term) => klas.includes(term.name))
		? []
		: klas

	const stageYearsText = getStageAndYearCombined(
		releaseNote.elements.stages__stage_years.value,
	)

	const listItems = [
		...listItemsBeforeDefault,
		...getListItemFromSyllabusesList(
			syllabuses,
			syllabusTaxoSyllabusUrls,
			stageYearsText,
			keyLearningAreas,
		),
	]

	const limitedListItems = listItems.slice(
		0,
		showAll ? listItems.length : limit,
	)

	const isShowToggle = listItems.length > limitedListItems.length

	return (
		<div>
			{!!title && <strong>{title}</strong>}
			<ul className="mt-2 space-y-1 list-disc pl-[18px]">
				{limitedListItems.map((item: NavItem) => {
					const { id, url, text, target } = item || {}
					return (
						<li key={id}>
							{url ? (
								<NextMuiLink href={url} target={target}>
									{text}
								</NextMuiLink>
							) : (
								<span>{text}</span>
							)}
						</li>
					)
				})}
			</ul>
			{isShowToggle && (
				<button
					type="button"
					className="mt-2 underline bold text-nsw-brand-dark hover:bg-nsw-text-hover focus:bg-nsw-text-hover focus:outline-2 focus:outline-nsw-text-hover"
					onClick={setShowAll}
				>
					Show all
				</button>
			)}
		</div>
	)
}
