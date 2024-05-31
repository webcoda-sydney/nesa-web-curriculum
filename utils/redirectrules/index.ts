import { Redirectrule } from '@/kontent/content-types'

export type RedirectRulesType =
	| 'path'
	| 'focus_area_codename'
	| 'syllabus_codename'

export const getRedirectRulesTypes = (
	redirectRule: Redirectrule,
): RedirectRulesType => {
	return redirectRule.elements.type.value[0].codename as RedirectRulesType
}
