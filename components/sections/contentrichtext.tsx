import { ContentTeachingadvice } from '@/kontent/content-types'
import type { Contentrichtext as ContentrichtextModel } from '@/kontent/content-types/contentrichtext'
import { TaxoStage, TaxoStageYear } from '@/kontent/taxonomies'
import {
	IPropWithClassName,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import { byTaxoCodename } from '@/utils'
import type { RichtextSectionProps } from '.'
import RichText from '../RichText'

export const isShowContentRichtextBasedOnStageAndYear = (
	linkedItem: ContentrichtextModel | ContentTeachingadvice,
	stage: TaxoStageWithLifeSkill,
	year: TaxoStageYearWithLifeSkill,
) => {
	if (
		(year &&
			year !== 'life_skills' &&
			!linkedItem.elements.stage_years.value
				.map(byTaxoCodename)
				.includes(year as TaxoStageYear)) ||
		(stage &&
			stage !== 'life_skills' &&
			!linkedItem.elements.stages.value
				.map(byTaxoCodename)
				.includes(stage as TaxoStage))
	) {
		return null
	}
	return true
}

export default function Contentrichtext({
	linkedItem,
	mappings,
	linkedItems,
	currentPath,
	currentStage,
	currentYear,
	resolveFootnotesLink,
	className,
}: RichtextSectionProps<ContentrichtextModel> & IPropWithClassName) {
	if (
		!isShowContentRichtextBasedOnStageAndYear(
			linkedItem,
			currentStage,
			currentYear,
		)
	) {
		return null
	}

	return (
		<RichText
			className={className}
			currentPath={currentPath}
			richTextElement={linkedItem.elements.content}
			mappings={mappings}
			linkedItems={linkedItems}
			resolveFootnotesLink={resolveFootnotesLink}
		/>
	)
}
