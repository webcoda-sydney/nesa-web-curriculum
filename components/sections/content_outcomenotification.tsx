import type { ContentOutcomenotification as ContentOutcomenotificationModel } from '@/kontent/content-types/content_outcomenotification'
import {
	TaxoStage,
	TaxoStageYear,
	TaxoSyllabustype,
} from '@/kontent/taxonomies'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { byTaxoCodename, negatePredicate } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import type { RichtextSectionProps } from '.'
import RichText from '../RichText'

const isLifeSkillsTaxo = (x: ElementModels.TaxonomyTerm<TaxoSyllabustype>) =>
	x.codename === 'life_skills'
const isNotLifeSkillsTaxo = negatePredicate(isLifeSkillsTaxo)

export const isShowContentOutcomenotificationBasedOnStageAndYear = (
	linkedItem: ContentOutcomenotificationModel,
	stage: TaxoStageWithLifeSkill,
	year: TaxoStageYearWithLifeSkill,
) => {
	if (year) {
		if (
			(year !== 'life_skills' &&
				(!linkedItem.elements.stage_years.value
					.map(byTaxoCodename)
					.includes(year as TaxoStageYear) ||
					!linkedItem.elements.syllabus_type__items.value.some(
						isNotLifeSkillsTaxo,
					))) ||
			(year === 'life_skills' &&
				!linkedItem.elements.syllabus_type__items.value.some(
					isLifeSkillsTaxo,
				))
		) {
			return false
		}
	}

	if (stage) {
		if (
			(stage !== 'life_skills' &&
				(!linkedItem.elements.stages.value
					.map(byTaxoCodename)
					.includes(stage as TaxoStage) ||
					!linkedItem.elements.syllabus_type__items.value.some(
						isNotLifeSkillsTaxo,
					))) ||
			(stage === 'life_skills' &&
				!linkedItem.elements.syllabus_type__items.value.some(
					isLifeSkillsTaxo,
				))
		) {
			return false
		}
	}

	return true
}

export default function ContentOutcomenotification({
	linkedItem,
	mappings,
	linkedItems,
	currentPath,
	currentStage,
	currentYear,
}: RichtextSectionProps<ContentOutcomenotificationModel>) {
	if (
		!isShowContentOutcomenotificationBasedOnStageAndYear(
			linkedItem,
			currentStage,
			currentYear,
		)
	) {
		return null
	}

	return (
		<RichText
			currentPath={currentPath}
			richTextElement={linkedItem.elements.content}
			mappings={mappings}
			linkedItems={linkedItems}
		/>
	)
}
