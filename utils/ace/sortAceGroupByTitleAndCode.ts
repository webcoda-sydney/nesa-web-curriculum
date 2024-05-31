import { AceGroup, AceSubgroup } from '@/kontent/content-types'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import { parseInteger } from '@/utils'

export const sortAceGroupByTitleAndCode = <T extends AceGroup | AceSubgroup>(
	groups: T[],
) => {
	return groups
		.sort((a, b) =>
			stringCompare(a.elements.title.value, b.elements.title.value),
		)
		.sort(
			(a, b) =>
				parseInteger(a.elements.code.value) -
				parseInteger(b.elements.code.value),
		)
}
