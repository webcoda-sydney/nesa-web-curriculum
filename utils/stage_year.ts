import { STAGE_YEARS } from '@/constants'
import { taxonomies } from '@/kontent/project/taxonomies'
import type { TaxoStage, TaxoStageYear } from '@/kontent/taxonomies'
import type { ElementModels } from '@kontent-ai/delivery-sdk'

export const getStageFromYear = (year: TaxoStageYear) => {
	const stageYear = Object.entries(STAGE_YEARS).find(([_key, years]) => {
		return years.includes(year)
	})
	if (!stageYear) return undefined

	return taxonomies.stage.terms[
		stageYear[0]
	] as ElementModels.TaxonomyTerm<TaxoStage>
}
