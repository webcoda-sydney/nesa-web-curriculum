import {
	Focusarea,
	Syllabus,
	WebLinkContentgroup,
	WebLinkFocusarea,
	WebLinkTeachingadvice,
} from '@/kontent/content-types'
import { TaxoStageWithLifeSkill, TaxoStageYearWithLifeSkill } from '@/types'
import { getSlugByCodename } from '../getSlugByCodename'

export const getFocusareaPath = (
	item: WebLinkContentgroup | WebLinkFocusarea | WebLinkTeachingadvice,
	syllabus: Syllabus,
	focusArea: Focusarea,
) => {
	if (item && (!syllabus || !focusArea)) {
		if (process.env.NODE_ENV === 'development') {
			console.log('🚀 line 19 getFocusareaPath.ts: missing syllabus or focusArea - item.id', item.system.id)
		}
		return ''
	}

	// stage path
	const slugKla = getSlugByCodename(
		(
			syllabus.elements.key_learning_area_default.value[0] ||
			syllabus.elements.key_learning_area__items.value[0]
		).codename,
	)
	let stageOrYear: TaxoStageWithLifeSkill | TaxoStageYearWithLifeSkill =
		item.elements.stages__stages.value[0]?.codename
	if (stageOrYear === 'stage_6') {
		stageOrYear = item.elements.stages__stage_years.value[0]?.codename
	}
	if (
		item.elements.syllabus_type__items.value.some(
			(t) => t.codename === 'life_skills',
		)
	) {
		stageOrYear = 'life_skills'
	}
	const slugStageOrYear = getSlugByCodename(stageOrYear || '')
	const slugSyllabus = getSlugByCodename(syllabus.system.codename)
	const slugFocusarea = getSlugByCodename(focusArea?.system.codename || '')

	return `/learning-areas/${slugKla}/${slugSyllabus}/content/${slugStageOrYear}/${slugFocusarea}`
}
