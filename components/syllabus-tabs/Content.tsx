import { Syllabus } from '@/kontent/content-types'
import { taxonomies } from '@/kontent/project/taxonomies'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import {
	CommonContentTab,
	getStagesOrYearsBasedOnSyllabusAndDisabledStages,
} from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import {
	CommonPageProps,
	MappingParams,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { getCodenameBySlug, getSlugByCodename } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import Link from 'next/link'
import { ReactNode } from 'react'
import { useKontentHomeConfig } from '../contexts/KontentHomeConfigProvider'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export interface StageOrYearContentAccordionProps {
	title?: string
	stagesOrYears: ElementModels.TaxonomyTerm<
		TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill
	>[]
	params: MappingParams
	children?: ReactNode
	defaultFocusAreaPerStageOrYear?: CommonContentTab<Syllabus>['defaultFocusAreaUrls']
}

export const isTaxoStageYearWithLifeSkill = (
	obj: ElementModels.TaxonomyTerm<any>,
): obj is ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill> => {
	return (
		Object.keys(taxonomies.stage_year.terms).some(
			(t) => t === obj.codename,
		) || obj.codename === 'life_skills'
	)
}

export const getYearTitle = (
	year: ElementModels.TaxonomyTerm<TaxoStageYearWithLifeSkill>,
) => {
	return year.codename === 'life_skills' ? year.name : `Year ${year.name}`
}

export const StageOrYearContentAccordion = ({
	stagesOrYears,
	params,
	defaultFocusAreaPerStageOrYear,
	children,
}: StageOrYearContentAccordionProps) => {
	const { preview, mappings } = useKontentHomeConfig()

	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="content"
				mappings={mappings}
				syllabusCodename={getCodenameBySlug(params['syllabus'])}
			/>
			{stagesOrYears.map((stageOrYear) => {
				const stageCodenameSlugged = getSlugByCodename(
					stageOrYear.codename,
				)
				const title = isTaxoStageYearWithLifeSkill(stageOrYear)
					? getYearTitle(stageOrYear)
					: stageOrYear.name

				const isCurrent = children
					? stageCodenameSlugged === params['stage']
					: false

				const accordionUrl =
					defaultFocusAreaPerStageOrYear?.[stageOrYear.codename] ||
					`/learning-areas/${params['learningarea']}/${params['syllabus']}/${params['tab']}/${stageCodenameSlugged}`

				return (
					<CustomAccordion
						key={stageOrYear.codename}
						title={title}
						className="relative"
						slotAfter={
							isCurrent ? null : (
								<Link href={accordionUrl} prefetch={!preview}>
									<a
										className="absolute inset-0 hover:bg-[rgba(0,133,179,0.2)] focus:bg-[rgba(0,133,179,0.2)] hover:outline-0"
										aria-label={stageOrYear.name}
									></a>
								</Link>
							)
						}
						startOpen={isCurrent}
					>
						{isCurrent ? children : null}
					</CustomAccordion>
				)
			})}
		</div>
	)
}

export const Content = ({
	params,
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const { stages, years, syllabus, disabledStages } = data || {}
	const stageOrYears = getStagesOrYearsBasedOnSyllabusAndDisabledStages(
		stages,
		years,
		disabledStages,
		syllabus.item,
	)
	return (
		<StageOrYearContentAccordion
			stagesOrYears={stageOrYears}
			params={params}
			defaultFocusAreaPerStageOrYear={data.defaultFocusAreaUrls}
		/>
	)
}

export default Content
