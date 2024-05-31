import type { WpStagegroup } from '@/kontent/content-types'
import { getItemByCodename, getNonLinkedItemsClient } from '@/lib/api'
import type { GetPageResponseParams } from '.'

function getPageResponse({ codename, preview }: GetPageResponseParams) {
	return getItemByCodename<WpStagegroup>({
		depth: 2,
		codename,
		preview,
		kontentClient: getNonLinkedItemsClient(),
	})
}

const _ = {
	getPageResponse,
}

export default _
