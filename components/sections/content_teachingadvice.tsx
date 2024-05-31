import { STAGES_WITH_LIFESKILLS, STAGE_YEARS } from '@/constants'
import type { ContentTeachingadvice } from '@/kontent/content-types/content_teachingadvice'
import { TaxoSyllabustype } from '@/kontent/taxonomies'
import { byTaxoCodename, isIntersect } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import type { RichtextSectionProps } from '.'
import RichText from '../RichText'

const isLifeSkillsTaxo = (x: ElementModels.TaxonomyTerm<TaxoSyllabustype>) =>
	x.codename === 'life_skills'

const YEARS_FOR_LIFESKILLS = STAGES_WITH_LIFESKILLS.flatMap(
	(s) => STAGE_YEARS[s],
)

/**
 * Determines whether to show content based on the stage, year, and life skill parameters.
 *
 * @param {Object} linkedItem - The linked item to be checked.
 * @param {string} stage - The stage parameter.
 * @param {string} year - The year parameter.
 * @param {Object} currentSyllabus - The current syllabus.
 * @param {boolean} isLifeSkill - Boolean indicating whether it is a life skill.
 * @returns {boolean} - True if the content should be shown, false otherwise.
 */
export const isShowContentRichtextBasedOnStageAndYearAndLifeSkill = (
	linkedItem,
	stage,
	year,
	currentSyllabus,
	isLifeSkill,
) => {
	const linkedItemStageYears =
		linkedItem.elements.stage_years.value.map(byTaxoCodename)
	const linkedItemStages =
		linkedItem.elements.stages.value.map(byTaxoCodename)
	const syllabusTypeItems = linkedItem.elements.syllabus_type__items.value

	// Check if the linked item matches the life skill type
	const isLinkedItemMatchedWithLifeSkillType =
		(isLifeSkill && syllabusTypeItems.some(isLifeSkillsTaxo)) ||
		(!isLifeSkill && !syllabusTypeItems.some(isLifeSkillsTaxo))

	if (year) {
		// Check if the year is not 'life_skills' and it doesn't match the linked item's stage years
		// or if the linked item doesn't match the life skill type
		const criteriaIfYearNotLifeSkills =
			(year !== 'life_skills' && !linkedItemStageYears.includes(year)) ||
			!isLinkedItemMatchedWithLifeSkillType

		// If the criteria for not showing the content is met, return false
		if (
			criteriaIfYearNotLifeSkills ||
			(year === 'life_skills' &&
				!syllabusTypeItems.some(isLifeSkillsTaxo))
		) {
			return false
		}

		const syllabusStageYears =
			currentSyllabus.elements.stages__stage_years.value.map(
				byTaxoCodename,
			)

		// If the year is 'life_skills' and the syllabus stage years don't intersect with the linked item's stage years
		// or if the linked item's stage years intersect with the years for life skills, return false
		if (
			year === 'life_skills' &&
			(!isIntersect(syllabusStageYears, linkedItemStageYears) ||
				!isIntersect(YEARS_FOR_LIFESKILLS, linkedItemStageYears))
		) {
			return false
		}
	}

	if (stage) {
		// Check if the stage is not 'life_skills' and it doesn't match the linked item's stages
		// or if the linked item doesn't match the life skill type
		const criteriaIfStageNotLifeSkills =
			(stage !== 'life_skills' && !linkedItemStages.includes(stage)) ||
			!isLinkedItemMatchedWithLifeSkillType

		// If the criteria for not showing the content is met, return false
		if (
			criteriaIfStageNotLifeSkills ||
			(stage === 'life_skills' &&
				!syllabusTypeItems.some(isLifeSkillsTaxo))
		) {
			return false
		}

		const syllabusStages =
			currentSyllabus.elements.stages__stages.value.map(byTaxoCodename)

		// If the stage is 'life_skills' and the syllabus stages don't intersect with the linked item's stages
		// or if the linked item's stages don't intersect with the stages with life skills, return false
		if (
			stage === 'life_skills' &&
			(!isIntersect(syllabusStages, linkedItemStages) ||
				!isIntersect(STAGES_WITH_LIFESKILLS, linkedItemStages))
		) {
			return false
		}
	}

	// If none of the criteria for not showing the content are met, return true
	return true
}

export default function ContentTeachingadviceComponent({
	linkedItem,
	mappings,
	linkedItems,
	currentPath,
	currentStage,
	currentYear,
	currentSyllabus,
	isLifeSkillMode = false,
}: RichtextSectionProps<ContentTeachingadvice>) {
	if (
		!isShowContentRichtextBasedOnStageAndYearAndLifeSkill(
			linkedItem,
			currentStage,
			currentYear,
			currentSyllabus,
			isLifeSkillMode,
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
